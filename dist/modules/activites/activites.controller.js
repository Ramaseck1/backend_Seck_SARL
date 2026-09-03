"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.creer = creer;
exports.lister = lister;
exports.obtenir = obtenir;
const zod_1 = require("zod");
const activites_service_1 = require("./activites.service");
const creerSchema = zod_1.z.object({
    nom: zod_1.z.string().min(2),
    uniteMesure: zod_1.z.string().min(1),
});
async function creer(req, res, next) {
    try {
        const body = creerSchema.parse(req.body);
        const activite = await (0, activites_service_1.creerActivite)(body.nom, body.uniteMesure);
        res.status(201).json(activite);
    }
    catch (err) {
        next(err);
    }
}
async function lister(_req, res, next) {
    try {
        res.json(await (0, activites_service_1.listerActivites)());
    }
    catch (err) {
        next(err);
    }
}
async function obtenir(req, res, next) {
    try {
        res.json(await (0, activites_service_1.obtenirActivite)(req.params.id));
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=activites.controller.js.map