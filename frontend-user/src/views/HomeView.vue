<script setup>
import { ref, computed, onMounted } from 'vue'
import NaraLogoDefs from '../components/home/NaraLogoDefs.vue'
import Hero from '../components/home/Hero.vue'
import Purpose from '../components/home/Purpose.vue'
import FeaturedProducts from '../components/home/FeaturedProducts.vue'
import FitFinder from '../components/home/FitFinder.vue'
import Closing from '../components/home/Closing.vue'
import api from '../api/client'
import { useMeta } from '../composables/useMeta'

useMeta(() => ({ path: '/' }))

const products = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await api.get('/products')
    products.value = Array.isArray(data) ? data : []
  } catch {
    products.value = []
  } finally {
    loading.value = false
  }
})

// Las 3 prendas más recientes con stock (si no alcanzan, se completan con agotadas)
const featured = computed(() => {
  const inStock = products.value.filter((p) => p.stockAvailable > 0)
  const rest = products.value.filter((p) => !(p.stockAvailable > 0))
  return [...inStock, ...rest].slice(0, 3)
})

// Fotos para el mosaico del hero: primeras imágenes de prendas distintas
const heroImages = computed(() =>
  products.value
    .map((p) => p.images?.[0])
    .filter(Boolean)
    .slice(0, 2),
)
</script>

<template>
  <div>
    <NaraLogoDefs />
    <Hero :images="heroImages" />
    <Purpose />
    <FeaturedProducts :products="featured" :loading="loading" />
    <FitFinder />
    <Closing />
  </div>
</template>
