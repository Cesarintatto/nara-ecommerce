<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../store/cartStore'
import api from '../api/client'

const router = useRouter()
const cart = useCartStore()

const form = ref({
  customerEmail: '',
  customerName: '',
  phone: '',
  addressLine: '',
  city: '',
  department: '',
})

const isSubmitting = ref(false)
const error = ref('')

const formatPrice = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value)

onMounted(() => {
  if (cart.items.length === 0) {
    router.replace('/carrito')
  }
})

const submit = async () => {
  error.value = ''
  isSubmitting.value = true
  try {
    const { data } = await api.post('/checkout', {
      items: cart.items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      customerEmail: form.value.customerEmail,
      customerName: form.value.customerName,
      shippingAddress: {
        phone: form.value.phone,
        addressLine: form.value.addressLine,
        city: form.value.city,
        department: form.value.department,
      },
    })
    window.location.href = data.checkoutUrl
  } catch (err) {
    error.value = err.response?.data?.error || 'No se pudo iniciar el pago. Intentá de nuevo.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="pt-24 pb-16 px-6 max-w-2xl mx-auto">
    <h1 class="text-3xl font-serif mb-2">Datos de envío</h1>
    <p class="text-sm text-nara-dark/50 mb-8">Subtotal: {{ formatPrice(cart.subtotal) }}</p>

    <form class="space-y-5" @submit.prevent="submit">
      <div>
        <label class="block text-xs uppercase tracking-widest text-nara-dark/50 mb-1">Email</label>
        <input
          v-model="form.customerEmail"
          type="email"
          required
          class="w-full border border-nara-dark/15 rounded-lg px-4 py-3 focus:outline-none focus:border-nara-olive"
        />
      </div>

      <div>
        <label class="block text-xs uppercase tracking-widest text-nara-dark/50 mb-1">Nombre completo</label>
        <input
          v-model="form.customerName"
          type="text"
          required
          class="w-full border border-nara-dark/15 rounded-lg px-4 py-3 focus:outline-none focus:border-nara-olive"
        />
      </div>

      <div>
        <label class="block text-xs uppercase tracking-widest text-nara-dark/50 mb-1">Teléfono</label>
        <input
          v-model="form.phone"
          type="tel"
          required
          class="w-full border border-nara-dark/15 rounded-lg px-4 py-3 focus:outline-none focus:border-nara-olive"
        />
      </div>

      <div>
        <label class="block text-xs uppercase tracking-widest text-nara-dark/50 mb-1">Dirección</label>
        <input
          v-model="form.addressLine"
          type="text"
          required
          class="w-full border border-nara-dark/15 rounded-lg px-4 py-3 focus:outline-none focus:border-nara-olive"
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs uppercase tracking-widest text-nara-dark/50 mb-1">Ciudad</label>
          <input
            v-model="form.city"
            type="text"
            required
            class="w-full border border-nara-dark/15 rounded-lg px-4 py-3 focus:outline-none focus:border-nara-olive"
          />
        </div>
        <div>
          <label class="block text-xs uppercase tracking-widest text-nara-dark/50 mb-1">Departamento</label>
          <input
            v-model="form.department"
            type="text"
            required
            class="w-full border border-nara-dark/15 rounded-lg px-4 py-3 focus:outline-none focus:border-nara-olive"
          />
        </div>
      </div>

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

      <button
        type="submit"
        :disabled="isSubmitting"
        class="w-full bg-nara-dark text-white py-4 rounded-xl hover:bg-nara-sand transition-colors uppercase tracking-widest font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isSubmitting ? 'Procesando…' : 'Pagar con Mercado Pago' }}
      </button>
    </form>
  </div>
</template>
