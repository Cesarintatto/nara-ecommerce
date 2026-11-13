// CRUD del panel administrativo: banners, secciones, colores y productos.
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { NotFoundError } from '../lib/http';
import {
  ValidationError,
  requiredString,
  optionalString,
  optionalBool,
  optionalInt,
  optionalDate,
  hexColor,
  slugField,
  idList,
  urlList,
} from '../lib/validation';

type Body = Record<string, unknown>;

// ---------- Orden genérico (arrastrar y soltar en el admin) ----------

export type Reorderable = 'banner' | 'section' | 'color' | 'product';

export async function reorder(model: Reorderable, ids: unknown) {
  const list = idList(ids, 'ids');
  if (!list || list.length === 0) throw new ValidationError('Envía "ids" en el orden deseado');
  // Cada delegate tiene la misma forma para update({ where: { id }, data: { sortOrder } })
  const delegate = prisma[model] as unknown as {
    update: (args: { where: { id: string }; data: { sortOrder: number } }) => Prisma.PrismaPromise<unknown>;
  };
  await prisma.$transaction(list.map((id, index) => delegate.update({ where: { id }, data: { sortOrder: index } })));
}

const nextSortOrder = async (model: Reorderable) => {
  const delegate = prisma[model] as unknown as {
    aggregate: (args: { _max: { sortOrder: true } }) => Promise<{ _max: { sortOrder: number | null } }>;
  };
  const { _max } = await delegate.aggregate({ _max: { sortOrder: true } });
  return (_max.sortOrder ?? -1) + 1;
};

// ---------- Colores relacionados (paletas) ----------

const colorLinks = (ids: string[]) => ids.map((colorId, sortOrder) => ({ colorId, sortOrder }));

const colorsInclude = {
  colors: {
    orderBy: { sortOrder: 'asc' as const },
    select: { color: { select: { id: true, name: true, hex: true, available: true } } },
  },
};

const flatten = <T extends { colors: { color: unknown }[] }>(row: T) => ({
  ...row,
  colors: row.colors.map((c) => c.color),
});

// ---------- Banners ----------

function bannerData(body: Body, partial: boolean) {
  const data = {
    title: partial && body.title === undefined ? undefined : requiredString(body.title, 'title', 120),
    subtitle: optionalString(body.subtitle, 'subtitle', 240, partial),
    imageDesktop:
      partial && body.imageDesktop === undefined ? undefined : requiredString(body.imageDesktop, 'imageDesktop', 1000),
    imageMobile: optionalString(body.imageMobile, 'imageMobile', 1000, partial),
    ctaLabel: optionalString(body.ctaLabel, 'ctaLabel', 40, partial),
    ctaUrl: optionalString(body.ctaUrl, 'ctaUrl', 500, partial),
    active: optionalBool(body.active, 'active'),
    startsAt: optionalDate(body.startsAt, 'startsAt', partial),
    endsAt: optionalDate(body.endsAt, 'endsAt', partial),
  };
  if (data.startsAt && data.endsAt && data.startsAt > data.endsAt) {
    throw new ValidationError('La fecha de fin debe ser posterior a la de inicio');
  }
  if (data.ctaUrl && !/^(\/|https?:\/\/)/.test(data.ctaUrl)) {
    throw new ValidationError('El enlace del botón debe empezar por / (página del sitio) o por https://');
  }
  return data;
}

export const listBanners = () => prisma.banner.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] });

export async function createBanner(body: Body) {
  const data = bannerData(body, false);
  return prisma.banner.create({
    data: { ...data, title: data.title!, imageDesktop: data.imageDesktop!, sortOrder: await nextSortOrder('banner') },
  });
}

export const updateBanner = (id: string, body: Body) => prisma.banner.update({ where: { id }, data: bannerData(body, true) });
export const deleteBanner = (id: string) => prisma.banner.delete({ where: { id } });

// ---------- Colores ----------

export const listColors = () =>
  prisma.color.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { sections: true, products: true } } },
  });

export async function createColor(body: Body) {
  return prisma.color.create({
    data: {
      name: requiredString(body.name, 'name', 60),
      hex: hexColor(body.hex),
      available: optionalBool(body.available, 'available') ?? true,
      sortOrder: await nextSortOrder('color'),
    },
  });
}

export const updateColor = (id: string, body: Body) =>
  prisma.color.update({
    where: { id },
    data: {
      name: body.name === undefined ? undefined : requiredString(body.name, 'name', 60),
      hex: body.hex === undefined ? undefined : hexColor(body.hex),
      available: optionalBool(body.available, 'available'),
    },
  });

export const deleteColor = (id: string) => prisma.color.delete({ where: { id } });

// ---------- Secciones ----------

function sectionData(body: Body, partial: boolean) {
  const name = partial && body.name === undefined ? undefined : requiredString(body.name, 'name', 60);
  const tag = optionalString(body.tag, 'tag', 30, partial); // string | null | undefined
  return {
    name,
    slug: slugField(body.slug, name, partial),
    tag: typeof tag === 'string' ? tag.toUpperCase() : tag,
    description:
      body.description === undefined ? (partial ? undefined : '') : (optionalString(body.description, 'description', 600) ?? ''),
    coverImage: optionalString(body.coverImage, 'coverImage', 1000, partial),
    active: optionalBool(body.active, 'active'),
  };
}

export async function listSections() {
  const rows = await prisma.section.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    include: { ...colorsInclude, _count: { select: { products: true } } },
  });
  return rows.map(flatten);
}

export async function getSection(id: string) {
  const row = await prisma.section.findUnique({ where: { id }, include: colorsInclude });
  if (!row) throw new NotFoundError('Sección no encontrada');
  return flatten(row);
}

export async function createSection(body: Body) {
  const data = sectionData(body, false);
  const colorIds = idList(body.colorIds, 'colorIds') ?? [];
  const row = await prisma.section.create({
    data: {
      ...data,
      name: data.name!,
      slug: data.slug!,
      sortOrder: await nextSortOrder('section'),
      colors: { create: colorLinks(colorIds) },
    },
    include: colorsInclude,
  });
  return flatten(row);
}

export async function updateSection(id: string, body: Body) {
  const data = sectionData(body, true);
  const colorIds = idList(body.colorIds, 'colorIds', true);
  const row = await prisma.section.update({
    where: { id },
    data: {
      ...data,
      ...(colorIds ? { colors: { deleteMany: {}, create: colorLinks(colorIds) } } : {}),
    },
    include: colorsInclude,
  });
  return flatten(row);
}

export const deleteSection = (id: string) => prisma.section.delete({ where: { id } });

// ---------- Productos ----------

function productData(body: Body, partial: boolean) {
  const name = partial && body.name === undefined ? undefined : requiredString(body.name, 'name', 120);
  const sectionId = optionalString(body.sectionId, 'sectionId', 64, partial);
  return {
    name,
    slug: slugField(body.slug, name, partial),
    description:
      body.description === undefined ? (partial ? undefined : '') : (optionalString(body.description, 'description', 4000) ?? ''),
    sectionId,
    images: urlList(body.images, 'images', partial),
    price: optionalInt(body.price, 'price', partial),
    featured: optionalBool(body.featured, 'featured'),
    active: optionalBool(body.active, 'active'),
  };
}

export async function listAdminProducts(sectionId?: string) {
  const rows = await prisma.product.findMany({
    where: sectionId ? { sectionId } : undefined,
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    include: { ...colorsInclude, section: { select: { id: true, name: true } } },
  });
  return rows.map(flatten);
}

export async function getAdminProduct(id: string) {
  const row = await prisma.product.findUnique({
    where: { id },
    include: { ...colorsInclude, section: { select: { id: true, name: true } } },
  });
  if (!row) throw new NotFoundError('Producto no encontrado');
  return flatten(row);
}

export async function createAdminProduct(body: Body) {
  const data = productData(body, false);
  const colorIds = idList(body.colorIds, 'colorIds') ?? [];
  const row = await prisma.product.create({
    data: {
      ...data,
      name: data.name!,
      slug: data.slug!,
      images: data.images ?? [],
      sortOrder: await nextSortOrder('product'),
      colors: { create: colorLinks(colorIds) },
    },
    include: colorsInclude,
  });
  return flatten(row);
}

export async function updateAdminProduct(id: string, body: Body) {
  const data = productData(body, true);
  const colorIds = idList(body.colorIds, 'colorIds', true);
  const row = await prisma.product.update({
    where: { id },
    data: {
      ...data,
      ...(colorIds ? { colors: { deleteMany: {}, create: colorLinks(colorIds) } } : {}),
    },
    include: colorsInclude,
  });
  return flatten(row);
}

export const deleteAdminProduct = (id: string) => prisma.product.delete({ where: { id } });

// ---------- Resumen para el inicio del admin ----------

export async function getSummary() {
  const [banners, activeBanners, sections, products, colors, soldOutColors] = await prisma.$transaction([
    prisma.banner.count(),
    prisma.banner.count({ where: { active: true } }),
    prisma.section.count(),
    prisma.product.count(),
    prisma.color.count(),
    prisma.color.count({ where: { available: false } }),
  ]);
  return { banners, activeBanners, sections, products, colors, soldOutColors };
}
