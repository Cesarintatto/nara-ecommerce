// /backend/src/services/order.service.ts
import { prisma } from '../lib/prisma';
import { sendNaraEmail } from '../config/sdks';
import { Prisma } from '@prisma/client';

export class OrderService {
  /**
   * Consolida la orden tras el pago aprobado
   */
  static async finalizeOrder(preferenceId: string, paymentId: string) {
    return await prisma.$transaction(async (tx) => {
      // 1. Buscar el checkout asociado (con todas sus reservas)
      const checkout = await tx.checkout.findUnique({
        where: { externalId: preferenceId },
        include: { reservations: { include: { product: true } } },
      });

      if (!checkout) {
        console.warn(`Checkout no encontrado o ya procesado para MP ID: ${preferenceId}`);
        return null;
      }

      const totalAmount = checkout.reservations.reduce(
        (sum, res) => sum.add(res.product.basePrice.mul(res.quantity)),
        new Prisma.Decimal(0),
      );

      // 2. Crear la Orden definitiva con un OrderItem por cada producto
      const order = await tx.order.create({
        data: {
          mercadopagoId: paymentId,
          status: 'APPROVED',
          totalAmount,
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

      // 3. Ajustar Inventario Físico de cada producto (el disponible ya se
      // restó al crear las reservas)
      for (const res of checkout.reservations) {
        await tx.product.update({
          where: { id: res.productId },
          data: { stockPhysical: { decrement: res.quantity } },
        });
      }

      // 4. Eliminar el Checkout (cascade se lleva las reservas)
      await tx.checkout.delete({ where: { id: checkout.id } });

      // 5. Disparar Email de Confirmación vía Brevo
      // Template ID: 1 (Configurado en el panel de Brevo, espera un solo
      // "product_name" — hasta que exista una plantilla multi-item, se
      // unen los nombres de los productos en un solo string)
      const productNames = checkout.reservations
        .map((res) => `${res.product.name} (x${res.quantity})`)
        .join(', ');

      await sendNaraEmail(order.customerEmail, 1, {
        customer_name: order.customerName,
        order_id: order.id,
        total_amount: order.totalAmount.toString(),
        product_name: productNames,
      });

      return order;
    });
  }
}
