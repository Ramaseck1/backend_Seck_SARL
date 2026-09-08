"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.creerFinancement = creerFinancement;
exports.listerFinancements = listerFinancements;
exports.obtenirFinancement = obtenirFinancement;
exports.enregistrerRemboursementFinancement = enregistrerRemboursementFinancement;
const prisma_1 = require("../../lib/prisma");
const client_1 = require("@prisma/client");
async function creerFinancement(input) {
    const { activiteId, nom, prenom, telephone, montant, saisiParId } = input;
    return prisma_1.prisma.$transaction(async (tx) => {
        const mouvement = await tx.mouvementCaisse.create({
            data: {
                activiteId,
                saisiParId,
                type: "SORTIE",
                montant,
                motif: `Financement — ${prenom} ${nom}`,
                categorie: "FINANCEMENT",
            },
        });
        return tx.financement.create({
            data: {
                activiteId,
                nom,
                prenom,
                telephone,
                montant,
                montantRestant: montant,
                saisiParId,
                mouvementCaisseId: mouvement.id,
            },
        });
    });
}
async function listerFinancements(activiteId) {
    return prisma_1.prisma.financement.findMany({
        where: { activiteId },
        orderBy: { date: "desc" },
    });
}
async function obtenirFinancement(id) {
    const financement = await prisma_1.prisma.financement.findUniqueOrThrow({ where: { id } });
    return financement;
}
async function enregistrerRemboursementFinancement(input) {
    const { financementId, typePaiement, montant, saisiParId } = input;
    return prisma_1.prisma.$transaction(async (tx) => {
        const financement = await tx.financement.findUniqueOrThrow({ where: { id: financementId } });
        if (financement.statut === "PAYE") {
            throw new Error("Ce financement est déjà soldé.");
        }
        const restant = new client_1.Prisma.Decimal(financement.montantRestant);
        let montantAPayer;
        if (typePaiement === "COMPLET") {
            montantAPayer = restant;
        }
        else {
            if (!montant || montant <= 0)
                throw new Error("Montant partiel invalide.");
            montantAPayer = new client_1.Prisma.Decimal(montant);
            if (montantAPayer.gt(restant))
                throw new Error("Le montant dépasse le solde restant.");
        }
        const mouvement = await tx.mouvementCaisse.create({
            data: {
                activiteId: financement.activiteId,
                saisiParId,
                type: "ENTREE",
                montant: montantAPayer,
                motif: `Remboursement financement — ${financement.prenom} ${financement.nom}`,
                categorie: "FINANCEMENT",
            },
        });
        const remboursement = await tx.remboursementFinancement.create({
            data: {
                financementId,
                saisiParId,
                montant: montantAPayer,
                typePaiement,
                mouvementCaisseId: mouvement.id,
            },
        });
        const nouveauRestant = restant.sub(montantAPayer);
        const solde = nouveauRestant.lte(0);
        await tx.financement.update({
            where: { id: financementId },
            data: {
                montantRembourse: new client_1.Prisma.Decimal(financement.montantRembourse).add(montantAPayer),
                montantRestant: solde ? 0 : nouveauRestant,
                statut: solde ? "PAYE" : "NON_PAYE",
                dateSolde: solde ? new Date() : null,
            },
        });
        return remboursement;
    });
}
//# sourceMappingURL=financement.service.js.map