import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const SITE_URL = (process.env.CLIENT_URL || 'https://www.naracol.com').replace(/\/$/, '');

const escapeXml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const urlEntry = (loc: string, changefreq: string, priority: string, lastmod?: string) =>
  `<url><loc>${escapeXml(loc)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}<changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;

export const getSitemap = async (_req: Request, res: Response) => {
  const products = await prisma.product.findMany({
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  });

  const urls = [
    urlEntry(`${SITE_URL}/`, 'daily', '1.0'),
    urlEntry(`${SITE_URL}/catalogo`, 'daily', '0.8'),
    ...products.map((p) =>
      urlEntry(`${SITE_URL}/producto/${p.slug}`, 'weekly', '0.7', p.updatedAt.toISOString()),
    ),
  ].join('');

  res.set('Content-Type', 'application/xml; charset=UTF-8');
  res.set('Cache-Control', 'public, max-age=3600');
  res.send(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
  );
};
