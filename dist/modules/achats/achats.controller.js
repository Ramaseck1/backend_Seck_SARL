"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.creer = creer;
exports.lister = lister;
exports.reception = reception;
exports.paiement = paiement;
const zod_1 = require("zod");
const achats_service_1 = require("./achats.service");
const ligneSchema = zod_1.z.object({
    produitId: zod_1.z.string().uuid(),
    quantite: zod_1.z.number().positive(),
    prixUnitaire: zod_1.z.number().positive(),
});
const creerBonSchema = zod_1.z.object({
    activiteId: zod_1.z.string().uuid(),
    fournisseurId: zod_1.z.string().uuid(),
    lignes: zod_1.z.array(ligneSchema).min(1),
});
const paiementSchema = zod_1.z.object({
    montant: zod_1.z.number().positive(),
    activiteId: zod_1.z.string().uuid(),
});
async function creer(req, res, next) {
    try {
        const body = creerBonSchema.parse(req.body);
        res.status(201).json(await (0, achats_service_1.creerBonCommande)(body));
    }
    catch (err) {
        next(err);
    }
}
async function lister(req, res, next) {
    try {
        res.json(await (0, achats_service_1.listerBonsCommande)(req.query.activiteId));
    }
    catch (err) {
        next(err);
    }
}
async function reception(req, res, next) {
    try {
        res.json(await (0, achats_service_1.receptionnerBonCommande)(req.params.id));
    }
    catch (err) {
        next(err);
    }
}
async function paiement(req, res, next) {
    try {
        const body = paiementSchema.parse(req.body);
        res.status(201).json(await (0, achats_service_1.payerFacture)({ ...body, factureId: req.params.id, saisiParId: req.user.id }));
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=achats.controller.js.map