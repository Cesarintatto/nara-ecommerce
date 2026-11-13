<script setup>
import { MessageCircle } from 'lucide-vue-next'
import { useSiteStore } from '../../store/siteStore'

const site = useSiteStore()

const steps = [
  { n: '01', title: 'Elige la pieza', text: 'Recorre las secciones y encuentra lo que quieres regalar, coleccionar o usar.' },
  { n: '02', title: 'Elige el color', text: 'Cada pieza muestra los colores de filamento que tenemos disponibles.' },
  { n: '03', title: 'Escríbenos', text: 'Pide por WhatsApp. Te confirmamos precio, tiempo de impresión y entrega.' },
]
</script>

<template>
  <section id="como-pedir" class="border-b-2 border-verde bg-crema" aria-labelledby="como-pedir-titulo">
    <div class="contenedor py-16 md:py-24">
      <p class="etiqueta">Cómo pedir</p>
      <h2 id="como-pedir-titulo" class="mt-3 max-w-xl text-4xl">Tres pasos, sin carrito.</h2>

      <ol class="mt-12 grid gap-6 md:grid-cols-3">
        <li v-for="s in steps" :key="s.n" class="border-2 border-verde bg-crema p-6 shadow-capa">
          <span class="text-3xl font-bold">{{ s.n }}</span>
          <h3 class="mt-6 text-lg">{{ s.title }}</h3>
          <p class="mt-2">{{ s.text }}</p>
        </li>
      </ol>

      <a :href="site.whatsappLink()" target="_blank" rel="noopener" class="btn-primario mt-12">
        <MessageCircle class="h-4 w-4" aria-hidden="true" />
        Escríbenos por WhatsApp
      </a>
    </div>
  </section>
</template>
