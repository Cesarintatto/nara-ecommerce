<script setup>
import iconoPositivo from '../assets/logos/naracol-icono-positivo.svg'
import { useMeta } from '../composables/useMeta'

useMeta(() => ({ title: 'Página no encontrada' }))
</script>

<template>
  <section class="cuadricula">
    <div class="contenedor flex flex-col items-start gap-6 py-24 md:py-32">
      <img :src="iconoPositivo" alt="" class="h-auto w-14" />
      <p class="etiqueta">Error 404</p>
      <h1 class="max-w-xl text-4xl">Esta pieza no salió de la impresora.</h1>
      <p>La página que buscas no existe o ya no está disponible.</p>
      <router-link to="/" class="btn-primario">Volver al inicio</router-link>
    </div>
  </section>
</template>
