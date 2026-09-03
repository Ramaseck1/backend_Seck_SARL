"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.creer = creer;
exports.lister = lister;
exports.ajuster = ajuster;
exports.alertes = alertes;
exports.bilan = bilan;
const zod_1 = require("zod");
const produits_service_1 = require("./produits.service");
const creerSchema = zod_1.z.object({
    activiteId: zod_1.z.string().uuid(),
    nom: zod_1.z.string().min(2).optional(), // ← ajouter .optional()
    prixAchatUnitaire: zod_1.z.number().positive(),
    prixUnitaire: zod_1.z.number().positive(),
    quantiteStock: zod_1.z.number().nonnegative(),
    seuilAlerte: zod_1.z.number()
        .nonnegative()
        .optional(),
    dateAchat: zod_1.z.string()
        .datetime()
        .optional(),
});
const ajustementSchema = zod_1.z.object({
    delta: zod_1.z.number(),
    motif: zod_1.z.string().min(2),
    prixAchatUnitaire: zod_1.z.number()
        .positive()
        .optional(),
});
async function creer(req, res, next) {
    try {
        const body = creerSchema.parse(req.body);
        const produit = await (0, produits_service_1.creerProduit)({
            ...body,
            dateAchat: body.dateAchat
                ? new Date(body.dateAchat)
                : undefined,
        });
        res
            .status(201)
            .json(produit);
    }
    catch (err) {
        next(err);
    }
}
async function lister(req, res, next) {
    try {
        const activiteId = req.query.activiteId;
        res.json(await (0, produits_service_1.listerProduits)(activiteId));
    }
    catch (err) {
        next(err);
    }
}
async function ajuster(req, res, next) {
    try {
        const body = ajustementSchema.parse(req.body);
        const produit = await (0, produits_service_1.ajusterStock)({
            produitId: req.params.id,
            delta: body.delta,
            motif: body.motif,
            prixAchatUnitaire: body.prixAchatUnitaire,
        });
        res.json(produit);
    }
    catch (err) {
        next(err);
    }
}
async function alertes(req, res, next) {
    try {
        const activiteId = req.query.activiteId;
        res.json(await (0, produits_service_1.produitsEnAlerte)(activiteId));
    }
    catch (err) {
        next(err);
    }
}
async function bilan(req, res, next) {
    try {
        const result = await (0, produits_service_1.obtenirBilanProduit)(req.params.id);
        res.json(result);
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=produits.controller.js.map