<script setup>
import SmartImage from '../ui/SmartImage.vue'
import ColorPalette from '../ui/ColorPalette.vue'
import { formatPrice } from '../../utils/format'

defineProps({
  product: { type: Object, required: true },
})
</script>

<template>
  <router-link :to="`/producto/${product.slug}`" class="group block">
    <div class="aspect-square overflow-hidden border-2 border-verde transition-shadow group-hover:shadow-capa-lg">
      <SmartImage :src="product.image" :alt="product.name" img-class="transition-transform duration-300 group-hover:scale-[1.03]" />
    </div>
    <div class="mt-4 flex items-start justify-between gap-3">
      <h3 class="text-base font-bold group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4">
        {{ product.name }}
      </h3>
      <p class="shrink-0 text-sm">{{ formatPrice(product.price) }}</p>
    </div>
    <ColorPalette :colors="product.colors" size="sm" :max="8" class="mt-3" :label="`Colores de ${product.name}`" />
  </router-link>
</template>
