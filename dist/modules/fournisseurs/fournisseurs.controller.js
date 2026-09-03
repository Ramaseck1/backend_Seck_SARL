"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.creer = creer;
exports.lister = lister;
const zod_1 = require("zod");
const fournisseurs_service_1 = require("./fournisseurs.service");
const creerSchema = zod_1.z.object({ nom: zod_1.z.string().min(2), contact: zod_1.z.string().optional() });
async function creer(req, res, next) {
    try {
        const body = creerSchema.parse(req.body);
        res.status(201).json(await (0, fournisseurs_service_1.creerFournisseur)(body.nom, body.contact));
    }
    catch (err) {
        next(err);
    }
}
async function lister(_req, res, next) {
    try {
        res.json(await (0, fournisseurs_service_1.listerFournisseurs)());
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=fournisseurs.controller.js.map