// Endpoints del panel administrativo (todos protegidos con requireAuth en las rutas)
import { Request, Response } from 'express';
import * as admin from '../services/admin-catalog.service';
import { getSettings, updateSettings } from '../services/settings.service';

const body = (req: Request) => (req.body ?? {}) as Record<string, unknown>;

export const summary = async (_req: Request, res: Response) => res.json(await admin.getSummary());

// Banners
export const listBanners = async (_req: Request, res: Response) => res.json(await admin.listBanners());
export const createBanner = async (req: Request, res: Response) => res.status(201).json(await admin.createBanner(body(req)));
export const updateBanner = async (req: Request, res: Response) => res.json(await admin.updateBanner(req.params.id, body(req)));
export const deleteBanner = async (req: Request, res: Response) => {
  await admin.deleteBanner(req.params.id);
  res.status(204).end();
};

// Colores
export const listColors = async (_req: Request, res: Response) => res.json(await admin.listColors());
export const createColor = async (req: Request, res: Response) => res.status(201).json(await admin.createColor(body(req)));
export const updateColor = async (req: Request, res: Response) => res.json(await admin.updateColor(req.params.id, body(req)));
export const deleteColor = async (req: Request, res: Response) => {
  await admin.deleteColor(req.params.id);
  res.status(204).end();
};

// Secciones
export const listSections = async (_req: Request, res: Response) => res.json(await admin.listSections());
export const getSection = async (req: Request, res: Response) => res.json(await admin.getSection(req.params.id));
export const createSection = async (req: Request, res: Response) => res.status(201).json(await admin.createSection(body(req)));
export const updateSection = async (req: Request, res: Response) => res.json(await admin.updateSection(req.params.id, body(req)));
export const deleteSection = async (req: Request, res: Response) => {
  await admin.deleteSection(req.params.id);
  res.status(204).end();
};

// Productos
export const listProducts = async (req: Request, res: Response) =>
  res.json(await admin.listAdminProducts(typeof req.query.sectionId === 'string' ? req.query.sectionId : undefined));
export const getProduct = async (req: Request, res: Response) => res.json(await admin.getAdminProduct(req.params.id));
export const createProduct = async (req: Request, res: Response) => res.status(201).json(await admin.createAdminProduct(body(req)));
export const updateProduct = async (req: Request, res: Response) => res.json(await admin.updateAdminProduct(req.params.id, body(req)));
export const deleteProduct = async (req: Request, res: Response) => {
  await admin.deleteAdminProduct(req.params.id);
  res.status(204).end();
};

// Orden (arrastrar y soltar)
export const reorder = (model: admin.Reorderable) => async (req: Request, res: Response) => {
  await admin.reorder(model, body(req).ids);
  res.status(204).end();
};

// Ajustes
export const readSettings = async (_req: Request, res: Response) => res.json(await getSettings());
export const writeSettings = async (req: Request, res: Response) => res.json(await updateSettings(body(req)));
