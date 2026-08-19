import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CatalogView from '../views/CatalogView.vue'
import ProductDetailView from '../views/ProductDetailView.vue'
import CartView from '../views/CartView.vue'
import CheckoutView from '../views/CheckoutView.vue'
import ThankYouView from '../views/ThankYouView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/catalogo', name: 'catalog', component: CatalogView },
  { path: '/producto/:slug', name: 'product', component: ProductDetailView },
  { path: '/carrito', name: 'cart', component: CartView },
  { path: '/checkout', name: 'checkout', component: CheckoutView },
  { path: '/gracias', name: 'thank-you', component: ThankYouView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
