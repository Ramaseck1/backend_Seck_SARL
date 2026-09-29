import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';               // ← adapte le chemin
import { requireAuth } from '../../middlewares/auth';   // ← adapte le chemin

const router = Router();
router.use(requireAuth);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Erreur "métier" : renvoyée au mobile comme un refus définitif (ok:false),
// contrairement aux erreurs techniques (500) qui seront réessayées.
class SyncError extends Error {}

type Operation = {
  opId: string;
  entity: string;
  entityId: string;
  op: 'upsert' | 'delete';
  payload: any;
};

type Handler = {
  upsert: (p: any) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

// Un handler par entité synchronisée. Ajouter ici produits, ventes, etc.
const handlers: Record<string, Handler> = {
  clients: {
    async upsert(p) {
      const nom = String(p.nom ?? '').trim();
      if (!nom) throw new SyncError('Le nom du client est requis.');
      const contact = p.contact ? String(p.contact).trim() : null;

      // Idempotent : rejouer la même opération ne crée jamais de doublon.
      // Modifier un client supprimé ailleurs le "ressuscite" (on préfère ne rien perdre).
      await prisma.client.upsert({
        where: { id: p.id },
        create: { id: p.id, nom, contact },
        update: { nom, contact, deletedAt: null },
      });
    },

    async remove(id) {
      const existant = await prisma.client.findUnique({ where: { id } });
      if (!existant || existant.deletedAt) return; // déjà supprimé : succès

      const [ventes, credits] = await Promise.all([
        prisma.vente.count({ where: { clientId: id } }),
        prisma.credit.count({ where: { clientId: id } }),
      ]);
      if (ventes > 0 || credits > 0) {
        throw new SyncError('Client lié à des ventes ou des crédits : suppression refusée.');
      }
      // Suppression logique : les autres appareils doivent pouvoir l'apprendre via /pull
      await prisma.client.update({ where: { id }, data: { deletedAt: new Date() } });
    },
  },
};

function messageMetier(e: unknown): string | null {
  if (e instanceof SyncError) return e.message;
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
    return 'Un enregistrement avec ce nom ou ce contact existe déjà.';
  }
  return null;
}

// ---------- PUSH : le mobile envoie ses opérations en attente ----------
router.post('/push', async (req, res, next) => {
  try {
    const operations: Operation[] = Array.isArray(req.body?.operations)
      ? req.body.operations.slice(0, 100)
      : [];
    const results: { opId: string; ok: boolean; message?: string }[] = [];

    for (const o of operations) {
      try {
        const h = handlers[o.entity];
        if (!h) throw new SyncError(`Entité inconnue : ${o.entity}`);
        if (!UUID.test(o.entityId)) throw new SyncError('Identifiant invalide.');

        if (o.op === 'upsert') await h.upsert({ ...o.payload, id: o.entityId });
        else if (o.op === 'delete') await h.remove(o.entityId);
        else throw new SyncError('Opération inconnue.');

        results.push({ opId: o.opId, ok: true });
      } catch (e) {
        const msg = messageMetier(e);
        if (msg === null) throw e; // erreur technique → 500 → le mobile réessaiera
        results.push({ opId: o.opId, ok: false, message: msg });
      }
    }
    res.json({ results });
  } catch (e) {
    next(e);
  }
});

// ---------- PULL : le mobile demande ce qui a changé depuis sa dernière sync ----------
router.get('/pull', async (req, res, next) => {
  try {
    const serverTime = new Date();
    const sinceRaw = typeof req.query.since === 'string' ? new Date(req.query.since) : null;
    const since = sinceRaw && !isNaN(sinceRaw.getTime()) ? sinceRaw : null;

    // Première sync : tout ce qui est actif. Ensuite : tout ce qui a bougé (y compris les suppressions).
    const where = since ? { updatedAt: { gt: since } } : { deletedAt: null };

    const clients = await prisma.client.findMany({
      where,
      select: { id: true, nom: true, contact: true, createdAt: true, updatedAt: true, deletedAt: true },
      orderBy: { updatedAt: 'asc' },
    });

    // Marge de 5 s : une ligne reçue deux fois est sans danger (upsert côté mobile),
    // une ligne manquée serait, elle, perdue.
    res.json({
      serverTime: new Date(serverTime.getTime() - 5000).toISOString(),
      clients,
    });
  } catch (e) {
    next(e);
  }
});

export default router;

// Dans ton app.ts / server.ts :
//   import syncRouter from './routes/sync.routes';
//   app.use('/sync', syncRouter);   // (avec le même préfixe que tes autres routes, ex. /api/sync)