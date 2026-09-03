"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listerComptes = listerComptes;
exports.creerCompte = creerCompte;
exports.creerEcriture = creerEcriture;
exports.listerEcritures = listerEcritures;
exports.calculerBilan = calculerBilan;
const prisma_1 = require("../../lib/prisma");
const errorHandler_1 = require("../../middlewares/errorHandler");
async function listerComptes() {
    return prisma_1.prisma.compteComptable.findMany({ orderBy: { code: "asc" } });
}
async function creerCompte(code, libelle, type) {
    return prisma_1.prisma.compteComptable.create({ data: { code, libelle, type: type } });
}
// Une écriture comptable doit toujours être équilibrée : total débit = total crédit.
async function creerEcriture(input) {
    const totalDebit = input.lignes.filter((l) => l.sens === "DEBIT").reduce((a, l) => a + l.montant, 0);
    const totalCredit = input.lignes.filter((l) => l.sens === "CREDIT").reduce((a, l) => a + l.montant, 0);
    if (totalDebit !== totalCredit) {
        throw new errorHandler_1.AppError(`Écriture non équilibrée : débit ${totalDebit} ≠ crédit ${totalCredit}`, 400);
    }
    return prisma_1.prisma.ecritureComptable.create({
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
async function listerEcritures(activiteId) {
    return prisma_1.prisma.ecritureComptable.findMany({
        where: { activiteId },
        include: { lignes: { include: { compte: true } } },
        orderBy: { date: "desc" },
    });
}
// Bilan simplifié : agrège les lignes d'écritures par type de compte,
// pour une activité précise, ou toutes activités confondues si activiteId
// est omis (vue consolidée, en lecture seule).
async function calculerBilan(activiteId) {
    const lignes = await prisma_1.prisma.ligneEcriture.findMany({
        where: activiteId ? { ecriture: { activiteId } } : undefined,
        include: { compte: true },
    });
    const totauxParType = {};
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
//# sourceMappingURL=comptabilite.service.js.map