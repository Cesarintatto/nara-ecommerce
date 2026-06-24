<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '../components/layout/AdminLayout.vue'
import StatCard from '../components/dashboard/StatCard.vue'
import api from '../api/client'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const auth = useAuthStore()
const stats = ref(null)
const isLoading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const { data } = await api.get('/admin/dashboard/stats')
    stats.value = data
  } catch (err) {
    if (err.response?.status === 401) {
      auth.logout()
      router.push('/login')
      return
    }
    error.value = 'No se pudieron cargar las estadísticas.'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <AdminLayout title="Dashboard Financiero" subtitle="Estado de salud de la marca NARA en tiempo real.">
    <p v-if="error" class="text-red-600 mb-6">{{ error }}</p>
    <p v-if="isLoading" class="text-nara-sand">Cargando métricas…</p>

    <div v-if="!isLoading && stats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <StatCard title="Ingresos Brutos" :value="stats.grossRevenue" />
      <StatCard title="Costos de Maquila" :value="stats.productionCosts" />
      <StatCard title="Utilidad Neta" :value="stats.netProfit" type="profit" />
      <StatCard title="Margen Neto" :value="stats.marginPercentage.toFixed(1) + '%'" />
    </div>

    <div
      v-if="!isLoading && stats && stats.grossRevenue > 0"
      class="bg-nara-light p-8 rounded-nara border border-nara-olive/20"
    >
      <h3 class="font-serif text-xl mb-6 text-nara-dark">Desglose de Ingresos</h3>
      <div class="flex h-12 w-full rounded-full overflow-hidden shadow-inner">
        <div
          :style="{ width: (stats.productionCosts / stats.grossRevenue * 100) + '%' }"
          class="bg-nara-sand/40"
          title="Costos"
        />
        <div
          :style="{ width: (stats.mpCommissions / stats.grossRevenue * 100) + '%' }"
          class="bg-nara-dark/20"
          title="Comisiones"
        />
        <div
          :style="{ width: (stats.netProfit / stats.grossRevenue * 100) + '%' }"
          class="bg-nara-olive"
          title="Utilidad"
        />
      </div>
      <div class="flex gap-6 mt-6 text-xs uppercase tracking-tighter text-nara-dark/60">
        <div class="flex items-center gap-2"><span class="w-3 h-3 bg-nara-sand/40 rounded-full" /> Maquila</div>
        <div class="flex items-center gap-2"><span class="w-3 h-3 bg-nara-dark/20 rounded-full" /> Pasarela (MP)</div>
        <div class="flex items-center gap-2"><span class="w-3 h-3 bg-nara-olive rounded-full" /> Utilidad Neta</div>
      </div>
    </div>

    <p v-if="!isLoading && stats && stats.grossRevenue === 0" class="text-nara-sand text-sm">
      Sin ventas aprobadas aún. Los datos aparecerán cuando haya órdenes pagadas.
    </p>
  </AdminLayout>
</template>
