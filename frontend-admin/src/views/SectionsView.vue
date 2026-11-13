<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import AdminLayout from '../components/layout/AdminLayout.vue'
import Modal from '../components/ui/Modal.vue'
import ImageField from '../components/ui/ImageField.vue'
import ColorSelect from '../components/ui/ColorSelect.vue'
import api, { errorMessage } from '../api/client'
import { notify } from '../stores/toast'
import { useReorder } from '../composables/useReorder'
import { slugify } from '../utils/format'

const sections = ref([])
const colors = ref([])
const loading = ref(true)
const move = useReorder(sections, '/admin/sections')

const load = async () => {
  try {
    const [s, c] = await Promise.all([api.get('/admin/sections'), api.get('/admin/colors')])
    sections.value = s.data
    colors.value = c.data
  } catch (err) {
    notify(errorMessage(err), 'error')
  } finally {
    loading.value = false
  }
}
onMounted(load)

// ---------- Formulario ----------
const editing = ref(null)
const saving = ref(false)
const uploading = ref(false)
const formError = ref('')
const slugTouched = ref(false)
const form = reactive({})

const open = (s = null) => {
  Object.assign(form, {
    name: s?.name ?? '',
    slug: s?.slug ?? '',
    tag: s?.tag ?? '',
    description: s?.description ?? '',
    coverImage: s?.coverImage ?? null,
    active: s?.active ?? true,
    colorIds: s ? s.colors.map((c) => c.id) : [],
  })
  slugTouched.value = Boolean(s)
  formError.value = ''
  editing.value = s ?? {}
}

// En secciones nuevas, el slug se genera del nombre hasta que se edite a mano
watch(
  () => form.name,
  (name) => {
    if (editing.value && !slugTouched.value) form.slug = slugify(name)
  },
)

const save = async () => {
  formError.value = ''
  if (!form.name.trim()) return (formError.value = 'Escribe el nombre de la sección.')
  saving.value = true
  try {
    if (editing.value.id) await api.patch(`/admin/sections/${editing.value.id}`, form)
    else await api.post('/admin/sections', form)
    notify('Sección guardada')
    editing.value = null
    await load()
  } catch (err) {
    formError.value = errorMessage(err)
  } finally {
    saving.value = false
  }
}

const toggle = async (s) => {
  try {
    await api.patch(`/admin/sections/${s.id}`, { active: !s.active })
    s.active = !s.active
  } catch (err) {
    notify(errorMessage(err), 'error')
  }
}

const remove = async (s) => {
  const extra = s._count.products ? ` Sus ${s._count.products} productos quedarán sin sección (no se borran).` : ''
  if (!confirm(`¿Eliminar la sección «${s.name}»?${extra}`)) return
  try {
    await api.delete(`/admin/sections/${s.id}`)
    sections.value = sections.value.filter((x) => x.id !== s.id)
    notify('Sección eliminada')
  } catch (err) {
    notify(errorMessage(err), 'error')
  }
}
</script>

<template>
  <AdminLayout title="Secciones" subtitle="Cada sección aparece en el inicio con su portada, su etiqueta y su paleta de colores, en este orden.">
    <template #actions>
      <button type="button" class="btn-primario" @click="open()">+ Nueva sección</button>
    </template>

    <p v-if="loading">Cargando…</p>
    <ul v-else class="space-y-4">
      <li v-for="(s, i) in sections" :key="s.id" class="tarjeta flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
        <div class="aspect-[4/3] w-full shrink-0 overflow-hidden border border-verde/20 bg-verde sm:w-40">
          <img v-if="s.coverImage" :src="s.coverImage" alt="" class="h-full w-full object-cover" />
          <div v-else class="flex h-full items-center justify-center text-xs text-crema">Sin portada</div>
        </div>
        <div class="min-w-0 flex-1">
          <p class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span><span :class="['mr-1.5 inline-block h-2.5 w-2.5', s.active ? 'bg-verde' : 'bg-verde/30']" aria-hidden="true"></span>{{ s.active ? 'Visible' : 'Oculta' }}</span>
            <span v-if="s.tag" class="etiqueta">{{ s.tag }}</span>
            <span>/seccion/{{ s.slug }}</span>
          </p>
          <p class="mt-1 text-lg font-bold">{{ s.name }}</p>
          <p class="text-xs">{{ s._count.products }} {{ s._count.products === 1 ? 'producto' : 'productos' }}</p>
          <ul class="mt-2 flex flex-wrap gap-1" aria-label="Paleta">
            <li
              v-for="c in s.colors"
              :key="c.id"
              :title="c.available ? c.name : `${c.name} (agotado)`"
              :class="['h-5 w-5 border border-verde/30', !c.available ? 'opacity-30' : '']"
              :style="{ backgroundColor: c.hex }"
            >
              <span class="sr-only">{{ c.name }}</span>
            </li>
            <li v-if="!s.colors.length" class="text-xs">Sin paleta</li>
          </ul>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button type="button" class="btn-icono" :disabled="i === 0" aria-label="Subir" @click="move(i, -1)">↑</button>
          <button type="button" class="btn-icono" :disabled="i === sections.length - 1" aria-label="Bajar" @click="move(i, 1)">↓</button>
          <button type="button" class="btn-secundario" @click="toggle(s)">{{ s.active ? 'Ocultar' : 'Mostrar' }}</button>
          <button type="button" class="btn-secundario" @click="open(s)">Editar</button>
          <button type="button" class="btn-peligro" @click="remove(s)">Eliminar</button>
        </div>
      </li>
    </ul>

    <Modal v-if="editing" :title="editing.id ? `Editar ${editing.name}` : 'Nueva sección'" :busy="saving" wide @close="editing = null">
      <form id="form-seccion" class="grid gap-6 md:grid-cols-2" @submit.prevent="save">
        <div class="space-y-5">
          <div>
            <label for="s-name" class="rotulo">Nombre</label>
            <input id="s-name" v-model="form.name" class="campo" maxlength="60" placeholder="Temporada" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="s-tag" class="rotulo">Etiqueta</label>
              <input id="s-tag" v-model="form.tag" class="campo uppercase" maxlength="30" placeholder="NAVIDAD" />
            </div>
            <div>
              <label for="s-slug" class="rotulo">Dirección</label>
              <input id="s-slug" v-model="form.slug" class="campo" @input="slugTouched = true" />
            </div>
          </div>
          <p class="ayuda -mt-3">La etiqueta sale sobre el nombre (p. ej. cambia «NAVIDAD» por la temporada que siga). La dirección queda como /seccion/{{ form.slug || '…' }}</p>
          <div>
            <label for="s-desc" class="rotulo">Descripción</label>
            <textarea id="s-desc" v-model="form.description" class="campo" rows="3" maxlength="600"></textarea>
          </div>
          <label class="flex items-center gap-3 font-bold">
            <input v-model="form.active" type="checkbox" class="h-5 w-5 accent-verde" /> Visible en el sitio
          </label>
        </div>
        <div class="space-y-6">
          <ImageField id="s-cover" v-model="form.coverImage" folder="sections" label="Portada" hint="Foto horizontal 4:3 de piezas de la sección." @uploading="uploading = $event" />
          <ColorSelect v-model="form.colorIds" :library="colors" label="Paleta de la sección" />
        </div>
      </form>
      <p v-if="formError" class="mt-5 border-l-4 border-rosa pl-3 font-bold" role="alert">{{ formError }}</p>
      <template #footer>
        <button type="button" class="btn-secundario" :disabled="saving" @click="editing = null">Cancelar</button>
        <button type="submit" form="form-seccion" class="btn-primario" :disabled="saving || uploading">{{ saving ? 'Guardando…' : 'Guardar' }}</button>
      </template>
    </Modal>
  </AdminLayout>
</template>
