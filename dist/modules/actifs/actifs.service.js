"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.creerActif = creerActif;
exports.listerActifs = listerActifs;
exports.valeurNetteComptable = valeurNetteComptable;
const prisma_1 = require("../../lib/prisma");
async function creerActif(input) {
    return prisma_1.prisma.actif.create({
        data: { ...input, dateAcquisition: new Date(input.dateAcquisition) },
    });
}
async function listerActifs(activiteId) {
    return prisma_1.prisma.actif.findMany({ where: { activiteId }, orderBy: { dateAcquisition: "desc" } });
}
// Amortissement linéaire simple : valeur / durée en mois, x mois écoulés
async function valeurNetteComptable(actifId) {
    const actif = await prisma_1.prisma.actif.findUnique({ where: { id: actifId } });
    if (!actif)
        return null;
    const moisEcoules = Math.floor((Date.now() - actif.dateAcquisition.getTime()) / (1000 * 60 * 60 * 24 * 30));
    const amortissementMensuel = Number(actif.valeurAcquisition) / actif.dureeAmortissement;
    const amortissementCumule = Math.min(amortissementMensuel * moisEcoules, Number(actif.valeurAcquisition));
    return {
        actifId,
        valeurAcquisition: Number(actif.valeurAcquisition),
        amortissementCumule,
        valeurNette: Number(actif.valeurAcquisition) - amortissementCumule,
    };
}
//# sourceMappingURL=actifs.service.js.map