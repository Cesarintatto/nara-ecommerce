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

export const updateOrderTracking = async (req: Request, res: Response) => {
  const { trackingNumber } = req.body;

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
