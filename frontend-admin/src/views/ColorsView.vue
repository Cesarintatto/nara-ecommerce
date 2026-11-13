<script setup>
import { ref, reactive, onMounted } from 'vue'
import AdminLayout from '../components/layout/AdminLayout.vue'
import Modal from '../components/ui/Modal.vue'
import api, { errorMessage } from '../api/client'
import { notify } from '../stores/toast'
import { useReorder } from '../composables/useReorder'

const colors = ref([])
const loading = ref(true)
const move = useReorder(colors, '/admin/colors')

const load = async () => {
  try {
    colors.value = (await api.get('/admin/colors')).data
  } catch (err) {
    notify(errorMessage(err), 'error')
  } finally {
    loading.value = false
  }
}
onMounted(load)

const toggle = async (c) => {
  try {
    await api.patch(`/admin/colors/${c.id}`, { available: !c.available })
    c.available = !c.available
    notify(c.available ? `${c.name} disponible de nuevo` : `${c.name} marcado como agotado`)
  } catch (err) {
    notify(errorMessage(err), 'error')
  }
}

// ---------- Formulario ----------
const editing = ref(null)
const saving = ref(false)
const formError = ref('')
const form = reactive({ name: '', hex: '#3FA34D', available: true })

const open = (c = null) => {
  Object.assign(form, { name: c?.name ?? '', hex: c?.hex ?? '#3FA34D', available: c?.available ?? true })
  formError.value = ''
  editing.value = c ?? {}
}

const save = async () => {
  formError.value = ''
  if (!form.name.trim()) return (formError.value = 'Escribe el nombre del color.')
  if (!/^#[0-9a-fA-F]{6}$/.test(form.hex)) return (formError.value = 'El código debe verse así: #3FA34D')
  saving.value = true
  try {
    if (editing.value.id) await api.patch(`/admin/colors/${editing.value.id}`, form)
    else await api.post('/admin/colors', form)
    notify('Color guardado')
    editing.value = null
    await load()
  } catch (err) {
    formError.value = errorMessage(err)
  } finally {
    saving.value = false
  }
}

const remove = async (c) => {
  const uses = c._count.sections + c._count.products
  const extra = uses ? ` Se quitará de ${c._count.sections} secciones y ${c._count.products} productos. Si solo se acabó, mejor márcalo como agotado.` : ''
  if (!confirm(`¿Eliminar el color «${c.name}»?${extra}`)) return
  try {
    await api.delete(`/admin/colors/${c.id}`)
    colors.value = colors.value.filter((x) => x.id !== c.id)
    notify('Color eliminado')
  } catch (err) {
    notify(errorMessage(err), 'error')
  }
}
</script>

<template>
  <AdminLayout
    title="Colores"
    subtitle="La biblioteca de filamentos. Si un color se acaba, márcalo como agotado: desaparece de todas las paletas del sitio sin editar cada producto."
  >
    <template #actions>
      <button type="button" class="btn-primario" @click="open()">+ Nuevo color</button>
    </template>

    <p v-if="loading">Cargando…</p>
    <div v-else class="tarjeta overflow-x-auto">
      <table class="w-full min-w-[640px] text-left">
        <thead class="border-b-2 border-verde">
          <tr>
            <th class="etiqueta px-4 py-3">Orden</th>
            <th class="etiqueta px-4 py-3">Color</th>
            <th class="etiqueta px-4 py-3">Usado en</th>
            <th class="etiqueta px-4 py-3">Estado</th>
            <th class="px-4 py-3"><span class="sr-only">Acciones</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(c, i) in colors" :key="c.id" class="border-b border-verde/15 last:border-0">
            <td class="px-4 py-3">
              <div class="flex gap-1">
                <button type="button" class="btn-icono" :disabled="i === 0" :aria-label="`Subir ${c.name}`" @click="move(i, -1)">↑</button>
                <button type="button" class="btn-icono" :disabled="i === colors.length - 1" :aria-label="`Bajar ${c.name}`" @click="move(i, 1)">↓</button>
              </div>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <span class="h-8 w-8 shrink-0 border border-verde/30" :style="{ backgroundColor: c.hex }" aria-hidden="true"></span>
                <div>
                  <p class="font-bold">{{ c.name }}</p>
                  <p class="text-xs">{{ c.hex }}</p>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 text-xs">{{ c._count.sections }} secc. · {{ c._count.products }} prod.</td>
            <td class="px-4 py-3">
              <button
                type="button"
                role="switch"
                :aria-checked="c.available"
                :aria-label="`${c.name} disponible`"
                :class="['flex items-center gap-2 border-2 px-2 py-1 text-xs font-bold', c.available ? 'border-verde bg-verde text-crema' : 'border-verde/40']"
                @click="toggle(c)"
              >
                <span :class="['inline-block h-2.5 w-2.5', c.available ? 'bg-crema' : 'bg-rosa']" aria-hidden="true"></span>
                {{ c.available ? 'Disponible' : 'Agotado' }}
              </button>
            </td>
            <td class="px-4 py-3">
              <div class="flex justify-end gap-2">
                <button type="button" class="btn-secundario" @click="open(c)">Editar</button>
                <button type="button" class="btn-peligro" @click="remove(c)">Eliminar</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Modal v-if="editing" :title="editing.id ? `Editar ${editing.name}` : 'Nuevo color'" :busy="saving" @close="editing = null">
      <form id="form-color" class="space-y-5" @submit.prevent="save">
        <div>
          <label for="c-name" class="rotulo">Nombre</label>
          <input id="c-name" v-model="form.name" class="campo" maxlength="60" placeholder="Verde rana" />
        </div>
        <div>
          <label for="c-hex" class="rotulo">Color</label>
          <div class="flex items-center gap-3">
            <input v-model="form.hex" type="color" class="h-11 w-16 cursor-pointer border-2 border-verde/40 bg-white p-1" aria-label="Elegir color" />
            <input id="c-hex" v-model="form.hex" class="campo max-w-[10rem] uppercase" maxlength="7" />
          </div>
          <p class="ayuda">Compáralo con la muestra física del rollo: en pantalla es una referencia.</p>
        </div>
        <label class="flex items-center gap-3 font-bold">
          <input v-model="form.available" type="checkbox" class="h-5 w-5 accent-verde" /> Disponible
        </label>
      </form>
      <p v-if="formError" class="mt-5 border-l-4 border-rosa pl-3 font-bold" role="alert">{{ formError }}</p>
      <template #footer>
        <button type="button" class="btn-secundario" :disabled="saving" @click="editing = null">Cancelar</button>
        <button type="submit" form="form-color" class="btn-primario" :disabled="saving">{{ saving ? 'Guardando…' : 'Guardar' }}</button>
      </template>
    </Modal>
  </AdminLayout>
</template>
