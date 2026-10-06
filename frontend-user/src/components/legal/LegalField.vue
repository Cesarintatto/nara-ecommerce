<script setup>
import { computed } from 'vue'
import { isPending } from '../../legal/legalInfo'

// Muestra un dato legal; si sigue pendiente, lo resalta para que no se publique así.
const props = defineProps({ value: { type: String, required: true } })
const pending = computed(() => isPending(props.value))
</script>

<template>
  <mark v-if="pending" class="rounded bg-amber-100 px-1 text-amber-900">{{ value }}</mark>
  <span v-else>{{ value }}</span>
</template>
