<script setup>
import { ref, watch, computed } from 'vue'

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
  images: '',
})

const form = ref(emptyForm())

const isEditing = computed(() => Boolean(props.product?.id))

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
        images: (props.product.images || []).join('\n'),
      }
    } else {
      form.value = {
        ...emptyForm(),
        categoryId: props.categories[0]?.id || '',
      }
    }
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

const submit = () => {
  emit('save', { ...form.value })
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
          <label class="block text-xs uppercase tracking-wider text-nara-dark/70 mb-1">
            Imágenes (una URL por línea)
          </label>
          <textarea
            v-model="form.images"
            rows="3"
            placeholder="https://..."
            class="w-full px-3 py-2 rounded-nara border border-nara-olive/30 focus:outline-none focus:ring-2 focus:ring-nara-olive/40 font-mono text-xs"
          />
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
            :disabled="saving"
            class="flex-1 py-2.5 rounded-nara bg-nara-sand text-white hover:bg-nara-olive transition-colors disabled:opacity-60"
          >
            {{ saving ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear producto' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
