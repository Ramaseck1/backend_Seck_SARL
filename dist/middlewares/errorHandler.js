"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.errorHandler = errorHandler;
class AppError extends Error {
    statusCode;
    constructor(message, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
    }
}
exports.AppError = AppError;
// Middleware d'erreur centralisé — capture les AppError métier (ex: emprunt
// déjà en cours) ainsi que les erreurs Prisma/serveur inattendues.
function errorHandler(err, _req, res, _next) {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ error: err.message });
    }
    console.error(err);
    return res.status(500).json({ error: "Erreur interne du serveur" });
}
//# sourceMappingURL=errorHandler.js.map