<script setup>
// Una imagen (portada, banner): subir, ver y quitar. v-model = URL o null.
import { ref } from 'vue'
import { uploadImage, errorMessage } from '../../api/client'

const props = defineProps({
  modelValue: { type: String, default: null },
  folder: { type: String, required: true }, // banners | sections | products
  label: { type: String, required: true },
  hint: { type: String, default: '' },
  aspect: { type: String, default: 'aspect-[4/3]' },
  id: { type: String, required: true },
})
const emit = defineEmits(['update:modelValue', 'uploading'])

const uploading = ref(false)
const error = ref('')

const onFile = async (e) => {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  error.value = ''
  uploading.value = true
  emit('uploading', true)
  try {
    emit('update:modelValue', await uploadImage(file, props.folder))
  } catch (err) {
    error.value = errorMessage(err, 'No se pudo subir la imagen.')
  } finally {
    uploading.value = false
    emit('uploading', false)
  }
}
</script>

<template>
  <div>
    <span class="rotulo">{{ label }}</span>
    <div :class="['relative overflow-hidden border-2 border-dashed border-verde/40 bg-crema', aspect]">
      <img v-if="modelValue" :src="modelValue" alt="" class="h-full w-full object-cover" />
      <div v-else class="flex h-full w-full items-center justify-center p-4 text-center text-xs text-verde/70">
        {{ uploading ? 'Subiendo…' : 'Sin imagen' }}
      </div>
      <div v-if="uploading && modelValue" class="absolute inset-0 flex items-center justify-center bg-crema/80 text-xs font-bold">Subiendo…</div>
    </div>
    <div class="mt-3 flex flex-wrap gap-2">
      <label :for="id" :class="['btn-secundario cursor-pointer', uploading ? 'pointer-events-none opacity-50' : '']">
        {{ modelValue ? 'Cambiar' : 'Subir imagen' }}
      </label>
      <input :id="id" type="file" accept="image/jpeg,image/png,image/webp" class="sr-only" :disabled="uploading" @change="onFile" />
      <button v-if="modelValue" type="button" class="btn-peligro" :disabled="uploading" @click="emit('update:modelValue', null)">Quitar</button>
    </div>
    <p v-if="hint" class="ayuda">{{ hint }}</p>
    <p v-if="error" class="mt-2 text-xs font-bold" role="alert">⚠ {{ error }}</p>
  </div>
</template>
