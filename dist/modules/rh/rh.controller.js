"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.creer = creer;
exports.lister = lister;
exports.presence = presence;
exports.bulletin = bulletin;
const zod_1 = require("zod");
const rh_service_1 = require("./rh.service");
const creerEmployeSchema = zod_1.z.object({
    activiteId: zod_1.z.string().uuid(),
    nom: zod_1.z.string().min(2),
    poste: zod_1.z.string().min(2),
    salaireBase: zod_1.z.number().positive(),
    contact: zod_1.z.string().optional(),
});
const presenceSchema = zod_1.z.object({
    date: zod_1.z.string(),
    present: zod_1.z.boolean(),
    heures: zod_1.z.number().nonnegative().default(0),
});
const bulletinSchema = zod_1.z.object({
    employeId: zod_1.z.string().uuid(),
    mois: zod_1.z.number().int().min(1).max(12),
    annee: zod_1.z.number().int().min(2000),
    deductions: zod_1.z.number().nonnegative().optional(),
});
async function creer(req, res, next) {
    try {
        res.status(201).json(await (0, rh_service_1.creerEmploye)(creerEmployeSchema.parse(req.body)));
    }
    catch (err) {
        next(err);
    }
}
async function lister(req, res, next) {
    try {
        res.json(await (0, rh_service_1.listerEmployes)(req.query.activiteId));
    }
    catch (err) {
        next(err);
    }
}
async function presence(req, res, next) {
    try {
        const body = presenceSchema.parse(req.body);
        res.status(201).json(await (0, rh_service_1.enregistrerPresence)(req.params.id, body.date, body.present, body.heures));
    }
    catch (err) {
        next(err);
    }
}
async function bulletin(req, res, next) {
    try {
        res.status(201).json(await (0, rh_service_1.genererBulletin)(bulletinSchema.parse(req.body)));
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=rh.controller.js.map