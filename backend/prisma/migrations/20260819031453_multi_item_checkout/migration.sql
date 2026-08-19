/*
  Warnings:

  - You are about to drop the column `createdAt` on the `StockReservation` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `StockReservation` table. All the data in the column will be lost.
  - You are about to drop the column `externalId` on the `StockReservation` table. All the data in the column will be lost.
  - Added the required column `checkoutId` to the `StockReservation` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "StockReservation_expiresAt_idx";

-- DropIndex
DROP INDEX "StockReservation_externalId_key";

-- AlterTable
ALTER TABLE "StockReservation" DROP COLUMN "createdAt",
DROP COLUMN "expiresAt",
DROP COLUMN "externalId",
ADD COLUMN     "checkoutId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Checkout" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "shippingAddress" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Checkout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Checkout_externalId_key" ON "Checkout"("externalId");

-- CreateIndex
CREATE INDEX "Checkout_expiresAt_idx" ON "Checkout"("expiresAt");

-- AddForeignKey
ALTER TABLE "StockReservation" ADD CONSTRAINT "StockReservation_checkoutId_fkey" FOREIGN KEY ("checkoutId") REFERENCES "Checkout"("id") ON DELETE CASCADE ON UPDATE CASCADE;
