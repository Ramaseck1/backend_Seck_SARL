"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = require("./errorHandler");
const prisma_1 = require("../lib/prisma"); // ajustez si le chemin réel diffère
async function requireAuth(req, _res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        return next(new errorHandler_1.AppError("Authentification requise", 401));
    }
    const token = header.split(" ")[1];
    try {
        const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const utilisateur = await prisma_1.prisma.utilisateur.findUnique({ where: { id: payload.id } });
        if (!utilisateur || utilisateur.tokenVersion !== payload.tokenVersion) {
            return next(new errorHandler_1.AppError("Session expirée, veuillez vous reconnecter", 401));
        }
        req.user = {
            id: utilisateur.id,
            roleGlobal: utilisateur.roleGlobal,
            tokenVersion: utilisateur.tokenVersion,
        };
        next();
    }
    catch {
        next(new errorHandler_1.AppError("Token invalide ou expiré", 401));
    }
}
//# sourceMappingURL=auth.js.map