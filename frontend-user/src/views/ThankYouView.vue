<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useCartStore } from '../store/cartStore'
import api from '../api/client'

const route = useRoute()
const cart = useCartStore()

// Wompi redirige a /gracias?id=<transactionId>
const transactionId = route.query.id

// 'loading' | 'APPROVED' | 'PENDING' | 'DECLINED' | 'UNKNOWN'
const state = ref(transactionId ? 'loading' : 'UNKNOWN')

const POLL_INTERVAL_MS = 3000
const MAX_ATTEMPTS = 10
let attempts = 0
let timer = null

const checkStatus = async () => {
  attempts += 1
  try {
    const { data } = await api.get(`/checkout/transactions/${encodeURIComponent(transactionId)}`)
    if (data.status === 'APPROVED') {
      state.value = 'APPROVED'
      cart.clear()
    } else if (['DECLINED', 'VOIDED', 'ERROR'].includes(data.status)) {
      state.value = 'DECLINED'
    } else {
      state.value = 'PENDING'
      if (attempts < MAX_ATTEMPTS) timer = setTimeout(checkStatus, POLL_INTERVAL_MS)
      else cart.clear()
    }
  } catch {
    state.value = 'UNKNOWN'
  }
}

onMounted(() => {
  if (transactionId) checkStatus()
})

onBeforeUnmount(() => clearTimeout(timer))

const content = computed(() => {
  switch (state.value) {
    case 'APPROVED':
      return {
        title: '¡Gracias por elegirte!',
        text: 'Tu pago fue aprobado y ya estamos preparando tu pedido con mucho cariño. En unos minutos te llega un correo con la confirmación.',
      }
    case 'PENDING':
      return {
        title: 'Estamos confirmando tu pago',
        text: 'Tu banco todavía está procesando la transacción. Apenas se confirme te enviamos un correo; no hace falta que vuelvas a pagar.',
      }
    case 'DECLINED':
      return {
        title: 'Tu pago no se completó',
        text: 'No se realizó ningún cobro. Tus prendas siguen en el carrito para que lo intentes de nuevo cuando quieras, con el mismo u otro medio de pago.',
      }
    case 'loading':
      return { title: 'Un momento…', text: 'Estamos consultando el estado de tu pago.' }
    default:
      return {
        title: 'Gracias por tu compra',
        text: 'Si completaste el pago, en breve te llega un correo con la confirmación y los detalles del envío.',
      }
  }
})
</script>

<template>
  <div class="pt-32 pb-20 px-6 max-w-xl mx-auto text-center">
    <h1 class="text-3xl font-serif mb-4">{{ content.title }}</h1>
    <p class="text-nara-dark/60 mb-10">{{ content.text }}</p>

    <router-link
      v-if="state === 'DECLINED'"
      to="/carrito"
      class="inline-block bg-nara-dark text-white px-8 py-3 rounded-xl uppercase tracking-widest text-sm hover:bg-nara-sand transition-colors"
    >
      Volver al carrito
    </router-link>
    <router-link
      v-else-if="state !== 'loading'"
      to="/catalogo"
      class="inline-block bg-nara-dark text-white px-8 py-3 rounded-xl uppercase tracking-widest text-sm hover:bg-nara-sand transition-colors"
    >
      Seguir comprando
    </router-link>
  </div>
</template>
