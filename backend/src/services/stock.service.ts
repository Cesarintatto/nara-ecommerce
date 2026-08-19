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

export class StockService {
  /**
   * Reserva stock para todos los items del carrito en una sola transacción
   * (todo o nada) y crea el Checkout que los agrupa bajo una misma
   * preferencia de Mercado Pago.
   * EARS: Cuando el usuario confirme el checkout, entonces reservar stock
   * de cada producto y crear el registro de Checkout.
   */
  static async createCheckoutReservation(
    items: CartItemInput[],
    preferenceId: string,
    customerEmail: string,
    customerName: string,
    shippingAddress: Prisma.InputJsonValue,
  ) {
    const TTL_MINUTES = 15;
    const expiresAt = new Date(Date.now() + TTL_MINUTES * 60 * 1000);

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
          externalId: preferenceId,
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
   * Libera checkouts expirados y devuelve el stock reservado.
   * EARS: Cuando el TTL expire sin Webhook, entonces reincorporar al stock disponible.
   */
  static async releaseExpiredReservations() {
    const now = new Date();

    const expiredCheckouts = await prisma.checkout.findMany({
      where: { expiresAt: { lt: now } },
      include: { reservations: true },
    });

    if (expiredCheckouts.length === 0) return;

    console.log(`[TTL Worker] Liberando ${expiredCheckouts.length} checkouts expirados...`);

    for (const checkout of expiredCheckouts) {
      await prisma.$transaction([
        ...checkout.reservations.map((res) =>
          prisma.product.update({
            where: { id: res.productId },
            data: { stockAvailable: { increment: res.quantity } },
          }),
        ),
        prisma.checkout.delete({ where: { id: checkout.id } }),
      ]);
    }
  }
}
