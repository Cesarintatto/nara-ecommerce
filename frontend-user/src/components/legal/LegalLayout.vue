<script setup>
// Plantilla de lectura para los textos legales: índice lateral + contenido.
defineProps({
  title: { type: String, required: true },
  effectiveDate: { type: String, required: true },
  sections: { type: Array, required: true }, // [{ id, title }]
})
</script>

<template>
  <div class="bg-white">
    <div class="max-w-6xl mx-auto px-6 pt-16 pb-24 md:pt-20">
      <header class="max-w-3xl">
        <h1 class="legal-title font-archivo text-nara-dark">{{ title }}</h1>
        <p class="mt-4 font-manrope text-sm text-nara-dark/60">Vigente desde el {{ effectiveDate }}</p>
      </header>

      <div class="mt-12 grid lg:grid-cols-12 gap-12">
        <nav class="lg:col-span-3" aria-label="Contenido">
          <ol class="lg:sticky lg:top-28 space-y-2 font-manrope text-sm text-nara-dark/70 list-decimal list-inside">
            <li v-for="s in sections" :key="s.id">
              <a :href="`#${s.id}`" class="hover:text-nara-dark hover:underline underline-offset-4">{{ s.title }}</a>
            </li>
          </ol>
        </nav>

        <article class="legal-body lg:col-span-9 max-w-3xl font-noto-serif text-[1.0625rem] leading-[1.8] text-nara-dark/85">
          <slot />
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped>
.legal-title {
  font-weight: 850;
  font-stretch: 105%;
  font-size: clamp(2.25rem, 5vw, 3.75rem);
  line-height: 1;
  letter-spacing: -0.03em;
}
.legal-body :deep(h2) {
  font-family: 'Archivo', sans-serif;
  font-weight: 800;
  font-size: 1.375rem;
  line-height: 1.25;
  color: #000;
  margin: 3rem 0 1rem;
  scroll-margin-top: 7rem;
}
.legal-body :deep(h2:first-child) {
  margin-top: 0;
}
.legal-body :deep(p) {
  margin: 0 0 1rem;
}
.legal-body :deep(ul),
.legal-body :deep(ol) {
  margin: 0 0 1rem;
  padding-left: 1.25rem;
}
.legal-body :deep(ul) {
  list-style: disc;
}
.legal-body :deep(ol) {
  list-style: lower-alpha;
}
.legal-body :deep(li) {
  margin-bottom: 0.35rem;
}
.legal-body :deep(a) {
  text-decoration: underline;
  text-underline-offset: 3px;
}
.legal-body :deep(strong) {
  color: #000;
}
</style>
