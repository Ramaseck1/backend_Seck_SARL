"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.creerProduit = creerProduit;
exports.listerProduits = listerProduits;
exports.ajusterStock = ajusterStock;
exports.produitsEnAlerte = produitsEnAlerte;
exports.obtenirBilanProduit = obtenirBilanProduit;
const prisma_1 = require("../../lib/prisma");
const errorHandler_1 = require("../../middlewares/errorHandler");
/**
 * Créer une nouvelle session produit.
 *
 * Une activité ne peut avoir qu'une seule session active.
 */
async function creerProduit(input) {
    const quantite = input.quantiteStock ?? 0;
    const dateAchat = input.dateAchat ?? new Date();
    const totalInvesti = quantite * input.prixAchatUnitaire;
    return prisma_1.prisma.$transaction(async (tx) => {
        const dernierProduit = await tx.produit.findFirst({
            where: { activiteId: input.activiteId },
            orderBy: { numeroSession: "desc" },
        });
        const numeroSession = (dernierProduit?.numeroSession ?? 0) + 1;
        const produit = await tx.produit.create({
            data: {
                activiteId: input.activiteId,
                numeroSession,
                nom: input.nom,
                quantiteStock: quantite,
                quantiteInitiale: quantite,
                seuilAlerte: input.seuilAlerte ?? 0,
                prixAchatUnitaire: input.prixAchatUnitaire,
                prixUnitaire: input.prixUnitaire,
                totalInvesti,
                dateAchat,
                sessionTerminee: quantite === 0,
                dateFinSession: quantite === 0
                    ? dateAchat
                    : null,
            },
        });
        // Enregistrer l'achat initial
        if (quantite > 0) {
            await tx.achatProduit.create({
                data: {
                    produitId: produit.id,
                    quantite,
                    prixUnitaire: input.prixAchatUnitaire,
                    montantTotal: totalInvesti,
                    date: dateAchat,
                    motif: "Achat initial",
                },
            });
        }
        return produit;
    });
}
/**
 * Liste les produits / sessions d'une activité.
 */
async function listerProduits(activiteId) {
    return prisma_1.prisma.produit.findMany({
        where: {
            activiteId,
        },
        orderBy: [
            {
                sessionTerminee: "asc",
            },
            {
                numeroSession: "desc"
            },
        ],
        include: {
            activite: true
        },
    });
}
/**
 * Ajustement du stock.
 *
 * delta positif = nouvel achat / entrée
 * delta négatif = perte / casse / correction
 */
async function ajusterStock(input) {
    const { produitId, delta, motif, prixAchatUnitaire, } = input;
    return prisma_1.prisma.$transaction(async (tx) => {
        const produit = await tx.produit.findUnique({
            where: {
                id: produitId,
            },
        });
        if (!produit) {
            throw new errorHandler_1.AppError("Produit introuvable", 404);
        }
        if (produit.sessionTerminee) {
            throw new errorHandler_1.AppError("Cette session est déjà terminée.", 400);
        }
        const ancienStock = Number(produit.quantiteStock);
        const nouveauStock = ancienStock + delta;
        if (nouveauStock < 0) {
            throw new errorHandler_1.AppError("Le stock ne peut pas être négatif.", 400);
        }
        let totalInvesti = Number(produit.totalInvesti);
        let nouveauPrixAchat = Number(produit.prixAchatUnitaire);
        // ==========================================
        // NOUVEL ACHAT
        // ==========================================
        if (delta > 0) {
            if (prixAchatUnitaire === undefined ||
                prixAchatUnitaire <= 0) {
                throw new errorHandler_1.AppError("Le prix d'achat est obligatoire pour une entrée de stock.", 400);
            }
            const montantAchat = delta * prixAchatUnitaire;
            totalInvesti += montantAchat;
            nouveauPrixAchat =
                prixAchatUnitaire;
            await tx.achatProduit.create({
                data: {
                    produitId,
                    quantite: delta,
                    prixUnitaire: prixAchatUnitaire,
                    montantTotal: montantAchat,
                    motif,
                },
            });
        }
        // ==========================================
        // FIN DE SESSION
        // ==========================================
        const sessionTerminee = nouveauStock === 0;
        return tx.produit.update({
            where: {
                id: produitId,
            },
            data: {
                quantiteStock: nouveauStock,
                totalInvesti,
                prixAchatUnitaire: nouveauPrixAchat,
                sessionTerminee,
                dateFinSession: sessionTerminee
                    ? new Date()
                    : null,
            },
        });
    });
}
/**
 * Produits en alerte.
 */
async function produitsEnAlerte(activiteId) {
    const produits = await prisma_1.prisma.produit.findMany({
        where: {
            activiteId,
            sessionTerminee: false,
        },
    });
    return produits.filter((p) => Number(p.quantiteStock) <=
        Number(p.seuilAlerte));
}
/**
 * Compte rendu complet d'une session produit.
 */
async function obtenirBilanProduit(produitId) {
    const produit = await prisma_1.prisma.produit.findUnique({
        where: {
            id: produitId,
        },
        include: {
            activite: true,
            achats: {
                orderBy: {
                    date: "asc",
                },
            },
            ventes: {
                orderBy: {
                    date: "desc",
                },
                include: {
                    client: true,
                    credit: {
                        include: {
                            remboursements: {
                                orderBy: {
                                    date: "asc",
                                },
                            },
                        },
                    },
                },
            },
        },
    });
    if (!produit) {
        throw new errorHandler_1.AppError("Produit introuvable", 404);
    }
    // ==========================================
    // INVESTISSEMENT
    // ==========================================
    const totalInvesti = produit.achats.reduce((total, achat) => total +
        Number(achat.montantTotal), 0);
    const quantiteAchetee = produit.achats.reduce((total, achat) => total +
        Number(achat.quantite), 0);
    // ==========================================
    // VENTES
    // ==========================================
    const quantiteVendue = produit.ventes.reduce((total, vente) => total +
        Number(vente.quantite), 0);
    const montantTotalVendu = produit.ventes.reduce((total, vente) => total +
        Number(vente.montant), 0);
    // ==========================================
    // CREDITS
    // ==========================================
    const ventesCredit = produit.ventes.filter((vente) => vente.modePaiement === "CREDIT");
    const totalCredit = ventesCredit.reduce((total, vente) => total +
        Number(vente.credit?.montantInitial ?? 0), 0);
    const totalCreditRembourse = ventesCredit.reduce((total, vente) => total +
        Number(vente.credit?.montantRembourse ?? 0), 0);
    const totalCreditRestant = ventesCredit.reduce((total, vente) => total +
        Number(vente.credit?.montantRestant ?? 0), 0);
    // ==========================================
    // CLIENTS NON PAYÉS
    // ==========================================
    const clientsNonPayes = ventesCredit
        .filter((vente) => Number(vente.credit?.montantRestant ?? 0) > 0)
        .map((vente) => ({
        venteId: vente.id,
        client: vente.client,
        montantInitial: Number(vente.credit?.montantInitial ?? 0),
        montantRembourse: Number(vente.credit?.montantRembourse ?? 0),
        montantRestant: Number(vente.credit?.montantRestant ?? 0),
        statut: vente.credit?.statut,
    }));
    // ==========================================
    // CLIENTS PAYÉS
    // ==========================================
    const clientsPayes = ventesCredit
        .filter((vente) => Number(vente.credit?.montantRestant ?? 0) === 0)
        .map((vente) => ({
        venteId: vente.id,
        client: vente.client,
        montant: Number(vente.montant),
        datePaiement: vente.credit?.dateSolde,
        statut: "PAYE",
    }));
    // ==========================================
    // STOCK
    // ==========================================
    const stockRestant = Number(produit.quantiteStock);
    const valeurStock = stockRestant *
        Number(produit.prixAchatUnitaire);
    // ==========================================
    // BILAN
    // ==========================================
    return {
        produit: {
            id: produit.id,
            nom: produit.nom,
            activite: produit.activite,
            dateAchat: produit.dateAchat,
            dateFinSession: produit.dateFinSession,
            sessionTerminee: produit.sessionTerminee,
            prixAchatUnitaire: Number(produit.prixAchatUnitaire),
            prixVenteUnitaire: Number(produit.prixUnitaire),
        },
        investissement: {
            quantiteAchetee,
            totalInvesti,
            achats: produit.achats.map((achat) => ({
                id: achat.id,
                quantite: Number(achat.quantite),
                prixUnitaire: Number(achat.prixUnitaire),
                montantTotal: Number(achat.montantTotal),
                date: achat.date,
                motif: achat.motif,
            })),
        },
        ventes: {
            quantiteVendue,
            montantTotal: montantTotalVendu,
            nombreVentes: produit.ventes.length,
            details: produit.ventes.map((vente) => ({
                id: vente.id,
                quantite: Number(vente.quantite),
                montant: Number(vente.montant),
                modePaiement: vente.modePaiement,
                date: vente.date,
                client: vente.client,
                credit: vente.credit
                    ? {
                        montantInitial: Number(vente.credit.montantInitial),
                        montantRembourse: Number(vente.credit.montantRembourse),
                        montantRestant: Number(vente.credit.montantRestant),
                        statut: vente.credit.statut,
                    }
                    : null,
            })),
        },
        stock: {
            quantiteRestante: stockRestant,
            valeurEstimee: valeurStock,
        },
        credits: {
            totalCredit,
            totalRembourse: totalCreditRembourse,
            totalRestant: totalCreditRestant,
            nombreCredits: ventesCredit.length,
            clientsNonPayes,
            clientsPayes,
        },
        // Résultat indicatif
        // = ventes encaissables + valeur du stock - investissement
        resultatEstime: montantTotalVendu +
            valeurStock -
            totalInvesti,
    };
}
//# sourceMappingURL=produits.service.js.map