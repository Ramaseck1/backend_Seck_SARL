"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.creer = creer;
exports.lister = lister;
exports.obtenir = obtenir;
exports.soldes = soldes;
const zod_1 = require("zod");
const clients_service_1 = require("./clients.service");
const creerSchema = zod_1.z.object({
    nom: zod_1.z.string().min(2),
    contact: zod_1.z.string().optional(),
});
async function creer(req, res, next) {
    try {
        const body = creerSchema.parse(req.body);
        res.status(201).json(await (0, clients_service_1.creerClient)(body.nom, body.contact));
    }
    catch (err) {
        next(err);
    }
}
async function lister(req, res, next) {
    try {
        res.json(await (0, clients_service_1.listerClients)(req.query.q));
    }
    catch (err) {
        next(err);
    }
}
async function obtenir(req, res, next) {
    try {
        res.json(await (0, clients_service_1.obtenirClient)(req.params.id));
    }
    catch (err) {
        next(err);
    }
}
async function soldes(req, res, next) {
    try {
        res.json(await (0, clients_service_1.soldesParActivite)(req.params.id));
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=clients.controller.js.map