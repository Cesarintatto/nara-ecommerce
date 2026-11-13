import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import { useAuthStore } from '../stores/authStore'

const routes = [
  { path: '/', redirect: '/inicio' },
  { path: '/login', name: 'login', component: LoginView, meta: { guest: true } },
  { path: '/inicio', name: 'home', component: () => import('../views/HomeView.vue'), meta: { requiresAuth: true } },
  { path: '/banners', name: 'banners', component: () => import('../views/BannersView.vue'), meta: { requiresAuth: true } },
  { path: '/secciones', name: 'sections', component: () => import('../views/SectionsView.vue'), meta: { requiresAuth: true } },
  { path: '/productos', name: 'products', component: () => import('../views/ProductsView.vue'), meta: { requiresAuth: true } },
  { path: '/colores', name: 'colors', component: () => import('../views/ColorsView.vue'), meta: { requiresAuth: true } },
  { path: '/ajustes', name: 'settings', component: () => import('../views/SettingsView.vue'), meta: { requiresAuth: true } },
  { path: '/:pathMatch(.*)*', redirect: '/inicio' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) return '/login'
  if (to.meta.guest && auth.isAuthenticated) return '/inicio'
  return true
})

export default router
