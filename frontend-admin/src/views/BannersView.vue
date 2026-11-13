<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import AdminLayout from '../components/layout/AdminLayout.vue'
import Modal from '../components/ui/Modal.vue'
import ImageField from '../components/ui/ImageField.vue'
import api, { errorMessage } from '../api/client'
import { notify } from '../stores/toast'
import { useReorder } from '../composables/useReorder'
import { toLocalInput, fromLocalInput, formatDate } from '../utils/format'

const banners = ref([])
const sections = ref([])
const loading = ref(true)
const move = useReorder(banners, '/admin/banners')

const load = async () => {
  try {
    const [b, s] = await Promise.all([api.get('/admin/banners'), api.get('/admin/sections')])
    banners.value = b.data
    sections.value = s.data
  } catch (err) {
    notify(errorMessage(err), 'error')
  } finally {
    loading.value = false
  }
}
onMounted(load)

// Estado visible del banner
const status = (b) => {
  const now = Date.now()
  if (!b.active) return { label: 'Oculto', dot: 'bg-verde/30' }
  if (b.startsAt && new Date(b.startsAt) > now) return { label: `Desde ${formatDate(b.startsAt)}`, dot: 'bg-rosa' }
  if (b.endsAt && new Date(b.endsAt) < now) return { label: 'Vencido', dot: 'bg-verde/30' }
  return { label: b.endsAt ? `Visible hasta ${formatDate(b.endsAt)}` : 'Visible', dot: 'bg-verde' }
}

// ---------- Formulario ----------
const editing = ref(null) // null = cerrado; {} = nuevo; banner = editar
const saving = ref(false)
const uploading = ref(false)
const formError = ref('')
const form = reactive({})

const open = (b = null) => {
  Object.assign(form, {
    title: b?.title ?? '',
    subtitle: b?.subtitle ?? '',
    imageDesktop: b?.imageDesktop ?? null,
    imageMobile: b?.imageMobile ?? null,
    ctaLabel: b?.ctaLabel ?? '',
    ctaUrl: b?.ctaUrl ?? '',
    active: b?.active ?? true,
    startsAt: toLocalInput(b?.startsAt),
    endsAt: toLocalInput(b?.endsAt),
  })
  formError.value = ''
  editing.value = b ?? {}
}

const quickLinks = computed(() => sections.value.map((s) => ({ label: s.name, url: `/seccion/${s.slug}` })))

const save = async () => {
  formError.value = ''
  if (!form.title.trim()) return (formError.value = 'Escribe un título.')
  if (!form.imageDesktop) return (formError.value = 'Sube la imagen principal.')
  if (form.ctaLabel.trim() && !form.ctaUrl.trim()) return (formError.value = 'El botón necesita un enlace.')
  saving.value = true
  const payload = { ...form, startsAt: fromLocalInput(form.startsAt), endsAt: fromLocalInput(form.endsAt) }
  try {
    if (editing.value.id) await api.patch(`/admin/banners/${editing.value.id}`, payload)
    else await api.post('/admin/banners', payload)
    notify('Banner guardado')
    editing.value = null
    await load()
  } catch (err) {
    formError.value = errorMessage(err)
  } finally {
    saving.value = false
  }
}

const toggle = async (b) => {
  try {
    await api.patch(`/admin/banners/${b.id}`, { active: !b.active })
    b.active = !b.active
  } catch (err) {
    notify(errorMessage(err), 'error')
  }
}

const remove = async (b) => {
  if (!confirm(`¿Eliminar el banner «${b.title}»?`)) return
  try {
    await api.delete(`/admin/banners/${b.id}`)
    banners.value = banners.value.filter((x) => x.id !== b.id)
    notify('Banner eliminado')
  } catch (err) {
    notify(errorMessage(err), 'error')
  }
}
</script>

<template>
  <AdminLayout title="Banners" subtitle="El carrusel del inicio. Se muestran en este orden, solo los visibles y dentro de sus fechas.">
    <template #actions>
      <button type="button" class="btn-primario" @click="open()">+ Nuevo banner</button>
    </template>

    <p v-if="loading">Cargando…</p>
    <div v-else-if="!banners.length" class="tarjeta p-8 text-center">
      <p class="font-bold">Aún no hay banners.</p>
      <p class="mt-1">Mientras tanto, el inicio muestra el logo de Naracol.</p>
      <button type="button" class="btn-primario mt-5" @click="open()">Crear el primero</button>
    </div>

    <ul v-else class="space-y-4">
      <li v-for="(b, i) in banners" :key="b.id" class="tarjeta flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
        <img :src="b.imageDesktop" alt="" class="aspect-[16/7] w-full border border-verde/20 object-cover sm:w-56" />
        <div class="min-w-0 flex-1">
          <p class="flex items-center gap-2 text-xs">
            <span :class="['inline-block h-2.5 w-2.5', status(b).dot]" aria-hidden="true"></span>{{ status(b).label }}
          </p>
          <p class="mt-1 truncate text-base font-bold">{{ b.title }}</p>
          <p v-if="b.ctaLabel" class="mt-1 truncate text-xs">Botón: {{ b.ctaLabel }} → {{ b.ctaUrl }}</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button type="button" class="btn-icono" :disabled="i === 0" aria-label="Subir" @click="move(i, -1)">↑</button>
          <button type="button" class="btn-icono" :disabled="i === banners.length - 1" aria-label="Bajar" @click="move(i, 1)">↓</button>
          <button type="button" class="btn-secundario" @click="toggle(b)">{{ b.active ? 'Ocultar' : 'Mostrar' }}</button>
          <button type="button" class="btn-secundario" @click="open(b)">Editar</button>
          <button type="button" class="btn-peligro" @click="remove(b)">Eliminar</button>
        </div>
      </li>
    </ul>

    <Modal v-if="editing" :title="editing.id ? 'Editar banner' : 'Nuevo banner'" :busy="saving" wide @close="editing = null">
      <form id="form-banner" class="grid gap-6 md:grid-cols-2" @submit.prevent="save">
        <div class="space-y-5">
          <div>
            <label for="b-title" class="rotulo">Título</label>
            <input id="b-title" v-model="form.title" class="campo" maxlength="120" placeholder="Clickers de Froggy" />
          </div>
          <div>
            <label for="b-sub" class="rotulo">Texto corto (opcional)</label>
            <textarea id="b-sub" v-model="form.subtitle" class="campo" rows="2" maxlength="240"></textarea>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="b-cta" class="rotulo">Texto del botón</label>
              <input id="b-cta" v-model="form.ctaLabel" class="campo" maxlength="40" placeholder="Ver clickers" />
            </div>
            <div>
              <label for="b-url" class="rotulo">Enlace</label>
              <input id="b-url" v-model="form.ctaUrl" class="campo" placeholder="/seccion/clickers" />
            </div>
          </div>
          <div v-if="quickLinks.length" class="-mt-2 flex flex-wrap gap-2">
            <button v-for="q in quickLinks" :key="q.url" type="button" class="border border-verde/40 px-2 py-1 text-xs hover:border-verde" @click="form.ctaUrl = q.url">
              {{ q.label }}
            </button>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="b-start" class="rotulo">Mostrar desde</label>
              <input id="b-start" v-model="form.startsAt" type="datetime-local" class="campo" />
            </div>
            <div>
              <label for="b-end" class="rotulo">Mostrar hasta</label>
              <input id="b-end" v-model="form.endsAt" type="datetime-local" class="campo" />
            </div>
          </div>
          <p class="ayuda -mt-3">Opcional. Útil para promociones con fecha (p. ej. Navidad).</p>
          <label class="flex items-center gap-3 font-bold">
            <input v-model="form.active" type="checkbox" class="h-5 w-5 accent-verde" /> Visible en el sitio
          </label>
        </div>
        <div class="space-y-5">
          <ImageField id="b-img" v-model="form.imageDesktop" folder="banners" label="Imagen principal" aspect="aspect-[16/7]" hint="Horizontal, ideal 2400 × 1050 px. El texto va abajo a la izquierda." @uploading="uploading = $event" />
          <ImageField id="b-img-m" v-model="form.imageMobile" folder="banners" label="Imagen para celular (opcional)" aspect="aspect-[4/5] max-w-[200px]" hint="Vertical 4:5. Si no la subes, se usa la principal." @uploading="uploading = $event" />
        </div>
      </form>
      <p v-if="formError" class="mt-5 border-l-4 border-rosa pl-3 font-bold" role="alert">{{ formError }}</p>
      <template #footer>
        <button type="button" class="btn-secundario" :disabled="saving" @click="editing = null">Cancelar</button>
        <button type="submit" form="form-banner" class="btn-primario" :disabled="saving || uploading">{{ saving ? 'Guardando…' : 'Guardar' }}</button>
      </template>
    </Modal>
  </AdminLayout>
</template>
