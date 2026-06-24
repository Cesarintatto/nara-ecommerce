<script setup>
import { ref, computed, onMounted } from 'vue'
import FilterBar from '../components/catalog/FilterBar.vue'
import ProductCard from '../components/catalog/ProductCard.vue'
import api from '../api/client'

const products = ref([])
const activeCategory = ref('Todos')
const isLoading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const { data } = await api.get('/products')
    products.value = data
  } catch {
    error.value = 'No se pudo cargar el catálogo. ¿Está el backend en marcha?'
  } finally {
    isLoading.value = false
  }
})

const categories = computed(() => {
  const names = products.value.map((p) => p.category?.name).filter(Boolean)
  return ['Todos', ...new Set(names)]
})

const filteredProducts = computed(() => {
  if (activeCategory.value === 'Todos') return products.value
  return products.value.filter((p) => p.category?.name === activeCategory.value)
})
</script>

<template>
  <div class="pt-24 pb-16 px-6 max-w-7xl mx-auto">
    <header class="mb-12 text-center">
      <img src="../assets/images/Nara-white.png" alt="NARA" class="logo" width="367px" height="300px"/>
      <h1 class="text-4xl font-serif mb-4">Nuestra Colección</h1>
      <p class="text-nara-dark/60 italic">Piezas diseñadas para el ritmo de tu propia piel.</p>
    </header>

    <p v-if="error" class="text-center text-red-600 mb-8">{{ error }}</p>

    <FilterBar
      v-if="!isLoading && products.length"
      :categories="categories"
      :active="activeCategory"
      @update:active="activeCategory = $event"
    />

    <div v-if="!isLoading && !error && filteredProducts.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      <ProductCard v-for="product in filteredProducts" :key="product.id" :product="product" />
    </div>

    <p
      v-else-if="!isLoading && !error && products.length === 0"
      class="text-center text-nara-sand py-16"
    >
      Aún no hay productos en el catálogo.
    </p>

    <p
      v-else-if="!isLoading && !error && filteredProducts.length === 0"
      class="text-center text-nara-sand py-16"
    >
      No hay productos en esta categoría.
    </p>

    <div v-else-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      <div v-for="i in 4" :key="i" class="h-80 bg-nara-olive/5 animate-pulse rounded-nara" />
    </div>
  </div>
</template>
