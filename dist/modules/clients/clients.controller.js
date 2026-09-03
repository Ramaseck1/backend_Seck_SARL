"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.creer = creer;
exports.modifier = modifier;
exports.supprimer = supprimer;
exports.supprimerPlusieurs = supprimerPlusieurs;
exports.lister = lister;
exports.obtenir = obtenir;
exports.soldes = soldes;
const zod_1 = require("zod");
const clients_service_1 = require("./clients.service");
const creerSchema = zod_1.z.object({
    nom: zod_1.z.string().min(2),
    contact: zod_1.z.string().optional(),
});
const modifierSchema = zod_1.z.object({
    nom: zod_1.z.string().min(2),
    contact: zod_1.z.string().optional(),
});
const supprimerPlusieursSchema = zod_1.z.object({
    ids: zod_1.z.array(zod_1.z.string()).min(1),
});
function gererErreurClient(err, res, next) {
    if (err instanceof clients_service_1.NomClientDupliqueError) {
        return res.status(409).json({ error: err.message });
    }
    if (err instanceof clients_service_1.ClientIntrouvableError) {
        return res.status(404).json({ error: err.message });
    }
    if (err instanceof clients_service_1.ClientLieError) {
        return res.status(409).json({ error: err.message });
    }
    next(err);
}
async function creer(req, res, next) {
    try {
        const body = creerSchema.parse(req.body);
        res.status(201).json(await (0, clients_service_1.creerClient)(body.nom, body.contact));
    }
    catch (err) {
        gererErreurClient(err, res, next);
    }
}
async function modifier(req, res, next) {
    try {
        const body = modifierSchema.parse(req.body);
        res.json(await (0, clients_service_1.modifierClient)(req.params.id, body.nom, body.contact));
    }
    catch (err) {
        gererErreurClient(err, res, next);
    }
}
async function supprimer(req, res, next) {
    try {
        await (0, clients_service_1.supprimerClient)(req.params.id);
        res.status(204).send();
    }
    catch (err) {
        gererErreurClient(err, res, next);
    }
}
async function supprimerPlusieurs(req, res, next) {
    try {
        const body = supprimerPlusieursSchema.parse(req.body);
        const resultats = await (0, clients_service_1.supprimerClients)(body.ids);
        res.json({ resultats });
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