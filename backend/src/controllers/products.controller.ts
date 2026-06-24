import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const productSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  basePrice: true,
  stockAvailable: true,
  images: true,
  category: { select: { id: true, name: true } },
};

export const listProducts = async (req: Request, res: Response) => {
  const category = req.query.category as string | undefined;

  const products = await prisma.product.findMany({
    where: category
      ? { category: { name: { equals: category, mode: 'insensitive' } } }
      : undefined,
    select: productSelect,
    orderBy: { createdAt: 'desc' },
  });

  return res.json(
    products.map((p) => ({
      ...p,
      basePrice: Number(p.basePrice),
    })),
  );
};

export const getProductBySlug = async (req: Request, res: Response) => {
  const product = await prisma.product.findUnique({
    where: { slug: req.params.slug },
    select: productSelect,
  });

  if (!product) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  return res.json({ ...product, basePrice: Number(product.basePrice) });
};
