// /backend/src/services/logistics.service.ts
import { prisma } from '../lib/prisma';
import { sendNaraEmail } from '../config/sdks';

export class LogisticsService {
  /**
   * Registra el despacho de un pedido y notifica a la clienta
   */
  static async shipOrder(orderId: string, trackingNumber: string) {
    return await prisma.$transaction(async (tx) => {
      // 1. Validar que la orden existe y está pagada
      const order = await tx.order.findUnique({
        where: { id: orderId }
      });

      if (!order || order.status !== 'APPROVED') {
        throw new Error('Solo se pueden despachar órdenes con pago aprobado.');
      }

      // 2. Actualizar estado y guardar guía de envío
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'SHIPPED',
          trackingNumber: trackingNumber,
          updatedAt: new Date()
        }
      });

      // 3. Disparar Email de Despacho vía Brevo
      // Template ID: 2 (Configurado para "Pedido en Camino")
      await sendNaraEmail(order.customerEmail, 2, {
        customer_name: order.customerName,
        tracking_number: trackingNumber,
        order_id: order.id.slice(-6).toUpperCase() // ID corto para referencia
      });

      return updatedOrder;
    });
  }
}