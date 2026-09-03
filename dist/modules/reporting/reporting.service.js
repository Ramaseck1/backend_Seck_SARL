"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rapportJournalier = rapportJournalier;
exports.rapportConsolide = rapportConsolide;
const prisma_1 = require("../../lib/prisma");
// Rapport journalier pour une activité : vendu, encaissé, crédit accordé/remboursé
async function rapportJournalier(activiteId, dateStr) {
    const date = dateStr ? new Date(dateStr) : new Date();
    const debut = new Date(date.setHours(0, 0, 0, 0));
    const fin = new Date(date.setHours(23, 59, 59, 999));
    const [ventes, remboursements, mouvements] = await Promise.all([
        prisma_1.prisma.vente.findMany({ where: { activiteId, date: { gte: debut, lte: fin } } }),
        prisma_1.prisma.remboursement.findMany({
            where: { credit: { activiteId }, date: { gte: debut, lte: fin } },
        }),
        prisma_1.prisma.mouvementCaisse.findMany({ where: { activiteId, date: { gte: debut, lte: fin } } }),
    ]);
    const totalVendu = ventes.reduce((a, v) => a + Number(v.montant), 0);
    const totalCreditAccorde = ventes
        .filter((v) => v.modePaiement === "CREDIT")
        .reduce((a, v) => a + Number(v.montant), 0);
    const totalRembourse = remboursements.reduce((a, r) => a + Number(r.montant), 0);
    const totalEncaisse = mouvements
        .filter((m) => m.type === "ENTREE")
        .reduce((a, m) => a + Number(m.montant), 0);
    return {
        activiteId,
        date: debut.toISOString().slice(0, 10),
        totalVendu,
        totalEncaisse,
        totalCreditAccorde,
        totalRembourse,
        nombreVentes: ventes.length,
    };
}
// Rapport consolidé des trois activités — lecture seule, aucune fusion de caisse
async function rapportConsolide() {
    const activites = await prisma_1.prisma.activite.findMany();
    const rapports = await Promise.all(activites.map(async (activite) => {
        const [soldeEntrees, soldeSorties, creancesEnCours] = await Promise.all([
            prisma_1.prisma.mouvementCaisse.aggregate({
                where: { activiteId: activite.id, type: "ENTREE" },
                _sum: { montant: true },
            }),
            prisma_1.prisma.mouvementCaisse.aggregate({
                where: { activiteId: activite.id, type: "SORTIE" },
                _sum: { montant: true },
            }),
            prisma_1.prisma.credit.aggregate({
                where: { activiteId: activite.id, statut: "EN_COURS" },
                _sum: { montantRestant: true },
            }),
        ]);
        return {
            activiteId: activite.id,
            nom: activite.nom,
            soldeCaisse: Number(soldeEntrees._sum.montant ?? 0) - Number(soldeSorties._sum.montant ?? 0),
            creancesEnCours: Number(creancesEnCours._sum.montantRestant ?? 0),
        };
    }));
    return {
        activites: rapports,
        totalCaisseConsolide: rapports.reduce((a, r) => a + r.soldeCaisse, 0),
        totalCreancesConsolide: rapports.reduce((a, r) => a + r.creancesEnCours, 0),
    };
}
//# sourceMappingURL=reporting.service.js.map