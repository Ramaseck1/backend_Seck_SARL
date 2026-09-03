import { prisma } from "../../lib/prisma";

export async function creerFournisseur(nom: string, contact?: string) {
  return prisma.fournisseur.create({ data: { nom, contact } });
}

export async function listerFournisseurs() {
  return prisma.fournisseur.findMany({ orderBy: { nom: "asc" } });
}
