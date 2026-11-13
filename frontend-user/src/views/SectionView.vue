<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api/client'
import SmartImage from '../components/ui/SmartImage.vue'
import ColorPalette from '../components/ui/ColorPalette.vue'
import ProductCard from '../components/catalog/ProductCard.vue'
import NotFoundView from './NotFoundView.vue'
import { useSiteStore } from '../store/siteStore'
import { useMeta } from '../composables/useMeta'

const route = useRoute()
const site = useSiteStore()
const section = ref(null)
const status = ref('loading') // loading | ok | notfound | error

const load = async (slug) => {
  status.value = 'loading'
  try {
    section.value = (await api.get(`/sections/${slug}`)).data
    status.value = 'ok'
  } catch (e) {
    status.value = e.response?.status === 404 ? 'notfound' : 'error'
  }
}
watch(() => route.params.slug, (slug) => slug && load(slug), { immediate: true })

useMeta(() => ({
  title: section.value?.name,
  description: section.value?.description || undefined,
  image: section.value?.coverImage || undefined,
  path: `/seccion/${route.params.slug}`,
}))
</script>

<template>
  <NotFoundView v-if="status === 'notfound'" />

  <div v-else-if="status === 'error'" class="contenedor py-24">
    <h1 class="text-3xl">No pudimos cargar esta sección.</h1>
    <p class="mt-4">Recarga la página o escríbenos por WhatsApp.</p>
  </div>

  <div v-else>
    <!-- Encabezado -->
    <header class="sobre-verde cuadricula-clara border-b-2 border-verde bg-verde text-crema">
      <div class="contenedor grid items-center gap-10 py-14 md:grid-cols-12 md:py-20">
        <div class="md:col-span-6">
          <nav aria-label="Ruta" class="text-xs">
            <router-link to="/" class="hover:underline hover:underline-offset-4">Inicio</router-link>
            <span class="mx-2" aria-hidden="true">/</span>
            <span>{{ section?.name || '…' }}</span>
          </nav>
          <template v-if="status === 'ok'">
            <p v-if="section.tag" class="etiqueta mt-8 text-rosa">{{ section.tag }}</p>
            <h1 class="mt-3 text-4xl sm:text-5xl">{{ section.name }}</h1>
            <p v-if="section.description" class="mt-5 max-w-md">{{ section.description }}</p>
            <div v-if="section.colors.length" class="mt-8">
              <p class="etiqueta mb-3">Colores disponibles</p>
              <ColorPalette :colors="section.colors" size="md" on-dark :label="`Colores de ${section.name}`" />
            </div>
          </template>
          <div v-else class="mt-8 space-y-4" aria-busy="true">
            <div class="h-4 w-24 animate-pulse bg-crema/20"></div>
            <div class="h-12 w-64 animate-pulse bg-crema/20"></div>
          </div>
        </div>
        <div class="md:col-span-6">
          <div class="marco aspect-[4/3] overflow-hidden">
            <SmartImage v-if="status === 'ok'" :src="section.coverImage" :alt="section.name" eager />
          </div>
        </div>
      </div>
    </header>

    <!-- Productos -->
    <section class="contenedor py-14 md:py-20" aria-label="Productos">
      <div v-if="status === 'loading'" class="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
        <div v-for="n in 4" :key="n">
          <div class="aspect-square animate-pulse bg-verde/10"></div>
          <div class="mt-4 h-4 w-2/3 animate-pulse bg-verde/10"></div>
        </div>
      </div>

      <template v-else>
        <p class="etiqueta mb-8">
          {{ section.products.length }} {{ section.products.length === 1 ? 'pieza' : 'piezas' }}
        </p>
        <div v-if="section.products.length" class="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          <ProductCard v-for="p in section.products" :key="p.id" :product="p" />
        </div>
        <div v-else class="max-w-lg border-2 border-verde p-6 shadow-capa">
          <p class="font-bold">Estamos preparando las piezas de esta sección.</p>
          <p class="mt-2">Si tienes algo en mente, cuéntanos y lo diseñamos.</p>
          <a :href="site.whatsappLink(`Hola Naracol, quiero algo de la sección ${section.name}.`)" target="_blank" rel="noopener" class="btn-primario mt-5">
            Escríbenos
          </a>
        </div>
      </template>
    </section>
  </div>
</template>
