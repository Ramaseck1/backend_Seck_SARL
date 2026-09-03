import { prisma } from "../../lib/prisma";

export async function creerActivite(nom: string, uniteMesure: string) {
  return prisma.activite.create({ data: { nom, uniteMesure } });
}

export async function listerActivites() {
  return prisma.activite.findMany({ orderBy: { nom: "asc" } });
}

export async function obtenirActivite(id: string) {
  return prisma.activite.findUnique({ where: { id } });
}
