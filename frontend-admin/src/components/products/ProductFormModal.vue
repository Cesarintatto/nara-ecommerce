<script setup>
import { ref, watch, computed } from 'vue'
import api from '../../api/client'

const props = defineProps({
  open: Boolean,
  product: { type: Object, default: null },
  categories: { type: Array, default: () => [] },
  saving: Boolean,
  error: { type: String, default: '' },
})

const emit = defineEmits(['close', 'save'])

const emptyForm = () => ({
  name: '',
  slug: '',
  description: '',
  categoryId: '',
  basePrice: '',
  costPrice: '',
  stockPhysical: '',
  stockAvailable: '',
  images: [],
})

const form = ref(emptyForm())

// Estado de la subida de imágenes a Google Cloud Storage
const uploading = ref(false)
const uploadProgress = ref('')
const uploadError = ref('')
const urlInput = ref('')
const fileInput = ref(null)

const isEditing = computed(() => Boolean(props.product?.id))

const selectedCategoryName = computed(
  () => props.categories.find((c) => c.id === form.value.categoryId)?.name || '',
)

watch(
  () => [props.open, props.product],
  () => {
    if (!props.open) return
    if (props.product) {
      form.value = {
        name: props.product.name,
        slug: props.product.slug,
        description: props.product.description,
        categoryId: props.product.categoryId,
        basePrice: String(props.product.basePrice),
        costPrice: String(props.product.costPrice),
        stockPhysical: String(props.product.stockPhysical),
        stockAvailable: String(props.product.stockAvailable),
        images: [...(props.product.images || [])],
      }
    } else {
      form.value = {
        ...emptyForm(),
        categoryId: props.categories[0]?.id || '',
      }
    }
    uploadError.value = ''
    urlInput.value = ''
  },
  { immediate: true },
)

const slugify = (text) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const onNameInput = () => {
  if (!isEditing.value) {
    form.value.slug = slugify(form.value.name)
  }
}

// --- Imágenes: se suben a Google Cloud Storage y se guarda su URL ---
const onFilesSelected = async (event) => {
  const files = Array.from(event.target.files || [])
  event.target.value = ''
  if (!files.length) return

  if (!form.value.categoryId) {
    uploadError.value = 'Elige primero la categoría de la prenda: las fotos se guardan en su carpeta.'
    return
  }

  uploading.value = true
  uploadError.value = ''
  const failed = []

  for (const [i, file] of files.entries()) {
    uploadProgress.value = files.length > 1 ? `Subiendo ${i + 1} de ${files.length}…` : 'Subiendo…'
    const body = new FormData()
    body.append('categoryId', form.value.categoryId)
    body.append('image', file)
    try {
      const { data } = await api.post('/admin/uploads/images', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      form.value.images.push(data.url)
    } catch (err) {
      failed.push(`${file.name}: ${err.response?.data?.error || 'no se pudo subir'}`)
    }
  }

  uploading.value = false
  uploadProgress.value = ''
  if (failed.length) uploadError.value = failed.join(' · ')
}

const addUrl = () => {
  const url = urlInput.value.trim()
  if (!/^https?:\/\//.test(url)) {
    uploadError.value = 'La URL debe empezar por https://'
    return
  }
  form.value.images.push(url)
  urlInput.value = ''
  uploadError.value = ''
}

const removeImage = (index) => {
  form.value.images.splice(index, 1)
}

const makeMain = (index) => {
  const [img] = form.value.images.splice(index, 1)
  form.value.images.unshift(img)
}

const submit = () => {
  emit('save', { ...form.value, images: [...form.value.images] })
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-nara-dark/40"
    @click.self="emit('close')"
  >
    <div class="bg-nara-light w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-nara border border-nara-olive/20 shadow-xl p-6">
      <h2 class="text-xl font-serif text-nara-dark mb-6">
        {{ isEditing ? 'Editar producto' : 'Nuevo producto' }}
      </h2>

      <form class="space-y-4" @submit.prevent="submit">
        <div>
          <label class="block text-xs uppercase tracking-wider text-nara-dark/70 mb-1">Nombre</label>
          <input
            v-model="form.name"
            required
            class="w-full px-3 py-2 rounded-nara border border-nara-olive/30 focus:outline-none focus:ring-2 focus:ring-nara-olive/40"
            @input="onNameInput"
          />
        </div>

        <div>
          <label class="block text-xs uppercase tracking-wider text-nara-dark/70 mb-1">Slug (URL)</label>
          <input
            v-model="form.slug"
            required
            class="w-full px-3 py-2 rounded-nara border border-nara-olive/30 focus:outline-none focus:ring-2 focus:ring-nara-olive/40 font-mono text-sm"
          />
        </div>

        <div>
          <label class="block text-xs uppercase tracking-wider text-nara-dark/70 mb-1">Descripción</label>
          <textarea
            v-model="form.description"
            required
            rows="3"
            class="w-full px-3 py-2 rounded-nara border border-nara-olive/30 focus:outline-none focus:ring-2 focus:ring-nara-olive/40"
          />
        </div>

        <div>
          <label class="block text-xs uppercase tracking-wider text-nara-dark/70 mb-1">Categoría</label>
          <select
            v-model="form.categoryId"
            required
            class="w-full px-3 py-2 rounded-nara border border-nara-olive/30 focus:outline-none focus:ring-2 focus:ring-nara-olive/40"
          >
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs uppercase tracking-wider text-nara-dark/70 mb-1">Precio venta (COP)</label>
            <input
              v-model="form.basePrice"
              type="number"
              min="0"
              step="1"
              required
              class="w-full px-3 py-2 rounded-nara border border-nara-olive/30 focus:outline-none focus:ring-2 focus:ring-nara-olive/40"
            />
          </div>
          <div>
            <label class="block text-xs uppercase tracking-wider text-nara-dark/70 mb-1">Costo maquila (COP)</label>
            <input
              v-model="form.costPrice"
              type="number"
              min="0"
              step="1"
              required
              class="w-full px-3 py-2 rounded-nara border border-nara-olive/30 focus:outline-none focus:ring-2 focus:ring-nara-olive/40"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs uppercase tracking-wider text-nara-dark/70 mb-1">Stock físico</label>
            <input
              v-model="form.stockPhysical"
              type="number"
              min="0"
              step="1"
              required
              class="w-full px-3 py-2 rounded-nara border border-nara-olive/30 focus:outline-none focus:ring-2 focus:ring-nara-olive/40"
            />
          </div>
          <div>
            <label class="block text-xs uppercase tracking-wider text-nara-dark/70 mb-1">Stock disponible</label>
            <input
              v-model="form.stockAvailable"
              type="number"
              min="0"
              step="1"
              :placeholder="isEditing ? '' : 'Igual al físico si vacío'"
              class="w-full px-3 py-2 rounded-nara border border-nara-olive/30 focus:outline-none focus:ring-2 focus:ring-nara-olive/40"
            />
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="block text-xs uppercase tracking-wider text-nara-dark/70">Imágenes</label>
            <button
              type="button"
              :disabled="uploading"
              class="text-xs px-3 py-1.5 rounded-nara bg-nara-dark text-white hover:bg-nara-olive transition-colors disabled:opacity-60"
              @click="fileInput?.click()"
            >
              {{ uploading ? uploadProgress : 'Subir imágenes' }}
            </button>
            <input
              ref="fileInput"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              class="hidden"
              @change="onFilesSelected"
            />
          </div>

          <p class="text-xs text-nara-dark/50 mb-3">
            JPG, PNG o WebP de hasta 15 MB. Se convierten a WebP y se guardan en la carpeta de
            la categoría <strong>{{ selectedCategoryName || 'elegida' }}</strong>.
            La primera es la principal: es la que se ve en el catálogo y en la home.
          </p>

          <div v-if="form.images.length" class="grid grid-cols-3 gap-3 mb-3">
            <div
              v-for="(img, index) in form.images"
              :key="img + index"
              class="relative rounded-nara overflow-hidden border border-nara-olive/20 bg-nara-olive/5"
            >
              <img :src="img" alt="" class="w-full aspect-[3/4] object-cover" />
              <span
                v-if="index === 0"
                class="absolute top-1.5 left-1.5 bg-nara-dark text-white text-[10px] px-2 py-0.5 rounded-full"
              >
                Principal
              </span>
              <div class="absolute inset-x-0 bottom-0 flex gap-1 p-1.5 bg-gradient-to-t from-nara-dark/60">
                <button
                  v-if="index !== 0"
                  type="button"
                  class="flex-1 text-[10px] py-1 rounded bg-white/90 text-nara-dark hover:bg-white"
                  @click="makeMain(index)"
                >
                  Principal
                </button>
                <button
                  type="button"
                  class="flex-1 text-[10px] py-1 rounded bg-white/90 text-red-700 hover:bg-white"
                  @click="removeImage(index)"
                >
                  Quitar
                </button>
              </div>
            </div>
          </div>
          <p v-else class="text-sm text-nara-dark/50 mb-3">Este producto aún no tiene imágenes.</p>

          <div class="flex gap-2">
            <input
              v-model="urlInput"
              type="url"
              placeholder="O pega una URL https://..."
              class="flex-1 px-3 py-2 rounded-nara border border-nara-olive/30 focus:outline-none focus:ring-2 focus:ring-nara-olive/40 text-xs"
              @keydown.enter.prevent="addUrl"
            />
            <button
              type="button"
              class="text-xs px-3 rounded-nara border border-nara-olive/30 text-nara-dark/70 hover:bg-nara-olive/5"
              @click="addUrl"
            >
              Agregar
            </button>
          </div>
          <p v-if="uploadError" class="mt-2 text-xs text-red-600">{{ uploadError }}</p>
        </div>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

        <div class="flex gap-3 pt-2">
          <button
            type="button"
            class="flex-1 py-2.5 rounded-nara border border-nara-olive/30 text-nara-dark/70 hover:bg-nara-olive/5"
            @click="emit('close')"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="saving || uploading"
            class="flex-1 py-2.5 rounded-nara bg-nara-sand text-white hover:bg-nara-olive transition-colors disabled:opacity-60"
          >
            {{ saving ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear producto' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
