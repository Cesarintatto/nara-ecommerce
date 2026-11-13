<script setup>
import { onMounted } from 'vue'
import Navbar from './components/layout/Navbar.vue'
import Footer from './components/layout/Footer.vue'
import WhatsAppFab from './components/layout/WhatsAppFab.vue'
import ConsentBanner from './components/layout/ConsentBanner.vue'
import { useSiteStore } from './store/siteStore'

const site = useSiteStore()
onMounted(() => site.load())
</script>

<template>
  <a
    href="#contenido"
    class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:bg-verde focus:px-4 focus:py-2 focus:text-crema"
  >
    Saltar al contenido
  </a>
  <div class="flex min-h-screen flex-col">
    <Navbar />
    <main id="contenido" class="flex-1">
      <router-view v-slot="{ Component, route }">
        <transition name="fade" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>
    <Footer />
  </div>
  <WhatsAppFab />
  <ConsentBanner />
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
