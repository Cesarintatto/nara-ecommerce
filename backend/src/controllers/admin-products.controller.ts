import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import {
  adminVariantSelect,
  parseVariantsInput,
  VariantInput,
  syncProductVariants,
  VariantValidationError,
} from '../services/variants.service';

const adminProductSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  basePrice: true,
  costPrice: true,
  categoryId: true,
  images: true,
  stockPhysical: true,
  stockAvailable: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { id: true, name: true } },
  variants: adminVariantSelect,
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function serializeProduct(product: {
  basePrice: { toString(): string };
  costPrice: { toString(): string };
  [key: string]: unknown;
}) {
  return {
    ...product,
    basePrice: Number(product.basePrice),
    costPrice: Number(product.costPrice),
  };
}

export const listAdminProducts = async (_req: Request, res: Response) => {
  const products = await prisma.product.findMany({
    select: adminProductSelect,
    orderBy: { createdAt: 'desc' },
  });

  return res.json(products.map(serializeProduct));
};

export const getAdminProduct = async (req: Request, res: Response) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    select: adminProductSelect,
  });

  if (!product) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  return res.json(serializeProduct(product));
};

export const createAdminProduct = async (req: Request, res: Response) => {
  const {
    name,
    slug,
    description,
    categoryId,
    basePrice,
    costPrice,
    variants,
    images,
  } = req.body;

  if (!name?.trim() || !description?.trim() || !categoryId) {
    return res.status(400).json({ error: 'Nombre, descripción y categoría son obligatorios' });
  }

  const parsedBasePrice = Number(basePrice);
  const parsedCostPrice = Number(costPrice);

  if (Number.isNaN(parsedBasePrice) || parsedBasePrice < 0) {
    return res.status(400).json({ error: 'Precio de venta inválido' });
  }
  if (Number.isNaN(parsedCostPrice) || parsedCostPrice < 0) {
    return res.status(400).json({ error: 'Precio de costo inválido' });
  }

  let parsedVariants: VariantInput[] | undefined;
  try {
    parsedVariants = parseVariantsInput(variants);
  } catch (error) {
    if (error instanceof VariantValidationError) return res.status(400).json({ error: error.message });
    throw error;
  }

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) {
    return res.status(400).json({ error: 'Categoría no encontrada' });
  }

  const finalSlug = slug?.trim() || slugify(name);

  const imageList = Array.isArray(images)
    ? images.filter(Boolean)
    : String(images || '')
        .split('\n')
        .map((url: string) => url.trim())
        .filter(Boolean);

  try {
    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          name: name.trim(),
          slug: finalSlug,
          description: description.trim(),
          categoryId,
          basePrice: parsedBasePrice,
          costPrice: parsedCostPrice,
          stockPhysical: 0,
          stockAvailable: 0,
          images: imageList,
        },
      });
      await syncProductVariants(tx, created.id, parsedVariants);
      return tx.product.findUniqueOrThrow({ where: { id: created.id }, select: adminProductSelect });
    });

    return res.status(201).json(serializeProduct(product));
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return res.status(409).json({ error: 'Ya existe un producto con ese slug' });
    }
    throw error;
  }
};

export const updateAdminProduct = async (req: Request, res: Response) => {
  const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  const {
    name,
    slug,
    description,
    categoryId,
    basePrice,
    costPrice,
    variants,
    images,
  } = req.body;

  const data: Record<string, unknown> = {};

  if (name !== undefined) {
    if (!String(name).trim()) return res.status(400).json({ error: 'El nombre no puede estar vacío' });
    data.name = String(name).trim();
  }
  if (slug !== undefined) {
    if (!String(slug).trim()) return res.status(400).json({ error: 'El slug no puede estar vacío' });
    data.slug = String(slug).trim();
  }
  if (description !== undefined) {
    if (!String(description).trim()) return res.status(400).json({ error: 'La descripción no puede estar vacía' });
    data.description = String(description).trim();
  }
  if (categoryId !== undefined) {
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) return res.status(400).json({ error: 'Categoría no encontrada' });
    data.categoryId = categoryId;
  }
  if (basePrice !== undefined) {
    const parsed = Number(basePrice);
    if (Number.isNaN(parsed) || parsed < 0) return res.status(400).json({ error: 'Precio de venta inválido' });
    data.basePrice = parsed;
  }
  if (costPrice !== undefined) {
    const parsed = Number(costPrice);
    if (Number.isNaN(parsed) || parsed < 0) return res.status(400).json({ error: 'Precio de costo inválido' });
    data.costPrice = parsed;
  }
  let parsedVariants: VariantInput[] | undefined;
  if (variants !== undefined) {
    try {
      parsedVariants = parseVariantsInput(variants);
    } catch (error) {
      if (error instanceof VariantValidationError) return res.status(400).json({ error: error.message });
      throw error;
    }
  }
  if (images !== undefined) {
    data.images = Array.isArray(images)
      ? images.filter(Boolean)
      : String(images)
          .split('\n')
          .map((url) => url.trim())
          .filter(Boolean);
  }

  try {
    const product = await prisma.$transaction(async (tx) => {
      await tx.product.update({ where: { id: req.params.id }, data });
      if (parsedVariants) await syncProductVariants(tx, req.params.id, parsedVariants);
      return tx.product.findUniqueOrThrow({ where: { id: req.params.id }, select: adminProductSelect });
    });

    return res.json(serializeProduct(product));
  } catch (error: unknown) {
    if (error instanceof VariantValidationError) {
      return res.status(400).json({ error: error.message });
    }
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return res.status(409).json({ error: 'Ya existe un producto con ese slug' });
    }
    throw error;
  }
};

export const deleteAdminProduct = async (req: Request, res: Response) => {
  const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2003') {
      return res.status(409).json({
        error: 'No se puede eliminar: el producto tiene órdenes o reservas asociadas',
      });
    }
    throw error;
  }
};

export const listCategories = async (_req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });
  return res.json(categories);
};
