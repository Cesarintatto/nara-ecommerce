import { Router } from 'express';
import { asyncHandler as h } from '../lib/http';
import { healthCheck } from '../controllers/health.controller';
import { login } from '../controllers/auth.controller';
import * as pub from '../controllers/public.controller';
import * as admin from '../controllers/admin-catalog.controller';
import { receiveImage, uploadImage } from '../controllers/admin-uploads.controller';
import { checkAuthLock } from '../middlewares/auth';
import { requireAuth } from '../middlewares/jwtAuth';

const router = Router();

router.get('/health', healthCheck);

// ---------- Sitio público ----------
router.get('/banners', h(pub.getBanners));
router.get('/sections', h(pub.getSections));
router.get('/sections/:slug', h(pub.getSection));
router.get('/products', h(pub.getProducts));
router.get('/products/:slug', h(pub.getProduct));
router.get('/settings', h(pub.getPublicSettings));

// ---------- Admin ----------
// La ruta de login va antes del sub-router /admin, que exige token
router.post('/admin/auth/login', checkAuthLock, h(login));

const a = Router();
a.use(requireAuth);

a.get('/summary', h(admin.summary));

a.get('/banners', h(admin.listBanners));
a.post('/banners', h(admin.createBanner));
a.patch('/banners/order', h(admin.reorder('banner')));
a.patch('/banners/:id', h(admin.updateBanner));
a.delete('/banners/:id', h(admin.deleteBanner));

a.get('/colors', h(admin.listColors));
a.post('/colors', h(admin.createColor));
a.patch('/colors/order', h(admin.reorder('color')));
a.patch('/colors/:id', h(admin.updateColor));
a.delete('/colors/:id', h(admin.deleteColor));

a.get('/sections', h(admin.listSections));
a.post('/sections', h(admin.createSection));
a.patch('/sections/order', h(admin.reorder('section')));
a.get('/sections/:id', h(admin.getSection));
a.patch('/sections/:id', h(admin.updateSection));
a.delete('/sections/:id', h(admin.deleteSection));

a.get('/products', h(admin.listProducts));
a.post('/products', h(admin.createProduct));
a.patch('/products/order', h(admin.reorder('product')));
a.get('/products/:id', h(admin.getProduct));
a.patch('/products/:id', h(admin.updateProduct));
a.delete('/products/:id', h(admin.deleteProduct));

a.get('/settings', h(admin.readSettings));
a.patch('/settings', h(admin.writeSettings));

a.post('/uploads/images', receiveImage, h(uploadImage));

router.use('/admin', a);

export default router;
