"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.definir = definir;
exports.verifier = verifier;
exports.modifier = modifier;
exports.reinitialiser = reinitialiser;
const zod_1 = require("zod");
const pin_service_1 = require("./pin.service");
const codePinSchema = zod_1.z.object({ codePin: zod_1.z.string().length(4).regex(/^\d{4}$/) });
const modifierPinSchema = zod_1.z.object({
    ancienCodePin: zod_1.z.string().length(4).regex(/^\d{4}$/),
    nouveauCodePin: zod_1.z.string().length(4).regex(/^\d{4}$/),
});
const reinitialiserPinSchema = zod_1.z.object({
    motDePasse: zod_1.z.string().min(6),
    nouveauCodePin: zod_1.z.string().length(4).regex(/^\d{4}$/),
});
async function definir(req, res, next) {
    try {
        const { codePin } = codePinSchema.parse(req.body);
        const result = await (0, pin_service_1.definirCodePin)(req.user.id, codePin);
        res.status(201).json(result);
    }
    catch (err) {
        next(err);
    }
}
async function verifier(req, res, next) {
    try {
        const { codePin } = codePinSchema.parse(req.body);
        const result = await (0, pin_service_1.verifierCodePin)(req.user.id, codePin);
        res.json(result);
    }
    catch (err) {
        next(err);
    }
}
async function modifier(req, res, next) {
    try {
        const { ancienCodePin, nouveauCodePin } = modifierPinSchema.parse(req.body);
        const result = await (0, pin_service_1.modifierCodePin)(req.user.id, ancienCodePin, nouveauCodePin);
        res.json(result);
    }
    catch (err) {
        next(err);
    }
}
async function reinitialiser(req, res, next) {
    try {
        const { motDePasse, nouveauCodePin } = reinitialiserPinSchema.parse(req.body);
        const result = await (0, pin_service_1.reinitialiserCodePinAvecMotDePasse)(req.user.id, motDePasse, nouveauCodePin);
        res.json(result);
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=pin.controller.js.map