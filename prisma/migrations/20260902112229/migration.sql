/*
  Warnings:

  - A unique constraint covering the columns `[activiteId,numeroSession]` on the table `produits` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `numeroSession` to the `produits` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "produits" ADD COLUMN     "numeroSession" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "produits_activiteId_numeroSession_key" ON "produits"("activiteId", "numeroSession");
