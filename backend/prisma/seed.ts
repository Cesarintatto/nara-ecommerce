// Datos iniciales de Naracol Estudio.
// - Siempre: usuario admin, colores de filamento base, secciones y ajustes.
// - Con SEED_SAMPLE_PRODUCTS=true: productos de ejemplo (solo para desarrollo).
// Es idempotente: se puede correr varias veces sin duplicar.
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const COLORS: [name: string, hex: string][] = [
  ['Verde rana', '#3FA34D'],
  ['Amarillo', '#F5C518'],
  ['Rosa chicle', '#F49AC1'],
  ['Azul cielo', '#6EC1E4'],
  ['Morado', '#7E57C2'],
  ['Rojo navidad', '#C62828'],
  ['Verde pino', '#1B5E20'],
  ['Dorado', '#C9A227'],
  ['Blanco', '#FFFFFF'],
  ['Negro', '#1A1A1A'],
  ['Gris', '#9E9E9E'],
  ['Madera', '#A47551'],
];

const SECTIONS = [
  {
    name: 'Clickers',
    slug: 'clickers',
    tag: 'COLECCIONABLES',
    description: 'Llaveros que hacen clic. Se regalan, se coleccionan y no se sueltan.',
    colors: ['Verde rana', 'Amarillo', 'Rosa chicle', 'Azul cielo', 'Morado'],
  },
  {
    name: 'Temporada',
    slug: 'temporada',
    tag: 'NAVIDAD',
    description: 'Adornos, detalles y regalos impresos para esta Navidad.',
    colors: ['Rojo navidad', 'Verde pino', 'Dorado', 'Blanco'],
  },
  {
    name: 'Hogar',
    slug: 'hogar',
    tag: 'PARA USAR',
    description: 'Piezas útiles para la casa: organizadores, soportes y comederos para mascotas.',
    colors: ['Blanco', 'Negro', 'Gris', 'Madera'],
  },
];

const SAMPLE_PRODUCTS = [
  { name: 'Clicker Froggy', section: 'clickers', price: 18000, featured: true, colors: ['Verde rana', 'Rosa chicle', 'Morado'] },
  { name: 'Clicker Pixel', section: 'clickers', price: 15000, featured: false, colors: ['Amarillo', 'Azul cielo'] },
  { name: 'Estrella para el árbol', section: 'temporada', price: 25000, featured: true, colors: ['Dorado', 'Blanco'] },
  { name: 'Bolas navideñas x6', section: 'temporada', price: 32000, featured: false, colors: ['Rojo navidad', 'Verde pino', 'Dorado'] },
  { name: 'Soporte para comedero', section: 'hogar', price: null, featured: false, colors: ['Blanco', 'Negro', 'Gris'] },
];

const slugify = (v: string) =>
  v.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function main() {
  // Admin
  const adminEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@naracol.com').toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminPassword && process.env.NODE_ENV === 'production') {
    throw new Error('Define SEED_ADMIN_PASSWORD para crear el admin en producción');
  }
  const passwordHash = await bcrypt.hash(adminPassword || 'naracol123', 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: passwordHash, role: 'ADMIN', failedAttempts: 0, lockedUntil: null },
    create: { email: adminEmail, password: passwordHash, role: 'ADMIN' },
  });

  // Colores (no pisa cambios hechos desde el admin)
  const colorId: Record<string, string> = {};
  for (const [index, [name, hex]] of COLORS.entries()) {
    const color = await prisma.color.upsert({ where: { name }, update: {}, create: { name, hex, sortOrder: index } });
    colorId[name] = color.id;
  }

  // Secciones con su paleta (solo se crean si no existen)
  for (const [index, s] of SECTIONS.entries()) {
    const exists = await prisma.section.findUnique({ where: { slug: s.slug } });
    if (exists) continue;
    await prisma.section.create({
      data: {
        name: s.name,
        slug: s.slug,
        tag: s.tag,
        description: s.description,
        sortOrder: index,
        colors: { create: s.colors.map((name, i) => ({ colorId: colorId[name], sortOrder: i })) },
      },
    });
  }

  if (process.env.SEED_SAMPLE_PRODUCTS === 'true') {
    for (const [index, p] of SAMPLE_PRODUCTS.entries()) {
      const slug = slugify(p.name);
      if (await prisma.product.findUnique({ where: { slug } })) continue;
      const section = await prisma.section.findUnique({ where: { slug: p.section } });
      await prisma.product.create({
        data: {
          name: p.name,
          slug,
          description: `${p.name}, diseñado e impreso en 3D por Naracol Estudio. Elige tu color y pídelo por WhatsApp.`,
          sectionId: section?.id,
          price: p.price,
          featured: p.featured,
          images: [],
          sortOrder: index,
          colors: { create: p.colors.map((name, i) => ({ colorId: colorId[name], sortOrder: i })) },
        },
      });
    }
  }

  console.log(`[seed] Listo. Admin: ${adminEmail}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
