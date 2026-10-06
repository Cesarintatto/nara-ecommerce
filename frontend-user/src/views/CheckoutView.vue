<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../store/cartStore'
import api from '../api/client'
import { POLICY_VERSION } from '../legal/legalInfo'

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

// Autorización de tratamiento de datos (Ley 1581 de 2012): obligatoria para pagar
const acceptedPolicies = ref(false)

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
      acceptedPolicies: acceptedPolicies.value,
      policyVersion: POLICY_VERSION,
    })
    window.location.href = data.checkoutUrl
  } catch (err) {
    error.value = err.response?.data?.error || 'No se pudo iniciar el pago. Intenta de nuevo.'
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

      <label class="flex items-start gap-3 rounded-xl border border-nara-dark/15 p-4 text-sm text-nara-dark/80 cursor-pointer">
        <input
          v-model="acceptedPolicies"
          type="checkbox"
          required
          class="mt-0.5 h-4 w-4 shrink-0 accent-nara-dark"
        />
        <span>
          Acepto los
          <router-link to="/terminos" target="_blank" class="underline underline-offset-2">Términos y condiciones</router-link>
          y autorizo el tratamiento de mis datos personales según la
          <router-link to="/privacidad" target="_blank" class="underline underline-offset-2">Política de tratamiento de datos</router-link>
          (Ley 1581 de 2012).
        </span>
      </label>

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

      <button
        type="submit"
        :disabled="isSubmitting"
        class="w-full bg-nara-dark text-white py-4 rounded-xl hover:bg-nara-sand transition-colors uppercase tracking-widest font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isSubmitting ? 'Procesando…' : 'Ir a pagar' }}
      </button>
    </form>
    <p class="mt-4 text-xs text-center text-nara-dark/40">
      Pago seguro con Wompi: tarjeta, PSE, Nequi o Bancolombia. Tus prendas quedan apartadas por 15 minutos.
    </p>
  </div>
</template>
