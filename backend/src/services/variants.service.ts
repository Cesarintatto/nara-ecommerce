// /backend/src/services/variants.service.ts
// Tallas de producto (ProductVariant), cada una con su propio inventario.
//
// Desde el admin solo se edita el stock FÍSICO de cada talla. El disponible se
// calcula: disponible = físico - apartado (prendas en checkouts en curso). Así
// el admin nunca puede "pisar" una reserva activa.
// Product.stockPhysical / stockAvailable se mantienen como la suma de sus tallas.
import { Prisma } from '@prisma/client';

export const ONE_SIZE = 'Única';
const MAX_SIZE_LENGTH = 20;

export interface VariantInput {
  id?: string;
  size: string;
  stockPhysical: number;
}

export class VariantValidationError extends Error {}

const normalizeSize = (raw: unknown): string => {
  const size = String(raw ?? '').trim().replace(/\s+/g, ' ');
  if (/^(talla\s+)?[uú]nica$/i.test(size)) return ONE_SIZE;
  return size.toUpperCase() === size.toLowerCase() ? size : size.toUpperCase(); // "m" → "M", "10" queda igual
};

/** Valida y normaliza la lista de tallas que llega del admin. */
export function parseVariantsInput(raw: unknown): VariantInput[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new VariantValidationError('Agrega al menos una talla con su stock.');
  }

  const seen = new Set<string>();
  const variants = raw.map((item) => {
    const size = normalizeSize(item?.size);
    if (!size) throw new VariantValidationError('Cada talla necesita un nombre (p. ej. S, M, 10 o Única).');
    if (size.length > MAX_SIZE_LENGTH) throw new VariantValidationError(`La talla "${size}" es demasiado larga.`);

    const key = size.toLowerCase();
    if (seen.has(key)) throw new VariantValidationError(`La talla "${size}" está repetida.`);
    seen.add(key);

    const stockPhysical = Number(item?.stockPhysical);
    if (!Number.isInteger(stockPhysical) || stockPhysical < 0) {
      throw new VariantValidationError(`El stock de la talla "${size}" debe ser un número entero mayor o igual a 0.`);
    }

    const id = typeof item?.id === 'string' && item.id ? item.id : undefined;
    return { id, size, stockPhysical };
  });

  if (variants.length > 1 && variants.some((v) => v.size === ONE_SIZE)) {
    throw new VariantValidationError('"Talla única" no se puede combinar con otras tallas.');
  }
  return variants;
}

/**
 * Deja las tallas del producto exactamente como vienen del admin (crea,
 * actualiza y elimina) y recalcula los totales del producto. Debe correr
 * dentro de una transacción.
 */
export async function syncProductVariants(
  tx: Prisma.TransactionClient,
  productId: string,
  input: VariantInput[],
) {
  const existing = await tx.productVariant.findMany({ where: { productId } });
  const byId = new Map(existing.map((v) => [v.id, v]));
  const keptIds = new Set(input.filter((v) => v.id && byId.has(v.id)).map((v) => v.id!));

  // 1. Tallas eliminadas: solo si no tienen prendas apartadas en este momento
  for (const variant of existing.filter((v) => !keptIds.has(v.id))) {
    const reserved = variant.stockPhysical - variant.stockAvailable;
    const activeReservations = await tx.stockReservation.count({ where: { variantId: variant.id } });
    if (reserved > 0 || activeReservations > 0) {
      throw new VariantValidationError(
        `No puedes quitar la talla "${variant.size}": tiene prendas apartadas en un pago en curso. Intenta en unos minutos.`,
      );
    }
    await tx.productVariant.delete({ where: { id: variant.id } });
  }

  // 2. Tallas que se mantienen o se crean. Primero se renombran temporalmente
  // las existentes para no chocar con la restricción única (productId, size)
  // si el admin intercambió nombres.
  for (const id of keptIds) {
    await tx.productVariant.update({ where: { id }, data: { size: `__tmp_${id}` } });
  }

  for (const [index, item] of input.entries()) {
    const current = item.id ? byId.get(item.id) : undefined;
    if (current) {
      const reserved = current.stockPhysical - current.stockAvailable;
      const stockAvailable = item.stockPhysical - reserved;
      if (stockAvailable < 0) {
        throw new VariantValidationError(
          `La talla "${item.size}" tiene ${reserved} prenda(s) apartada(s) en pagos en curso: su stock no puede ser menor que eso.`,
        );
      }
      await tx.productVariant.update({
        where: { id: current.id },
        data: { size: item.size, sortOrder: index, stockPhysical: item.stockPhysical, stockAvailable },
      });
    } else {
      await tx.productVariant.create({
        data: {
          productId,
          size: item.size,
          sortOrder: index,
          stockPhysical: item.stockPhysical,
          stockAvailable: item.stockPhysical,
        },
      });
    }
  }

  await refreshProductTotals(tx, productId);
}

/** Product.stockPhysical / stockAvailable = suma de sus tallas */
export async function refreshProductTotals(tx: Prisma.TransactionClient, productId: string) {
  const totals = await tx.productVariant.aggregate({
    where: { productId },
    _sum: { stockPhysical: true, stockAvailable: true },
  });
  await tx.product.update({
    where: { id: productId },
    data: {
      stockPhysical: totals._sum.stockPhysical ?? 0,
      stockAvailable: totals._sum.stockAvailable ?? 0,
    },
  });
}

/** Selección pública de tallas (tienda) */
export const publicVariantSelect = {
  orderBy: { sortOrder: 'asc' as const },
  select: { id: true, size: true, stockAvailable: true },
};

/** Selección de tallas para el admin */
export const adminVariantSelect = {
  orderBy: { sortOrder: 'asc' as const },
  select: { id: true, size: true, stockPhysical: true, stockAvailable: true },
};
