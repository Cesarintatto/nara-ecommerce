<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { errorMessage } from '../api/client'
import logoPrincipal from '../assets/logos/naracol-logo-principal.svg'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const email = ref('')
const password = ref('')
const error = ref(route.query.expirada ? 'Tu sesión expiró. Vuelve a entrar.' : '')
const isSubmitting = ref(false)

const onSubmit = async () => {
  error.value = ''
  if (!email.value.trim() || !password.value) {
    error.value = 'Ingresa correo y contraseña.'
    return
  }
  isSubmitting.value = true
  try {
    await auth.login(email.value.trim().toLowerCase(), password.value)
    router.push('/inicio')
  } catch (err) {
    error.value = errorMessage(err, 'No se pudo iniciar sesión.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="sobre-verde flex min-h-screen items-center justify-center bg-verde px-4 py-10">
    <div class="w-full max-w-md">
      <img :src="logoPrincipal" alt="Naracol Estudio" class="mx-auto h-auto w-full max-w-[320px]" />
      <form class="tarjeta mt-8 space-y-5 border-crema p-7 shadow-capa-lg" @submit.prevent="onSubmit">
        <p class="etiqueta">Panel administrativo</p>
        <div>
          <label for="email" class="rotulo">Correo</label>
          <input id="email" v-model="email" type="email" autocomplete="email" class="campo" />
        </div>
        <div>
          <label for="password" class="rotulo">Contraseña</label>
          <input id="password" v-model="password" type="password" autocomplete="current-password" class="campo" />
        </div>
        <p v-if="error" class="border-l-4 border-rosa pl-3 text-sm font-bold" role="alert">{{ error }}</p>
        <button type="submit" :disabled="isSubmitting" class="btn-primario w-full !py-3">
          {{ isSubmitting ? 'Entrando…' : 'Entrar' }}
        </button>
      </form>
    </div>
  </div>
</template>
