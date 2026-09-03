/*
  Warnings:

  - You are about to drop the column `coutMoyen` on the `produits` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "produits" DROP COLUMN "coutMoyen",
 ADD COLUMN     "dateAchat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dateFinSession" TIMESTAMP(3),
ADD COLUMN     "prixAchatUnitaire" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "quantiteInitiale" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "sessionTerminee" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "totalInvesti" DECIMAL(65,30) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "achats_produit" (
    "id" TEXT NOT NULL,
    "produitId" TEXT NOT NULL,
    "quantite" DECIMAL(65,30) NOT NULL,
    "prixUnitaire" DECIMAL(65,30) NOT NULL,
    "montantTotal" DECIMAL(65,30) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "motif" TEXT,

    CONSTRAINT "achats_produit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "achats_produit_produitId_date_idx" ON "achats_produit"("produitId", "date");

-- AddForeignKey
ALTER TABLE "achats_produit" ADD CONSTRAINT "achats_produit_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "produits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
