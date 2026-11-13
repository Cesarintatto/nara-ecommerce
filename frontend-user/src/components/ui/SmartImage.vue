<script setup>
// Imagen con respaldo de marca: si no hay foto (o falla), muestra el ícono
// de Naracol sobre la cuadrícula, en lugar de un hueco.
import { ref, watch } from 'vue'
import iconoNegativo from '../../assets/logos/naracol-icono-negativo.svg'

const props = defineProps({
  src: { type: String, default: null },
  alt: { type: String, default: '' },
  eager: { type: Boolean, default: false },
  imgClass: { type: String, default: '' },
})

const failed = ref(false)
watch(() => props.src, () => (failed.value = false))
</script>

<template>
  <img
    v-if="src && !failed"
    :src="src"
    :alt="alt"
    :loading="eager ? 'eager' : 'lazy'"
    :fetchpriority="eager ? 'high' : 'auto'"
    decoding="async"
    :class="['h-full w-full object-cover', imgClass]"
    @error="failed = true"
  />
  <div v-else class="cuadricula-clara flex h-full w-full items-center justify-center bg-verde" role="img" :aria-label="alt || 'Sin foto'">
    <img :src="iconoNegativo" alt="" class="h-auto w-[18%] min-w-[24px] max-w-[64px] opacity-90" />
  </div>
</template>
