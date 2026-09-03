"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.creerActivite = creerActivite;
exports.listerActivites = listerActivites;
exports.obtenirActivite = obtenirActivite;
const prisma_1 = require("../../lib/prisma");
async function creerActivite(nom, uniteMesure) {
    return prisma_1.prisma.activite.create({ data: { nom, uniteMesure } });
}
async function listerActivites() {
    return prisma_1.prisma.activite.findMany({ orderBy: { nom: "asc" } });
}
async function obtenirActivite(id) {
    return prisma_1.prisma.activite.findUnique({ where: { id } });
}
//# sourceMappingURL=activites.service.js.map