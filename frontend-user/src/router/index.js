import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/seccion/:slug', name: 'section', component: () => import('../views/SectionView.vue') },
  { path: '/producto/:slug', name: 'product', component: () => import('../views/ProductView.vue') },
  { path: '/terminos', name: 'terms', component: () => import('../views/TermsView.vue') },
  { path: '/privacidad', name: 'privacy', component: () => import('../views/PrivacyView.vue') },
  // Enlaces viejos de la tienda anterior
  { path: '/catalogo', redirect: '/' },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('../views/NotFoundView.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, top: 88, behavior: 'smooth' }
    return { top: 0 }
  },
})

export default router
