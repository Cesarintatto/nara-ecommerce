<script setup>
import { ref, onMounted } from 'vue'
import api from '../api/client'
import HeroCarousel from '../components/home/HeroCarousel.vue'
import SectionShowcase from '../components/home/SectionShowcase.vue'
import HowToOrder from '../components/home/HowToOrder.vue'
import { useSiteStore } from '../store/siteStore'
import { useMeta } from '../composables/useMeta'

const site = useSiteStore()
const banners = ref([])
const loadingBanners = ref(true)

useMeta(() => ({ path: '/', image: banners.value[0]?.imageDesktop }))

onMounted(async () => {
  site.load()
  try {
    banners.value = (await api.get('/banners')).data
  } catch {
    banners.value = [] // Sin banners se muestra la portada de marca
  } finally {
    loadingBanners.value = false
  }
})
</script>

<template>
  <div>
    <HeroCarousel :banners="banners" :loading="loadingBanners" />

    <section id="secciones" aria-label="Secciones">
      <template v-if="!site.sectionsLoaded">
        <div v-for="n in 2" :key="n" class="cuadricula border-b-2 border-verde">
          <div class="contenedor grid gap-10 py-16 md:grid-cols-12">
            <div class="aspect-[4/3] animate-pulse bg-verde/10 md:col-span-7"></div>
            <div class="space-y-4 md:col-span-5">
              <div class="h-4 w-24 animate-pulse bg-verde/10"></div>
              <div class="h-10 w-48 animate-pulse bg-verde/10"></div>
              <div class="h-16 w-full animate-pulse bg-verde/10"></div>
            </div>
          </div>
        </div>
      </template>
      <div v-else-if="site.sectionsError" class="contenedor py-16">
        <p>No pudimos cargar las secciones. Recarga la página o escríbenos por WhatsApp.</p>
      </div>
      <template v-else>
        <SectionShowcase v-for="(s, i) in site.sections" :key="s.id" :section="s" :index="i" />
      </template>
    </section>

    <HowToOrder />
  </div>
</template>
