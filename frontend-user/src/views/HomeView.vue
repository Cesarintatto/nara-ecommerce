<script setup>
import Hero from '../components/home/Hero.vue';
import { useMeta } from '../composables/useMeta'

useMeta(() => ({ path: '/' }))
</script>

<template>
  <div>
    <Hero />
  </div>
</template>
