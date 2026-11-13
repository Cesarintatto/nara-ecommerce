<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Menu, X, MessageCircle } from 'lucide-vue-next'
import logoPositivo from '../../assets/logos/naracol-logo-positivo.svg'
import { useSiteStore } from '../../store/siteStore'

const site = useSiteStore()
const route = useRoute()
const open = ref(false)

// Cerrar el menú móvil al navegar
watch(() => route.fullPath, () => (open.value = false))
</script>

<template>
  <header class="sticky top-0 z-50 border-b-2 border-verde bg-crema">
    <nav class="contenedor flex h-[72px] items-center justify-between gap-6" aria-label="Principal">
      <router-link to="/" class="shrink-0" aria-label="Naracol Estudio, inicio">
        <!-- Logo positivo a 132 px de ancho (mínimo del manual: 120 px) -->
        <img :src="logoPositivo" alt="Naracol Estudio" width="132" height="30" class="h-[30px] w-[132px]" />
      </router-link>

      <ul class="hidden items-center gap-7 md:flex">
        <li v-for="s in site.sections" :key="s.id">
          <router-link
            :to="`/seccion/${s.slug}`"
            class="etiqueta py-2 hover:underline hover:decoration-2 hover:underline-offset-8"
            active-class="underline decoration-2 underline-offset-8"
          >
            {{ s.name }}
          </router-link>
        </li>
        <li>
          <router-link to="/#como-pedir" class="etiqueta py-2 hover:underline hover:decoration-2 hover:underline-offset-8">
            Cómo pedir
          </router-link>
        </li>
      </ul>

      <div class="flex items-center gap-3">
        <a
          :href="site.whatsappLink()"
          target="_blank"
          rel="noopener"
          class="btn-primario hidden !px-4 !py-2 sm:inline-flex"
        >
          <MessageCircle class="h-4 w-4" aria-hidden="true" />
          WhatsApp
        </a>
        <button
          type="button"
          class="inline-flex h-11 w-11 items-center justify-center border-2 border-verde md:hidden"
          :aria-expanded="open"
          aria-controls="menu-movil"
          :aria-label="open ? 'Cerrar menú' : 'Abrir menú'"
          @click="open = !open"
        >
          <X v-if="open" class="h-5 w-5" aria-hidden="true" />
          <Menu v-else class="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </nav>

    <div v-show="open" id="menu-movil" class="sobre-verde border-t-2 border-verde bg-verde text-crema md:hidden">
      <ul class="contenedor flex flex-col py-4">
        <li v-for="s in site.sections" :key="s.id">
          <router-link :to="`/seccion/${s.slug}`" class="flex items-center justify-between py-3 text-lg font-bold">
            {{ s.name }}
            <span v-if="s.tag" class="etiqueta text-rosa">{{ s.tag }}</span>
          </router-link>
        </li>
        <li>
          <router-link to="/#como-pedir" class="block py-3 text-lg font-bold">Cómo pedir</router-link>
        </li>
        <li class="pt-3">
          <a :href="site.whatsappLink()" target="_blank" rel="noopener" class="btn-claro w-full">
            <MessageCircle class="h-4 w-4" aria-hidden="true" />
            Escríbenos por WhatsApp
          </a>
        </li>
      </ul>
    </div>
  </header>
</template>
