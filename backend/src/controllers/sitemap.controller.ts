import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const SITE_URL = (process.env.CLIENT_URL || 'https://www.naracol.com').replace(/\/$/, '');

const escapeXml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const urlEntry = (loc: string, changefreq: string, priority: string, lastmod?: string) =>
  `<url><loc>${escapeXml(loc)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}<changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;

export const getSitemap = async (_req: Request, res: Response) => {
  const [sections, products] = await Promise.all([
    prisma.section.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } }),
    prisma.product.findMany({
      where: { active: true, OR: [{ sectionId: null }, { section: { active: true } }] },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    }),
  ]);

  const urls = [
    urlEntry(`${SITE_URL}/`, 'daily', '1.0'),
    ...sections.map((s) => urlEntry(`${SITE_URL}/seccion/${s.slug}`, 'weekly', '0.8', s.updatedAt.toISOString())),
    ...products.map((p) => urlEntry(`${SITE_URL}/producto/${p.slug}`, 'weekly', '0.7', p.updatedAt.toISOString())),
    urlEntry(`${SITE_URL}/terminos`, 'yearly', '0.2'),
    urlEntry(`${SITE_URL}/privacidad`, 'yearly', '0.2'),
  ].join('');

  res.set('Content-Type', 'application/xml; charset=UTF-8');
  res.set('Cache-Control', 'public, max-age=3600');
  res.send(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
  );
};
