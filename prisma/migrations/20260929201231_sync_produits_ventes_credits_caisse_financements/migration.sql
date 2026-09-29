/*
  Warnings:

  - Added the required column `updatedAt` to the `credits` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `financements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `mouvements_caisse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ventes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "credits" ADD COLUMN "updatedAt" TIMESTAMP(3);
UPDATE "credits" SET "updatedAt" = "dateEmprunt";
ALTER TABLE "credits" ALTER COLUMN "updatedAt" SET NOT NULL;
-- AlterTable
ALTER TABLE "financements"
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "deletedAt" TIMESTAMP(3),
ADD COLUMN "updatedAt" TIMESTAMP(3);
UPDATE "financements" SET "createdAt" = "date", "updatedAt" = "date";
ALTER TABLE "financements" ALTER COLUMN "updatedAt" SET NOT NULL;


-- AlterTable
ALTER TABLE "mouvements_caisse"
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "deletedAt" TIMESTAMP(3),
ADD COLUMN "updatedAt" TIMESTAMP(3);
UPDATE "mouvements_caisse" SET "createdAt" = "date", "updatedAt" = "date";
ALTER TABLE "mouvements_caisse" ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "produits" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ventes" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "activites_updatedAt_idx" ON "activites"("updatedAt");

-- CreateIndex
CREATE INDEX "credits_updatedAt_idx" ON "credits"("updatedAt");

-- CreateIndex
CREATE INDEX "financements_updatedAt_idx" ON "financements"("updatedAt");

-- CreateIndex
CREATE INDEX "mouvements_caisse_updatedAt_idx" ON "mouvements_caisse"("updatedAt");

-- CreateIndex
CREATE INDEX "produits_updatedAt_idx" ON "produits"("updatedAt");

-- CreateIndex
CREATE INDEX "ventes_updatedAt_idx" ON "ventes"("updatedAt");
