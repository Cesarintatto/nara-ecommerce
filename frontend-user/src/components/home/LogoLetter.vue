<script setup>
// Una letra del logo NARA, con su tipografía original.
// Requiere <NaraLogoDefs /> montado en la página.
const props = defineProps({
  letter: { type: String, required: true }, // 'n' | 'a' | 'r'
})

const letters = {
  n: { id: 'nara-n', view: '106 94 263 209' },
  a: { id: 'nara-a1', view: '334 94 294 209' },
  r: { id: 'nara-r', view: '106 295 258 210' },
}
</script>

<template>
  <svg :viewBox="letters[props.letter].view" aria-hidden="true" focusable="false" class="block">
    <use :href="`#${letters[props.letter].id}`" fill="currentColor" />
  </svg>
</template>
