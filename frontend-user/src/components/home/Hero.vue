<script setup>
// Fotos de prendas reales (vienen del catálogo). Si aún no hay,
// las celdas se pintan con los colores de marca.
defineProps({
  images: { type: Array, default: () => [] },
})
</script>

<template>
  <section class="hero relative overflow-hidden bg-nara-dark text-white">
    <div
      class="relative max-w-7xl mx-auto px-6 py-16 md:py-20 lg:py-24 grid lg:grid-cols-12 gap-12 lg:gap-10 items-center min-h-[calc(100svh-5rem)]"
    >
      <!-- Texto -->
      <div class="lg:col-span-6 order-2 lg:order-1">
        <h1 class="hero-title font-archivo text-nara-sand">
          Hecha para<br />tus formas
        </h1>
        <p class="mt-8 max-w-md font-noto-serif text-lg md:text-xl leading-relaxed text-white/80">
          Ropa cómoda que se ve elegante, con una horma pensada para la silueta mid-size.
          Para que te vistas para ti y te sientas bien siendo quien eres.
        </p>
        <div class="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5 font-manrope">
          <router-link
            to="/catalogo"
            class="inline-flex items-center rounded-full bg-nara-sand px-8 py-4 font-semibold text-nara-dark transition-colors duration-300 hover:bg-nara-olive focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-nara-sand"
          >
            Ver la colección
          </router-link>
          <a
            href="#talla"
            class="font-semibold text-white/80 underline decoration-nara-olive decoration-2 underline-offset-8 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-nara-sand rounded"
          >
            Encontrar mi talla
          </a>
        </div>
      </div>

      <!-- El logo NARA tal cual, con fotos de prendas dentro de la N y la R -->
      <div class="lg:col-span-6 order-1 lg:order-2">
        <svg
          viewBox="0 0 735 599"
          class="logo-mosaic mx-auto block w-full max-w-[34rem]"
          role="img"
          aria-label="NARA"
        >
          <use href="#nara-frame" class="part part-frame" fill="#b69d86" />

          <g class="part" style="--d: 0ms; --tx: -24px; --ty: -16px">
            <g clip-path="url(#nara-clip-n)">
              <image
                v-if="images[0]"
                :href="images[0]"
                x="110" y="98" width="255" height="201"
                preserveAspectRatio="xMidYMin slice"
              />
              <rect v-else x="100" y="90" width="270" height="215" fill="#b69d86" fill-opacity="0.45" />
            </g>
          </g>

          <g class="part" style="--d: 140ms; --tx: 24px; --ty: -20px">
            <use href="#nara-a1" fill="#b69d86" />
          </g>

          <g class="part" style="--d: 280ms; --tx: -20px; --ty: 22px">
            <g clip-path="url(#nara-clip-r)">
              <image
                v-if="images[1]"
                :href="images[1]"
                x="110" y="299" width="252" height="202"
                preserveAspectRatio="xMidYMin slice"
              />
              <rect v-else x="100" y="295" width="270" height="215" fill="#a8ae89" fill-opacity="0.6" />
            </g>
          </g>

          <g class="part" style="--d: 420ms; --tx: 26px; --ty: 18px">
            <use href="#nara-a2" fill="#a8ae89" />
          </g>
        </svg>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-title {
  font-weight: 900;
  font-stretch: 106%;
  font-size: clamp(3rem, 6.4vw, 5.75rem);
  line-height: 0.9;
  letter-spacing: -0.03em;
}

/* Entrada: las letras del logo llegan y encajan en su lugar */
.part {
  transform-box: fill-box;
  transform-origin: center;
  animation: part-in 1000ms cubic-bezier(0.2, 0.75, 0.15, 1) both;
  animation-delay: calc(var(--d, 0ms) + 250ms);
}
.part-frame {
  animation-name: frame-in;
  animation-duration: 900ms;
  animation-delay: 0ms;
}
.logo-mosaic image {
  animation: img-in 700ms ease both;
}
@keyframes part-in {
  from {
    opacity: 0;
    transform: translate(var(--tx, 0), var(--ty, 20px));
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@keyframes frame-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@keyframes img-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .part,
  .logo-mosaic image {
    animation: none;
  }
}
</style>
