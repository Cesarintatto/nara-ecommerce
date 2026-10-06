-- Registro de la autorización de tratamiento de datos (Ley 1581 de 2012):
-- fecha en que la clienta aceptó y versión de los términos/política aceptada.
ALTER TABLE "Checkout" ADD COLUMN "privacyAcceptedAt" TIMESTAMP(3),
                       ADD COLUMN "policyVersion" TEXT;

ALTER TABLE "Order" ADD COLUMN "privacyAcceptedAt" TIMESTAMP(3),
                    ADD COLUMN "policyVersion" TEXT;
