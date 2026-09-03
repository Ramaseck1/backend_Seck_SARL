import { prisma } from "../../lib/prisma";
import { AppError } from "../../middlewares/errorHandler";

export async function listerComptes() {
  return prisma.compteComptable.findMany({ orderBy: { code: "asc" } });
}

export async function creerCompte(code: string, libelle: string, type: string) {
  return prisma.compteComptable.create({ data: { code, libelle, type: type as never } });
}

interface LigneEcritureInput {
  compteId: string;
  sens: "DEBIT" | "CREDIT";
  montant: number;
}

interface CreerEcritureInput {
  activiteId: string;
  journal: string;
  libelle: string;
  reference?: string;
  saisiParId: string;
  lignes: LigneEcritureInput[];
}

// Une écriture comptable doit toujours être équilibrée : total débit = total crédit.
export async function creerEcriture(input: CreerEcritureInput) {
  const totalDebit = input.lignes.filter((l) => l.sens === "DEBIT").reduce((a, l) => a + l.montant, 0);
  const totalCredit = input.lignes.filter((l) => l.sens === "CREDIT").reduce((a, l) => a + l.montant, 0);

  if (totalDebit !== totalCredit) {
    throw new AppError(
      `Écriture non équilibrée : débit ${totalDebit} ≠ crédit ${totalCredit}`,
      400
    );
  }

  return prisma.ecritureComptable.create({
    data: {
      activiteId: input.activiteId,
      journal: input.journal,
      libelle: input.libelle,
      reference: input.reference,
      saisiParId: input.saisiParId,
      lignes: { create: input.lignes },
    },
    include: { lignes: { include: { compte: true } } },
  });
}

export async function listerEcritures(activiteId: string) {
  return prisma.ecritureComptable.findMany({
    where: { activiteId },
    include: { lignes: { include: { compte: true } } },
    orderBy: { date: "desc" },
  });
}

// Bilan simplifié : agrège les lignes d'écritures par type de compte,
// pour une activité précise, ou toutes activités confondues si activiteId
// est omis (vue consolidée, en lecture seule).
export async function calculerBilan(activiteId?: string) {
  const lignes = await prisma.ligneEcriture.findMany({
    where: activiteId ? { ecriture: { activiteId } } : undefined,
    include: { compte: true },
  });

  const totauxParType: Record<string, number> = {};

  for (const ligne of lignes) {
    const signe = ligne.sens === "DEBIT" ? 1 : -1;
    const cle = ligne.compte.type;
    totauxParType[cle] = (totauxParType[cle] ?? 0) + signe * Number(ligne.montant);
  }

  return {
    activiteId: activiteId ?? "CONSOLIDE",
    totauxParType,
  };
}
