<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const auth = useAuthStore()
const email = ref('')
const password = ref('')
const error = ref('')
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
    router.push('/dashboard')
  } catch (err) {
    error.value = err.response?.data?.error || 'No se pudo iniciar sesión. ¿Está el backend en marcha?'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-nara-olive/5 px-4 font-sans">
    <div class="w-full max-w-md bg-nara-light rounded-nara border border-nara-olive/20 shadow-lg p-8">
      <header class="text-center mb-8">
        <h1 class="text-4xl font-serif text-nara-dark tracking-tight">NARA</h1>
        <p class="mt-2 text-sm text-nara-sand uppercase tracking-widest">Panel administrativo</p>
      </header>

      <form class="space-y-5" @submit.prevent="onSubmit">
        <div>
          <label for="email" class="block text-xs uppercase tracking-wider text-nara-dark/70 mb-2">
            Correo
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            class="w-full px-4 py-3 rounded-nara border border-nara-olive/30 focus:outline-none focus:ring-2 focus:ring-nara-olive/50 text-nara-dark"
            placeholder="admin@nara.com"
          />
        </div>

        <div>
          <label for="password" class="block text-xs uppercase tracking-wider text-nara-dark/70 mb-2">
            Contraseña
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            class="w-full px-4 py-3 rounded-nara border border-nara-olive/30 focus:outline-none focus:ring-2 focus:ring-nara-olive/50 text-nara-dark"
            placeholder="••••••••"
          />
        </div>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

        <button
          type="submit"
          :disabled="isSubmitting"
          class="w-full py-3 rounded-nara bg-nara-sand text-white font-medium hover:bg-nara-olive transition-colors disabled:opacity-60"
        >
          {{ isSubmitting ? 'Entrando…' : 'Iniciar sesión' }}
        </button>
      </form>

      <p class="mt-6 text-center text-xs text-nara-dark/40">
        Tras el seed: admin@nara.com / admin123
      </p>
    </div>
  </div>
</template>
