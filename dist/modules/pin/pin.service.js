"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.definirCodePin = definirCodePin;
exports.verifierCodePin = verifierCodePin;
exports.modifierCodePin = modifierCodePin;
exports.reinitialiserCodePinAvecMotDePasse = reinitialiserCodePinAvecMotDePasse;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = require("../../lib/prisma");
const errorHandler_1 = require("../../middlewares/errorHandler");
const MAX_TENTATIVES = 5;
const DUREE_BLOCAGE_MINUTES = 5;
function verifierFormatPin(codePin) {
    if (!/^\d{4}$/.test(codePin)) {
        throw new errorHandler_1.AppError("Le code doit contenir exactement 4 chiffres.", 400);
    }
}
async function definirCodePin(utilisateurId, codePin) {
    verifierFormatPin(codePin);
    const utilisateur = await prisma_1.prisma.utilisateur.findUnique({ where: { id: utilisateurId } });
    if (!utilisateur)
        throw new errorHandler_1.AppError("Utilisateur introuvable", 404);
    if (utilisateur.codePinHash) {
        throw new errorHandler_1.AppError("Un code est déjà configuré. Utilisez la modification.", 409);
    }
    const codePinHash = await bcrypt_1.default.hash(codePin, 10);
    await prisma_1.prisma.utilisateur.update({
        where: { id: utilisateurId },
        data: { codePinHash, pinTentativesEchouees: 0, pinBloqueJusqu: null },
    });
    return { pinConfigure: true };
}
async function verifierCodePin(utilisateurId, codePin) {
    verifierFormatPin(codePin);
    const utilisateur = await prisma_1.prisma.utilisateur.findUnique({ where: { id: utilisateurId } });
    if (!utilisateur)
        throw new errorHandler_1.AppError("Utilisateur introuvable", 404);
    if (!utilisateur.codePinHash)
        throw new errorHandler_1.AppError("Aucun code configuré.", 409);
    if (utilisateur.pinBloqueJusqu && utilisateur.pinBloqueJusqu > new Date()) {
        const minutesRestantes = Math.ceil((utilisateur.pinBloqueJusqu.getTime() - Date.now()) / 60000);
        throw new errorHandler_1.AppError(`Trop de tentatives. Réessayez dans ${minutesRestantes} min ou reconnectez-vous avec votre mot de passe.`, 423);
    }
    const valide = await bcrypt_1.default.compare(codePin, utilisateur.codePinHash);
    if (!valide) {
        const tentatives = utilisateur.pinTentativesEchouees + 1;
        const bloque = tentatives >= MAX_TENTATIVES;
        await prisma_1.prisma.utilisateur.update({
            where: { id: utilisateurId },
            data: {
                pinTentativesEchouees: bloque ? 0 : tentatives,
                pinBloqueJusqu: bloque ? new Date(Date.now() + DUREE_BLOCAGE_MINUTES * 60000) : null,
            },
        });
        if (bloque) {
            throw new errorHandler_1.AppError(`Trop de tentatives. Réessayez dans ${DUREE_BLOCAGE_MINUTES} min ou reconnectez-vous avec votre mot de passe.`, 423);
        }
        throw new errorHandler_1.AppError("Code incorrect.", 401);
    }
    await prisma_1.prisma.utilisateur.update({
        where: { id: utilisateurId },
        data: { pinTentativesEchouees: 0, pinBloqueJusqu: null },
    });
    return { valide: true };
}
async function modifierCodePin(utilisateurId, ancienCodePin, nouveauCodePin) {
    await verifierCodePin(utilisateurId, ancienCodePin); // réutilise la vérification + anti brute-force
    verifierFormatPin(nouveauCodePin);
    const codePinHash = await bcrypt_1.default.hash(nouveauCodePin, 10);
    await prisma_1.prisma.utilisateur.update({
        where: { id: utilisateurId },
        data: { codePinHash },
    });
    return { modifie: true };
}
// "Code oublié" : réinitialisation via le mot de passe du compte
async function reinitialiserCodePinAvecMotDePasse(utilisateurId, motDePasse, nouveauCodePin) {
    verifierFormatPin(nouveauCodePin);
    const utilisateur = await prisma_1.prisma.utilisateur.findUnique({ where: { id: utilisateurId } });
    if (!utilisateur)
        throw new errorHandler_1.AppError("Utilisateur introuvable", 404);
    const motDePasseValide = await bcrypt_1.default.compare(motDePasse, utilisateur.motDePasseHash);
    if (!motDePasseValide)
        throw new errorHandler_1.AppError("Mot de passe incorrect.", 401);
    const codePinHash = await bcrypt_1.default.hash(nouveauCodePin, 10);
    await prisma_1.prisma.utilisateur.update({
        where: { id: utilisateurId },
        data: { codePinHash, pinTentativesEchouees: 0, pinBloqueJusqu: null },
    });
    return { reinitialise: true };
}
//# sourceMappingURL=pin.service.js.map