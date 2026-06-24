// /backend/src/services/order.service.ts
import { prisma } from '../lib/prisma';
import { sendNaraEmail } from '../config/sdks';

export class OrderService {
  /**
   * Consolida la orden tras el pago aprobado
   */
  static async finalizeOrder(preferenceId: string, paymentId: string) {
    return await prisma.$transaction(async (tx) => {
      // 1. Buscar la reserva asociada
      const reservation = await tx.stockReservation.findUnique({
        where: { externalId: preferenceId },
        include: { product: true }
      });

      if (!reservation) {
        console.warn(`Reserva no encontrada o ya procesada para MP ID: ${preferenceId}`);
        return null;
      }

      // 2. Crear la Orden definitiva
      const order = await tx.order.create({
        data: {
          mercadopagoId: paymentId,
          status: 'APPROVED',
          totalAmount: reservation.product.basePrice.mul(reservation.quantity),
          customerEmail: 'cliente@ejemplo.com', // En producción se extrae del objeto de pago de MP
          customerName: 'Cliente NARA',
          shippingAddress: {}, // Datos del checkout
          items: {
            create: {
              productId: reservation.productId,
              quantity: reservation.quantity,
              priceAtPurchase: reservation.product.basePrice
            }
          }
        }
      });

      // 3. Ajustar Inventario Físico (El disponible ya se restó en la reserva)
      await tx.product.update({
        where: { id: reservation.productId },
        data: {
          stockPhysical: { decrement: reservation.quantity }
        }
      });

      // 4. Eliminar la reserva (Ya es una orden real)
      await tx.stockReservation.delete({
        where: { id: reservation.id }
      });

      // 5. Disparar Email de Confirmación vía Brevo
      // Template ID: 1 (Configurado en el panel de Brevo)
      await sendNaraEmail(order.customerEmail, 1, {
        customer_name: order.customerName,
        order_id: order.id,
        total_amount: order.totalAmount.toString(),
        product_name: reservation.product.name
      });

      return order;
    });
  }
}