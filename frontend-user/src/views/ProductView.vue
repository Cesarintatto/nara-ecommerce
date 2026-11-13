<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { MessageCircle } from 'lucide-vue-next'
import api from '../api/client'
import SmartImage from '../components/ui/SmartImage.vue'
import ColorPalette from '../components/ui/ColorPalette.vue'
import NotFoundView from './NotFoundView.vue'
import { useSiteStore } from '../store/siteStore'
import { useMeta } from '../composables/useMeta'
import { formatPrice } from '../utils/format'

const route = useRoute()
const site = useSiteStore()
const product = ref(null)
const status = ref('loading') // loading | ok | notfound | error
const activeImage = ref(0)
const colorId = ref(null)

const load = async (slug) => {
  status.value = 'loading'
  activeImage.value = 0
  colorId.value = null
  try {
    product.value = (await api.get(`/products/${slug}`)).data
    // Si solo hay un color, queda elegido
    if (product.value.colors.length === 1) colorId.value = product.value.colors[0].id
    status.value = 'ok'
  } catch (e) {
    status.value = e.response?.status === 404 ? 'notfound' : 'error'
  }
}
watch(() => route.params.slug, (slug) => slug && load(slug), { immediate: true })

const selectedColor = computed(() => product.value?.colors.find((c) => c.id === colorId.value) || null)
const needsColor = computed(() => (product.value?.colors.length ?? 0) > 1 && !selectedColor.value)

const whatsappHref = computed(() => {
  if (!product.value) return site.whatsappLink()
  const url = `${window.location.origin}/producto/${product.value.slug}`
  const color = selectedColor.value ? ` en color ${selectedColor.value.name}` : ''
  return site.whatsappLink(`Hola Naracol, quiero ${product.value.name}${color}. ${url}`)
})

// Si hay varios colores y no ha elegido, se le pide elegir antes de abrir WhatsApp
const showColorHint = ref(false)
const onOrder = (e) => {
  if (needsColor.value) {
    e.preventDefault()
    showColorHint.value = true
    document.getElementById('selector-color')?.focus()
  }
}
watch(colorId, () => (showColorHint.value = false))

useMeta(() => ({
  title: product.value?.name,
  description: product.value?.description?.slice(0, 160) || undefined,
  image: product.value?.image || undefined,
  path: `/producto/${route.params.slug}`,
}))
</script>

<template>
  <NotFoundView v-if="status === 'notfound'" />

  <div v-else-if="status === 'error'" class="contenedor py-24">
    <h1 class="text-3xl">No pudimos cargar este producto.</h1>
    <p class="mt-4">Recarga la página o escríbenos por WhatsApp.</p>
  </div>

  <div v-else class="cuadricula">
    <div class="contenedor grid gap-12 py-10 md:grid-cols-12 md:py-16">
      <!-- Galería -->
      <div class="md:col-span-7">
        <div class="marco aspect-square overflow-hidden bg-crema">
          <div v-if="status === 'loading'" class="h-full w-full animate-pulse bg-verde/10"></div>
          <SmartImage v-else :src="product.images[activeImage]" :alt="product.name" eager />
        </div>
        <div v-if="status === 'ok' && product.images.length > 1" class="mt-6 flex gap-3 overflow-x-auto pb-2">
          <button
            v-for="(img, i) in product.images"
            :key="img"
            type="button"
            class="h-20 w-20 shrink-0 overflow-hidden border-2"
            :class="i === activeImage ? 'border-verde shadow-capa-sm' : 'border-verde/20 hover:border-verde'"
            :aria-label="`Ver foto ${i + 1} de ${product.images.length}`"
            :aria-current="i === activeImage"
            @click="activeImage = i"
          >
            <img :src="img" alt="" class="h-full w-full object-cover" loading="lazy" />
          </button>
        </div>
      </div>

      <!-- Información -->
      <div class="md:col-span-5">
        <template v-if="status === 'ok'">
          <nav aria-label="Ruta" class="text-xs">
            <router-link to="/" class="hover:underline hover:underline-offset-4">Inicio</router-link>
            <template v-if="product.section">
              <span class="mx-2" aria-hidden="true">/</span>
              <router-link :to="`/seccion/${product.section.slug}`" class="hover:underline hover:underline-offset-4">
                {{ product.section.name }}
              </router-link>
            </template>
          </nav>

          <h1 class="mt-6 text-3xl sm:text-4xl">{{ product.name }}</h1>
          <p class="mt-4 text-xl font-bold">{{ formatPrice(product.price) }}</p>

          <div v-if="product.colors.length" class="mt-8">
            <p id="selector-color" tabindex="-1" class="etiqueta mb-4">
              Color<span v-if="selectedColor" class="normal-case tracking-normal">: {{ selectedColor.name }}</span>
            </p>
            <ColorPalette v-model="colorId" :colors="product.colors" selectable :label="`Color de ${product.name}`" />
            <p v-if="showColorHint" class="mt-4 border-l-4 border-rosa pl-3 text-sm font-bold" role="alert">
              Elige un color para tu pedido.
            </p>
          </div>

          <a :href="whatsappHref" target="_blank" rel="noopener" class="btn-primario mt-10 w-full sm:w-auto" @click="onOrder">
            <MessageCircle class="h-4 w-4" aria-hidden="true" />
            Pedir por WhatsApp
          </a>
          <p class="mt-4 text-sm">Te respondemos para confirmar precio, tiempo de impresión y entrega.</p>

          <div v-if="product.description" class="mt-10 border-t-2 border-verde pt-8">
            <p class="etiqueta mb-3">Descripción</p>
            <p class="whitespace-pre-line">{{ product.description }}</p>
          </div>
        </template>

        <div v-else class="space-y-4" aria-busy="true">
          <div class="h-4 w-32 animate-pulse bg-verde/10"></div>
          <div class="h-10 w-3/4 animate-pulse bg-verde/10"></div>
          <div class="h-6 w-24 animate-pulse bg-verde/10"></div>
        </div>
      </div>
    </div>
  </div>
</template>
