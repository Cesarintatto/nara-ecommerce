<template>
  <nav class="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
      <!-- Logo -->
      <router-link to="/">
        <img src="@/assets/images/Nara-white.png" alt="NARA Logo" class="h-8" />
      </router-link>

      <!-- Links Centrales -->
      <div class="hidden md:flex gap-10 text-sm font-montserrat tracking-wider text-gray-600">
        <router-link to="/" class="hover:text-nara-olive transition-colors">Inicio</router-link>
        <router-link to="/catalogo" class="hover:text-nara-olive transition-colors">Catálogo</router-link>
      </div>

      <!-- Iconos/Carrito -->
      <div class="flex items-center gap-6">
        <router-link to="/carrito" class="relative p-2 text-gray-700 hover:text-nara-olive transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" x2="21" y1="6" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          <span
            v-if="cart.itemCount > 0"
            class="absolute top-0 right-0 bg-nara-olive text-white text-xs w-4 h-4 rounded-full flex items-center justify-center"
          >
            {{ cart.itemCount }}
          </span>
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useCartStore } from '../../store/cartStore'

const cart = useCartStore()
</script>