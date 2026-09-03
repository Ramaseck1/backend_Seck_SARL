import { prisma } from "../../lib/prisma";

export class NomClientDupliqueError extends Error {
  constructor(nom: string) {
    super(`Le nom "${nom}" existe déjà. Ajoutez un mot pour le différencier (quartier, surnom, etc.).`);
    this.name = "NomClientDupliqueError";
  }
}

export class ClientIntrouvableError extends Error {
  constructor(id: string) {
    super(`Client introuvable (id: ${id}).`);
    this.name = "ClientIntrouvableError";
  }
}

export class ClientLieError extends Error {
  constructor() {
    super("Impossible de supprimer ce client : il a des ventes ou crédits enregistrés.");
    this.name = "ClientLieError";
  }
}

async function verifierNomUnique(nom: string, excludeId?: string) {
  const existant = await prisma.client.findFirst({
    where: {
      nom: { equals: nom, mode: "insensitive" },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });
  if (existant) throw new NomClientDupliqueError(nom);
}

export async function creerClient(nom: string, contact?: string) {
  const nomTrim = nom.trim();
  await verifierNomUnique(nomTrim);

  try {
    return await prisma.client.create({ data: { nom: nomTrim, contact } });
  } catch (err: any) {
    if (err.code === "P2002") throw new NomClientDupliqueError(nomTrim);
    throw err;
  }
}

export async function modifierClient(id: string, nom: string, contact?: string) {
  const nomTrim = nom.trim();

  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) throw new ClientIntrouvableError(id);

  await verifierNomUnique(nomTrim, id);

  try {
    return await prisma.client.update({
      where: { id },
      data: { nom: nomTrim, contact },
    });
  } catch (err: any) {
    if (err.code === "P2002") throw new NomClientDupliqueError(nomTrim);
    throw err;
  }
}

export async function supprimerClient(id: string) {
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) throw new ClientIntrouvableError(id);

  try {
    await prisma.client.delete({ where: { id } });
  } catch (err: any) {
    // P2003 = violation de contrainte de clé étrangère (ventes/credits liés)
    if (err.code === "P2003") throw new ClientLieError();
    throw err;
  }
}

// Suppression multiple — utilisée par la sélection sur le front
export async function supprimerClients(ids: string[]) {
  const resultats: { id: string; succes: boolean; erreur?: string }[] = [];

  for (const id of ids) {
    try {
      await supprimerClient(id);
      resultats.push({ id, succes: true });
    } catch (err: any) {
      resultats.push({ id, succes: false, erreur: err.message });
    }
  }

  return resultats;
}

export async function listerClients(recherche?: string) {
  return prisma.client.findMany({
    where: recherche
      ? { OR: [{ nom: { contains: recherche, mode: "insensitive" } }, { contact: { contains: recherche } }] }
      : undefined,
    orderBy: { nom: "asc" },
  });
}

export async function obtenirClient(id: string) {
  return prisma.client.findUnique({ where: { id } });
}

export async function soldesParActivite(clientId: string) {
  const credits = await prisma.credit.findMany({
    where: { clientId, statut: "EN_COURS" },
    include: { activite: true },
  });

  return credits.map((c) => ({
    activiteId: c.activiteId,
    activite: c.activite.nom,
    montantRestant: c.montantRestant,
    dateEmprunt: c.dateEmprunt,
  }));
}