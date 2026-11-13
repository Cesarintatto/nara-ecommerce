<script setup>
// Diálogo modal: Esc o clic fuera para cerrar (si no está ocupado).
import { onMounted, onBeforeUnmount, ref, nextTick } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  busy: { type: Boolean, default: false },
  wide: { type: Boolean, default: false },
})
const emit = defineEmits(['close'])
const panel = ref(null)

const close = () => {
  if (!props.busy) emit('close')
}
const onKey = (e) => {
  if (e.key === 'Escape') close()
}

onMounted(async () => {
  document.addEventListener('keydown', onKey)
  document.body.style.overflow = 'hidden'
  await nextTick()
  panel.value?.querySelector('input, textarea, select, button')?.focus()
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-verde/60 p-4 md:p-10" @mousedown.self="close">
    <div
      ref="panel"
      role="dialog"
      aria-modal="true"
      :aria-label="title"
      :class="['tarjeta w-full shadow-capa-lg', wide ? 'max-w-4xl' : 'max-w-xl']"
    >
      <header class="flex items-center justify-between border-b-2 border-verde px-6 py-4">
        <h2 class="text-lg">{{ title }}</h2>
        <button type="button" class="btn-icono" aria-label="Cerrar" :disabled="busy" @click="close">×</button>
      </header>
      <div class="px-6 py-6">
        <slot />
      </div>
      <footer v-if="$slots.footer" class="flex flex-wrap items-center justify-end gap-3 border-t-2 border-verde px-6 py-4">
        <slot name="footer" />
      </footer>
    </div>
  </div>
</template>
