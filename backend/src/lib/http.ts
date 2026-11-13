import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import { ValidationError } from './validation';

export class NotFoundError extends Error {}

// Express 4 no captura errores de funciones async: este wrapper los pasa a next().
export const asyncHandler =
  (fn: (req: Request, res: Response) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req, res).catch(next);
  };

// Traduce errores conocidos a respuestas JSON con el código correcto.
export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ValidationError) return res.status(400).json({ error: err.message });
  if (err instanceof NotFoundError) return res.status(404).json({ error: err.message });
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[] | undefined)?.join(', ') || 'campo';
      return res.status(409).json({ error: `Ya existe un registro con ese ${target}` });
    }
    if (err.code === 'P2025') return res.status(404).json({ error: 'Registro no encontrado' });
    if (err.code === 'P2003') return res.status(400).json({ error: 'Alguna referencia (sección o color) no existe' });
  }
  console.error('[api] Error no controlado:', err);
  return res.status(500).json({ error: 'Error interno del servidor' });
};
