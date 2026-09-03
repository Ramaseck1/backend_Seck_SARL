import { prisma } from "../../lib/prisma";
import { AppError } from "../../middlewares/errorHandler";

interface LigneInput {
  produitId: string;
  quantite: number;
  prixUnitaire: number;
}

interface CreerBonInput {
  activiteId: string;
  fournisseurId: string;
  lignes: LigneInput[];
}

export async function creerBonCommande(input: CreerBonInput) {
  return prisma.bonCommande.create({
    data: {
      activiteId: input.activiteId,
      fournisseurId: input.fournisseurId,
      statut: "BROUILLON",
      lignes: {
        create: input.lignes.map((l) => ({
          produitId: l.produitId,
          quantite: l.quantite,
          prixUnitaire: l.prixUnitaire,
        })),
      },
    },
    include: { lignes: true },
  });
}

export async function listerBonsCommande(activiteId: string) {
  return prisma.bonCommande.findMany({
    where: { activiteId },
    include: { fournisseur: true, lignes: { include: { produit: true } } },
    orderBy: { dateCommande: "desc" },
  });
}

// Réception : passe le bon à RECU, incrémente le stock de chaque produit
// commandé, et génère la facture fournisseur correspondante.
export async function receptionnerBonCommande(bonCommandeId: string) {
  return prisma.$transaction(async (tx) => {
    const bon = await tx.bonCommande.findUnique({
      where: { id: bonCommandeId },
      include: { lignes: true },
    });
    if (!bon) throw new AppError("Bon de commande introuvable", 404);
    if (bon.statut === "RECU") throw new AppError("Ce bon de commande est déjà réceptionné", 400);

    for (const ligne of bon.lignes) {
      await tx.produit.update({
        where: { id: ligne.produitId },
        data: { quantiteStock: { increment: ligne.quantite } },
      });
    }

    const montantTotal = bon.lignes.reduce(
      (acc, l) => acc + Number(l.quantite) * Number(l.prixUnitaire),
      0
    );

    const bonMisAJour = await tx.bonCommande.update({
      where: { id: bonCommandeId },
      data: { statut: "RECU", dateReception: new Date() },
    });

    const facture = await tx.factureFournisseur.create({
      data: { bonCommandeId, montant: montantTotal, statut: "EN_ATTENTE" },
    });

    return { bon: bonMisAJour, facture };
  });
}

interface PaiementInput {
  factureId: string;
  montant: number;
  activiteId: string;
  saisiParId: string;
}

// Paiement fournisseur : sort de la caisse de l'activité concernée, jamais
// mélangé avec la caisse d'une autre activité.
export async function payerFacture(input: PaiementInput) {
  return prisma.$transaction(async (tx) => {
    const facture = await tx.factureFournisseur.findUnique({ where: { id: input.factureId } });
    if (!facture) throw new AppError("Facture introuvable", 404);

    const nouveauPaye = Number(facture.montantPaye) + input.montant;
    if (nouveauPaye > Number(facture.montant)) {
      throw new AppError("Le montant payé dépasse le montant de la facture", 400);
    }

    const statut = nouveauPaye === Number(facture.montant) ? "PAYEE" : "PARTIELLE";

    const [paiement] = await Promise.all([
      tx.paiementFournisseur.create({ data: { factureId: input.factureId, montant: input.montant } }),
      tx.factureFournisseur.update({
        where: { id: input.factureId },
        data: { montantPaye: nouveauPaye, statut },
      }),
      tx.mouvementCaisse.create({
        data: {
          activiteId: input.activiteId,
          saisiParId: input.saisiParId,
          type: "SORTIE",
          montant: input.montant,
          motif: "Paiement facture fournisseur",
        },
      }),
    ]);

    return paiement;
  });
}
