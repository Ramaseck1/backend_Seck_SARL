"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const prisma_1 = require("../../lib/prisma"); // ← adapte le chemin
const auth_1 = require("../../middlewares/auth"); // ← adapte le chemin
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
class SyncError extends Error {
}
// handlers[entité][nom d'opération] = fonction qui applique l'opération.
// Chaque fonction reçoit (id, payload, userId) et lève une SyncError pour un refus métier
// (le push la renvoie telle quelle au mobile), ou toute autre erreur pour un vrai échec technique
// (le mobile réessaiera plus tard, rien n'est marqué "refusé").
const handlers = {
    clients: {
        async upsert(id, p) {
            const nom = String(p.nom ?? '').trim();
            if (!nom)
                throw new SyncError('Le nom du client est requis.');
            const contact = p.contact ? String(p.contact).trim() : null;
            await prisma_1.prisma.client.upsert({
                where: { id },
                create: { id, nom, contact },
                update: { nom, contact, deletedAt: null },
            });
        },
        async delete(id) {
            const existant = await prisma_1.prisma.client.findUnique({ where: { id } });
            if (!existant || existant.deletedAt)
                return;
            const [ventes, credits] = await Promise.all([
                prisma_1.prisma.vente.count({ where: { clientId: id } }),
                prisma_1.prisma.credit.count({ where: { clientId: id } }),
            ]);
            if (ventes > 0 || credits > 0) {
                throw new SyncError('Client lié à des ventes ou des crédits : suppression refusée.');
            }
            await prisma_1.prisma.client.update({ where: { id }, data: { deletedAt: new Date() } });
        },
    },
    produits: {
        // Création uniquement (pas de modifierProduit côté mobile) : idempotent via l'id.
        // Le numéro de session est attribué ICI, jamais côté mobile, pour éviter les collisions
        // entre deux sessions créées hors ligne sur des appareils différents.
        async upsert(id, p) {
            const existant = await prisma_1.prisma.produit.findUnique({ where: { id } });
            if (existant)
                return; // rejoué : déjà appliqué, on ne réattribue pas de numéro
            const activiteId = String(p.activiteId || '');
            const prixUnitaire = Number(p.prixUnitaire);
            if (!activiteId)
                throw new SyncError('Activité requise.');
            if (!prixUnitaire || prixUnitaire <= 0)
                throw new SyncError('Prix de vente invalide.');
            await prisma_1.prisma.$transaction(async (tx) => {
                const dernier = await tx.produit.aggregate({
                    where: { activiteId },
                    _max: { numeroSession: true },
                });
                const numeroSession = (dernier._max.numeroSession ?? 0) + 1;
                await tx.produit.create({
                    data: {
                        id,
                        activiteId,
                        numeroSession,
                        quantiteStock: p.quantiteStock ?? 0,
                        quantiteInitiale: p.quantiteInitiale ?? 0,
                        prixAchatUnitaire: p.prixAchatUnitaire ?? 0,
                        totalInvesti: p.totalInvesti ?? 0,
                        dateAchat: p.dateAchat ? new Date(p.dateAchat) : new Date(),
                        prixUnitaire,
                        seuilAlerte: p.seuilAlerte ?? 0,
                    },
                });
            });
        },
        // delta > 0 = entrée (réappro), delta < 0 = sortie (perte/casse). Toujours un INCREMENT,
        // jamais un SET absolu, pour rester correct même avec plusieurs ajustements concurrents.
        async stock_adjust(id, p) {
            const delta = Number(p.delta);
            if (!delta)
                throw new SyncError('Quantité d’ajustement invalide.');
            await prisma_1.prisma.$transaction(async (tx) => {
                const produit = await tx.produit.findUnique({ where: { id } });
                if (!produit)
                    throw new SyncError('Produit introuvable.');
                if (Number(produit.quantiteStock) + delta < 0) {
                    throw new SyncError('Stock insuffisant côté serveur pour cet ajustement.');
                }
                const data = { quantiteStock: { increment: delta } };
                if (delta > 0 && p.prixAchatUnitaire) {
                    const prixAchat = Number(p.prixAchatUnitaire);
                    await tx.achatProduit.create({
                        data: {
                            produitId: id,
                            quantite: delta,
                            prixUnitaire: prixAchat,
                            montantTotal: delta * prixAchat,
                            motif: p.motif || null,
                        },
                    });
                    data.totalInvesti = { increment: delta * prixAchat };
                }
                await tx.produit.update({ where: { id }, data });
            });
        },
    },
    ventes: {
        // Une vente = vente + (crédit OU mouvement de caisse) + décrément du stock,
        // dans UNE seule transaction. Idempotent via l'id (une vente n'est jamais modifiée).
        async upsert(id, p, userId) {
            const existant = await prisma_1.prisma.vente.findUnique({ where: { id } });
            if (existant)
                return;
            const quantite = Number(p.quantite);
            const montant = Number(p.montant);
            if (!quantite || quantite <= 0)
                throw new SyncError('Quantité de vente invalide.');
            if (!montant || montant <= 0)
                throw new SyncError('Montant de vente invalide.');
            if (!['COMPTANT', 'CREDIT'].includes(p.modePaiement)) {
                throw new SyncError('Mode de paiement invalide.');
            }
            try {
                await prisma_1.prisma.$transaction(async (tx) => {
                    const produit = await tx.produit.findUnique({ where: { id: p.produitId } });
                    if (!produit)
                        throw new SyncError('Produit introuvable.');
                    if (Number(produit.quantiteStock) < quantite) {
                        throw new SyncError(`Stock insuffisant (${produit.quantiteStock} restant, ${quantite} demandé).`);
                    }
                    if (p.modePaiement === 'CREDIT') {
                        const creditExistant = await tx.credit.findFirst({
                            where: { clientId: p.clientId, activiteId: p.activiteId, statut: 'EN_COURS' },
                        });
                        if (creditExistant) {
                            throw new SyncError('Ce client a déjà un emprunt en cours sur cette activité. Il doit rembourser avant un nouveau crédit.');
                        }
                    }
                    await tx.produit.update({
                        where: { id: p.produitId },
                        data: { quantiteStock: { decrement: quantite } },
                    });
                    await tx.vente.create({
                        data: {
                            id,
                            activiteId: p.activiteId,
                            clientId: p.clientId,
                            produitId: p.produitId,
                            saisiParId: userId,
                            quantite,
                            montant,
                            modePaiement: p.modePaiement,
                            date: p.date ? new Date(p.date) : new Date(),
                        },
                    });
                    if (p.modePaiement === 'CREDIT') {
                        // Contrainte unique partielle (voir schema-diff.md) : si une course a laissé passer
                        // deux ventes à crédit simultanées, celle-ci échoue ici avec le code Postgres 23505.
                        await tx.credit.create({
                            data: {
                                clientId: p.clientId,
                                activiteId: p.activiteId,
                                venteId: id,
                                montantInitial: montant,
                                montantRestant: montant,
                            },
                        });
                    }
                    else {
                        await tx.mouvementCaisse.create({
                            data: {
                                activiteId: p.activiteId,
                                venteId: id,
                                saisiParId: userId,
                                type: 'ENTREE',
                                montant,
                                motif: 'Vente',
                            },
                        });
                    }
                });
            }
            catch (e) {
                if (e instanceof client_1.Prisma.PrismaClientKnownRequestError && e.code === '23505') {
                    throw new SyncError('Ce client a déjà un emprunt en cours sur cette activité (détecté à la validation finale).');
                }
                throw e;
            }
        },
    },
    credits: {
        // Remboursement partiel ou total. Jamais de "set" du solde : toujours appliqué au solde
        // ACTUEL en base, donc correct même si plusieurs remboursements arrivent d'affilée.
        async remboursement(creditId, p, userId) {
            const montant = Number(p.montant);
            if (!montant || montant <= 0)
                throw new SyncError('Montant de remboursement invalide.');
            await prisma_1.prisma.$transaction(async (tx) => {
                const credit = await tx.credit.findUnique({ where: { id: creditId } });
                if (!credit)
                    throw new SyncError('Crédit introuvable.');
                if (credit.statut === 'SOLDE')
                    throw new SyncError('Ce crédit est déjà soldé.');
                const restant = Number(credit.montantRestant);
                const applique = Math.min(montant, restant); // ne jamais dépasser le solde dû
                const nouveauRestant = restant - applique;
                await tx.credit.update({
                    where: { id: creditId },
                    data: {
                        montantRembourse: { increment: applique },
                        montantRestant: nouveauRestant,
                        statut: nouveauRestant <= 0 ? 'SOLDE' : 'EN_COURS',
                        dateSolde: nouveauRestant <= 0 ? new Date() : null,
                    },
                });
                await tx.remboursement.create({
                    data: { creditId, saisiParId: userId, montant: applique },
                });
                await tx.mouvementCaisse.create({
                    data: {
                        activiteId: credit.activiteId,
                        saisiParId: userId,
                        type: 'ENTREE',
                        montant: applique,
                        motif: 'Remboursement crédit client',
                    },
                });
            });
        },
    },
    mouvements_caisse: {
        async upsert(id, p, userId) {
            const existant = await prisma_1.prisma.mouvementCaisse.findUnique({ where: { id } });
            if (existant)
                return;
            const montant = Number(p.montant);
            if (!montant || montant <= 0)
                throw new SyncError('Montant invalide.');
            if (!['ENTREE', 'SORTIE'].includes(p.type))
                throw new SyncError('Type de mouvement invalide.');
            if (!p.motif || !String(p.motif).trim())
                throw new SyncError('Le motif est requis.');
            await prisma_1.prisma.mouvementCaisse.create({
                data: {
                    id,
                    activiteId: p.activiteId,
                    saisiParId: userId,
                    type: p.type,
                    montant,
                    motif: String(p.motif).trim(),
                },
            });
        },
    },
    financements: {
        // Un financement créé = une SORTIE de caisse immédiate (argent avancé au client).
        async upsert(id, p, userId) {
            const existant = await prisma_1.prisma.financement.findUnique({ where: { id } });
            if (existant)
                return;
            const montant = Number(p.montant);
            if (!montant || montant <= 0)
                throw new SyncError('Montant invalide.');
            const nom = String(p.nom || '').trim();
            const prenom = String(p.prenom || '').trim();
            if (!nom || !prenom)
                throw new SyncError('Nom et prénom requis.');
            await prisma_1.prisma.$transaction(async (tx) => {
                const mouvement = await tx.mouvementCaisse.create({
                    data: {
                        activiteId: p.activiteId,
                        saisiParId: userId,
                        type: 'SORTIE',
                        montant,
                        motif: `Financement — ${prenom} ${nom}`,
                        categorie: 'FINANCEMENT',
                    },
                });
                await tx.financement.create({
                    data: {
                        id,
                        activiteId: p.activiteId,
                        nom,
                        prenom,
                        telephone: p.telephone || null,
                        montant,
                        montantRestant: montant,
                        saisiParId: userId,
                        date: p.date ? new Date(p.date) : new Date(),
                        mouvementCaisseId: mouvement.id,
                    },
                });
            });
        },
        // Remboursement = une ENTREE de caisse (le client rend l'argent avancé).
        async remb_financement(id, p, userId) {
            const montant = Number(p.montant);
            if (!montant || montant <= 0)
                throw new SyncError('Montant invalide.');
            await prisma_1.prisma.$transaction(async (tx) => {
                const fin = await tx.financement.findUnique({ where: { id } });
                if (!fin)
                    throw new SyncError('Financement introuvable.');
                if (fin.statut === 'PAYE')
                    throw new SyncError('Ce financement est déjà payé.');
                const restant = Number(fin.montantRestant);
                const applique = Math.min(montant, restant);
                const nouveauRestant = restant - applique;
                const mouvement = await tx.mouvementCaisse.create({
                    data: {
                        activiteId: fin.activiteId,
                        saisiParId: userId,
                        type: 'ENTREE',
                        montant: applique,
                        motif: `Remboursement financement — ${fin.prenom} ${fin.nom}`,
                        categorie: 'FINANCEMENT',
                    },
                });
                await tx.remboursementFinancement.create({
                    data: {
                        financementId: id,
                        saisiParId: userId,
                        montant: applique,
                        typePaiement: p.typePaiement || 'PARTIEL',
                        mouvementCaisseId: mouvement.id,
                    },
                });
                await tx.financement.update({
                    where: { id },
                    data: {
                        montantRembourse: { increment: applique },
                        montantRestant: nouveauRestant,
                        statut: nouveauRestant <= 0 ? 'PAYE' : 'NON_PAYE',
                        dateSolde: nouveauRestant <= 0 ? new Date() : null,
                    },
                });
            });
        },
    },
};
function messageMetier(e) {
    if (e instanceof SyncError)
        return e.message;
    if (e instanceof client_1.Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        return 'Un enregistrement avec ces informations existe déjà.';
    }
    return null;
}
// ---------- PUSH ----------
router.post('/push', async (req, res, next) => {
    try {
        const userId = req.user.id;
        const operations = Array.isArray(req.body?.operations)
            ? req.body.operations.slice(0, 100)
            : [];
        const results = [];
        for (const o of operations) {
            try {
                const fn = handlers[o.entity]?.[o.op];
                if (!fn)
                    throw new SyncError(`Opération inconnue : ${o.entity}.${o.op}`);
                if (!UUID.test(o.entityId))
                    throw new SyncError('Identifiant invalide.');
                await fn(o.entityId, o.payload, userId);
                results.push({ opId: o.opId, ok: true });
            }
            catch (e) {
                const msg = messageMetier(e);
                if (msg === null)
                    throw e; // erreur technique → 500 → le mobile réessaiera
                results.push({ opId: o.opId, ok: false, message: msg });
            }
        }
        res.json({ results });
    }
    catch (e) {
        next(e);
    }
});
// ---------- PULL ----------
router.get('/pull', async (req, res, next) => {
    try {
        const userId = req.user.id;
        const serverTime = new Date();
        const sinceRaw = typeof req.query.since === 'string' ? new Date(req.query.since) : null;
        const since = sinceRaw && !isNaN(sinceRaw.getTime()) ? sinceRaw : null;
        const where = since ? { updatedAt: { gt: since } } : { deletedAt: null };
        // Activités auxquelles l'utilisateur a accès : tout le reste (produits, ventes…) est
        // scopé à ces activités pour qu'un utilisateur ne récupère jamais les données d'une
        // activité qui n'est pas la sienne.
        const acces = await prisma_1.prisma.utilisateurActivite.findMany({
            where: { utilisateurId: userId },
            select: { activiteId: true },
        });
        const activiteIds = acces.map((a) => a.activiteId);
        const whereActivite = since
            ? { updatedAt: { gt: since }, activiteId: { in: activiteIds } }
            : { deletedAt: null, activiteId: { in: activiteIds } };
        const [clients, activites, produits, ventes, credits, mouvementsCaisse, financements] = await Promise.all([
            prisma_1.prisma.client.findMany({ where, orderBy: { updatedAt: 'asc' } }),
            prisma_1.prisma.activite.findMany({
                where: since ? { updatedAt: { gt: since } } : { id: { in: activiteIds } },
                orderBy: { updatedAt: 'asc' },
            }),
            prisma_1.prisma.produit.findMany({ where: whereActivite, orderBy: { updatedAt: 'asc' } }),
            prisma_1.prisma.vente.findMany({ where: whereActivite, orderBy: { updatedAt: 'asc' } }),
            prisma_1.prisma.credit.findMany({
                where: since ? { updatedAt: { gt: since }, activiteId: { in: activiteIds } } : { activiteId: { in: activiteIds } },
                orderBy: { updatedAt: 'asc' },
            }),
            prisma_1.prisma.mouvementCaisse.findMany({ where: whereActivite, orderBy: { updatedAt: 'asc' } }),
            prisma_1.prisma.financement.findMany({ where: whereActivite, orderBy: { updatedAt: 'asc' } }),
        ]);
        res.json({
            serverTime: new Date(serverTime.getTime() - 5000).toISOString(),
            clients,
            activites,
            produits,
            ventes,
            credits,
            mouvements_caisse: mouvementsCaisse,
            financements,
        });
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
//# sourceMappingURL=Sync.routes.js.map