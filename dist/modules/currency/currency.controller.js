"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertir = convertir;
exports.taux = taux;
const zod_1 = require("zod");
const currency_service_1 = require("./currency.service");
const convertirSchema = zod_1.z.object({
    montant: zod_1.z.coerce.number(),
    de: zod_1.z.string().length(3).default("GMD"),
    vers: zod_1.z.string().length(3).default("XOF"),
});
async function convertir(req, res, next) {
    try {
        const query = convertirSchema.parse(req.query);
        const resultat = await (0, currency_service_1.convertirMontant)(query.montant, query.de, query.vers);
        res.json(resultat);
    }
    catch (err) {
        if (err instanceof currency_service_1.ConversionDeviseError) {
            return res.status(502).json({ error: err.message });
        }
        next(err);
    }
}
async function taux(req, res, next) {
    try {
        const de = (req.query.de || "GMD").toUpperCase();
        const vers = (req.query.vers || "XOF").toUpperCase();
        const valeur = await (0, currency_service_1.obtenirTaux)(de, vers);
        res.json({ de, vers, taux: valeur });
    }
    catch (err) {
        if (err instanceof currency_service_1.ConversionDeviseError) {
            return res.status(502).json({ error: err.message });
        }
        next(err);
    }
}
//# sourceMappingURL=currency.controller.js.map