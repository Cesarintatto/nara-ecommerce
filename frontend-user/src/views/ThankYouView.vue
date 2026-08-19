<script setup>
import { onMounted } from 'vue'
import { useCartStore } from '../store/cartStore'

const cart = useCartStore()

onMounted(() => {
  cart.clear()
})
</script>

<template>
  <div class="pt-32 pb-20 px-6 max-w-xl mx-auto text-center">
    <h1 class="text-3xl font-serif mb-4">¡Gracias por tu compra!</h1>
    <p class="text-nara-dark/60 mb-10">
      Ya estamos procesando tu pedido. En breve vas a recibir un correo con la confirmación y los
      detalles del envío.
    </p>
    <router-link
      to="/catalogo"
      class="inline-block bg-nara-dark text-white px-8 py-3 rounded-xl uppercase tracking-widest text-sm hover:bg-nara-sand transition-colors"
    >
      Seguir comprando
    </router-link>
  </div>
</template>
