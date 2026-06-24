<!-- /frontend-user/src/components/product/SizeAssistant.vue -->
<script setup>
import { ref, computed } from 'vue';

const waist = ref(70);
const hip = ref(95);
const showResult = ref(false);

const calculateSize = computed(() => {
  const w = waist.value;
  const h = hip.value;

  // Lógica de rangos NARA
  if (w <= 68 && h <= 94) return '6 (XS)';
  if (w <= 73 && h <= 99) return '8 (S)';
  if (w <= 78 && h <= 104) return '10 (M)';
  if (w <= 83 && h <= 109) return '12 (L)';
  if (w <= 88 && h <= 114) return '14 (XL)';
  
  return 'Personalizada'; // Opción para contactar a soporte
});

const getFitMessage = computed(() => {
  if (calculateSize.value === 'Personalizada') return 'Tus medidas son únicas. Escríbenos para una asesoría a medida.';
  return `Esta talla está diseñada para fluir con el ritmo de tu piel en estas medidas.`;
});
</script>

<template>
  <div class="bg-nara-olive/5 p-6 rounded-nara border border-nara-olive/10">
    <div class="flex items-center gap-3 mb-6">
      <div class="w-8 h-8 rounded-full bg-nara-olive text-white flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 class="font-serif text-xl">Asistente Mid-Size</h3>
    </div>

    <div class="space-y-8">
      <!-- Selector de Cintura -->
      <div class="space-y-4">
        <div class="flex justify-between text-sm">
          <label class="text-nara-dark/70 uppercase tracking-wider">Cintura: <span class="font-bold text-nara-dark">{{ waist }} cm</span></label>
        </div>
        <input type="range" v-model="waist" min="60" max="100" 
          class="w-full h-1 bg-nara-sand/30 rounded-lg appearance-none cursor-pointer accent-nara-olive" />
      </div>

      <!-- Selector de Cadera -->
      <div class="space-y-4">
        <div class="flex justify-between text-sm">
          <label class="text-nara-dark/70 uppercase tracking-wider">Cadera: <span class="font-bold text-nara-dark">{{ hip }} cm</span></label>
        </div>
        <input type="range" v-model="hip" min="80" max="120" 
          class="w-full h-1 bg-nara-sand/30 rounded-lg appearance-none cursor-pointer accent-nara-olive" />
      </div>

      <!-- Resultado Dinámico -->
      <transition name="fade">
        <div class="mt-8 p-4 bg-white rounded-lg border border-nara-sand/20 text-center shadow-sm">
          <p class="text-[10px] text-nara-sand uppercase tracking-[0.2em] mb-1">Tu Talla Ideal NARA es</p>
          <p class="text-3xl font-serif text-nara-olive">{{ calculateSize }}</p>
          <p class="mt-2 text-xs text-nara-dark/50 italic">{{ getFitMessage }}</p>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>