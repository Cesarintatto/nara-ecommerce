-- Categorías del catálogo NARA: Blusas, Pantalones, Jeans, Busos, Bodys, Vestidos.
-- Migración solo de datos (idempotente): no cambia el esquema.

-- 1. "Jeanes" pasa a llamarse "Jeans" (conserva sus productos)
UPDATE "Category" SET "name" = 'Jeans'
WHERE "name" = 'Jeanes'
  AND NOT EXISTS (SELECT 1 FROM "Category" WHERE "name" = 'Jeans');

-- 2. Crear las que falten
INSERT INTO "Category" ("id", "name") VALUES
  (gen_random_uuid()::text, 'Blusas'),
  (gen_random_uuid()::text, 'Pantalones'),
  (gen_random_uuid()::text, 'Jeans'),
  (gen_random_uuid()::text, 'Busos'),
  (gen_random_uuid()::text, 'Bodys'),
  (gen_random_uuid()::text, 'Vestidos')
ON CONFLICT ("name") DO NOTHING;

-- 3. Quitar "Camisas" solo si no tiene productos (si tiene, se deja para no romperlos)
DELETE FROM "Category" c
WHERE c."name" = 'Camisas'
  AND NOT EXISTS (SELECT 1 FROM "Product" p WHERE p."categoryId" = c."id");
