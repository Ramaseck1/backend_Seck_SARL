-- CreateEnum
CREATE TYPE "StatutFinancement" AS ENUM ('NON_PAYE', 'PAYE');

-- AlterTable
ALTER TABLE "mouvements_caisse" ADD COLUMN     "categorie" TEXT;

-- CreateTable
CREATE TABLE "financements" (
    "id" TEXT NOT NULL,
    "activiteId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "montant" DECIMAL(65,30) NOT NULL,
    "montantRembourse" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "montantRestant" DECIMAL(65,30) NOT NULL,
    "statut" "StatutFinancement" NOT NULL DEFAULT 'NON_PAYE',
    "mouvementCaisseId" TEXT,
    "saisiParId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateSolde" TIMESTAMP(3),

    CONSTRAINT "financements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "remboursements_financement" (
    "id" TEXT NOT NULL,
    "financementId" TEXT NOT NULL,
    "saisiParId" TEXT NOT NULL,
    "montant" DECIMAL(65,30) NOT NULL,
    "typePaiement" TEXT NOT NULL,
    "mouvementCaisseId" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "remboursements_financement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "financements_mouvementCaisseId_key" ON "financements"("mouvementCaisseId");

-- CreateIndex
CREATE INDEX "financements_activiteId_statut_idx" ON "financements"("activiteId", "statut");

-- CreateIndex
CREATE UNIQUE INDEX "remboursements_financement_mouvementCaisseId_key" ON "remboursements_financement"("mouvementCaisseId");

-- CreateIndex
CREATE INDEX "remboursements_financement_financementId_idx" ON "remboursements_financement"("financementId");

-- AddForeignKey
ALTER TABLE "financements" ADD CONSTRAINT "financements_activiteId_fkey" FOREIGN KEY ("activiteId") REFERENCES "activites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financements" ADD CONSTRAINT "financements_saisiParId_fkey" FOREIGN KEY ("saisiParId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financements" ADD CONSTRAINT "financements_mouvementCaisseId_fkey" FOREIGN KEY ("mouvementCaisseId") REFERENCES "mouvements_caisse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remboursements_financement" ADD CONSTRAINT "remboursements_financement_financementId_fkey" FOREIGN KEY ("financementId") REFERENCES "financements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remboursements_financement" ADD CONSTRAINT "remboursements_financement_saisiParId_fkey" FOREIGN KEY ("saisiParId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remboursements_financement" ADD CONSTRAINT "remboursements_financement_mouvementCaisseId_fkey" FOREIGN KEY ("mouvementCaisseId") REFERENCES "mouvements_caisse"("id") ON DELETE SET NULL ON UPDATE CASCADE;
