<script setup>
import { toasts } from './stores/toast'
</script>

<template>
  <router-view />
  <div class="pointer-events-none fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-2" aria-live="polite">
    <div
      v-for="t in toasts"
      :key="t.id"
      :class="[
        'pointer-events-auto max-w-sm border-2 px-4 py-3 text-sm font-bold shadow-capa',
        t.type === 'error' ? 'border-verde bg-crema text-verde' : 'border-verde bg-verde text-crema',
      ]"
      :role="t.type === 'error' ? 'alert' : 'status'"
    >
      <span v-if="t.type === 'error'" class="mr-2 inline-block h-2.5 w-2.5 bg-rosa align-middle" aria-hidden="true"></span>{{ t.message }}
    </div>
  </div>
</template>
