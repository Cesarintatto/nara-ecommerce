// /backend/src/services/logistics.service.ts
import { prisma } from '../lib/prisma';
import { sendNaraEmail } from '../config/sdks';

export class LogisticsService {
  /**
   * Registra el despacho de un pedido y notifica a la clienta
   */
  static async shipOrder(orderId: string, trackingNumber: string) {
    const shipped = await prisma.$transaction(async (tx) => {
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

      return updatedOrder;
    });

    // 3. Email de despacho vía Brevo (template 2), FUERA de la transacción:
    // si Brevo falla o no está configurado, la guía ya quedó registrada.
    try {
      await sendNaraEmail(shipped.customerEmail, 2, {
        customer_name: shipped.customerName,
        tracking_number: trackingNumber,
        order_id: shipped.id.slice(-6).toUpperCase(), // ID corto para referencia
      });
    } catch (error) {
      console.error(`[Logistics] Pedido ${shipped.id} despachado, pero falló el correo de Brevo:`, error);
    }

    return shipped;
  }

  /**
   * Pedidos para el panel de despachos, con sus prendas y tallas.
   * status: APPROVED = por despachar (más antiguos primero), SHIPPED = enviados.
   */
  static async listOrders(status: 'APPROVED' | 'SHIPPED') {
    return prisma.order.findMany({
      where: { status },
      orderBy: { createdAt: status === 'APPROVED' ? 'asc' : 'desc' },
      take: 200,
      select: {
        id: true,
        status: true,
        customerName: true,
        customerEmail: true,
        shippingAddress: true,
        totalAmount: true,
        trackingNumber: true,
        createdAt: true,
        updatedAt: true,
        items: {
          select: {
            id: true,
            quantity: true,
            size: true,
            priceAtPurchase: true,
            product: { select: { name: true, slug: true, images: true } },
          },
        },
      },
    });
  }
}