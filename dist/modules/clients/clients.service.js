"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientLieError = exports.ClientIntrouvableError = exports.NomClientDupliqueError = void 0;
exports.creerClient = creerClient;
exports.modifierClient = modifierClient;
exports.supprimerClient = supprimerClient;
exports.supprimerClients = supprimerClients;
exports.listerClients = listerClients;
exports.obtenirClient = obtenirClient;
exports.soldesParActivite = soldesParActivite;
const prisma_1 = require("../../lib/prisma");
class NomClientDupliqueError extends Error {
    constructor(nom) {
        super(`Le nom "${nom}" existe déjà. Ajoutez un mot pour le différencier (quartier, surnom, etc.).`);
        this.name = "NomClientDupliqueError";
    }
}
exports.NomClientDupliqueError = NomClientDupliqueError;
class ClientIntrouvableError extends Error {
    constructor(id) {
        super(`Client introuvable (id: ${id}).`);
        this.name = "ClientIntrouvableError";
    }
}
exports.ClientIntrouvableError = ClientIntrouvableError;
class ClientLieError extends Error {
    constructor() {
        super("Impossible de supprimer ce client : il a des ventes ou crédits enregistrés.");
        this.name = "ClientLieError";
    }
}
exports.ClientLieError = ClientLieError;
async function verifierNomUnique(nom, excludeId) {
    const existant = await prisma_1.prisma.client.findFirst({
        where: {
            nom: { equals: nom, mode: "insensitive" },
            ...(excludeId ? { id: { not: excludeId } } : {}),
        },
    });
    if (existant)
        throw new NomClientDupliqueError(nom);
}
async function creerClient(nom, contact) {
    const nomTrim = nom.trim();
    await verifierNomUnique(nomTrim);
    try {
        return await prisma_1.prisma.client.create({ data: { nom: nomTrim, contact } });
    }
    catch (err) {
        if (err.code === "P2002")
            throw new NomClientDupliqueError(nomTrim);
        throw err;
    }
}
async function modifierClient(id, nom, contact) {
    const nomTrim = nom.trim();
    const client = await prisma_1.prisma.client.findUnique({ where: { id } });
    if (!client)
        throw new ClientIntrouvableError(id);
    await verifierNomUnique(nomTrim, id);
    try {
        return await prisma_1.prisma.client.update({
            where: { id },
            data: { nom: nomTrim, contact },
        });
    }
    catch (err) {
        if (err.code === "P2002")
            throw new NomClientDupliqueError(nomTrim);
        throw err;
    }
}
async function supprimerClient(id) {
    const client = await prisma_1.prisma.client.findUnique({ where: { id } });
    if (!client)
        throw new ClientIntrouvableError(id);
    try {
        await prisma_1.prisma.client.delete({ where: { id } });
    }
    catch (err) {
        // P2003 = violation de contrainte de clé étrangère (ventes/credits liés)
        if (err.code === "P2003")
            throw new ClientLieError();
        throw err;
    }
}
// Suppression multiple — utilisée par la sélection sur le front
async function supprimerClients(ids) {
    const resultats = [];
    for (const id of ids) {
        try {
            await supprimerClient(id);
            resultats.push({ id, succes: true });
        }
        catch (err) {
            resultats.push({ id, succes: false, erreur: err.message });
        }
    }
    return resultats;
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