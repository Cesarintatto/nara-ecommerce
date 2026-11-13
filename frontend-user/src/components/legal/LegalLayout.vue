<script setup>
// Plantilla de lectura para los textos legales: índice lateral + contenido.
defineProps({
  title: { type: String, required: true },
  effectiveDate: { type: String, required: true },
  sections: { type: Array, required: true }, // [{ id, title }]
})
</script>

<template>
  <div class="contenedor pb-24 pt-14 md:pt-20">
    <header class="max-w-3xl">
      <p class="etiqueta">Legal</p>
      <h1 class="mt-3 text-3xl sm:text-4xl">{{ title }}</h1>
      <p class="mt-4 text-sm">Vigente desde el {{ effectiveDate }}</p>
    </header>

    <div class="mt-12 grid gap-12 lg:grid-cols-12">
      <nav class="lg:col-span-3" aria-label="Contenido">
        <ol class="list-inside list-decimal space-y-2 text-sm lg:sticky lg:top-28">
          <li v-for="s in sections" :key="s.id">
            <a :href="`#${s.id}`" class="hover:underline hover:underline-offset-4">{{ s.title }}</a>
          </li>
        </ol>
      </nav>

      <article class="legal-body max-w-3xl lg:col-span-9">
        <slot />
      </article>
    </div>
  </div>
</template>

<style scoped>
.legal-body :deep(h2) {
  font-weight: 700;
  font-size: 1.125rem;
  line-height: 1.2;
  margin: 2.5rem 0 1rem;
  scroll-margin-top: 6rem;
}
.legal-body :deep(h2:first-child) {
  margin-top: 0;
}
.legal-body :deep(p) {
  margin: 0 0 1rem;
}
.legal-body :deep(ul) {
  margin: 0 0 1rem;
  padding-left: 1.25rem;
  list-style: square;
}
.legal-body :deep(li) {
  margin-bottom: 0.35rem;
}
.legal-body :deep(a) {
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
