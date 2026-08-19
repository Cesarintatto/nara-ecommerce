import { Request, Response, NextFunction } from 'express';

// Protege endpoints internos disparados por Cloud Scheduler (no por usuarios).
export const requireCronSecret = (req: Request, res: Response, next: NextFunction) => {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return res.status(500).json({ error: 'CRON_SECRET no configurado en el servidor' });
  }

  if (req.headers['x-cron-secret'] !== secret) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  next();
};
