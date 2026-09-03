"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.creerFournisseur = creerFournisseur;
exports.listerFournisseurs = listerFournisseurs;
const prisma_1 = require("../../lib/prisma");
async function creerFournisseur(nom, contact) {
    return prisma_1.prisma.fournisseur.create({ data: { nom, contact } });
}
async function listerFournisseurs() {
    return prisma_1.prisma.fournisseur.findMany({ orderBy: { nom: "asc" } });
}
//# sourceMappingURL=fournisseurs.service.js.map