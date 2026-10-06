<script setup>
// Aviso de aceptación de Términos y Política de Tratamiento de Datos.
// Se guarda en el navegador la versión aceptada; si las políticas cambian
// (POLICY_VERSION), el aviso vuelve a aparecer.
import { ref, onMounted } from 'vue'
import { POLICY_VERSION } from '../../legal/legalInfo'

const STORAGE_KEY = 'nara_policies_accepted'
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
      class="fixed inset-x-0 bottom-0 z-[60] p-4 md:p-6 pointer-events-none"
      role="region"
      aria-label="Aviso de términos y tratamiento de datos"
    >
      <div
        class="consent-card pointer-events-auto mx-auto max-w-4xl rounded-[1.5rem] bg-nara-dark text-white p-6 md:p-7 shadow-2xl md:flex md:items-center md:gap-8"
      >
        <p class="font-manrope text-sm leading-relaxed text-white/85 md:flex-1">
          Usamos almacenamiento esencial en tu navegador para que tu carrito funcione. Al seguir navegando
          aceptas nuestros
          <router-link to="/terminos" class="underline underline-offset-4 text-white hover:text-nara-sand">Términos y condiciones</router-link>
          y la
          <router-link to="/privacidad" class="underline underline-offset-4 text-white hover:text-nara-sand">Política de tratamiento de datos</router-link>,
          conforme a la Ley 1581 de 2012.
        </p>
        <button
          type="button"
          class="mt-5 md:mt-0 w-full md:w-auto shrink-0 rounded-full bg-nara-sand px-7 py-3 font-manrope font-semibold text-nara-dark transition-colors hover:bg-nara-olive focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-nara-sand"
          @click="accept"
        >
          Aceptar
        </button>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.consent-card {
  border: 2px solid #b69d86;
  outline: 1px solid rgba(182, 157, 134, 0.4);
  outline-offset: -8px;
}
.consent-enter-active,
.consent-leave-active {
  transition: opacity 300ms ease, transform 400ms cubic-bezier(0.2, 0.7, 0.2, 1);
}
.consent-enter-from,
.consent-leave-to {
  opacity: 0;
  transform: translateY(16px);
}
@media (prefers-reduced-motion: reduce) {
  .consent-enter-active,
  .consent-leave-active {
    transition: opacity 150ms linear;
  }
  .consent-enter-from,
  .consent-leave-to {
    transform: none;
  }
}
</style>
