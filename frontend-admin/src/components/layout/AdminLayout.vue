<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import logoNegativo from '../../assets/logos/naracol-logo-negativo.svg'

defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
})

const router = useRouter()
const auth = useAuthStore()
const menuOpen = ref(false)

const links = [
  { to: '/inicio', label: 'Inicio' },
  { to: '/banners', label: 'Banners' },
  { to: '/secciones', label: 'Secciones' },
  { to: '/productos', label: 'Productos' },
  { to: '/colores', label: 'Colores' },
  { to: '/ajustes', label: 'Ajustes' },
]

const siteUrl = import.meta.env.VITE_SITE_URL || 'http://localhost:5173'

const logout = () => {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen md:flex">
    <!-- Barra lateral -->
    <aside class="sobre-verde bg-verde text-crema md:sticky md:top-0 md:flex md:h-screen md:w-60 md:shrink-0 md:flex-col">
      <div class="flex items-center justify-between px-5 py-5">
        <router-link to="/inicio" aria-label="Inicio del admin">
          <img :src="logoNegativo" alt="Naracol Estudio" width="132" height="30" class="h-[30px] w-[132px]" />
        </router-link>
        <button type="button" class="etiqueta border-2 border-crema px-3 py-1.5 md:hidden" :aria-expanded="menuOpen" @click="menuOpen = !menuOpen">
          Menú
        </button>
      </div>
      <p class="etiqueta hidden px-5 text-rosa md:block">Admin</p>

      <nav :class="['flex-1 px-3 pb-4 md:mt-6 md:block', menuOpen ? 'block' : 'hidden']" aria-label="Admin">
        <router-link
          v-for="l in links"
          :key="l.to"
          :to="l.to"
          class="flex items-center gap-3 px-3 py-2.5 font-bold hover:bg-verde-profundo"
          active-class="bg-crema !text-verde hover:!bg-crema"
          @click="menuOpen = false"
        >
          {{ l.label }}
        </router-link>
        <div class="mt-6 border-t border-crema/20 pt-4 md:hidden">
          <a :href="siteUrl" target="_blank" rel="noopener" class="block px-3 py-2">Ver sitio ↗</a>
          <button type="button" class="block px-3 py-2" @click="logout">Cerrar sesión</button>
        </div>
      </nav>

      <div class="hidden border-t border-crema/20 px-5 py-4 text-xs md:block">
        <p class="truncate" :title="auth.user?.email">{{ auth.user?.email }}</p>
        <div class="mt-3 flex gap-4">
          <a :href="siteUrl" target="_blank" rel="noopener" class="underline underline-offset-4">Ver sitio ↗</a>
          <button type="button" class="underline underline-offset-4" @click="logout">Salir</button>
        </div>
      </div>
    </aside>

    <!-- Contenido -->
    <main class="cuadricula min-w-0 flex-1">
      <div class="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-10">
        <header v-if="title" class="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 class="text-3xl">{{ title }}</h1>
            <p v-if="subtitle" class="mt-2 max-w-2xl">{{ subtitle }}</p>
          </div>
          <slot name="actions" />
        </header>
        <slot />
      </div>
    </main>
  </div>
</template>
