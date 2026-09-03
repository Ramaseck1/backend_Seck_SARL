"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.creer = creer;
exports.lister = lister;
exports.valeurNette = valeurNette;
const zod_1 = require("zod");
const actifs_service_1 = require("./actifs.service");
const creerSchema = zod_1.z.object({
    activiteId: zod_1.z.string().uuid(),
    nom: zod_1.z.string().min(2),
    valeurAcquisition: zod_1.z.number().positive(),
    dateAcquisition: zod_1.z.string(),
    dureeAmortissement: zod_1.z.number().int().positive(),
});
async function creer(req, res, next) {
    try {
        res.status(201).json(await (0, actifs_service_1.creerActif)(creerSchema.parse(req.body)));
    }
    catch (err) {
        next(err);
    }
}
async function lister(req, res, next) {
    try {
        res.json(await (0, actifs_service_1.listerActifs)(req.query.activiteId));
    }
    catch (err) {
        next(err);
    }
}
async function valeurNette(req, res, next) {
    try {
        res.json(await (0, actifs_service_1.valeurNetteComptable)(req.params.id));
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=actifs.controller.js.map