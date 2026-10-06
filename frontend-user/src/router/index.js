import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CatalogView from '../views/CatalogView.vue'
import ProductDetailView from '../views/ProductDetailView.vue'
import CartView from '../views/CartView.vue'
import CheckoutView from '../views/CheckoutView.vue'
import ThankYouView from '../views/ThankYouView.vue'
import TermsView from '../views/TermsView.vue'
import PrivacyView from '../views/PrivacyView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/catalogo', name: 'catalog', component: CatalogView },
  { path: '/producto/:slug', name: 'product', component: ProductDetailView },
  { path: '/carrito', name: 'cart', component: CartView },
  { path: '/checkout', name: 'checkout', component: CheckoutView },
  { path: '/gracias', name: 'thank-you', component: ThankYouView },
  { path: '/terminos', name: 'terms', component: TermsView },
  { path: '/privacidad', name: 'privacy', component: PrivacyView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  // Al cambiar de página se vuelve arriba; los enlaces del índice legal (#seccion) bajan a su sección
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, top: 112, behavior: 'smooth' }
    return { top: 0 }
  },
})

export default router
