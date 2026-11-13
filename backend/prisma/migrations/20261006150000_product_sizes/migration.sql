-- Tallas por producto, cada una con su propio inventario.
-- Los productos existentes quedan con una sola talla "Única" que hereda su stock actual.

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "stockPhysical" INTEGER NOT NULL DEFAULT 0,
    "stockAvailable" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_productId_size_key" ON "ProductVariant"("productId", "size");

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "StockReservation" ADD COLUMN "variantId" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "variantId" TEXT,
ADD COLUMN "size" TEXT;

-- AddForeignKey
ALTER TABLE "StockReservation" ADD CONSTRAINT "StockReservation_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Datos: talla "Única" para cada producto existente, con su stock actual
INSERT INTO "ProductVariant" ("id", "productId", "size", "sortOrder", "stockPhysical", "stockAvailable", "updatedAt")
SELECT gen_random_uuid()::text, p."id", 'Única', 0, p."stockPhysical", p."stockAvailable", CURRENT_TIMESTAMP
FROM "Product" p;

-- Reservas en curso y pedidos anteriores apuntan a esa talla
UPDATE "StockReservation" r SET "variantId" = v."id"
FROM "ProductVariant" v WHERE v."productId" = r."productId";

UPDATE "OrderItem" oi SET "variantId" = v."id", "size" = v."size"
FROM "ProductVariant" v WHERE v."productId" = oi."productId";
