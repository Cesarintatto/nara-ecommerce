<script setup>
// Overview de una sección en el home: portada, etiqueta, nombre, descripción
// y paleta de colores disponibles. Las filas alternan crema y verde.
import { ArrowRight } from 'lucide-vue-next'
import SmartImage from '../ui/SmartImage.vue'
import ColorPalette from '../ui/ColorPalette.vue'

const props = defineProps({
  section: { type: Object, required: true },
  index: { type: Number, default: 0 },
})

const dark = props.index % 2 === 1
const flip = props.index % 2 === 1
</script>

<template>
  <article
    :class="[
      'border-b-2 border-verde',
      dark ? 'sobre-verde cuadricula-clara bg-verde text-crema' : 'cuadricula bg-crema text-verde',
    ]"
    :aria-labelledby="`sec-${section.slug}`"
  >
    <div class="contenedor grid items-center gap-10 py-16 md:grid-cols-12 md:gap-14 md:py-24">
      <router-link
        :to="`/seccion/${section.slug}`"
        :class="['marco block aspect-[4/3] overflow-hidden md:col-span-7', flip ? 'md:order-2' : '']"
        tabindex="-1"
        aria-hidden="true"
      >
        <SmartImage :src="section.coverImage" :alt="section.name" />
      </router-link>

      <div :class="['md:col-span-5', flip ? 'md:order-1' : '']">
        <p v-if="section.tag" :class="['etiqueta', dark ? 'text-rosa' : '']">
          <span v-if="!dark" class="mr-2 inline-block h-2.5 w-2.5 bg-rosa align-middle" aria-hidden="true"></span>{{ section.tag }}
        </p>
        <h2 :id="`sec-${section.slug}`" class="mt-3 text-4xl sm:text-5xl">{{ section.name }}</h2>
        <p v-if="section.description" class="mt-5 max-w-md">{{ section.description }}</p>

        <div v-if="section.colors.length" class="mt-8">
          <p class="etiqueta mb-3">{{ section.colors.length }} {{ section.colors.length === 1 ? 'color' : 'colores' }}</p>
          <ColorPalette :colors="section.colors" size="md" :on-dark="dark" :label="`Colores de ${section.name}`" />
        </div>

        <router-link :to="`/seccion/${section.slug}`" :class="['mt-10', dark ? 'btn-claro' : 'btn-primario']">
          Ver {{ section.name }}
          <ArrowRight class="h-4 w-4" aria-hidden="true" />
        </router-link>
      </div>
    </div>
  </article>
</template>
