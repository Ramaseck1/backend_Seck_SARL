import { prisma } from "../../lib/prisma";
import { AppError } from "../../middlewares/errorHandler";

interface RembourserInput {
  creditId: string;
  montant: number;
  saisiParId: string;
}

// Enregistre un remboursement, met à jour le solde du crédit, et le passe
// automatiquement à SOLDE si le montant restant atteint zéro — ce qui
// débloque la possibilité d'un nouvel emprunt sur cette activité.
export async function enregistrerRemboursement(input: RembourserInput) {
  const { creditId, montant, saisiParId } = input;

  return prisma.$transaction(async (tx) => {
    const credit = await tx.credit.findUnique({ where: { id: creditId } });
    if (!credit) throw new AppError("Crédit introuvable", 404);
    if (credit.statut === "SOLDE") throw new AppError("Ce crédit est déjà soldé", 400);

    const nouveauMontantRembourse = Number(credit.montantRembourse) + montant;
    const nouveauMontantRestant = Number(credit.montantInitial) - nouveauMontantRembourse;

    if (nouveauMontantRestant < 0) {
      throw new AppError("Le montant remboursé dépasse le solde restant", 400);
    }

    const estSolde = nouveauMontantRestant === 0;

    const [remboursement] = await Promise.all([
      tx.remboursement.create({
        data: { creditId, montant, saisiParId },
      }),
      tx.credit.update({
        where: { id: creditId },
        data: {
          montantRembourse: nouveauMontantRembourse,
          montantRestant: nouveauMontantRestant,
          statut: estSolde ? "SOLDE" : "EN_COURS",
          dateSolde: estSolde ? new Date() : null,
        },
      }),
      tx.mouvementCaisse.create({
        data: {
          activiteId: credit.activiteId,
          saisiParId,
          type: "ENTREE",
          montant,
          motif: "Remboursement crédit client",
        },
      }),
    ]);

    return remboursement;
  });
}

// Liste des créances en retard, triées par ancienneté (pour relance)
export async function listerCreancesEnRetard(activiteId?: string) {
  return prisma.credit.findMany({
    where: { statut: "EN_COURS", ...(activiteId ? { activiteId } : {}) },
    orderBy: { dateEmprunt: "asc" },
    include: { client: true, activite: true,vente:true },
  });
}

export function obtenirCredit(id: string) {
  return prisma.credit.findUniqueOrThrow({
    where: { id },
    include: { client: true, activite: true, remboursements: true },
  });
}

export function historiqueCredits(clientId: string, activiteId?: string) {
  return prisma.credit.findMany({
    where: { clientId, ...(activiteId ? { activiteId } : {}) },
    orderBy: { dateEmprunt: "desc" },
    include: { remboursements: true },
  });
}

// Détail des crédits (en cours et soldés) d'un client, tous activités confondues
export async function listerCreditsClient(clientId: string) {
  return prisma.credit.findMany({
    where: { clientId },
    include: { activite: true, remboursements: true },
    orderBy: { dateEmprunt: "desc" },
  });
}
