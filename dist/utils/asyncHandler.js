"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = asyncHandler;
// Enveloppe un handler async pour transmettre automatiquement les erreurs
// (y compris les rejets de promesses) au middleware errorHandler.
function asyncHandler(fn) {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
}
//# sourceMappingURL=asyncHandler.js.map