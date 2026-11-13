<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import AdminLayout from '../components/layout/AdminLayout.vue'
import api, { errorMessage } from '../api/client'
import { notify } from '../stores/toast'

const form = reactive({
  whatsappNumber: '',
  whatsappMessage: '',
  instagramUrl: '',
  tiktokUrl: '',
  facebookUrl: '',
  contactEmail: '',
})
const loading = ref(true)
const saving = ref(false)
const error = ref('')

onMounted(async () => {
  try {
    Object.assign(form, (await api.get('/admin/settings')).data)
  } catch (err) {
    error.value = errorMessage(err)
  } finally {
    loading.value = false
  }
})

const testLink = computed(
  () => `https://wa.me/${form.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(form.whatsappMessage)}`,
)

const save = async () => {
  error.value = ''
  saving.value = true
  try {
    Object.assign(form, (await api.patch('/admin/settings', form)).data)
    notify('Ajustes guardados')
  } catch (err) {
    error.value = errorMessage(err)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <AdminLayout title="Ajustes" subtitle="Datos de contacto que se usan en todo el sitio.">
    <p v-if="loading">Cargando…</p>
    <form v-else class="tarjeta max-w-2xl space-y-6 p-6" @submit.prevent="save">
      <fieldset class="space-y-5">
        <legend class="etiqueta mb-4">WhatsApp</legend>
        <div>
          <label for="s-wa" class="rotulo">Número</label>
          <input id="s-wa" v-model="form.whatsappNumber" class="campo max-w-xs" inputmode="tel" placeholder="573054050812" />
          <p class="ayuda">Con indicativo de país y sin espacios ni «+». Colombia: 57 + número.</p>
        </div>
        <div>
          <label for="s-msg" class="rotulo">Mensaje por defecto</label>
          <input id="s-msg" v-model="form.whatsappMessage" class="campo" maxlength="300" />
          <p class="ayuda">Se usa en el botón flotante y en «Escríbenos». En cada producto el mensaje incluye la pieza y el color.</p>
        </div>
        <a :href="testLink" target="_blank" rel="noopener" class="btn-secundario">Probar enlace ↗</a>
      </fieldset>

      <fieldset class="space-y-5 border-t-2 border-verde pt-6">
        <legend class="etiqueta mb-4 pt-6">Redes y correo</legend>
        <div>
          <label for="s-ig" class="rotulo">Instagram</label>
          <input id="s-ig" v-model="form.instagramUrl" class="campo" placeholder="https://www.instagram.com/somosnaracol" />
        </div>
        <div>
          <label for="s-tt" class="rotulo">TikTok</label>
          <input id="s-tt" v-model="form.tiktokUrl" class="campo" placeholder="https://www.tiktok.com/@somosnaracol" />
        </div>
        <div>
          <label for="s-fb" class="rotulo">Facebook</label>
          <input id="s-fb" v-model="form.facebookUrl" class="campo" placeholder="https://www.facebook.com/somosnaracol" />
        </div>
        <div>
          <label for="s-mail" class="rotulo">Correo de contacto</label>
          <input id="s-mail" v-model="form.contactEmail" type="email" class="campo" />
          <p class="ayuda">Deja vacío un campo para ocultarlo del pie de página.</p>
        </div>
      </fieldset>

      <p v-if="error" class="border-l-4 border-rosa pl-3 font-bold" role="alert">{{ error }}</p>
      <button type="submit" class="btn-primario" :disabled="saving">{{ saving ? 'Guardando…' : 'Guardar ajustes' }}</button>
    </form>
  </AdminLayout>
</template>
