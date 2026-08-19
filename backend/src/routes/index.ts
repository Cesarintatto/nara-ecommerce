import { Router } from 'express';
import { healthCheck } from '../controllers/health.controller';
import { listProducts, getProductBySlug } from '../controllers/products.controller';
import { login } from '../controllers/auth.controller';
import { getDashboardStats, updateOrderTracking } from '../controllers/admin.controller';
import {
  listAdminProducts,
  getAdminProduct,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  listCategories,
} from '../controllers/admin-products.controller';
import { createCheckout } from '../controllers/checkout.controller';
import { handleMPWebhook } from '../controllers/webhook.controller';
import { releaseExpiredStock } from '../controllers/cron.controller';
import { checkAuthLock } from '../middlewares/auth';
import { requireAuth } from '../middlewares/jwtAuth';
import { requireCronSecret } from '../middlewares/cronAuth';

const router = Router();

router.get('/health', healthCheck);

router.get('/products', listProducts);
router.get('/products/:slug', getProductBySlug);

router.post('/admin/auth/login', checkAuthLock, login);
router.get('/admin/dashboard/stats', requireAuth, getDashboardStats);
router.patch('/admin/orders/:id/tracking', requireAuth, updateOrderTracking);

router.get('/admin/categories', requireAuth, listCategories);
router.get('/admin/products', requireAuth, listAdminProducts);
router.get('/admin/products/:id', requireAuth, getAdminProduct);
router.post('/admin/products', requireAuth, createAdminProduct);
router.patch('/admin/products/:id', requireAuth, updateAdminProduct);
router.delete('/admin/products/:id', requireAuth, deleteAdminProduct);

router.post('/checkout', createCheckout);
router.post('/webhooks/mercadopago', handleMPWebhook);

router.post('/internal/cron/release-expired-stock', requireCronSecret, releaseExpiredStock);

export default router;
