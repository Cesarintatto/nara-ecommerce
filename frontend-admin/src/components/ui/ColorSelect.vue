<script setup>
// Editor de paleta: elige colores de la biblioteca. El orden de la paleta es
// el orden en que se eligen (y se puede ajustar con las flechas).
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] }, // ids en orden
  library: { type: Array, default: () => [] }, // [{ id, name, hex, available }]
  label: { type: String, default: 'Paleta de colores' },
  hint: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

const byId = computed(() => Object.fromEntries(props.library.map((c) => [c.id, c])))
const selected = computed(() => props.modelValue.map((id) => byId.value[id]).filter(Boolean))
const isSelected = (id) => props.modelValue.includes(id)

const toggle = (id) =>
  emit('update:modelValue', isSelected(id) ? props.modelValue.filter((x) => x !== id) : [...props.modelValue, id])

const move = (i, dir) => {
  const list = [...props.modelValue]
  const j = i + dir
  ;[list[i], list[j]] = [list[j], list[i]]
  emit('update:modelValue', list)
}

const light = (hex) => {
  const n = parseInt(hex.slice(1), 16)
  return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) > 200
}
</script>

<template>
  <div>
    <span class="rotulo">{{ label }}</span>

    <!-- Paleta elegida, en orden -->
    <ol v-if="selected.length" class="mb-4 flex flex-wrap gap-2" aria-label="Paleta elegida">
      <li v-for="(c, i) in selected" :key="c.id" class="flex items-center gap-1 border-2 border-verde bg-white py-1 pl-1 pr-1.5">
        <span class="h-6 w-6 border border-verde/30" :style="{ backgroundColor: c.hex }" aria-hidden="true"></span>
        <span class="px-1 text-xs font-bold" :class="!c.available ? 'line-through opacity-60' : ''">{{ c.name }}</span>
        <button type="button" class="px-0.5 text-xs disabled:opacity-20" :disabled="i === 0" :aria-label="`Mover ${c.name} antes`" @click="move(i, -1)">←</button>
        <button type="button" class="px-0.5 text-xs disabled:opacity-20" :disabled="i === selected.length - 1" :aria-label="`Mover ${c.name} después`" @click="move(i, 1)">→</button>
      </li>
    </ol>
    <p v-else class="mb-4 text-xs text-verde/70">Aún no hay colores elegidos.</p>

    <!-- Biblioteca -->
    <div class="flex flex-wrap gap-2" role="group" :aria-label="`${label}: biblioteca`">
      <button
        v-for="c in library"
        :key="c.id"
        type="button"
        :aria-pressed="isSelected(c.id)"
        :title="c.available ? c.name : `${c.name} (agotado)`"
        :class="[
          'relative h-9 w-9 border-2 transition-shadow',
          isSelected(c.id) ? 'border-verde shadow-capa-sm' : light(c.hex) ? 'border-verde/30' : 'border-transparent',
          !c.available ? 'opacity-40' : '',
        ]"
        :style="{ backgroundColor: c.hex }"
        @click="toggle(c.id)"
      >
        <span class="sr-only">{{ c.name }}{{ c.available ? '' : ' (agotado)' }}</span>
        <span v-if="isSelected(c.id)" :class="['text-sm font-bold', light(c.hex) ? 'text-verde' : 'text-crema']" aria-hidden="true">✓</span>
      </button>
    </div>
    <p class="ayuda">{{ hint || 'Toca un color para agregarlo o quitarlo. Los agotados (tachados) no se muestran en el sitio.' }}</p>
  </div>
</template>
