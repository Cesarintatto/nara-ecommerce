<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'

defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
})

const router = useRouter()
const auth = useAuthStore()

const logout = () => {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-nara-olive/5 font-sans">
    <header class="bg-nara-light border-b border-nara-olive/15 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div class="flex items-center gap-10">
          <router-link to="/dashboard" class="text-2xl font-serif text-nara-dark tracking-tight">
            NARA
          </router-link>
          <nav class="hidden sm:flex gap-6 text-xs uppercase tracking-widest">
            <router-link
              to="/dashboard"
              class="text-nara-dark/50 hover:text-nara-olive transition-colors"
              active-class="!text-nara-olive font-medium"
            >
              Dashboard
            </router-link>
            <router-link
              to="/productos"
              class="text-nara-dark/50 hover:text-nara-olive transition-colors"
              active-class="!text-nara-olive font-medium"
            >
              Productos
            </router-link>
          </nav>
        </div>
        <button
          type="button"
          class="text-xs uppercase tracking-wider text-nara-dark/50 hover:text-nara-olive"
          @click="logout"
        >
          Cerrar sesión
        </button>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-6 py-8">
      <header v-if="title" class="mb-8">
        <h1 class="text-3xl font-serif text-nara-dark">{{ title }}</h1>
        <p v-if="subtitle" class="text-nara-sand italic mt-1">{{ subtitle }}</p>
      </header>
      <slot />
    </main>
  </div>
</template>
