<template>
  <nav class="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-nara-olive/10">
    <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
      <!-- Logo -->
      <router-link to="/" class="text-3xl font-serif tracking-tighter text-nara-dark">
        NARA
      </router-link>

      <!-- Links Centrales -->
      <div class="hidden md:flex gap-10 text-xs uppercase tracking-[0.2em] text-nara-dark/60">
        <router-link to="/" class="hover:text-nara-olive transition-colors">Inicio</router-link>
        <router-link to="/catalogo" class="hover:text-nara-olive transition-colors">Catálogo</router-link>
      </div>

      <!-- Iconos/Carrito -->
      <div class="flex items-center gap-6">
        <button class="relative p-2 text-nara-dark hover:text-nara-sand transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span class="absolute top-0 right-0 bg-nara-olive text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">0</span>
        </button>
      </div>
    </div>
  </nav>
</template>