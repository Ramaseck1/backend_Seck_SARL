"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NomClientDupliqueError = void 0;
exports.creerClient = creerClient;
exports.listerClients = listerClients;
exports.obtenirClient = obtenirClient;
exports.soldesParActivite = soldesParActivite;
const prisma_1 = require("../../lib/prisma");
class NomClientDupliqueError extends Error {
    constructor(nom) {
        super(`Un client nommé "${nom}" existe déjà. Merci d'ajouter un élément pour le différencier (quartier, surnom, activité...).`);
        this.name = "NomClientDupliqueError";
    }
}
exports.NomClientDupliqueError = NomClientDupliqueError;
async function creerClient(nom, contact) {
    const nomTrim = nom.trim();
    const existant = await prisma_1.prisma.client.findFirst({
        where: { nom: { equals: nomTrim, mode: "insensitive" } },
    });
    if (existant) {
        throw new NomClientDupliqueError(nomTrim);
    }
    try {
        return await prisma_1.prisma.client.create({ data: { nom: nomTrim, contact } });
    }
    catch (err) {
        // Filet de sécurité en cas de race condition (deux créations simultanées)
        if (err.code === "P2002") {
            throw new NomClientDupliqueError(nomTrim);
        }
        throw err;
    }
}
async function listerClients(recherche) {
    return prisma_1.prisma.client.findMany({
        where: recherche
            ? { OR: [{ nom: { contains: recherche, mode: "insensitive" } }, { contact: { contains: recherche } }] }
            : undefined,
        orderBy: { nom: "asc" },
    });
}
async function obtenirClient(id) {
    return prisma_1.prisma.client.findUnique({ where: { id } });
}
async function soldesParActivite(clientId) {
    const credits = await prisma_1.prisma.credit.findMany({
        where: { clientId, statut: "EN_COURS" },
        include: { activite: true },
    });
    return credits.map((c) => ({
        activiteId: c.activiteId,
        activite: c.activite.nom,
        montantRestant: c.montantRestant,
        dateEmprunt: c.dateEmprunt,
    }));
}
//# sourceMappingURL=clients.service.js.map