<script setup>
// Aviso de Términos y Política de Tratamiento de Datos.
// Guarda en el navegador la versión aceptada; si las políticas cambian
// (POLICY_VERSION), el aviso vuelve a aparecer.
import { ref, onMounted } from 'vue'
import { POLICY_VERSION } from '../../legal/legalInfo'

const STORAGE_KEY = 'naracol_policies_accepted'
const visible = ref(false)

onMounted(() => {
  let accepted = null
  try {
    accepted = localStorage.getItem(STORAGE_KEY)
  } catch {
    // Navegador sin almacenamiento disponible: se muestra el aviso igual
  }
  visible.value = accepted !== POLICY_VERSION
})

const accept = () => {
  try {
    localStorage.setItem(STORAGE_KEY, POLICY_VERSION)
  } catch {
    // Si no se puede guardar, el aviso volverá a salir en la próxima visita
  }
  visible.value = false
}
</script>

<template>
  <transition name="consent">
    <div
      v-if="visible"
      class="pointer-events-none fixed inset-x-0 bottom-0 z-[60] p-4 md:p-6"
      role="region"
      aria-label="Aviso de términos y tratamiento de datos"
    >
      <div
        class="sobre-verde pointer-events-auto mx-auto max-w-3xl border-2 border-crema bg-verde p-5 text-crema shadow-capa md:flex md:items-center md:gap-6"
      >
        <p class="text-sm md:flex-1">
          Al navegar aceptas nuestros
          <router-link to="/terminos" class="underline underline-offset-4">Términos</router-link>
          y la
          <router-link to="/privacidad" class="underline underline-offset-4">Política de tratamiento de datos</router-link>
          (Ley 1581 de 2012).
        </p>
        <button type="button" class="btn-claro mt-4 w-full md:mt-0 md:w-auto" @click="accept">Aceptar</button>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.consent-enter-active,
.consent-leave-active {
  transition: opacity 250ms ease, transform 300ms ease;
}
.consent-enter-from,
.consent-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
