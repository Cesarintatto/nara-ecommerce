import { createRouter, createWebHistory } from 'vue-router'
import LandingView from '../views/LandingView.vue'
import CatalogView from '../views/CatalogView.vue'
import ProductDetailView from '../views/ProductDetailView.vue'

const routes = [
  { path: '/', name: 'home', component: LandingView },
  { path: '/catalogo', name: 'catalog', component: CatalogView },
  { path: '/producto/:slug', name: 'product', component: ProductDetailView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
