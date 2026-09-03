"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.creerVente = creerVente;
exports.listerVentes = listerVentes;
exports.obtenirVente = obtenirVente;
const prisma_1 = require("../../lib/prisma");
const errorHandler_1 = require("../../middlewares/errorHandler");
/**
 * Crée une vente.
 *
 * Le montant est calculé automatiquement
 * à partir du prix de vente du produit :
 *
 * montant = prixUnitaire × quantite
 *
 * Le montant envoyé éventuellement par le
 * frontend est donc totalement ignoré.
 */
async function creerVente(input) {
    const { activiteId, clientId, produitId, saisiParId, quantite, modePaiement, } = input;
    return prisma_1.prisma.$transaction(async (tx) => {
        // ==========================================
        // VÉRIFICATION DU PRODUIT
        // ==========================================
        const produit = await tx.produit.findUnique({
            where: {
                id: produitId,
            },
        });
        if (!produit) {
            throw new errorHandler_1.AppError("Produit introuvable.", 404);
        }
        // ==========================================
        // VÉRIFICATION ACTIVITÉ
        // ==========================================
        if (produit.activiteId !==
            activiteId) {
            throw new errorHandler_1.AppError("Ce produit n'appartient pas à cette activité.", 400);
        }
        // ==========================================
        // VÉRIFICATION SESSION
        // ==========================================
        if (produit.sessionTerminee) {
            throw new errorHandler_1.AppError(`La session du produit "${produit.nom}" est déjà terminée.`, 400);
        }
        // ==========================================
        // QUANTITÉ
        // ==========================================
        const stockDisponible = Number(produit.quantiteStock);
        const quantiteDemandee = Number(quantite);
        if (!Number.isFinite(quantiteDemandee)) {
            throw new errorHandler_1.AppError("La quantité est invalide.", 400);
        }
        if (quantiteDemandee <= 0) {
            throw new errorHandler_1.AppError("La quantité doit être supérieure à 0.", 400);
        }
        // ==========================================
        // STOCK ÉPUISÉ
        // ==========================================
        if (stockDisponible <= 0) {
            throw new errorHandler_1.AppError(`Stock épuisé. Le produit "${produit.nom}" n'est plus disponible à la vente.`, 400);
        }
        // ==========================================
        // STOCK INSUFFISANT
        // ==========================================
        if (quantiteDemandee >
            stockDisponible) {
            throw new errorHandler_1.AppError(`Stock insuffisant pour "${produit.nom}". ` +
                `Stock disponible : ${stockDisponible}. ` +
                `Quantité demandée : ${quantiteDemandee}.`, 400);
        }
        // ==========================================
        // PRIX DE VENTE
        // ==========================================
        const prixVenteUnitaire = Number(produit.prixUnitaire);
        if (!Number.isFinite(prixVenteUnitaire) ||
            prixVenteUnitaire <= 0) {
            throw new errorHandler_1.AppError(`Le produit "${produit.nom}" n'a pas de prix de vente valide.`, 400);
        }
        // ==========================================
        // CALCUL AUTOMATIQUE DU MONTANT
        // ==========================================
        const montant = prixVenteUnitaire *
            quantiteDemandee;
        if (!Number.isFinite(montant) ||
            montant <= 0) {
            throw new errorHandler_1.AppError("Le montant calculé de la vente est invalide.", 400);
        }
        // ==========================================
        // NOUVEAU STOCK
        // ==========================================
        const nouveauStock = stockDisponible -
            quantiteDemandee;
        if (nouveauStock < 0) {
            throw new errorHandler_1.AppError("La vente ne peut pas être effectuée : le stock ne peut pas être négatif.", 400);
        }
        // ==========================================
        // VÉRIFICATION DU CRÉDIT
        // ==========================================
        if (modePaiement ===
            "CREDIT") {
            const creditExistant = await tx.credit.findFirst({
                where: {
                    clientId,
                    activiteId,
                    statut: "EN_COURS",
                },
            });
            if (creditExistant) {
                throw new errorHandler_1.AppError(`Ce client a déjà un emprunt en cours sur cette activité ` +
                    `(reste ${creditExistant.montantRestant} à rembourser). ` +
                    `Impossible de créer un nouvel emprunt tant qu'il n'est pas soldé.`, 409);
            }
        }
        // ==========================================
        // CRÉATION DE LA VENTE
        // ==========================================
        const vente = await tx.vente.create({
            data: {
                activiteId,
                clientId,
                produitId,
                saisiParId,
                quantite: quantiteDemandee,
                // IMPORTANT :
                // montant calculé côté serveur
                montant,
                modePaiement,
            },
        });
        // ==========================================
        // DÉCRÉMENTATION DU STOCK
        // ==========================================
        await tx.produit.update({
            where: {
                id: produitId,
            },
            data: {
                quantiteStock: nouveauStock,
                sessionTerminee: nouveauStock === 0,
                dateFinSession: nouveauStock === 0
                    ? new Date()
                    : null,
            },
        });
        // ==========================================
        // PAIEMENT COMPTANT
        // ==========================================
        if (modePaiement ===
            "COMPTANT") {
            await tx.mouvementCaisse.create({
                data: {
                    activiteId,
                    venteId: vente.id,
                    saisiParId,
                    type: "ENTREE",
                    montant,
                    motif: "Vente comptant",
                },
            });
        }
        // ==========================================
        // PAIEMENT À CRÉDIT
        // ==========================================
        else {
            await tx.credit.create({
                data: {
                    clientId,
                    activiteId,
                    venteId: vente.id,
                    montantInitial: montant,
                    montantRembourse: 0,
                    montantRestant: montant,
                    statut: "EN_COURS",
                },
            });
        }
        // ==========================================
        // AUDIT
        // ==========================================
        await tx.auditLog.create({
            data: {
                utilisateurId: saisiParId,
                action: "CREATION_VENTE",
                entite: "Vente",
                entiteId: vente.id,
                details: {
                    modePaiement,
                    prixVenteUnitaire,
                    montant,
                    quantite: quantiteDemandee,
                    stockAvant: stockDisponible,
                    stockApres: nouveauStock,
                },
            },
        });
        return vente;
    });
}
/**
 * Liste les ventes d'une activité.
 */
function listerVentes(activiteId, clientId) {
    return prisma_1.prisma.vente.findMany({
        where: {
            activiteId,
            ...(clientId
                ? { clientId }
                : {}),
        },
        orderBy: {
            date: "desc",
        },
        include: {
            client: true,
            produit: true,
        },
    });
}
/**
 * Récupère une vente.
 */
function obtenirVente(id) {
    return prisma_1.prisma.vente.findUniqueOrThrow({
        where: {
            id,
        },
        include: {
            client: true,
            produit: true,
            credit: true,
            mouvementCaisse: true,
        },
    });
}
//# sourceMappingURL=ventes.service.js.map