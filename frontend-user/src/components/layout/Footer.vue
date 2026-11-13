<script setup>
import logoNegativo from '../../assets/logos/naracol-logo-negativo.svg'
import { useSiteStore } from '../../store/siteStore'

const site = useSiteStore()
const year = new Date().getFullYear()

const phoneLabel = (digits) => {
  // 573054050812 → +57 305 405 0812
  const m = /^57(\d{3})(\d{3})(\d{4})$/.exec(digits || '')
  return m ? `+57 ${m[1]} ${m[2]} ${m[3]}` : `+${digits}`
}
</script>

<template>
  <footer class="sobre-verde cuadricula-clara bg-verde text-crema">
    <div class="contenedor grid gap-12 py-16 md:grid-cols-12">
      <div class="md:col-span-5">
        <img :src="logoNegativo" alt="Naracol Estudio" width="200" height="45" class="h-auto w-[200px]" />
        <p class="mt-6 max-w-xs">Diseñamos e imprimimos en 3D, capa por capa.</p>
      </div>

      <nav class="md:col-span-3" aria-label="Secciones">
        <p class="etiqueta text-rosa">Secciones</p>
        <ul class="mt-4 space-y-2">
          <li v-for="s in site.sections" :key="s.id">
            <router-link :to="`/seccion/${s.slug}`" class="hover:underline hover:underline-offset-4">{{ s.name }}</router-link>
          </li>
          <li><router-link to="/#como-pedir" class="hover:underline hover:underline-offset-4">Cómo pedir</router-link></li>
        </ul>
      </nav>

      <div class="md:col-span-4">
        <p class="etiqueta text-rosa">Contacto</p>
        <ul class="mt-4 space-y-2">
          <li>
            <a :href="site.whatsappLink()" target="_blank" rel="noopener" class="hover:underline hover:underline-offset-4">
              WhatsApp {{ phoneLabel(site.settings.whatsappNumber) }}
            </a>
          </li>
          <li v-if="site.settings.contactEmail">
            <a :href="`mailto:${site.settings.contactEmail}`" class="hover:underline hover:underline-offset-4">
              {{ site.settings.contactEmail }}
            </a>
          </li>
          <li v-if="site.settings.instagramUrl">
            <a :href="site.settings.instagramUrl" target="_blank" rel="noopener" class="hover:underline hover:underline-offset-4">Instagram @somosnaracol</a>
          </li>
          <li v-if="site.settings.tiktokUrl">
            <a :href="site.settings.tiktokUrl" target="_blank" rel="noopener" class="hover:underline hover:underline-offset-4">TikTok @somosnaracol</a>
          </li>
          <li v-if="site.settings.facebookUrl">
            <a :href="site.settings.facebookUrl" target="_blank" rel="noopener" class="hover:underline hover:underline-offset-4">Facebook @somosnaracol</a>
          </li>
        </ul>
      </div>
    </div>

    <div class="border-t border-crema/20">
      <div class="contenedor flex flex-col gap-3 py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
        <p>© {{ year }} Naracol Estudio</p>
        <div class="flex gap-6">
          <router-link to="/terminos" class="hover:underline hover:underline-offset-4">Términos</router-link>
          <router-link to="/privacidad" class="hover:underline hover:underline-offset-4">Tratamiento de datos</router-link>
        </div>
      </div>
    </div>
  </footer>
</template>
