<script setup>
// Fotos de producto: varias, ordenables. La primera es la portada.
import { ref } from 'vue'
import { uploadImage, errorMessage } from '../../api/client'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  id: { type: String, required: true },
})
const emit = defineEmits(['update:modelValue', 'uploading'])

const uploading = ref(0)
const error = ref('')

const onFiles = async (e) => {
  const files = [...(e.target.files || [])]
  e.target.value = ''
  if (!files.length) return
  error.value = ''
  uploading.value = files.length
  emit('uploading', true)
  const urls = [...props.modelValue]
  for (const file of files) {
    try {
      urls.push(await uploadImage(file, 'products'))
      emit('update:modelValue', [...urls])
    } catch (err) {
      error.value = `${file.name}: ${errorMessage(err, 'no se pudo subir.')}`
    } finally {
      uploading.value -= 1
    }
  }
  emit('uploading', false)
}

const move = (i, dir) => {
  const list = [...props.modelValue]
  const j = i + dir
  ;[list[i], list[j]] = [list[j], list[i]]
  emit('update:modelValue', list)
}
const remove = (i) => emit('update:modelValue', props.modelValue.filter((_, k) => k !== i))
</script>

<template>
  <div>
    <span class="rotulo">Fotos</span>
    <ul class="grid grid-cols-3 gap-3 sm:grid-cols-4">
      <li v-for="(url, i) in modelValue" :key="url" class="border-2 border-verde/40 bg-crema">
        <div class="relative aspect-square">
          <img :src="url" alt="" class="h-full w-full object-cover" />
          <span v-if="i === 0" class="etiqueta absolute left-0 top-0 bg-verde px-1.5 py-0.5 !text-[9px] text-crema">Portada</span>
        </div>
        <div class="flex justify-between gap-1 p-1">
          <button type="button" class="btn-icono !h-7 !w-7" :disabled="i === 0" aria-label="Mover a la izquierda" @click="move(i, -1)">←</button>
          <button type="button" class="btn-icono !h-7 !w-7" aria-label="Quitar foto" @click="remove(i)">×</button>
          <button type="button" class="btn-icono !h-7 !w-7" :disabled="i === modelValue.length - 1" aria-label="Mover a la derecha" @click="move(i, 1)">→</button>
        </div>
      </li>
      <li v-for="n in uploading" :key="`up-${n}`" class="flex aspect-square items-center justify-center border-2 border-dashed border-verde/40 text-xs">
        Subiendo…
      </li>
      <li>
        <label
          :for="id"
          :class="['flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 border-2 border-dashed border-verde/40 text-center text-xs font-bold hover:border-verde', uploading ? 'pointer-events-none opacity-50' : '']"
        >
          <span class="text-2xl leading-none" aria-hidden="true">+</span>
          Agregar fotos
        </label>
        <input :id="id" type="file" accept="image/jpeg,image/png,image/webp" multiple class="sr-only" @change="onFiles" />
      </li>
    </ul>
    <p class="ayuda">JPG, PNG o WebP hasta 15 MB. Se convierten a WebP. Fondo liso crema o verde, luz natural.</p>
    <p v-if="error" class="mt-2 text-xs font-bold" role="alert">⚠ {{ error }}</p>
  </div>
</template>
