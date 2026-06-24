<script setup>
defineProps({
  active: { type: String, required: true },
  categories: { type: Array, default: () => ['Todos'] },
})

defineEmits(['update:active'])
</script>

<template>
  <div class="flex flex-wrap justify-center gap-4 mb-12">
    <button
      v-for="cat in categories"
      :key="cat"
      type="button"
      :class="[
        'px-6 py-2 rounded-full text-sm transition-all duration-300 border',
        active === cat
          ? 'bg-nara-olive text-white border-nara-olive shadow-md'
          : 'bg-transparent text-nara-dark/60 border-nara-olive/20 hover:border-nara-olive',
      ]"
      @click="$emit('update:active', cat)"
    >
      {{ cat }}
    </button>
  </div>
</template>
