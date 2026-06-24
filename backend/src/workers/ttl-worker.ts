// /backend/src/workers/ttl-worker.ts
import cron from 'node-cron';
import { StockService } from '../services/stock.service';

// Se ejecuta cada minuto
cron.schedule('* * * * *', async () => {
  try {
    await StockService.releaseExpiredReservations();
  } catch (error) {
    console.error('Error en el worker de limpieza de stock:', error);
  }
});