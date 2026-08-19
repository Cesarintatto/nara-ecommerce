<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SizeAssistant from '../components/product/SizeAssistant.vue'
import api from '../api/client'
import { useCartStore } from '../store/cartStore'

const route = useRoute()
const router = useRouter()
const cart = useCartStore()

const product = ref(null)
const isLoading = ref(true)
const error = ref('')
const activeImageIndex = ref(0)
const quantity = ref(1)
const justAdded = ref(false)

const formatPrice = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value)

const activeImage = computed(() => product.value?.images?.[activeImageIndex.value] || null)

const loadProduct = async (slug) => {
  isLoading.value = true
  error.value = ''
  activeImageIndex.value = 0
  quantity.value = 1
  try {
    const { data } = await api.get(`/products/${slug}`)
    product.value = data
  } catch (err) {
    if (err.response?.status === 404) {
      error.value = 'Producto no encontrado.'
    } else {
      error.value = 'No se pudo cargar el producto.'
    }
    product.value = null
  } finally {
    isLoading.value = false
  }
}

const decreaseQuantity = () => {
  quantity.value = Math.max(1, quantity.value - 1)
}

const increaseQuantity = () => {
  quantity.value = Math.min(product.value?.stockAvailable || 1, quantity.value + 1)
}

const addToCart = () => {
  if (!product.value || product.value.stockAvailable === 0) return
  cart.addItem(product.value, quantity.value)
  justAdded.value = true
  setTimeout(() => {
    justAdded.value = false
  }, 1800)
}

onMounted(() => loadProduct(route.params.slug))

watch(
  () => route.params.slug,
  (slug) => {
    if (slug) loadProduct(slug)
  },
)
</script>

<template>
  <div class="pt-24 pb-16 px-6 max-w-7xl mx-auto">
    <button
      type="button"
      class="text-sm text-nara-dark/50 hover:text-nara-olive mb-8 uppercase tracking-widest"
      @click="router.push('/catalogo')"
    >
      ← Volver al catálogo
    </button>

    <p v-if="isLoading" class="text-nara-sand py-20 text-center">Cargando producto…</p>

    <p v-else-if="error" class="text-red-600 py-20 text-center">{{ error }}</p>

    <div v-else-if="product" class="grid lg:grid-cols-2 gap-12">
      <div>
        <div class="rounded-nara overflow-hidden aspect-[3/4] bg-nara-olive/5">
          <img
            v-if="activeImage"
            :src="activeImage"
            :alt="product.name"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-nara-sand">
            Sin imagen
          </div>
        </div>
        <div v-if="product.images?.length > 1" class="flex gap-3 mt-4">
          <button
            v-for="(img, index) in product.images"
            :key="index"
            type="button"
            :class="[
              'w-16 h-16 rounded overflow-hidden border-2 transition-colors',
              activeImageIndex === index ? 'border-nara-olive' : 'border-transparent opacity-60 hover:opacity-100',
            ]"
            @click="activeImageIndex = index"
          >
            <img :src="img" :alt="`${product.name} ${index + 1}`" class="w-full h-full object-cover" />
          </button>
        </div>
      </div>

      <div class="flex flex-col justify-center">
        <p v-if="product.category?.name" class="text-xs uppercase tracking-[0.2em] text-nara-sand mb-2">
          {{ product.category.name }}
        </p>
        <h1 class="text-4xl font-serif mb-2">{{ product.name }}</h1>
        <p class="text-2xl text-nara-sand mb-4">{{ formatPrice(product.basePrice) }}</p>

        <p
          v-if="product.stockAvailable === 0"
          class="text-sm text-red-600/80 mb-4 uppercase tracking-wider"
        >
          Agotado temporalmente
        </p>
        <p v-else class="text-sm text-nara-dark/40 mb-6">
          {{ product.stockAvailable }} disponible{{ product.stockAvailable !== 1 ? 's' : '' }}
        </p>

        <p class="text-nara-dark/70 mb-8 leading-relaxed whitespace-pre-line">
          {{ product.description }}
        </p>

        <SizeAssistant class="mb-8" />

        <div v-if="product.stockAvailable > 0" class="flex items-center gap-4 mb-4">
          <span class="text-xs uppercase tracking-widest text-nara-dark/50">Cantidad</span>
          <div class="flex items-center border border-nara-dark/15 rounded-xl overflow-hidden">
            <button
              type="button"
              class="w-10 h-10 flex items-center justify-center hover:bg-nara-olive/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              :disabled="quantity <= 1"
              @click="decreaseQuantity"
            >
              −
            </button>
            <span class="w-10 text-center">{{ quantity }}</span>
            <button
              type="button"
              class="w-10 h-10 flex items-center justify-center hover:bg-nara-olive/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              :disabled="quantity >= product.stockAvailable"
              @click="increaseQuantity"
            >
              +
            </button>
          </div>
        </div>

        <button
          type="button"
          :disabled="product.stockAvailable === 0"
          class="w-full bg-nara-dark text-white py-4 rounded-xl hover:bg-nara-sand transition-colors uppercase tracking-widest font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
          @click="addToCart"
        >
          {{ product.stockAvailable === 0 ? 'Agotado' : 'Añadir al carrito' }}
        </button>
        <p v-if="justAdded" class="mt-3 text-center text-xs text-nara-olive font-semibold">
          Añadido al carrito ✓
        </p>
        <router-link
          v-if="justAdded"
          to="/carrito"
          class="mt-1 block text-center text-xs text-nara-dark/50 hover:text-nara-olive underline"
        >
          Ver carrito
        </router-link>
      </div>
    </div>
  </div>
</template>
