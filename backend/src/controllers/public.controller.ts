// Endpoints públicos del sitio de Naracol
import { Request, Response } from 'express';
import * as catalog from '../services/catalog.service';
import { getSettings } from '../services/settings.service';

// Caché corta en el navegador/CDN: el contenido cambia desde el admin
const cacheShort = (res: Response) => res.set('Cache-Control', 'public, max-age=60');

export const getBanners = async (_req: Request, res: Response) => {
  cacheShort(res);
  res.json(await catalog.listActiveBanners());
};

export const getSections = async (_req: Request, res: Response) => {
  cacheShort(res);
  res.json(await catalog.listActiveSections());
};

export const getSection = async (req: Request, res: Response) => {
  cacheShort(res);
  res.json(await catalog.getSectionBySlug(req.params.slug));
};

export const getProducts = async (req: Request, res: Response) => {
  cacheShort(res);
  res.json(await catalog.listProducts({ featured: req.query.featured === 'true' }));
};

export const getProduct = async (req: Request, res: Response) => {
  cacheShort(res);
  res.json(await catalog.getProductBySlug(req.params.slug));
};

export const getPublicSettings = async (_req: Request, res: Response) => {
  cacheShort(res);
  res.json(await getSettings());
};
