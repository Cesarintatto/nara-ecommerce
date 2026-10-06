<script setup>
defineProps({
  products: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

// Cada tarjeta toma una forma distinta del logo.
const shapes = ['shape-n', 'shape-r', 'shape-frame']

const formatPrice = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value)
</script>

<template>
  <section class="relative bg-nara-wash pb-24 md:pb-32">
    <!-- Onda superior (Eco Fluido) -->
    <svg
      class="block w-full h-16 md:h-24 text-white"
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0,0 H1440 V40 C1200,110 960,110 720,62 C480,14 240,14 0,70 Z"
        fill="currentColor"
      />
    </svg>

    <div class="max-w-7xl mx-auto px-6 pt-10">
      <div class="flex flex-wrap items-end justify-between gap-6 mb-14">
        <h2 class="section-title font-archivo text-nara-dark">Recién llegadas</h2>
        <router-link
          to="/catalogo"
          class="font-manrope font-semibold text-nara-dark underline decoration-nara-sand decoration-2 underline-offset-8 hover:decoration-nara-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-nara-dark rounded"
        >
          Ver todo el catálogo
        </router-link>
      </div>

      <div v-if="loading" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
        <div
          v-for="i in 3"
          :key="i"
          :class="['aspect-[3/4] bg-nara-olive/15 animate-pulse', shapes[i - 1]]"
        />
      </div>

      <div v-else-if="products.length" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-14">
        <router-link
          v-for="(product, i) in products"
          :key="product.id"
          :to="'/producto/' + product.slug"
          class="group block rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-nara-dark"
        >
          <div :class="['card-media relative aspect-[3/4] overflow-hidden bg-nara-olive/20', shapes[i % 3]]">
            <img
              v-if="product.images?.[0]"
              :src="product.images[0]"
              :alt="product.name"
              loading="lazy"
              class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
            <span
              v-if="product.stockAvailable === 0"
              class="absolute bottom-4 left-4 rounded-full bg-nara-dark px-3 py-1 font-manrope text-xs font-semibold text-white"
            >
              Agotado
            </span>
          </div>
          <div class="mt-5 flex items-baseline justify-between gap-4">
            <h3 class="font-noto-serif text-xl text-nara-dark">{{ product.name }}</h3>
            <p class="shrink-0 font-manrope text-sm text-nara-dark/60">
              {{ formatPrice(product.basePrice) }}
            </p>
          </div>
          <p v-if="product.category?.name" class="mt-1 font-manrope text-sm text-nara-sand-deep">
            {{ product.category.name }}
          </p>
        </router-link>
      </div>

      <div v-else class="rounded-2xl border border-nara-olive/40 p-10 text-center">
        <p class="font-noto-serif text-xl text-nara-dark">La nueva colección está en camino.</p>
        <router-link
          to="/catalogo"
          class="mt-4 inline-block font-manrope font-semibold text-nara-dark underline underline-offset-8"
        >
          Ir al catálogo
        </router-link>
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
/* N: esquina superior cortada en diagonal */
.shape-n {
  clip-path: polygon(0 0, 72% 0, 100% 22%, 100% 100%, 0 100%);
  border-radius: 0 0 1rem 1rem;
}
/* R: la curva, como arco superior */
.shape-r {
  border-radius: 999px 999px 1rem 1rem;
}
/* Marco: el rectángulo redondeado del logo, con su línea interior */
.shape-frame {
  border-radius: 2rem;
}
.shape-frame.card-media::after {
  content: '';
  position: absolute;
  inset: 0.75rem;
  border: 1.5px solid rgba(255, 255, 255, 0.85);
  border-radius: 1.4rem;
  pointer-events: none;
}
</style>
