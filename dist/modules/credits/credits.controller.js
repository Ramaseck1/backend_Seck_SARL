"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rembourser = rembourser;
exports.enRetard = enRetard;
exports.parClient = parClient;
const zod_1 = require("zod");
const credits_service_1 = require("./credits.service");
const remboursementSchema = zod_1.z.object({
    creditId: zod_1.z.string().uuid(),
    montant: zod_1.z.number().positive(),
});
async function rembourser(req, res, next) {
    try {
        const body = remboursementSchema.parse(req.body);
        const remboursement = await (0, credits_service_1.enregistrerRemboursement)({ ...body, saisiParId: req.user.id });
        res.status(201).json(remboursement);
    }
    catch (err) {
        next(err);
    }
}
async function enRetard(req, res, next) {
    try {
        const activiteId = req.query.activiteId;
        const creances = await (0, credits_service_1.listerCreancesEnRetard)(activiteId);
        console.log("creances", creances);
        res.json(creances);
    }
    catch (err) {
        next(err);
    }
}
async function parClient(req, res, next) {
    try {
        const credits = await (0, credits_service_1.listerCreditsClient)(req.params.clientId);
        res.json(credits);
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=credits.controller.js.map