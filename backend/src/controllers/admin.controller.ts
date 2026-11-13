import { Request, Response } from 'express';
import { AdminService } from '../services/admin.service';
import { LogisticsService } from '../services/logistics.service';

export const getDashboardStats = async (_req: Request, res: Response) => {
  try {
    const stats = await AdminService.getFinancialStats();
    return res.json(stats);
  } catch (error) {
    console.error('[Admin Stats]', error);
    return res.status(500).json({ error: 'No se pudieron obtener las estadísticas' });
  }
};

export const listAdminOrders = async (req: Request, res: Response) => {
  const status = req.query.status === 'SHIPPED' ? 'SHIPPED' : 'APPROVED';
  try {
    const orders = await LogisticsService.listOrders(status);
    return res.json(
      orders.map((order) => ({
        ...order,
        totalAmount: Number(order.totalAmount),
        items: order.items.map((item) => ({ ...item, priceAtPurchase: Number(item.priceAtPurchase) })),
      })),
    );
  } catch (error) {
    console.error('[Admin Orders]', error);
    return res.status(500).json({ error: 'No se pudieron cargar los pedidos' });
  }
};

export const updateOrderTracking = async (req: Request, res: Response) => {
  const trackingNumber = typeof req.body?.trackingNumber === 'string' ? req.body.trackingNumber.trim() : '';

  if (!trackingNumber) {
    return res.status(400).json({ error: 'trackingNumber es obligatorio' });
  }

  try {
    const order = await LogisticsService.shipOrder(req.params.id, trackingNumber);
    return res.json(order);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al actualizar envío';
    return res.status(400).json({ error: message });
  }
};
