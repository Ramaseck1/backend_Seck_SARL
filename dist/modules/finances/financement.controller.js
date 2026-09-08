"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.creer = creer;
exports.lister = lister;
exports.obtenir = obtenir;
exports.rembourser = rembourser;
const zod_1 = require("zod");
const financement_service_1 = require("./financement.service");
const creerSchema = zod_1.z.object({
    activiteId: zod_1.z.string().uuid(),
    nom: zod_1.z.string().min(1),
    prenom: zod_1.z.string().min(1),
    telephone: zod_1.z.string().min(6),
    montant: zod_1.z.number().positive(),
});
const remboursementSchema = zod_1.z
    .object({
    typePaiement: zod_1.z.enum(["COMPLET", "PARTIEL"]),
    montant: zod_1.z.number().positive().optional(),
})
    .refine((d) => d.typePaiement === "COMPLET" || (d.montant && d.montant > 0), {
    message: "Le montant est requis pour un paiement partiel.",
    path: ["montant"],
});
async function creer(req, res, next) {
    try {
        const body = creerSchema.parse(req.body);
        res.status(201).json(await (0, financement_service_1.creerFinancement)({ ...body, saisiParId: req.user.id }));
    }
    catch (err) {
        next(err);
    }
}
async function lister(req, res, next) {
    try {
        res.json(await (0, financement_service_1.listerFinancements)(req.query.activiteId));
    }
    catch (err) {
        next(err);
    }
}
async function obtenir(req, res, next) {
    try {
        res.json(await (0, financement_service_1.obtenirFinancement)(req.params.id));
    }
    catch (err) {
        next(err);
    }
}
async function rembourser(req, res, next) {
    try {
        const body = remboursementSchema.parse(req.body);
        res.status(201).json(await (0, financement_service_1.enregistrerRemboursementFinancement)({
            ...body,
            financementId: req.params.id,
            saisiParId: req.user.id,
        }));
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=financement.controller.js.map