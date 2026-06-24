// /backend/src/services/stock.service.ts
import { prisma } from '../lib/prisma';

export class StockService {
  /**
   * Crea una reserva temporal de stock (TTL 15 min)
   * EARS: Cuando el usuario redirija a Mercado Pago, entonces crear StockReservation
   */
  static async createReservation(productId: string, quantity: number, preferenceId: string) {
    const TTL_MINUTES = 15;
    const expiresAt = new Date(Date.now() + TTL_MINUTES * 60 * 1000);

    return await prisma.$transaction(async (tx) => {
      // 1. Verificar stock disponible
      const product = await tx.product.findUnique({
        where: { id: productId },
        select: { stockAvailable: true, name: true }
      });

      if (!product || product.stockAvailable < quantity) {
        throw new Error(`Stock insuficiente para ${product?.name || 'el producto'}`);
      }

      // 2. Restar del stock disponible (no del físico aún)
      await tx.product.update({
        where: { id: productId },
        data: {
          stockAvailable: { decrement: quantity }
        }
      });

      // 3. Crear el registro de reserva
      const reservation = await tx.stockReservation.create({
        data: {
          productId,
          quantity,
          externalId: preferenceId, // ID de Mercado Pago
          expiresAt
        }
      });

      return reservation;
    });
  }

  /**
   * Libera reservas expiradas y devuelve el stock
   * EARS: Cuando el TTL expire sin Webhook, entonces reincorporar al stock disponible.
   */
  static async releaseExpiredReservations() {
    const now = new Date();

    const expired = await prisma.stockReservation.findMany({
      where: { expiresAt: { lt: now } }
    });

    if (expired.length === 0) return;

    console.log(`[TTL Worker] Liberando ${expired.length} reservas expiradas...`);

    for (const res of expired) {
      await prisma.$transaction([
        // Devolver stock al producto
        prisma.product.update({
          where: { id: res.productId },
          data: { stockAvailable: { increment: res.quantity } }
        }),
        // Eliminar la reserva
        prisma.stockReservation.delete({
          where: { id: res.id }
        })
      ]);
    }
  }
}