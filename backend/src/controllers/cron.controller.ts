// /backend/src/controllers/cron.controller.ts
import { Request, Response } from 'express';
import { StockService } from '../services/stock.service';

// Disparado por Cloud Scheduler cada minuto (ver cloudbuild.yaml).
// Reemplaza al worker in-process de node-cron: en Cloud Run, con escalado a
// cero, un cron dentro del proceso no corre de forma confiable entre
// requests.
export const releaseExpiredStock = async (_req: Request, res: Response) => {
  try {
    await StockService.releaseExpiredReservations();
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('[Cron] Error liberando reservas expiradas:', error);
    res.status(500).json({ status: 'error' });
  }
};
