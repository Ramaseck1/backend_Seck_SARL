"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.creerEmploye = creerEmploye;
exports.listerEmployes = listerEmployes;
exports.enregistrerPresence = enregistrerPresence;
exports.genererBulletin = genererBulletin;
const prisma_1 = require("../../lib/prisma");
const errorHandler_1 = require("../../middlewares/errorHandler");
async function creerEmploye(input) {
    return prisma_1.prisma.employe.create({ data: input });
}
async function listerEmployes(activiteId) {
    return prisma_1.prisma.employe.findMany({ where: { activiteId }, orderBy: { nom: "asc" } });
}
async function enregistrerPresence(employeId, date, present, heures) {
    return prisma_1.prisma.presence.upsert({
        where: { employeId_date: { employeId, date: new Date(date) } },
        update: { present, heures },
        create: { employeId, date: new Date(date), present, heures },
    });
}
async function genererBulletin(input) {
    const employe = await prisma_1.prisma.employe.findUnique({ where: { id: input.employeId } });
    if (!employe)
        throw new errorHandler_1.AppError("Employé introuvable", 404);
    const existant = await prisma_1.prisma.bulletin.findUnique({
        where: { employeId_mois_annee: { employeId: input.employeId, mois: input.mois, annee: input.annee } },
    });
    if (existant)
        throw new errorHandler_1.AppError("Un bulletin existe déjà pour cette période", 409);
    const montantBrut = Number(employe.salaireBase);
    const deductions = input.deductions ?? 0;
    const montantNet = montantBrut - deductions;
    return prisma_1.prisma.bulletin.create({
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
//# sourceMappingURL=rh.service.js.map