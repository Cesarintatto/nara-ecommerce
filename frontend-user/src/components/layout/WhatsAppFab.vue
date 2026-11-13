<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { MessageCircle } from 'lucide-vue-next'
import { useSiteStore } from '../../store/siteStore'

const site = useSiteStore()
const route = useRoute()

// En el detalle de producto ya hay un botón de WhatsApp con el producto y el color
const hidden = computed(() => route.name === 'product')
</script>

<template>
  <a
    v-if="!hidden"
    :href="site.whatsappLink()"
    target="_blank"
    rel="noopener"
    class="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center border-2 border-verde bg-verde text-crema shadow-capa transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-capa-sm"
    aria-label="Escríbenos por WhatsApp"
  >
    <MessageCircle class="h-6 w-6" aria-hidden="true" />
  </a>
</template>
