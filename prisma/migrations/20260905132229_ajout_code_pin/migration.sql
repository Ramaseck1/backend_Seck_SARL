/*
  Warnings:

  - A unique constraint covering the columns `[nom]` on the table `clients` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[contact]` on the table `clients` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "utilisateurs" ADD COLUMN     "codePinHash" TEXT,
ADD COLUMN     "pinBloqueJusqu" TIMESTAMP(3),
ADD COLUMN     "pinTentativesEchouees" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "clients_nom_key" ON "clients"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "clients_contact_key" ON "clients"("contact");
