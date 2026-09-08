import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";

interface CreerFinancementInput {
  activiteId: string;
  nom: string;
  prenom: string;
  telephone: string;
  montant: number;
  saisiParId: string;
}

export async function creerFinancement(input: CreerFinancementInput) {
  const { activiteId, nom, prenom, telephone, montant, saisiParId } = input;

  return prisma.$transaction(async (tx) => {
    const mouvement = await tx.mouvementCaisse.create({
      data: {
        activiteId,
        saisiParId,
        type: "SORTIE",
        montant,
        motif: `Financement — ${prenom} ${nom}`,
        categorie: "FINANCEMENT",
      },
    });

    return tx.financement.create({
      data: {
        activiteId,
        nom,
        prenom,
        telephone,
        montant,
        montantRestant: montant,
        saisiParId,
        mouvementCaisseId: mouvement.id,
      },
    });
  });
}

export async function listerFinancements(activiteId: string) {
  return prisma.financement.findMany({
    where: { activiteId },
    orderBy: { date: "desc" },
  });
}

export async function obtenirFinancement(id: string) {
  const financement = await prisma.financement.findUniqueOrThrow({ where: { id } });
  return financement;
}

interface RembourserFinancementInput {
  financementId: string;
  typePaiement: "COMPLET" | "PARTIEL";
  montant?: number; // requis si PARTIEL
  saisiParId: string;
}

export async function enregistrerRemboursementFinancement(input: RembourserFinancementInput) {
  const { financementId, typePaiement, montant, saisiParId } = input;

  return prisma.$transaction(async (tx) => {
    const financement = await tx.financement.findUniqueOrThrow({ where: { id: financementId } });

    if (financement.statut === "PAYE") {
      throw new Error("Ce financement est déjà soldé.");
    }

    const restant = new Prisma.Decimal(financement.montantRestant);
    let montantAPayer: Prisma.Decimal;

    if (typePaiement === "COMPLET") {
      montantAPayer = restant;
    } else {
      if (!montant || montant <= 0) throw new Error("Montant partiel invalide.");
      montantAPayer = new Prisma.Decimal(montant);
      if (montantAPayer.gt(restant)) throw new Error("Le montant dépasse le solde restant.");
    }

    const mouvement = await tx.mouvementCaisse.create({
      data: {
        activiteId: financement.activiteId,
        saisiParId,
        type: "ENTREE",
        montant: montantAPayer,
        motif: `Remboursement financement — ${financement.prenom} ${financement.nom}`,
        categorie: "FINANCEMENT",
      },
    });

    const remboursement = await tx.remboursementFinancement.create({
      data: {
        financementId,
        saisiParId,
        montant: montantAPayer,
        typePaiement,
        mouvementCaisseId: mouvement.id,
      },
    });

    const nouveauRestant = restant.sub(montantAPayer);
    const solde = nouveauRestant.lte(0);

    await tx.financement.update({
      where: { id: financementId },
      data: {
        montantRembourse: new Prisma.Decimal(financement.montantRembourse).add(montantAPayer),
        montantRestant: solde ? 0 : nouveauRestant,
        statut: solde ? "PAYE" : "NON_PAYE",
        dateSolde: solde ? new Date() : null,
      },
    });

    return remboursement;
  });
}