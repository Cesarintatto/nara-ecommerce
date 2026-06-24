<script setup>
defineProps(['product'])

const formatPrice = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value)

const imageUrl = (product) => product.images?.[0] || null
</script>

<template>
  <router-link :to="'/producto/' + product.slug" class="group block">
    <div class="relative overflow-hidden rounded-nara aspect-[3/4] bg-nara-olive/5">
      <img
        v-if="imageUrl(product)"
        :src="imageUrl(product)"
        :alt="product.name"
        class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center text-nara-sand/50 text-sm"
      >
        Sin imagen
      </div>

      <span
        v-if="product.stockAvailable === 0"
        class="absolute top-4 right-4 bg-nara-dark/80 text-white text-[10px] uppercase tracking-widest px-2 py-1 rounded"
      >
        Agotado
      </span>

      <span
        v-if="product.category?.name"
        class="absolute top-4 left-4 bg-white/80 backdrop-blur-sm text-[10px] uppercase tracking-widest px-2 py-1 rounded"
      >
        {{ product.category.name }}
      </span>
    </div>

    <div class="mt-4 space-y-1">
      <h3 class="text-lg font-serif text-nara-dark group-hover:text-nara-sand transition-colors">
        {{ product.name }}
      </h3>
      <p class="text-sm text-nara-dark/50 tracking-tighter">
        {{ formatPrice(product.basePrice) }}
      </p>
    </div>
  </router-link>
</template>
