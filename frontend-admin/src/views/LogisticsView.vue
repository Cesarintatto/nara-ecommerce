<!-- /frontend-admin/src/views/LogisticsView.vue -->
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '../components/layout/AdminLayout.vue'
import api from '../api/client'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const auth = useAuthStore()

const tab = ref('APPROVED') // APPROVED = por despachar, SHIPPED = enviados
const orders = ref([])
const isLoading = ref(true)
const pageError = ref('')
const trackingInputs = ref({})
const rowErrors = ref({})
const shippingId = ref(null)
const notice = ref('')

const formatPrice = (value) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)

const formatDate = (value) =>
  new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))

const daysSince = (value) => Math.floor((Date.now() - new Date(value).getTime()) / 86400000)

const sizeLabel = (size) => (!size ? 'Sin talla' : size === 'Única' ? 'Talla única' : `Talla ${size}`)

const shortId = (id) => id.slice(-6).toUpperCase()

const handleAuthError = (err) => {
  if (err.response?.status === 401) {
    auth.logout()
    router.push('/login')
    return true
  }
  return false
}

const loadOrders = async () => {
  isLoading.value = true
  pageError.value = ''
  try {
    const { data } = await api.get('/admin/orders', { params: { status: tab.value } })
    orders.value = data
  } catch (err) {
    if (!handleAuthError(err)) pageError.value = 'No se pudieron cargar los pedidos.'
  } finally {
    isLoading.value = false
  }
}

const switchTab = (value) => {
  if (tab.value === value) return
  tab.value = value
  notice.value = ''
  loadOrders()
}

const pendingCount = computed(() => (tab.value === 'APPROVED' ? orders.value.length : null))

const ship = async (order) => {
  const trackingNumber = (trackingInputs.value[order.id] || '').trim()
  rowErrors.value[order.id] = ''
  if (!trackingNumber) {
    rowErrors.value[order.id] = 'Escribe el número de guía.'
    return
  }

  shippingId.value = order.id
  try {
    await api.patch(`/admin/orders/${order.id}/tracking`, { trackingNumber })
    orders.value = orders.value.filter((o) => o.id !== order.id)
    notice.value = `Pedido ${shortId(order.id)} marcado como enviado con la guía ${trackingNumber}.`
  } catch (err) {
    if (!handleAuthError(err)) {
      rowErrors.value[order.id] = err.response?.data?.error || 'No se pudo registrar la guía.'
    }
  } finally {
    shippingId.value = null
  }
}

onMounted(loadOrders)
</script>

<template>
  <AdminLayout title="Despachos" subtitle="Pedidos pagados listos para enviar.">
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div class="inline-flex rounded-nara border border-nara-olive/30 bg-nara-light p-1" role="tablist">
        <button
          type="button"
          role="tab"
          :aria-selected="tab === 'APPROVED'"
          :class="['px-4 py-2 rounded-lg text-sm', tab === 'APPROVED' ? 'bg-nara-dark text-white' : 'text-nara-dark/70 hover:bg-nara-olive/10']"
          @click="switchTab('APPROVED')"
        >
          Por despachar
          <span v-if="pendingCount !== null && !isLoading" class="ml-1 opacity-70">({{ pendingCount }})</span>
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="tab === 'SHIPPED'"
          :class="['px-4 py-2 rounded-lg text-sm', tab === 'SHIPPED' ? 'bg-nara-dark text-white' : 'text-nara-dark/70 hover:bg-nara-olive/10']"
          @click="switchTab('SHIPPED')"
        >
          Enviados
        </button>
      </div>
      <button type="button" class="text-sm text-nara-olive hover:underline" @click="loadOrders">Actualizar</button>
    </div>

    <p v-if="notice" class="mb-4 rounded-nara bg-nara-olive/10 px-4 py-3 text-sm text-nara-dark">{{ notice }}</p>
    <p v-if="pageError" class="text-red-600 mb-4">{{ pageError }}</p>
    <p v-if="isLoading" class="text-nara-sand">Cargando pedidos…</p>

    <div
      v-else-if="orders.length === 0"
      class="bg-nara-light rounded-nara border border-nara-olive/15 p-12 text-center text-nara-dark/50"
    >
      {{ tab === 'APPROVED' ? 'No hay pedidos por despachar.' : 'Aún no hay pedidos enviados.' }}
    </div>

    <div v-else class="space-y-4">
      <article
        v-for="order in orders"
        :key="order.id"
        class="bg-nara-light rounded-nara border border-nara-olive/15 p-5 md:p-6"
      >
        <header class="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <p class="font-mono text-xs text-nara-dark/50">Pedido {{ shortId(order.id) }}</p>
            <p class="text-lg font-medium text-nara-dark">{{ order.customerName }}</p>
            <p class="text-xs text-nara-dark/50">
              Pagado el {{ formatDate(order.createdAt) }}
              <span
                v-if="tab === 'APPROVED' && daysSince(order.createdAt) >= 2"
                class="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-amber-800"
              >
                Hace {{ daysSince(order.createdAt) }} días
              </span>
            </p>
          </div>
          <p class="text-lg font-semibold text-nara-dark">{{ formatPrice(order.totalAmount) }}</p>
        </header>

        <div class="grid gap-6 md:grid-cols-2">
          <!-- Prendas -->
          <ul class="space-y-3">
            <li v-for="item in order.items" :key="item.id" class="flex items-center gap-3">
              <img
                v-if="item.product.images?.[0]"
                :src="item.product.images[0]"
                alt=""
                class="h-14 w-11 rounded object-cover bg-nara-olive/10"
              />
              <div v-else class="h-14 w-11 rounded bg-nara-olive/10" />
              <div class="text-sm">
                <p class="font-medium text-nara-dark">{{ item.product.name }}</p>
                <p>
                  <span class="rounded bg-nara-dark px-2 py-0.5 text-xs font-semibold text-white">{{ sizeLabel(item.size) }}</span>
                  <span class="ml-2 text-nara-dark/60">× {{ item.quantity }}</span>
                </p>
              </div>
            </li>
          </ul>

          <!-- Envío -->
          <div class="text-sm text-nara-dark/80 space-y-1">
            <p class="text-xs uppercase tracking-wider text-nara-dark/50 mb-1">Enviar a</p>
            <p>{{ order.shippingAddress?.addressLine }}</p>
            <p>{{ order.shippingAddress?.city }}, {{ order.shippingAddress?.department }}</p>
            <p>Tel. {{ order.shippingAddress?.phone }}</p>
            <p class="text-nara-dark/60">{{ order.customerEmail }}</p>
          </div>
        </div>

        <!-- Guía -->
        <footer class="mt-5 border-t border-nara-olive/10 pt-4">
          <form
            v-if="tab === 'APPROVED'"
            class="flex flex-wrap items-center gap-3"
            @submit.prevent="ship(order)"
          >
            <label class="sr-only" :for="`guia-${order.id}`">Número de guía</label>
            <input
              :id="`guia-${order.id}`"
              v-model="trackingInputs[order.id]"
              type="text"
              placeholder="Número de guía de la transportadora"
              class="flex-1 min-w-[14rem] px-3 py-2 rounded-nara border border-nara-olive/30 text-sm focus:outline-none focus:ring-2 focus:ring-nara-olive/40"
            />
            <button
              type="submit"
              :disabled="shippingId === order.id"
              class="px-4 py-2 rounded-nara bg-nara-dark text-white text-sm hover:bg-nara-olive transition-colors disabled:opacity-50"
            >
              {{ shippingId === order.id ? 'Registrando…' : 'Marcar como enviado' }}
            </button>
            <p v-if="rowErrors[order.id]" class="w-full text-xs text-red-600">{{ rowErrors[order.id] }}</p>
          </form>
          <p v-else class="text-sm text-nara-dark/70">
            Guía <span class="font-mono font-semibold text-nara-dark">{{ order.trackingNumber }}</span>
            · enviado el {{ formatDate(order.updatedAt) }}
          </p>
        </footer>
      </article>
    </div>
  </AdminLayout>
</template>
