"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inscrire = inscrire;
exports.connecter = connecter;
exports.deconnecter = deconnecter;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../../lib/prisma");
const errorHandler_1 = require("../../middlewares/errorHandler");
const ROLES_VALIDES = ["ADMIN", "GERANT", "CAISSIER", "COMPTABLE"];
async function inscrire(nom, contact, motDePasse, role) {
    const existant = await prisma_1.prisma.utilisateur.findUnique({ where: { contact } });
    if (existant)
        throw new errorHandler_1.AppError("Un utilisateur avec ce contact existe déjà", 409);
    const motDePasseHash = await bcrypt_1.default.hash(motDePasse, 10);
    const utilisateur = await prisma_1.prisma.utilisateur.create({
        data: { nom, contact, motDePasseHash, roleGlobal: role },
    });
    return { id: utilisateur.id, nom: utilisateur.nom, contact: utilisateur.contact };
}
async function connecter(contact, motDePasse) {
    const utilisateur = await prisma_1.prisma.utilisateur.findUnique({ where: { contact } });
    if (!utilisateur)
        throw new errorHandler_1.AppError("Identifiants invalides", 401);
    const motDePasseValide = await bcrypt_1.default.compare(motDePasse, utilisateur.motDePasseHash);
    if (!motDePasseValide)
        throw new errorHandler_1.AppError("Identifiants invalides", 401);
    const options = {
        expiresIn: (process.env.JWT_EXPIRES_IN || "7d"),
    };
    const token = jsonwebtoken_1.default.sign({ id: utilisateur.id, roleGlobal: utilisateur.roleGlobal, tokenVersion: utilisateur.tokenVersion }, process.env.JWT_SECRET, options);
    return {
        token,
        utilisateur: {
            id: utilisateur.id,
            nom: utilisateur.nom,
            role: utilisateur.roleGlobal,
            pinConfigure: !!utilisateur.codePinHash, // ← ajouté
        },
    };
}
async function deconnecter(userId) {
    await prisma_1.prisma.utilisateur.update({
        where: { id: userId },
        data: { tokenVersion: { increment: 1 } },
    });
}
//# sourceMappingURL=auth.service.js.map