<script setup>
// Paleta de colores de filamento: cuadros (pixeles) con su nombre accesible.
// Modo "selector": los cuadros son botones y emiten el color elegido.
import { computed } from 'vue'
import { Check } from 'lucide-vue-next'
import { isLightColor } from '../../utils/format'

const props = defineProps({
  colors: { type: Array, default: () => [] }, // [{ id, name, hex }]
  size: { type: String, default: 'md' }, // sm | md | lg
  max: { type: Number, default: 0 }, // 0 = todos
  selectable: { type: Boolean, default: false },
  modelValue: { type: String, default: null }, // id del color elegido
  onDark: { type: Boolean, default: false },
  label: { type: String, default: 'Colores disponibles' },
})
const emit = defineEmits(['update:modelValue'])

const sizes = { sm: 'h-4 w-4', md: 'h-7 w-7', lg: 'h-11 w-11' }
const visible = computed(() => (props.max ? props.colors.slice(0, props.max) : props.colors))
const hiddenCount = computed(() => props.colors.length - visible.value.length)

// Borde para que los colores cercanos al fondo no desaparezcan
const borderFor = (hex) => {
  if (props.onDark) return hex.toUpperCase() === '#1F3A2E' || !isLightColor(hex) ? 'border-crema/60' : 'border-transparent'
  return isLightColor(hex) ? 'border-verde/40' : 'border-transparent'
}
</script>

<template>
  <div v-if="colors.length">
    <!-- Solo lectura -->
    <ul v-if="!selectable" class="flex flex-wrap items-center gap-1.5" :aria-label="label">
      <li
        v-for="c in visible"
        :key="c.id"
        :class="[sizes[size], 'border', borderFor(c.hex)]"
        :style="{ backgroundColor: c.hex }"
        :title="c.name"
      >
        <span class="sr-only">{{ c.name }}</span>
      </li>
      <li v-if="hiddenCount > 0" class="ml-1 text-xs font-bold">+{{ hiddenCount }}</li>
    </ul>

    <!-- Selector -->
    <div v-else role="radiogroup" :aria-label="label" class="flex flex-wrap gap-3">
      <button
        v-for="c in colors"
        :key="c.id"
        type="button"
        role="radio"
        :aria-checked="modelValue === c.id"
        :aria-label="c.name"
        :title="c.name"
        :class="[
          sizes.lg,
          'relative inline-flex items-center justify-center border-2 transition-shadow',
          modelValue === c.id ? 'border-verde shadow-capa' : borderFor(c.hex) === 'border-transparent' ? 'border-transparent' : 'border-verde/40',
        ]"
        :style="{ backgroundColor: c.hex }"
        @click="emit('update:modelValue', c.id)"
      >
        <Check
          v-if="modelValue === c.id"
          class="h-5 w-5"
          :class="isLightColor(c.hex) ? 'text-verde' : 'text-crema'"
          aria-hidden="true"
        />
      </button>
    </div>
  </div>
</template>
