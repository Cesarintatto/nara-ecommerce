// /backend/src/middlewares/auth.ts
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export const checkAuthLock = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (user && user.lockedUntil && user.lockedUntil > new Date()) {
    return res.status(423).json({
      error: 'Cuenta bloqueada temporalmente por seguridad. Intenta más tarde.'
    });
  }

  next();
};

// Lógica de incremento de fallos (se llama desde el controlador de login)
export const handleFailedLogin = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return;

  const newAttempts = user.failedAttempts + 1;
  
  if (newAttempts >= 5) {
    await prisma.user.update({
      where: { email },
      data: {
        failedAttempts: 0,
        lockedUntil: new Date(Date.now() + 30 * 60 * 1000) // Bloqueo de 30 min
      }
    });
  } else {
    await prisma.user.update({
      where: { email },
      data: { failedAttempts: newAttempts }
    });
  }
};