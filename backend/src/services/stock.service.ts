// /backend/src/services/stock.service.ts
import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

export class InsufficientStockError extends Error {
  constructor(
    public productId: string,
    productName?: string,
  ) {
    super(`Stock insuficiente para ${productName || productId}`);
    this.name = 'InsufficientStockError';
  }
}

export interface CartItemInput {
  productId: string;
  quantity: number;
}

// Mismo valor que el expiration-time que se envía a Wompi
export const RESERVATION_TTL_MINUTES = 15;

export class StockService {
  /**
   * Reserva stock para todos los items del carrito en una sola transacción
   * (todo o nada) y crea el Checkout que los agrupa bajo una misma
   * referencia de pago de Wompi.
   * EARS: Cuando el usuario confirme el checkout, entonces reservar stock
   * de cada producto y crear el registro de Checkout.
   */
  static async createCheckoutReservation(
    items: CartItemInput[],
    reference: string,
    amountInCents: number,
    customerEmail: string,
    customerName: string,
    shippingAddress: Prisma.InputJsonValue,
  ) {
    const expiresAt = new Date(Date.now() + RESERVATION_TTL_MINUTES * 60 * 1000);

    // Orden estable por productId: evita deadlocks si dos carritos
    // comparten productos y los procesan en orden distinto.
    const sortedItems = [...items].sort((a, b) => a.productId.localeCompare(b.productId));

    return await prisma.$transaction(async (tx) => {
      for (const item of sortedItems) {
        const { count } = await tx.product.updateMany({
          where: { id: item.productId, stockAvailable: { gte: item.quantity } },
          data: { stockAvailable: { decrement: item.quantity } },
        });

        if (count === 0) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            select: { name: true },
          });
          throw new InsufficientStockError(item.productId, product?.name);
        }
      }

      return tx.checkout.create({
        data: {
          externalId: reference,
          amountInCents,
          customerEmail,
          customerName,
          shippingAddress,
          expiresAt,
          reservations: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
          },
        },
      });
    });
  }

  /**
   * Libera un checkout y devuelve su stock al disponible. Idempotente y
   * seguro frente a concurrencia (webhook de rechazo vs. cron de TTL vs.
   * pago aprobado): el deleteMany "reclama" el checkout y, si otro proceso
   * ya lo tomó, no se devuelve stock dos veces.
   * EARS: Cuando Wompi reporte DECLINED / VOIDED / ERROR, entonces liberar
   * la reserva de inmediato.
   */
  static async releaseCheckout(reference: string) {
    return await prisma.$transaction(async (tx) => {
      const checkout = await tx.checkout.findUnique({
        where: { externalId: reference },
        include: { reservations: true },
      });
      if (!checkout) return false;

      const { count } = await tx.checkout.deleteMany({ where: { id: checkout.id } });
      if (count === 0) return false;

      for (const res of checkout.reservations) {
        await tx.product.update({
          where: { id: res.productId },
          data: { stockAvailable: { increment: res.quantity } },
        });
      }
      return true;
    });
  }

  /**
   * Libera checkouts expirados y devuelve el stock reservado.
   * EARS: Cuando el TTL expire sin Webhook, entonces reincorporar al stock disponible.
   */
  static async releaseExpiredReservations() {
    const expiredCheckouts = await prisma.checkout.findMany({
      where: { expiresAt: { lt: new Date() } },
      select: { externalId: true },
    });

    if (expiredCheckouts.length === 0) return;

    console.log(`[TTL Worker] Liberando ${expiredCheckouts.length} checkouts expirados...`);

    for (const checkout of expiredCheckouts) {
      await StockService.releaseCheckout(checkout.externalId);
    }
  }
}
