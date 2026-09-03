-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'GERANT', 'CAISSIER', 'COMPTABLE');

-- CreateEnum
CREATE TYPE "ModePaiement" AS ENUM ('COMPTANT', 'CREDIT');

-- CreateEnum
CREATE TYPE "StatutCredit" AS ENUM ('EN_COURS', 'SOLDE');

-- CreateEnum
CREATE TYPE "TypeMouvement" AS ENUM ('ENTREE', 'SORTIE');

-- CreateEnum
CREATE TYPE "StatutBonCommande" AS ENUM ('BROUILLON', 'ENVOYE', 'RECU', 'ANNULE');

-- CreateEnum
CREATE TYPE "StatutFactureFournisseur" AS ENUM ('EN_ATTENTE', 'PARTIELLE', 'PAYEE');

-- CreateEnum
CREATE TYPE "TypeCompteComptable" AS ENUM ('ACTIF', 'PASSIF', 'CHARGE', 'PRODUIT', 'CAPITAUX');

-- CreateEnum
CREATE TYPE "SensEcriture" AS ENUM ('DEBIT', 'CREDIT');

-- CreateEnum
CREATE TYPE "StatutEmploye" AS ENUM ('ACTIF', 'INACTIF');

-- CreateTable
CREATE TABLE "activites" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "uniteMesure" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utilisateurs" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "motDePasseHash" TEXT NOT NULL,
    "roleGlobal" "Role" NOT NULL DEFAULT 'GERANT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utilisateur_activites" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "activiteId" TEXT NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "utilisateur_activites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "contact" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produits" (
    "id" TEXT NOT NULL,
    "activiteId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "quantiteStock" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "prixUnitaire" DECIMAL(65,30) NOT NULL,
    "coutMoyen" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "seuilAlerte" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ventes" (
    "id" TEXT NOT NULL,
    "activiteId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "produitId" TEXT NOT NULL,
    "saisiParId" TEXT NOT NULL,
    "quantite" DECIMAL(65,30) NOT NULL,
    "montant" DECIMAL(65,30) NOT NULL,
    "modePaiement" "ModePaiement" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ventes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credits" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "activiteId" TEXT NOT NULL,
    "venteId" TEXT,
    "montantInitial" DECIMAL(65,30) NOT NULL,
    "montantRembourse" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "montantRestant" DECIMAL(65,30) NOT NULL,
    "statut" "StatutCredit" NOT NULL DEFAULT 'EN_COURS',
    "dateEmprunt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateSolde" TIMESTAMP(3),

    CONSTRAINT "credits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "remboursements" (
    "id" TEXT NOT NULL,
    "creditId" TEXT NOT NULL,
    "saisiParId" TEXT NOT NULL,
    "montant" DECIMAL(65,30) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "remboursements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mouvements_caisse" (
    "id" TEXT NOT NULL,
    "activiteId" TEXT NOT NULL,
    "venteId" TEXT,
    "saisiParId" TEXT NOT NULL,
    "type" "TypeMouvement" NOT NULL,
    "montant" DECIMAL(65,30) NOT NULL,
    "motif" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mouvements_caisse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fournisseurs" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "contact" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fournisseurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bons_commande" (
    "id" TEXT NOT NULL,
    "activiteId" TEXT NOT NULL,
    "fournisseurId" TEXT NOT NULL,
    "statut" "StatutBonCommande" NOT NULL DEFAULT 'BROUILLON',
    "dateCommande" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateReception" TIMESTAMP(3),

    CONSTRAINT "bons_commande_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lignes_bon_commande" (
    "id" TEXT NOT NULL,
    "bonCommandeId" TEXT NOT NULL,
    "produitId" TEXT NOT NULL,
    "quantite" DECIMAL(65,30) NOT NULL,
    "prixUnitaire" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "lignes_bon_commande_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "factures_fournisseur" (
    "id" TEXT NOT NULL,
    "bonCommandeId" TEXT NOT NULL,
    "montant" DECIMAL(65,30) NOT NULL,
    "montantPaye" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "statut" "StatutFactureFournisseur" NOT NULL DEFAULT 'EN_ATTENTE',
    "dateEcheance" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "factures_fournisseur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paiements_fournisseur" (
    "id" TEXT NOT NULL,
    "factureId" TEXT NOT NULL,
    "montant" DECIMAL(65,30) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "paiements_fournisseur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comptes_comptables" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "type" "TypeCompteComptable" NOT NULL,

    CONSTRAINT "comptes_comptables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ecritures_comptables" (
    "id" TEXT NOT NULL,
    "activiteId" TEXT NOT NULL,
    "journal" TEXT NOT NULL,
    "reference" TEXT,
    "libelle" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "saisiParId" TEXT NOT NULL,

    CONSTRAINT "ecritures_comptables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lignes_ecriture" (
    "id" TEXT NOT NULL,
    "ecritureId" TEXT NOT NULL,
    "compteId" TEXT NOT NULL,
    "sens" "SensEcriture" NOT NULL,
    "montant" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "lignes_ecriture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employes" (
    "id" TEXT NOT NULL,
    "activiteId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "contact" TEXT,
    "poste" TEXT NOT NULL,
    "salaireBase" DECIMAL(65,30) NOT NULL,
    "statut" "StatutEmploye" NOT NULL DEFAULT 'ACTIF',
    "dateEmbauche" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "presences" (
    "id" TEXT NOT NULL,
    "employeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "present" BOOLEAN NOT NULL DEFAULT true,
    "heures" DECIMAL(65,30) NOT NULL DEFAULT 0,

    CONSTRAINT "presences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bulletins" (
    "id" TEXT NOT NULL,
    "employeId" TEXT NOT NULL,
    "mois" INTEGER NOT NULL,
    "annee" INTEGER NOT NULL,
    "montantBrut" DECIMAL(65,30) NOT NULL,
    "deductions" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "montantNet" DECIMAL(65,30) NOT NULL,
    "dateEmission" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bulletins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actifs" (
    "id" TEXT NOT NULL,
    "activiteId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "valeurAcquisition" DECIMAL(65,30) NOT NULL,
    "dateAcquisition" TIMESTAMP(3) NOT NULL,
    "dureeAmortissement" INTEGER NOT NULL,

    CONSTRAINT "actifs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entite" TEXT NOT NULL,
    "entiteId" TEXT NOT NULL,
    "details" JSONB,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_contact_key" ON "utilisateurs"("contact");

-- CreateIndex
CREATE UNIQUE INDEX "utilisateur_activites_utilisateurId_activiteId_key" ON "utilisateur_activites"("utilisateurId", "activiteId");

-- CreateIndex
CREATE INDEX "ventes_activiteId_clientId_idx" ON "ventes"("activiteId", "clientId");

-- CreateIndex
CREATE UNIQUE INDEX "credits_venteId_key" ON "credits"("venteId");

-- CreateIndex
CREATE INDEX "credits_clientId_activiteId_statut_idx" ON "credits"("clientId", "activiteId", "statut");

-- CreateIndex
CREATE INDEX "remboursements_creditId_idx" ON "remboursements"("creditId");

-- CreateIndex
CREATE UNIQUE INDEX "mouvements_caisse_venteId_key" ON "mouvements_caisse"("venteId");

-- CreateIndex
CREATE INDEX "mouvements_caisse_activiteId_date_idx" ON "mouvements_caisse"("activiteId", "date");

-- CreateIndex
CREATE INDEX "bons_commande_activiteId_fournisseurId_idx" ON "bons_commande"("activiteId", "fournisseurId");

-- CreateIndex
CREATE UNIQUE INDEX "factures_fournisseur_bonCommandeId_key" ON "factures_fournisseur"("bonCommandeId");

-- CreateIndex
CREATE UNIQUE INDEX "comptes_comptables_code_key" ON "comptes_comptables"("code");

-- CreateIndex
CREATE INDEX "ecritures_comptables_activiteId_date_idx" ON "ecritures_comptables"("activiteId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "presences_employeId_date_key" ON "presences"("employeId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "bulletins_employeId_mois_annee_key" ON "bulletins"("employeId", "mois", "annee");

-- CreateIndex
CREATE INDEX "audit_logs_entite_entiteId_idx" ON "audit_logs"("entite", "entiteId");

-- AddForeignKey
ALTER TABLE "utilisateur_activites" ADD CONSTRAINT "utilisateur_activites_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utilisateur_activites" ADD CONSTRAINT "utilisateur_activites_activiteId_fkey" FOREIGN KEY ("activiteId") REFERENCES "activites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produits" ADD CONSTRAINT "produits_activiteId_fkey" FOREIGN KEY ("activiteId") REFERENCES "activites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventes" ADD CONSTRAINT "ventes_activiteId_fkey" FOREIGN KEY ("activiteId") REFERENCES "activites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventes" ADD CONSTRAINT "ventes_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventes" ADD CONSTRAINT "ventes_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "produits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventes" ADD CONSTRAINT "ventes_saisiParId_fkey" FOREIGN KEY ("saisiParId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credits" ADD CONSTRAINT "credits_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credits" ADD CONSTRAINT "credits_activiteId_fkey" FOREIGN KEY ("activiteId") REFERENCES "activites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credits" ADD CONSTRAINT "credits_venteId_fkey" FOREIGN KEY ("venteId") REFERENCES "ventes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remboursements" ADD CONSTRAINT "remboursements_creditId_fkey" FOREIGN KEY ("creditId") REFERENCES "credits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remboursements" ADD CONSTRAINT "remboursements_saisiParId_fkey" FOREIGN KEY ("saisiParId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mouvements_caisse" ADD CONSTRAINT "mouvements_caisse_activiteId_fkey" FOREIGN KEY ("activiteId") REFERENCES "activites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mouvements_caisse" ADD CONSTRAINT "mouvements_caisse_venteId_fkey" FOREIGN KEY ("venteId") REFERENCES "ventes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mouvements_caisse" ADD CONSTRAINT "mouvements_caisse_saisiParId_fkey" FOREIGN KEY ("saisiParId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bons_commande" ADD CONSTRAINT "bons_commande_activiteId_fkey" FOREIGN KEY ("activiteId") REFERENCES "activites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bons_commande" ADD CONSTRAINT "bons_commande_fournisseurId_fkey" FOREIGN KEY ("fournisseurId") REFERENCES "fournisseurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_bon_commande" ADD CONSTRAINT "lignes_bon_commande_bonCommandeId_fkey" FOREIGN KEY ("bonCommandeId") REFERENCES "bons_commande"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_bon_commande" ADD CONSTRAINT "lignes_bon_commande_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "produits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factures_fournisseur" ADD CONSTRAINT "factures_fournisseur_bonCommandeId_fkey" FOREIGN KEY ("bonCommandeId") REFERENCES "bons_commande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiements_fournisseur" ADD CONSTRAINT "paiements_fournisseur_factureId_fkey" FOREIGN KEY ("factureId") REFERENCES "factures_fournisseur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecritures_comptables" ADD CONSTRAINT "ecritures_comptables_activiteId_fkey" FOREIGN KEY ("activiteId") REFERENCES "activites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecritures_comptables" ADD CONSTRAINT "ecritures_comptables_saisiParId_fkey" FOREIGN KEY ("saisiParId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_ecriture" ADD CONSTRAINT "lignes_ecriture_ecritureId_fkey" FOREIGN KEY ("ecritureId") REFERENCES "ecritures_comptables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_ecriture" ADD CONSTRAINT "lignes_ecriture_compteId_fkey" FOREIGN KEY ("compteId") REFERENCES "comptes_comptables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employes" ADD CONSTRAINT "employes_activiteId_fkey" FOREIGN KEY ("activiteId") REFERENCES "activites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presences" ADD CONSTRAINT "presences_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "employes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bulletins" ADD CONSTRAINT "bulletins_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "employes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actifs" ADD CONSTRAINT "actifs_activiteId_fkey" FOREIGN KEY ("activiteId") REFERENCES "activites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
