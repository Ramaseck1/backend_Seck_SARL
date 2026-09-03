"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.comptes = comptes;
exports.creerCompteHandler = creerCompteHandler;
exports.ecritures = ecritures;
exports.creerEcritureHandler = creerEcritureHandler;
exports.bilan = bilan;
const zod_1 = require("zod");
const comptabilite_service_1 = require("./comptabilite.service");
const creerCompteSchema = zod_1.z.object({
    code: zod_1.z.string().min(1),
    libelle: zod_1.z.string().min(2),
    type: zod_1.z.enum(["ACTIF", "PASSIF", "CHARGE", "PRODUIT", "CAPITAUX"]),
});
const ligneSchema = zod_1.z.object({
    compteId: zod_1.z.string().uuid(),
    sens: zod_1.z.enum(["DEBIT", "CREDIT"]),
    montant: zod_1.z.number().positive(),
});
const creerEcritureSchema = zod_1.z.object({
    activiteId: zod_1.z.string().uuid(),
    journal: zod_1.z.string().min(2),
    libelle: zod_1.z.string().min(2),
    reference: zod_1.z.string().optional(),
    lignes: zod_1.z.array(ligneSchema).min(2),
});
async function comptes(_req, res, next) {
    try {
        res.json(await (0, comptabilite_service_1.listerComptes)());
    }
    catch (err) {
        next(err);
    }
}
async function creerCompteHandler(req, res, next) {
    try {
        const body = creerCompteSchema.parse(req.body);
        res.status(201).json(await (0, comptabilite_service_1.creerCompte)(body.code, body.libelle, body.type));
    }
    catch (err) {
        next(err);
    }
}
async function ecritures(req, res, next) {
    try {
        res.json(await (0, comptabilite_service_1.listerEcritures)(req.query.activiteId));
    }
    catch (err) {
        next(err);
    }
}
async function creerEcritureHandler(req, res, next) {
    try {
        const body = creerEcritureSchema.parse(req.body);
        res.status(201).json(await (0, comptabilite_service_1.creerEcriture)({ ...body, saisiParId: req.user.id }));
    }
    catch (err) {
        next(err);
    }
}
async function bilan(req, res, next) {
    try {
        res.json(await (0, comptabilite_service_1.calculerBilan)(req.query.activiteId));
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=comptabilite.controller.js.map