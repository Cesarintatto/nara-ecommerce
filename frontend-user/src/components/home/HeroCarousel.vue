<script setup>
// Banner inicial: carrusel administrable desde el panel (Banners).
// - Avanza cada 6 s, se pausa con el cursor encima, con el foco dentro o si la
//   persona prefiere menos movimiento.
// - Flechas, puntos (cuadrados) y deslizamiento táctil.
// - Imagen distinta para móvil si el banner la tiene.
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import logoPrincipal from '../../assets/logos/naracol-logo-principal.svg'

const props = defineProps({
  banners: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const INTERVAL = 6000
const current = ref(0)
const paused = ref(false)
const reducedMotion = ref(false)
let timer = null

const count = computed(() => props.banners.length)
const isExternal = (url) => /^https?:\/\//.test(url || '')

const go = (index) => {
  if (!count.value) return
  current.value = (index + count.value) % count.value
}
const next = () => go(current.value + 1)
const prev = () => go(current.value - 1)

const tick = () => {
  if (!paused.value && !reducedMotion.value && count.value > 1 && document.visibilityState === 'visible') next()
}

onMounted(() => {
  reducedMotion.value = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  timer = setInterval(tick, INTERVAL)
})
onBeforeUnmount(() => clearInterval(timer))

// Deslizamiento táctil
let startX = null
const onPointerDown = (e) => {
  if (e.pointerType === 'touch') startX = e.clientX
}
const onPointerUp = (e) => {
  if (startX === null) return
  const dx = e.clientX - startX
  startX = null
  if (Math.abs(dx) > 50) (dx < 0 ? next : prev)()
}

// Pausar mientras el foco del teclado está dentro del carrusel
const onFocusOut = (e) => {
  if (!e.currentTarget.contains(e.relatedTarget)) paused.value = false
}
</script>

<template>
  <!-- Cargando -->
  <section v-if="loading" class="border-b-2 border-verde bg-verde" aria-busy="true">
    <div class="cuadricula-clara aspect-[4/5] w-full animate-pulse sm:aspect-[16/7]"></div>
  </section>

  <!-- Sin banners: portada de marca -->
  <section
    v-else-if="!count"
    class="sobre-verde cuadricula-clara border-b-2 border-verde bg-verde text-crema"
  >
    <div class="contenedor flex flex-col items-start gap-8 py-20 md:py-28">
      <img :src="logoPrincipal" alt="Naracol Estudio" class="h-auto w-full max-w-[460px]" />
      <h1 class="max-w-2xl text-3xl sm:text-4xl">Diseñamos e imprimimos en 3D, capa por capa.</h1>
      <router-link to="/#secciones" class="btn-claro">Ver lo que hacemos</router-link>
    </div>
  </section>

  <!-- Carrusel -->
  <section
    v-else
    class="relative overflow-hidden border-b-2 border-verde bg-verde"
    aria-roledescription="carrusel"
    aria-label="Novedades y promociones"
    @mouseenter="paused = true"
    @mouseleave="paused = false"
    @focusin="paused = true"
    @focusout="onFocusOut"
    @pointerdown="onPointerDown"
    @pointerup="onPointerUp"
  >
    <div class="relative aspect-[4/5] w-full sm:aspect-[16/7]">
      <div
        v-for="(b, i) in banners"
        :key="b.id"
        class="absolute inset-0 transition-opacity duration-700"
        :class="i === current ? 'z-10 opacity-100' : 'pointer-events-none z-0 opacity-0'"
        role="group"
        aria-roledescription="diapositiva"
        :aria-label="`${i + 1} de ${count}`"
        :aria-hidden="i !== current"
      >
        <picture>
          <source v-if="b.imageMobile" media="(max-width: 639px)" :srcset="b.imageMobile" />
          <img
            :src="b.imageDesktop"
            :alt="b.title"
            class="h-full w-full object-cover"
            :loading="i === 0 ? 'eager' : 'lazy'"
            :fetchpriority="i === 0 ? 'high' : 'auto'"
          />
        </picture>

        <!-- Texto en un bloque verde con la capa: legible sobre cualquier foto -->
        <div class="absolute inset-x-0 bottom-0 pb-16 sm:pb-14">
          <div class="contenedor">
            <div class="sobre-verde inline-block max-w-xl border-2 border-crema bg-verde p-5 text-crema shadow-capa-lg sm:p-7">
              <component :is="i === 0 ? 'h1' : 'h2'" class="text-2xl sm:text-4xl">{{ b.title }}</component>
              <p v-if="b.subtitle" class="mt-3 text-sm sm:text-base">{{ b.subtitle }}</p>
              <template v-if="b.ctaLabel && b.ctaUrl">
                <a
                  v-if="isExternal(b.ctaUrl)"
                  :href="b.ctaUrl"
                  target="_blank"
                  rel="noopener"
                  class="btn-claro mt-5"
                  :tabindex="i === current ? 0 : -1"
                >
                  {{ b.ctaLabel }}
                </a>
                <router-link v-else :to="b.ctaUrl" class="btn-claro mt-5" :tabindex="i === current ? 0 : -1">
                  {{ b.ctaLabel }}
                </router-link>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Controles -->
    <div v-if="count > 1" class="absolute inset-x-0 bottom-4 z-20">
      <div class="contenedor flex items-center justify-between">
        <div class="flex gap-2" role="tablist" aria-label="Elegir diapositiva">
          <button
            v-for="(b, i) in banners"
            :key="b.id"
            type="button"
            role="tab"
            :aria-selected="i === current"
            :aria-label="`Ir a: ${b.title}`"
            class="h-3 border-2 border-crema transition-all"
            :class="i === current ? 'w-8 bg-rosa' : 'w-3 bg-verde/60 hover:bg-crema'"
            @click="go(i)"
          ></button>
        </div>
        <div class="sobre-verde flex gap-2">
          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center border-2 border-crema bg-verde text-crema hover:bg-verde-profundo"
            aria-label="Anterior"
            @click="prev"
          >
            <ChevronLeft class="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center border-2 border-crema bg-verde text-crema hover:bg-verde-profundo"
            aria-label="Siguiente"
            @click="next"
          >
            <ChevronRight class="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
