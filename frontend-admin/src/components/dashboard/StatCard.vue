<!-- /frontend-admin/src/components/dashboard/StatCard.vue -->
<script setup>
defineProps(['title', 'value', 'type']);
</script>

<template>
  <div class="bg-white p-6 rounded-nara border border-nara-olive/10 shadow-sm">
    <p class="text-xs font-sans text-nara-sand uppercase tracking-widest mb-2">{{ title }}</p>
    <p :class="[
      'text-2xl font-serif',
      type === 'profit' ? 'text-nara-olive' : 'text-nara-dark'
    ]">
      {{ typeof value === 'number' ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value) : value }}
    </p>
  </div>
</template>