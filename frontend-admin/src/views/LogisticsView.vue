<!-- /frontend-admin/src/views/LogisticsView.vue -->
<script setup>
import { ref, onMounted } from 'vue';

const orders = ref([]);
const isLoading = ref(true);
const trackingInputs = ref({}); // Estado local para las guías de cada fila

onMounted(async () => {
  // Simulación: Cargar órdenes con status APPROVED
  setTimeout(() => {
    orders.value = [
      { id: 'ord_1', customerName: 'Camila Ríos', totalAmount: 189000, createdAt: '2024-05-20T10:00:00Z' },
      { id: 'ord_2', customerName: 'Mariana Vélez', totalAmount: 315000, createdAt: '2024-05-21T14:30:00Z' }
    ];
    isLoading.value = false;
  }, 500);
});

const handleShip = async (orderId) => {
  const guide = trackingInputs.value[orderId];
  if (!guide) return alert('Por favor ingresa un número de guía.');

  // Llamada al endpoint: PATCH /admin/orders/:id/ship
  console.log(`Enviando orden ${orderId} con guía ${guide}`);
  
  // Optimistic UI Update: Remover de la lista al despachar
  orders.value = orders.value.filter(o => o.id !== orderId);
  alert('Guía registrada y correo de seguimiento enviado automáticamente.');
};
</script>

<template>
  <div class="p-8 max-w-7xl mx-auto">
    <header class="mb-10 flex justify-between items-end">
      <div>
        <h1 class="text-3xl font-serif text-nara-dark">Gestión de Despachos</h1>
        <p class="text-nara-sand italic">Órdenes aprobadas listas para envío.</p>
      </div>
      <div class="bg-nara-olive/10 px-4 py-2 rounded-full text-nara-olive text-sm font-semibold">
        {{ orders.length }} Pendientes
      </div>
    </header>

    <div class="bg-white rounded-nara border border-nara-olive/10 overflow-hidden shadow-sm">
      <table class="w-full text-left border-collapse">
        <thead class="bg-nara-olive/5 text-nara-sand text-xs uppercase tracking-widest">
          <tr>
            <th class="p-4">Pedido</th>
            <th class="p-4">Cliente</th>
            <th class="p-4">Fecha Pago</th>
            <th class="p-4 w-64">Número de Guía (Transportadora)</th>
            <th class="p-4 text-right">Acción</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-nara-olive/5">
          <tr v-for="order in orders" :key="order.id" class="hover:bg-nara-olive/5 transition-colors">
            <td class="p-4 font-mono text-xs">{{ order.id.slice(-6).toUpperCase() }}</td>
            <td class="p-4 font-sans font-medium text-nara-dark">{{ order.customerName }}</td>
            <td class="p-4 text-sm text-nara-dark/60 italic">
              {{ new Date(order.createdAt).toLocaleDateString() }}
            </td>
            <td class="p-4">
              <input 
                v-model="trackingInputs[order.id]"
                type="text" 
                placeholder="Ej: SER987654321"
                class="w-full px-3 py-2 border border-nara-olive/20 rounded-lg text-sm focus:ring-1 focus:ring-nara-olive focus:border-nara-olive outline-none"
              />
            </td>
            <td class="p-4 text-right">
              <button 
                @click="handleShip(order.id)"
                class="bg-nara-dark text-white px-4 py-2 rounded-lg text-xs uppercase tracking-widest hover:bg-nara-sand transition-colors"
              >
                Confirmar Envío
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-if="orders.length === 0 && !isLoading" class="p-20 text-center text-nara-dark/40 italic">
        No hay despachos pendientes. ¡Todo está al día!
      </div>
    </div>
  </div>
</template>