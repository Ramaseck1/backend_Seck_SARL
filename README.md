# Backend — Gestion multi-activités

Node.js / Express / TypeScript / Prisma / PostgreSQL.
Trois activités indépendantes (Essence, Huîtres, Bateau-Poisson) : caisses
séparées, crédit client isolé par activité, un seul emprunt actif à la fois
par (client, activité).

## Démarrage

```bash
npm install

cp .env.example .env
# renseigner DATABASE_URL et JWT_SECRET dans .env

npx prisma generate
npx prisma migrate dev --name init
```

Après la première migration, ouvrir le fichier généré dans
`prisma/migrations/<timestamp>_init/migration.sql` et y coller le contenu de
`prisma/manual-constraints.sql` (index unique partiel non généré par Prisma).

```bash
npm run dev
```

- API : http://localhost:4000/api
- Documentation Swagger : http://localhost:4000/docs

## Structure

```
prisma/
  schema.prisma          modèle de données complet (V1 + V2)
  manual-constraints.sql  contrainte SQL à ajouter manuellement
src/
  server.ts               point d'entrée
  app.ts                  assemblage Express + Swagger
  lib/prisma.ts           client Prisma partagé
  middlewares/            auth JWT, gestion d'erreurs centralisée
  modules/
    auth/                 inscription, connexion
    ventes/                création de vente (bloque le double emprunt)
    credits/               remboursements, créances en retard
    ...                    fournisseurs, comptabilité, RH, actifs à ajouter
                           en suivant le même découpage (routes/service)
swagger.yaml              spécification API complète, séparée du code
```

## Modules déjà implémentés

- **Auth** : inscription/connexion avec mot de passe hashé (bcrypt) + JWT
- **Ventes** : création avec vérification transactionnelle du crédit en cours
- **Crédits** : remboursements, clôture automatique, créances en retard

## Modules à implémenter en suivant le même modèle

Chaque module suit le découpage `xxx.routes.ts` (validation zod + appel
service) / `xxx.service.ts` (logique métier + accès Prisma) :

- `activites`, `clients`, `produits`, `caisse`
- `fournisseurs`, `achats` (bons de commande, réception, factures)
- `comptabilite` (écritures, plan comptable, bilan)
- `rh` (employés, bulletins)
- `actifs`
- `reporting` (journalier, consolidé)

Le fichier `swagger.yaml` documente déjà tous les endpoints prévus pour ces
modules — il sert de contrat à respecter au fur et à mesure de l'implémentation.
