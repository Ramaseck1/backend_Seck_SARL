import { prisma } from "../../lib/prisma";

interface CreerActifInput {
  activiteId: string;
  nom: string;
  valeurAcquisition: number;
  dateAcquisition: string;
  dureeAmortissement: number;
}

export async function creerActif(input: CreerActifInput) {
  return prisma.actif.create({
    data: { ...input, dateAcquisition: new Date(input.dateAcquisition) },
  });
}

export async function listerActifs(activiteId: string) {
  return prisma.actif.findMany({ where: { activiteId }, orderBy: { dateAcquisition: "desc" } });
}

// Amortissement linéaire simple : valeur / durée en mois, x mois écoulés
export async function valeurNetteComptable(actifId: string) {
  const actif = await prisma.actif.findUnique({ where: { id: actifId } });
  if (!actif) return null;

  const moisEcoules = Math.floor(
    (Date.now() - actif.dateAcquisition.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );
  const amortissementMensuel = Number(actif.valeurAcquisition) / actif.dureeAmortissement;
  const amortissementCumule = Math.min(
    amortissementMensuel * moisEcoules,
    Number(actif.valeurAcquisition)
  );

  return {
    actifId,
    valeurAcquisition: Number(actif.valeurAcquisition),
    amortissementCumule,
    valeurNette: Number(actif.valeurAcquisition) - amortissementCumule,
  };
}
