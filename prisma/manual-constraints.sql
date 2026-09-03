-- À coller dans le fichier migration.sql généré par la première
-- commande `npx prisma migrate dev`, car Prisma ne génère pas les
-- index uniques partiels depuis schema.prisma.
--
-- Empêche définitivement le double emprunt en cours pour un même
-- (clientId, activiteId), même en cas de bug applicatif.

CREATE UNIQUE INDEX credits_un_seul_en_cours_par_client_activite
ON credits ("clientId", "activiteId")
WHERE statut = 'EN_COURS';
