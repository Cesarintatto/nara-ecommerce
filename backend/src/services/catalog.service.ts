// Consultas públicas del sitio. Solo devuelve contenido activo y colores disponibles.
import { prisma } from '../lib/prisma';
import { NotFoundError } from '../lib/http';

const availableColor = {
  where: { color: { available: true } },
  orderBy: [{ sortOrder: 'asc' as const }, { color: { sortOrder: 'asc' as const } }],
  select: { color: { select: { id: true, name: true, hex: true } } },
};

const flattenColors = (rows: { color: { id: string; name: string; hex: string } }[]) => rows.map((r) => r.color);

// Secciones activas, para las que un producto puede verse en el sitio
const visibleProduct = {
  active: true,
  OR: [{ sectionId: null }, { section: { active: true } }],
};

const productCardSelect = {
  id: true,
  name: true,
  slug: true,
  images: true,
  price: true,
  featured: true,
  colors: availableColor,
};

type ProductCardRow = {
  images: string[];
  colors: { color: { id: string; name: string; hex: string } }[];
} & Record<string, unknown>;

const toProductCard = <T extends ProductCardRow>(p: T) => ({
  ...p,
  image: p.images[0] ?? null,
  colors: flattenColors(p.colors),
});

export async function listActiveBanners(now = new Date()) {
  return prisma.banner.findMany({
    where: {
      active: true,
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      ],
    },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    select: {
      id: true,
      title: true,
      subtitle: true,
      imageDesktop: true,
      imageMobile: true,
      ctaLabel: true,
      ctaUrl: true,
    },
  });
}

export async function listActiveSections() {
  const sections = await prisma.section.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    select: {
      id: true,
      name: true,
      slug: true,
      tag: true,
      description: true,
      coverImage: true,
      colors: availableColor,
      _count: { select: { products: { where: { active: true } } } },
    },
  });
  return sections.map(({ _count, colors, ...s }) => ({
    ...s,
    colors: flattenColors(colors),
    productCount: _count.products,
  }));
}

export async function getSectionBySlug(slug: string) {
  const section = await prisma.section.findFirst({
    where: { slug, active: true },
    select: {
      id: true,
      name: true,
      slug: true,
      tag: true,
      description: true,
      coverImage: true,
      colors: availableColor,
      products: {
        where: { active: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        select: productCardSelect,
      },
    },
  });
  if (!section) throw new NotFoundError('Sección no encontrada');
  return {
    ...section,
    colors: flattenColors(section.colors),
    products: section.products.map(toProductCard),
  };
}

export async function listProducts(opts: { featured?: boolean }) {
  const products = await prisma.product.findMany({
    where: { ...visibleProduct, ...(opts.featured ? { featured: true } : {}) },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    select: { ...productCardSelect, section: { select: { name: true, slug: true } } },
    take: 60,
  });
  return products.map(toProductCard);
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug, ...visibleProduct },
    select: {
      ...productCardSelect,
      description: true,
      section: { select: { name: true, slug: true, tag: true } },
    },
  });
  if (!product) throw new NotFoundError('Producto no encontrado');
  return toProductCard(product);
}
