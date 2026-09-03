import { prisma } from "../../lib/prisma";

interface MouvementInput {
  activiteId: string;
  type: "ENTREE" | "SORTIE";
  montant: number;
  motif: string;
  saisiParId: string;
}

export async function enregistrerMouvement(input: MouvementInput) {
  return prisma.mouvementCaisse.create({ data: input });
}

export async function listerMouvements(activiteId: string, dateDebut?: string, dateFin?: string) {
  return prisma.mouvementCaisse.findMany({
    where: {
      activiteId,
      ...(dateDebut || dateFin
        ? { date: { gte: dateDebut ? new Date(dateDebut) : undefined, lte: dateFin ? new Date(dateFin) : undefined } }
        : {}),
    },
    orderBy: { date: "desc" },
  });
}

// Solde de caisse en temps réel = somme des entrées - somme des sorties,
// jamais mélangé avec une autre activité.
export async function soldeCaisse(activiteId: string) {
  const [entrees, sorties] = await Promise.all([
    prisma.mouvementCaisse.aggregate({ where: { activiteId, type: "ENTREE" }, _sum: { montant: true } }),
    prisma.mouvementCaisse.aggregate({ where: { activiteId, type: "SORTIE" }, _sum: { montant: true } }),
  ]);

  const total = Number(entrees._sum.montant ?? 0) - Number(sorties._sum.montant ?? 0);
  return { activiteId, solde: total };
}
