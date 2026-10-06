<script setup>
import { ref, computed } from 'vue'
import { sizeFor, CUSTOM_SIZE } from '../../composables/useNaraSize'

const waist = ref(76)
const hip = ref(102)

const size = computed(() => sizeFor(waist.value, hip.value))
const isCustom = computed(() => size.value === CUSTOM_SIZE)

// Ancho de cada barra en proporción a la medida (escala fija 0–120 cm)
const pct = (cm) => `${Math.round((cm / 120) * 100)}%`
</script>

<template>
  <section id="talla" class="bg-nara-sand py-24 md:py-32 scroll-mt-20">
    <div class="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-14 items-center">
      <div class="lg:col-span-5">
        <h2 class="section-title font-archivo text-nara-dark">
          Tu talla sale de tus medidas
        </h2>
        <p class="mt-6 max-w-md font-noto-serif text-lg leading-relaxed text-nara-dark/85">
          Nuestra horma está probada en cuerpos mid-size reales. Mueve las barras con tu
          cintura y tu cadera en centímetros y te decimos qué talla NARA te queda.
        </p>
        <router-link
          to="/catalogo"
          class="mt-10 inline-flex items-center rounded-full bg-nara-dark px-8 py-4 font-manrope font-semibold text-white transition-colors duration-300 hover:bg-white hover:text-nara-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-nara-dark"
        >
          Ver prendas
        </router-link>
      </div>

      <div class="lg:col-span-7">
        <div class="fit-card relative rounded-[2rem] bg-white p-8 md:p-12">
          <!-- Silueta abstracta: cintura y cadera como curvas -->
          <div class="space-y-4" aria-hidden="true">
            <div class="flex justify-center">
              <div class="bar bg-nara-olive" :style="{ width: pct(waist) }"></div>
            </div>
            <div class="flex justify-center">
              <div class="bar bg-nara-sand" :style="{ width: pct(hip) }"></div>
            </div>
          </div>

          <div class="mt-10 grid sm:grid-cols-2 gap-8 font-manrope">
            <label class="block">
              <span class="flex justify-between text-sm text-nara-dark/70">
                Cintura <strong class="text-nara-dark">{{ waist }} cm</strong>
              </span>
              <input v-model.number="waist" type="range" min="60" max="100" class="range mt-3 w-full" />
            </label>
            <label class="block">
              <span class="flex justify-between text-sm text-nara-dark/70">
                Cadera <strong class="text-nara-dark">{{ hip }} cm</strong>
              </span>
              <input v-model.number="hip" type="range" min="80" max="120" class="range mt-3 w-full" />
            </label>
          </div>

          <div class="mt-10 border-t border-nara-dark/10 pt-8" aria-live="polite">
            <p class="font-manrope text-sm text-nara-dark/60">Tu talla NARA</p>
            <p class="size-result mt-1 font-archivo text-nara-dark">{{ size }}</p>
            <p class="mt-3 font-manrope text-sm text-nara-dark/70">
              <template v-if="isCustom">
                Tus medidas son únicas. Escríbenos y te ayudamos a elegir.
              </template>
              <template v-else>
                También puedes confirmarla en el asistente de cada prenda.
              </template>
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section-title {
  font-weight: 850;
  font-stretch: 108%;
  font-size: clamp(2.25rem, 5vw, 4rem);
  line-height: 0.95;
  letter-spacing: -0.03em;
}
.fit-card::after {
  content: '';
  position: absolute;
  inset: 0.75rem;
  border: 1px solid rgba(182, 157, 134, 0.5);
  border-radius: 1.5rem;
  pointer-events: none;
}
.bar {
  height: 3.25rem;
  border-radius: 999px;
  transition: width 350ms cubic-bezier(0.2, 0.7, 0.2, 1);
}
.size-result {
  font-weight: 850;
  font-stretch: 108%;
  font-size: clamp(2.5rem, 5vw, 3.75rem);
  line-height: 1;
  letter-spacing: -0.02em;
}
.range {
  accent-color: #000;
  height: 1.5rem;
  cursor: pointer;
}
.range:focus-visible {
  outline: 2px solid #000;
  outline-offset: 4px;
  border-radius: 4px;
}
@media (prefers-reduced-motion: reduce) {
  .bar {
    transition: none;
  }
}
</style>
