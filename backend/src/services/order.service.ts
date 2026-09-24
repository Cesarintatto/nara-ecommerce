// /backend/src/services/order.service.ts
import { prisma } from '../lib/prisma';
import { sendNaraEmail } from '../config/sdks';
import { WOMPI_CURRENCY } from '../config/wompi';
import { Prisma } from '@prisma/client';

export class OrderService {
  /**
   * Consolida la orden tras un pago APPROVED de Wompi. Idempotente: si el
   * evento llega repetido, la segunda vez no encuentra el checkout (o ya
   * existe la orden con ese paymentId) y no hace nada.
   */
  static async finalizeOrder(
    reference: string,
    transactionId: string,
    amountInCents: number,
    currency: string,
  ) {
    const existing = await prisma.order.findUnique({ where: { paymentId: transactionId } });
    if (existing) return existing;

    const order = await prisma.$transaction(async (tx) => {
      // 1. Buscar el checkout asociado (con todas sus reservas)
      const checkout = await tx.checkout.findUnique({
        where: { externalId: reference },
        include: { reservations: { include: { product: true } } },
      });

      if (!checkout) {
        // Pago aprobado pero la reserva ya no existe (p. ej. liberada por
        // TTL). No debería pasar porque Wompi expira el pago con la reserva;
        // si pasa, hay que revisarlo a mano en el panel de Wompi.
        console.error(
          `[Order] ATENCIÓN: pago aprobado sin checkout activo. Referencia ${reference}, tx ${transactionId}. Revisar manualmente.`,
        );
        return null;
      }

      // 2. El monto cobrado debe ser exactamente el que se firmó
      if (amountInCents !== checkout.amountInCents || currency !== WOMPI_CURRENCY) {
        console.error(
          `[Order] ATENCIÓN: monto no coincide para ${reference}. Esperado ${checkout.amountInCents} ${WOMPI_CURRENCY}, recibido ${amountInCents} ${currency}. No se consolida.`,
        );
        return null;
      }

      // 3. "Reclamar" el checkout: si otro proceso (cron TTL o un evento
      // repetido) ya lo tomó, no se crea nada. Cascade se lleva las reservas.
      const { count } = await tx.checkout.deleteMany({ where: { id: checkout.id } });
      if (count === 0) return null;

      // 4. Crear la Orden definitiva con un OrderItem por cada producto.
      // totalAmount es lo que efectivamente se cobró en Wompi.
      const created = await tx.order.create({
        data: {
          paymentId: transactionId,
          status: 'APPROVED',
          totalAmount: new Prisma.Decimal(checkout.amountInCents).div(100),
          customerEmail: checkout.customerEmail,
          customerName: checkout.customerName,
          shippingAddress: checkout.shippingAddress as Prisma.InputJsonValue,
          items: {
            create: checkout.reservations.map((res) => ({
              productId: res.productId,
              quantity: res.quantity,
              priceAtPurchase: res.product.basePrice,
            })),
          },
        },
      });

      // 5. Ajustar Inventario Físico de cada producto (el disponible ya se
      // restó al crear las reservas)
      for (const res of checkout.reservations) {
        await tx.product.update({
          where: { id: res.productId },
          data: { stockPhysical: { decrement: res.quantity } },
        });
      }

      return {
        order: created,
        productNames: checkout.reservations
          .map((res) => `${res.product.name} (x${res.quantity})`)
          .join(', '),
      };
    });

    if (!order) return null;

    // 6. Email de confirmación vía Brevo, FUERA de la transacción: si Brevo
    // falla, la orden ya pagada no se debe perder.
    // Template ID: 1 (espera un solo "product_name": se unen los nombres)
    try {
      await sendNaraEmail(order.order.customerEmail, 1, {
        customer_name: order.order.customerName,
        order_id: order.order.id,
        total_amount: order.order.totalAmount.toString(),
        product_name: order.productNames,
      });
    } catch (error) {
      console.error(`[Order] La orden ${order.order.id} se creó pero falló el correo de Brevo:`, error);
    }

    return order.order;
  }
}
