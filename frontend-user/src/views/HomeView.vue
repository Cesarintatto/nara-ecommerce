<!-- /frontend-user/src/views/HomeView.vue -->
<script setup>
import Hero from '../components/home/Hero.vue';
import Culture from '../components/home/Culture.vue';
import Featured from '../components/home/Featured.vue';
import Navbar from '../components/layout/Navbar.vue';
</script>

<template>
  <div class="min-h-screen bg-nara-light font-sans text-nara-dark selection:bg-nara-olive/30">
    <Navbar />
    
    <main>
      <!-- Hero Section con Tipografía Serif -->
      <Hero />

      <!-- Sección de Cultura con Patrón de Ondas -->
      <section class="relative py-24 overflow-hidden bg-nara-olive/5">
        <div class="absolute inset-0 opacity-10 bg-fluid-wave bg-repeat-x bg-bottom h-32"></div>
        <Culture />
      </section>

      <!-- Productos Destacados -->
      <Featured />
    </main>

    <footer class="py-12 border-t border-nara-olive/10 text-center text-sm text-nara-sand">
      <p>© 2024 NARA. Hecho con amor por la propia piel.</p>
    </footer>
  </div>
</template>