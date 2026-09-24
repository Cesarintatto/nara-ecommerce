-- Cambio de pasarela: Mercado Pago -> Wompi

-- Checkout: monto firmado en Wompi (COP x 100), para validar el webhook.
-- Los checkouts vivos duran máximo 15 min; los que existan al migrar
-- quedan en 0 y el TTL los libera.
ALTER TABLE "Checkout" ADD COLUMN "amountInCents" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Checkout" ALTER COLUMN "amountInCents" DROP DEFAULT;

-- Order: el ID del pago ahora es el de la transacción de Wompi.
-- Se renombra (no drop + add) para conservar datos existentes.
ALTER TABLE "Order" RENAME COLUMN "mercadopagoId" TO "paymentId";
ALTER INDEX "Order_mercadopagoId_key" RENAME TO "Order_paymentId_key";
