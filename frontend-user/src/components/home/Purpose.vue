<script setup>
import { ref } from 'vue'
import LogoLetter from './LogoLetter.vue'

// Las cuatro letras del logo (con su tipografía original), cada una con una idea de la marca.
const values = [
  {
    key: 'n',
    letter: 'N',
    word: 'Naturalidad',
    text: 'Telas suaves y colores fieles. Mostramos la ropa como es, puesta en cuerpos reales.',
  },
  {
    key: 'a1',
    letter: 'A',
    word: 'Amor propio',
    text: 'Te vistes para ti. No para encajar en una talla ni en lo que alguien espera de ti.',
  },
  {
    key: 'r',
    letter: 'R',
    word: 'Ritmo',
    text: 'Prendas que se mueven contigo de la mañana a la noche: cómodas para tu día y elegantes para lo que venga después.',
  },
  {
    key: 'a2',
    letter: 'A',
    word: 'Autenticidad',
    text: 'Diseñamos la horma pensando en las curvas de la silueta mid-size, no a pesar de ellas.',
  },
]

const active = ref(0)
const tabs = ref([])

function onKey(e, i) {
  const map = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }
  if (!(e.key in map)) return
  e.preventDefault()
  const next = (i + map[e.key] + values.length) % values.length
  active.value = next
  tabs.value[next]?.focus()
}
</script>

<template>
  <section class="relative bg-white py-24 md:py-32 overflow-hidden">
    <div class="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-14 lg:gap-10">
      <div class="lg:col-span-5">
        <h2 class="font-noto-serif text-4xl md:text-5xl leading-[1.15] text-nara-dark max-w-md">
          No tienes que elegir entre verte hermosa y sentirte cómoda.
        </h2>
        <p class="mt-6 max-w-sm font-manrope text-nara-dark/70 leading-relaxed">
          Cada letra de NARA guarda una forma y una idea. Tócalas para conocerlas.
        </p>

        <!-- Rejilla 2×2: el logo como selector -->
        <div
          class="mt-12 grid grid-cols-4 gap-2 w-full max-w-sm lg:grid-cols-2 lg:gap-3 lg:max-w-[17rem]"
          role="tablist"
          aria-label="Lo que significa NARA"
        >
          <button
            v-for="(v, i) in values"
            :key="v.key"
            :ref="(el) => (tabs[i] = el)"
            type="button"
            role="tab"
            :id="`tab-${v.key}`"
            :aria-selected="active === i"
            aria-controls="nara-value-panel"
            :tabindex="active === i ? 0 : -1"
            :class="[
              'group aspect-square rounded-xl lg:rounded-2xl p-3 lg:p-5 transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nara-dark',
              active === i ? 'bg-nara-dark text-nara-sand' : 'bg-nara-wash text-nara-olive hover:text-nara-dark',
            ]"
            @click="active = i"
            @keydown="onKey($event, i)"
          >
            <span class="sr-only">{{ v.letter }}: {{ v.word }}</span>
            <LogoLetter :letter="v.letter.toLowerCase()" class="h-full w-full" />
          </button>
        </div>
      </div>

      <div class="lg:col-span-7 lg:pl-10 flex items-center">
        <div
          id="nara-value-panel"
          role="tabpanel"
          :aria-labelledby="`tab-${values[active].key}`"
          class="w-full"
        >
          <transition name="swap" mode="out-in">
            <div :key="values[active].key" class="relative">
              <LogoLetter :letter="values[active].letter.toLowerCase()" class="panel-shape absolute -right-6 -top-10 w-56 md:w-80 text-nara-olive/15" />
              <p class="relative panel-word font-archivo text-nara-dark">
                {{ values[active].word }}
              </p>
              <p class="relative mt-8 max-w-lg font-noto-serif text-xl md:text-2xl leading-relaxed text-nara-dark/80">
                {{ values[active].text }}
              </p>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.panel-word {
  font-weight: 850;
  font-stretch: 108%;
  font-size: clamp(2.75rem, 7vw, 6rem);
  line-height: 0.95;
  letter-spacing: -0.03em;
}

.swap-enter-active,
.swap-leave-active {
  transition: opacity 260ms ease, transform 360ms cubic-bezier(0.2, 0.7, 0.2, 1);
}
.swap-enter-from {
  opacity: 0;
  transform: translateY(14px);
}
.swap-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
@media (prefers-reduced-motion: reduce) {
  .swap-enter-active,
  .swap-leave-active {
    transition: opacity 150ms linear;
  }
  .swap-enter-from,
  .swap-leave-to {
    transform: none;
  }
}
</style>
