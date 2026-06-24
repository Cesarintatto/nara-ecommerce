import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@nara.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'admin123';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: passwordHash, role: 'ADMIN', failedAttempts: 0, lockedUntil: null },
    create: {
      email: adminEmail,
      password: passwordHash,
      role: 'ADMIN',
    },
  });

  const categories = ['Jeanes', 'Blusas', 'Vestidos', 'Camisas'];
  const categoryMap: Record<string, string> = {};

  for (const name of categories) {
    const cat = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    categoryMap[name] = cat.id;
  }

  const products = [
    {
      name: 'Jean Aura Mid-Size',
      slug: 'jean-aura',
      description: 'Jean de tiro medio con stretch cómodo.',
      basePrice: 189000,
      costPrice: 95000,
      categoryId: categoryMap.Jeanes,
      images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80'],
      stockPhysical: 20,
      stockAvailable: 20,
    },
    {
      name: 'Blusa Lino Arena',
      slug: 'blusa-lino',
      description: 'Blusa en lino natural, corte fluido.',
      basePrice: 125000,
      costPrice: 62000,
      categoryId: categoryMap.Blusas,
      images: ['https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?auto=format&fit=crop&q=80'],
      stockPhysical: 15,
      stockAvailable: 15,
    },
    {
      name: 'Vestido Fluido Oliva',
      slug: 'vestido-oliva',
      description: 'Vestido midi en tono oliva.',
      basePrice: 210000,
      costPrice: 105000,
      categoryId: categoryMap.Vestidos,
      images: ['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&q=80'],
      stockPhysical: 10,
      stockAvailable: 10,
    },
    {
      name: 'Camisa Skin Seda',
      slug: 'camisa-skin',
      description: 'Camisa ligera con caída suave.',
      basePrice: 145000,
      costPrice: 72000,
      categoryId: categoryMap.Camisas,
      images: ['https://images.unsplash.com/photo-1598033129183-c4f50c7176c8?auto=format&fit=crop&q=80'],
      stockPhysical: 12,
      stockAvailable: 12,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }

  console.log('Seed completado.');
  console.log(`Admin: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
