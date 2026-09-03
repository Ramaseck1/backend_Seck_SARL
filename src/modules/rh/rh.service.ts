import { prisma } from "../../lib/prisma";
import { AppError } from "../../middlewares/errorHandler";

interface CreerEmployeInput {
  activiteId: string;
  nom: string;
  poste: string;
  salaireBase: number;
  contact?: string;
}

export async function creerEmploye(input: CreerEmployeInput) {
  return prisma.employe.create({ data: input });
}

export async function listerEmployes(activiteId: string) {
  return prisma.employe.findMany({ where: { activiteId }, orderBy: { nom: "asc" } });
}

export async function enregistrerPresence(employeId: string, date: string, present: boolean, heures: number) {
  return prisma.presence.upsert({
    where: { employeId_date: { employeId, date: new Date(date) } },
    update: { present, heures },
    create: { employeId, date: new Date(date), present, heures },
  });
}

interface GenererBulletinInput {
  employeId: string;
  mois: number;
  annee: number;
  deductions?: number;
}

export async function genererBulletin(input: GenererBulletinInput) {
  const employe = await prisma.employe.findUnique({ where: { id: input.employeId } });
  if (!employe) throw new AppError("Employé introuvable", 404);

  const existant = await prisma.bulletin.findUnique({
    where: { employeId_mois_annee: { employeId: input.employeId, mois: input.mois, annee: input.annee } },
  });
  if (existant) throw new AppError("Un bulletin existe déjà pour cette période", 409);

  const montantBrut = Number(employe.salaireBase);
  const deductions = input.deductions ?? 0;
  const montantNet = montantBrut - deductions;

  return prisma.bulletin.create({
    data: {
      employeId: input.employeId,
      mois: input.mois,
      annee: input.annee,
      montantBrut,
      deductions,
      montantNet,
    },
  });
}
