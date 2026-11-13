<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import AdminLayout from '../components/layout/AdminLayout.vue'
import Modal from '../components/ui/Modal.vue'
import ImageListField from '../components/ui/ImageListField.vue'
import ColorSelect from '../components/ui/ColorSelect.vue'
import api, { errorMessage } from '../api/client'
import { notify } from '../stores/toast'
import { useReorder } from '../composables/useReorder'
import { formatPrice, slugify } from '../utils/format'

const products = ref([])
const sections = ref([])
const colors = ref([])
const loading = ref(true)
const sectionFilter = ref('') // '' = todas
const search = ref('')
const move = useReorder(products, '/admin/products')

const loadProducts = async () => {
  const params = sectionFilter.value ? { sectionId: sectionFilter.value } : {}
  products.value = (await api.get('/admin/products', { params })).data
}

onMounted(async () => {
  try {
    const [s, c] = await Promise.all([api.get('/admin/sections'), api.get('/admin/colors')])
    sections.value = s.data
    colors.value = c.data
    await loadProducts()
  } catch (err) {
    notify(errorMessage(err), 'error')
  } finally {
    loading.value = false
  }
})
watch(sectionFilter, () => loadProducts().catch((err) => notify(errorMessage(err), 'error')))

const visible = computed(() => {
  const q = search.value.trim().toLowerCase()
  return q ? products.value.filter((p) => p.name.toLowerCase().includes(q)) : products.value
})
// Ordenar solo tiene sentido dentro de una sección y sin búsqueda
const canReorder = computed(() => Boolean(sectionFilter.value) && !search.value.trim())

// ---------- Formulario ----------
const editing = ref(null)
const saving = ref(false)
const uploading = ref(false)
const formError = ref('')
const slugTouched = ref(false)
const form = reactive({})

const open = (p = null) => {
  Object.assign(form, {
    name: p?.name ?? '',
    slug: p?.slug ?? '',
    sectionId: p?.sectionId ?? (sectionFilter.value || sections.value[0]?.id || ''),
    price: p?.price ?? '',
    description: p?.description ?? '',
    images: p ? [...p.images] : [],
    colorIds: p ? p.colors.map((c) => c.id) : [],
    active: p?.active ?? true,
    featured: p?.featured ?? false,
  })
  slugTouched.value = Boolean(p)
  formError.value = ''
  editing.value = p ?? {}
}
watch(
  () => form.name,
  (name) => {
    if (editing.value && !slugTouched.value) form.slug = slugify(name)
  },
)

const sectionPalette = computed(() => sections.value.find((s) => s.id === form.sectionId)?.colors.map((c) => c.id) ?? [])
const useSectionPalette = () => (form.colorIds = [...sectionPalette.value])

const save = async () => {
  formError.value = ''
  if (!form.name.trim()) return (formError.value = 'Escribe el nombre del producto.')
  if (form.price !== '' && form.price !== null && !(Number(form.price) >= 0 && Number.isInteger(Number(form.price)))) {
    return (formError.value = 'El precio debe ser un número entero, sin puntos (p. ej. 18000).')
  }
  saving.value = true
  const payload = { ...form, sectionId: form.sectionId || null, price: form.price === '' ? null : Number(form.price) }
  try {
    if (editing.value.id) await api.patch(`/admin/products/${editing.value.id}`, payload)
    else await api.post('/admin/products', payload)
    notify('Producto guardado')
    editing.value = null
    await loadProducts()
  } catch (err) {
    formError.value = errorMessage(err)
  } finally {
    saving.value = false
  }
}

const toggle = async (p) => {
  try {
    await api.patch(`/admin/products/${p.id}`, { active: !p.active })
    p.active = !p.active
  } catch (err) {
    notify(errorMessage(err), 'error')
  }
}

const remove = async (p) => {
  if (!confirm(`¿Eliminar «${p.name}»? Esta acción no se puede deshacer.`)) return
  try {
    await api.delete(`/admin/products/${p.id}`)
    products.value = products.value.filter((x) => x.id !== p.id)
    notify('Producto eliminado')
  } catch (err) {
    notify(errorMessage(err), 'error')
  }
}
</script>

<template>
  <AdminLayout title="Productos" subtitle="Las piezas de cada sección, con sus fotos, precio y colores disponibles.">
    <template #actions>
      <button type="button" class="btn-primario" :disabled="loading" @click="open()">+ Nuevo producto</button>
    </template>

    <div class="mb-6 flex flex-wrap items-end gap-4">
      <div>
        <label for="f-sec" class="rotulo">Sección</label>
        <select id="f-sec" v-model="sectionFilter" class="campo min-w-[12rem]">
          <option value="">Todas</option>
          <option v-for="s in sections" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
      </div>
      <div class="flex-1">
        <label for="f-q" class="rotulo">Buscar</label>
        <input id="f-q" v-model="search" type="search" class="campo max-w-xs" placeholder="Nombre del producto" />
      </div>
    </div>
    <p v-if="!canReorder && products.length > 1" class="ayuda -mt-3 mb-5">Elige una sección para cambiar el orden de sus productos.</p>

    <p v-if="loading">Cargando…</p>
    <div v-else-if="!visible.length" class="tarjeta p-8 text-center">
      <p class="font-bold">{{ search ? 'Ningún producto coincide.' : 'Aún no hay productos aquí.' }}</p>
      <button v-if="!search" type="button" class="btn-primario mt-5" @click="open()">Crear producto</button>
    </div>

    <ul v-else class="space-y-3">
      <li v-for="(p, i) in visible" :key="p.id" class="tarjeta flex flex-col gap-4 p-3 sm:flex-row sm:items-center">
        <div class="aspect-square w-20 shrink-0 overflow-hidden border border-verde/20 bg-verde">
          <img v-if="p.images[0]" :src="p.images[0]" alt="" class="h-full w-full object-cover" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="flex flex-wrap items-center gap-x-3 text-xs">
            <span><span :class="['mr-1.5 inline-block h-2.5 w-2.5', p.active ? 'bg-verde' : 'bg-verde/30']" aria-hidden="true"></span>{{ p.active ? 'Visible' : 'Oculto' }}</span>
            <span v-if="p.featured" class="etiqueta"><span class="mr-1 inline-block h-2 w-2 bg-rosa" aria-hidden="true"></span>Destacado</span>
            <span>{{ p.section?.name || 'Sin sección' }}</span>
          </p>
          <p class="mt-1 truncate font-bold">{{ p.name }}</p>
          <div class="mt-1 flex flex-wrap items-center gap-3 text-xs">
            <span>{{ formatPrice(p.price) }}</span>
            <span class="flex gap-0.5">
              <span
                v-for="c in p.colors"
                :key="c.id"
                :title="c.name"
                :class="['h-3.5 w-3.5 border border-verde/30', !c.available ? 'opacity-30' : '']"
                :style="{ backgroundColor: c.hex }"
              ></span>
            </span>
            <span v-if="!p.images.length">· sin fotos</span>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <template v-if="canReorder">
            <button type="button" class="btn-icono" :disabled="i === 0" aria-label="Subir" @click="move(i, -1)">↑</button>
            <button type="button" class="btn-icono" :disabled="i === visible.length - 1" aria-label="Bajar" @click="move(i, 1)">↓</button>
          </template>
          <button type="button" class="btn-secundario" @click="toggle(p)">{{ p.active ? 'Ocultar' : 'Mostrar' }}</button>
          <button type="button" class="btn-secundario" @click="open(p)">Editar</button>
          <button type="button" class="btn-peligro" @click="remove(p)">Eliminar</button>
        </div>
      </li>
    </ul>

    <Modal v-if="editing" :title="editing.id ? `Editar ${editing.name}` : 'Nuevo producto'" :busy="saving" wide @close="editing = null">
      <form id="form-producto" class="grid gap-6 md:grid-cols-2" @submit.prevent="save">
        <div class="space-y-5">
          <div>
            <label for="p-name" class="rotulo">Nombre</label>
            <input id="p-name" v-model="form.name" class="campo" maxlength="120" placeholder="Clicker Froggy" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="p-sec" class="rotulo">Sección</label>
              <select id="p-sec" v-model="form.sectionId" class="campo">
                <option value="">Sin sección</option>
                <option v-for="s in sections" :key="s.id" :value="s.id">{{ s.name }}</option>
              </select>
            </div>
            <div>
              <label for="p-price" class="rotulo">Precio (COP)</label>
              <input id="p-price" v-model="form.price" class="campo" inputmode="numeric" placeholder="18000" />
            </div>
          </div>
          <p class="ayuda -mt-3">Deja el precio vacío para mostrar «A cotizar».</p>
          <div>
            <label for="p-slug" class="rotulo">Dirección</label>
            <input id="p-slug" v-model="form.slug" class="campo" @input="slugTouched = true" />
            <p class="ayuda">/producto/{{ form.slug || '…' }}</p>
          </div>
          <div>
            <label for="p-desc" class="rotulo">Descripción</label>
            <textarea id="p-desc" v-model="form.description" class="campo" rows="5" maxlength="4000" placeholder="Medidas, material, para qué sirve…"></textarea>
          </div>
          <div class="flex flex-wrap gap-6">
            <label class="flex items-center gap-3 font-bold">
              <input v-model="form.active" type="checkbox" class="h-5 w-5 accent-verde" /> Visible
            </label>
            <label class="flex items-center gap-3 font-bold">
              <input v-model="form.featured" type="checkbox" class="h-5 w-5 accent-verde" /> Destacado
            </label>
          </div>
        </div>
        <div class="space-y-6">
          <ImageListField id="p-imgs" v-model="form.images" @uploading="uploading = $event" />
          <div>
            <ColorSelect v-model="form.colorIds" :library="colors" label="Colores disponibles" hint="Los colores en que se puede pedir esta pieza. El cliente los elige antes de escribir por WhatsApp." />
            <button v-if="sectionPalette.length" type="button" class="btn-secundario mt-3" @click="useSectionPalette">Usar la paleta de la sección</button>
          </div>
        </div>
      </form>
      <p v-if="formError" class="mt-5 border-l-4 border-rosa pl-3 font-bold" role="alert">{{ formError }}</p>
      <template #footer>
        <button type="button" class="btn-secundario" :disabled="saving" @click="editing = null">Cancelar</button>
        <button type="submit" form="form-producto" class="btn-primario" :disabled="saving || uploading">{{ saving ? 'Guardando…' : 'Guardar' }}</button>
      </template>
    </Modal>
  </AdminLayout>
</template>
