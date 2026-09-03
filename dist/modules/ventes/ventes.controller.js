"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.creer = creer;
exports.lister = lister;
const zod_1 = require("zod");
const ventes_service_1 = require("./ventes.service");
// ==========================================
// VALIDATION DE LA CRÉATION D'UNE VENTE
// ==========================================
//
// Le montant n'est PAS reçu ici.
//
// Le montant est calculé côté backend
// à partir de :
//
// produit.prixUnitaire × quantite
//
const creerVenteSchema = zod_1.z.object({
    activiteId: zod_1.z.string().uuid(),
    clientId: zod_1.z.string().uuid(),
    produitId: zod_1.z.string().uuid(),
    quantite: zod_1.z.number().positive(),
    modePaiement: zod_1.z.enum([
        "COMPTANT",
        "CREDIT",
    ]),
});
// ==========================================
// CRÉER UNE VENTE
// ==========================================
async function creer(req, res, next) {
    try {
        const body = creerVenteSchema.parse(req.body);
        const vente = await (0, ventes_service_1.creerVente)({
            ...body,
            // L'utilisateur connecté est
            // récupéré depuis le token.
            saisiParId: req.user.id,
        });
        res
            .status(201)
            .json(vente);
    }
    catch (err) {
        next(err);
    }
}
// ==========================================
// LISTER LES VENTES
// ==========================================
async function lister(req, res, next) {
    try {
        const activiteId = req.query.activiteId;
        const ventes = await (0, ventes_service_1.listerVentes)(activiteId);
        res.json(ventes);
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=ventes.controller.js.map