"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.creer = creer;
exports.lister = lister;
exports.solde = solde;
const zod_1 = require("zod");
const caisse_service_1 = require("./caisse.service");
const mouvementSchema = zod_1.z.object({
    activiteId: zod_1.z.string().uuid(),
    type: zod_1.z.enum(["ENTREE", "SORTIE"]),
    montant: zod_1.z.number().positive(),
    motif: zod_1.z.string().min(2),
});
async function creer(req, res, next) {
    try {
        const body = mouvementSchema.parse(req.body);
        res.status(201).json(await (0, caisse_service_1.enregistrerMouvement)({ ...body, saisiParId: req.user.id }));
    }
    catch (err) {
        next(err);
    }
}
async function lister(req, res, next) {
    try {
        const { activiteId, dateDebut, dateFin } = req.query;
        res.json(await (0, caisse_service_1.listerMouvements)(activiteId, dateDebut, dateFin));
    }
    catch (err) {
        next(err);
    }
}
async function solde(req, res, next) {
    try {
        res.json(await (0, caisse_service_1.soldeCaisse)(req.query.activiteId));
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=caisse.controller.js.map