"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enregistrerMouvement = enregistrerMouvement;
exports.listerMouvements = listerMouvements;
exports.soldeCaisse = soldeCaisse;
const prisma_1 = require("../../lib/prisma");
async function enregistrerMouvement(input) {
    return prisma_1.prisma.mouvementCaisse.create({ data: input });
}
async function listerMouvements(activiteId, dateDebut, dateFin) {
    return prisma_1.prisma.mouvementCaisse.findMany({
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
async function soldeCaisse(activiteId) {
    const [entrees, sorties] = await Promise.all([
        prisma_1.prisma.mouvementCaisse.aggregate({ where: { activiteId, type: "ENTREE" }, _sum: { montant: true } }),
        prisma_1.prisma.mouvementCaisse.aggregate({ where: { activiteId, type: "SORTIE" }, _sum: { montant: true } }),
    ]);
    const total = Number(entrees._sum.montant ?? 0) - Number(sorties._sum.montant ?? 0);
    return { activiteId, solde: total };
}
//# sourceMappingURL=caisse.service.js.map