"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inscription = inscription;
exports.connexion = connexion;
const zod_1 = require("zod");
const auth_service_1 = require("./auth.service");
const inscrireSchema = zod_1.z.object({
    nom: zod_1.z.string().min(2),
    contact: zod_1.z.string().min(6),
    motDePasse: zod_1.z.string().min(6),
});
const connecterSchema = zod_1.z.object({
    contact: zod_1.z.string().min(6),
    motDePasse: zod_1.z.string().min(6),
});
async function inscription(req, res, next) {
    try {
        const body = inscrireSchema.parse(req.body);
        const utilisateur = await (0, auth_service_1.inscrire)(body.nom, body.contact, body.motDePasse);
        res.status(201).json(utilisateur);
    }
    catch (err) {
        next(err);
    }
}
async function connexion(req, res, next) {
    try {
        const body = connecterSchema.parse(req.body);
        const result = await (0, auth_service_1.connecter)(body.contact, body.motDePasse);
        res.json(result);
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=auth.controller.js.map