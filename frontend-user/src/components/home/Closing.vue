<template>
  <section class="bg-nara-dark px-6 py-20 md:py-28">
    <div class="closing-frame relative mx-auto max-w-5xl px-8 py-16 md:px-20 md:py-24 text-center">
      <p class="mx-auto max-w-3xl font-noto-serif text-3xl md:text-[2.75rem] leading-[1.3] text-white">
        La moda puede ser cómoda.<br />
        La comodidad también puede ser elegante.
      </p>
      <router-link
        to="/catalogo"
        class="mt-12 inline-flex items-center rounded-full bg-nara-sand px-8 py-4 font-manrope font-semibold text-nara-dark transition-colors duration-300 hover:bg-nara-olive focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-nara-sand"
      >
        Ver la colección
      </router-link>
    </div>
  </section>
</template>

<style scoped>
/* El marco doble del logo, a escala de sección */
.closing-frame {
  border: 3px solid #b69d86;
  border-radius: 2.5rem;
}
.closing-frame::after {
  content: '';
  position: absolute;
  inset: 0.9rem;
  border: 1px solid rgba(182, 157, 134, 0.45);
  border-radius: 1.75rem;
  pointer-events: none;
}
</style>
