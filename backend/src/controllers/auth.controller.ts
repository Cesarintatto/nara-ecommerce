import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { handleFailedLogin } from '../middlewares/auth';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
  }

  const user = await prisma.user.findUnique({ where: { email: String(email).toLowerCase().trim() } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    if (user) await handleFailedLogin(user.email);
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedAttempts: 0, lockedUntil: null },
  });

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: 'JWT_SECRET no configurado en el servidor' });
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    secret,
    { expiresIn: '8h' },
  );

  return res.json({
    token,
    user: { id: user.id, email: user.email, role: user.role },
  });
};
