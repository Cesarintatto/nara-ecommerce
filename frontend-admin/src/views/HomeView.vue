<script setup>
import { ref, onMounted } from 'vue'
import AdminLayout from '../components/layout/AdminLayout.vue'
import api, { errorMessage } from '../api/client'

const summary = ref(null)
const error = ref('')

onMounted(async () => {
  try {
    summary.value = (await api.get('/admin/summary')).data
  } catch (err) {
    error.value = errorMessage(err)
  }
})

const cards = [
  { key: 'activeBanners', total: 'banners', label: 'Banners activos', to: '/banners', text: 'Fotos y promociones del carrusel del inicio.' },
  { key: 'sections', label: 'Secciones', to: '/secciones', text: 'Clickers, Temporada, Hogar… con su portada y paleta.' },
  { key: 'products', label: 'Productos', to: '/productos', text: 'Piezas con fotos, precio y colores disponibles.' },
  { key: 'colors', label: 'Colores', to: '/colores', text: 'Biblioteca de filamentos. Marca los agotados.' },
]
</script>

<template>
  <AdminLayout title="Inicio" subtitle="Desde aquí cambias todo lo que se ve en el sitio de Naracol.">
    <p v-if="error" class="mb-6 font-bold" role="alert">⚠ {{ error }}</p>

    <div class="grid gap-5 sm:grid-cols-2">
      <router-link v-for="c in cards" :key="c.key" :to="c.to" class="tarjeta group block p-6 shadow-capa transition-transform hover:translate-x-[2px] hover:translate-y-[2px]">
        <p class="etiqueta">{{ c.label }}</p>
        <p class="mt-3 text-4xl font-bold">
          {{ summary ? summary[c.key] : '–' }}<span v-if="summary && c.total" class="text-lg font-normal"> / {{ summary[c.total] }}</span>
        </p>
        <p class="mt-3">{{ c.text }}</p>
      </router-link>
    </div>

    <div v-if="summary?.soldOutColors" class="tarjeta mt-8 border-l-8 border-l-rosa p-5">
      <p class="font-bold">{{ summary.soldOutColors }} {{ summary.soldOutColors === 1 ? 'color está agotado' : 'colores están agotados' }}.</p>
      <p class="mt-1">No aparecen en ninguna paleta del sitio hasta que los vuelvas a marcar como disponibles.</p>
      <router-link to="/colores" class="btn-secundario mt-4">Revisar colores</router-link>
    </div>
  </AdminLayout>
</template>
