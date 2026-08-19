<script setup>
import { useRouter } from 'vue-router'
import { useCartStore } from '../store/cartStore'

const router = useRouter()
const cart = useCartStore()

const formatPrice = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value)

const decreaseQuantity = (item) => cart.updateQuantity(item.productId, item.quantity - 1)
const increaseQuantity = (item) => cart.updateQuantity(item.productId, item.quantity + 1)
</script>

<template>
  <div class="pt-24 pb-16 px-6 max-w-4xl mx-auto">
    <h1 class="text-3xl font-serif mb-8">Tu carrito</h1>

    <div v-if="cart.items.length === 0" class="py-20 text-center">
      <p class="text-nara-dark/50 mb-6">Todavía no agregaste nada al carrito.</p>
      <button
        type="button"
        class="bg-nara-dark text-white px-8 py-3 rounded-xl uppercase tracking-widest text-sm hover:bg-nara-sand transition-colors"
        @click="router.push('/catalogo')"
      >
        Ver catálogo
      </button>
    </div>

    <div v-else>
      <div class="divide-y divide-nara-dark/10">
        <div
          v-for="item in cart.items"
          :key="item.productId"
          class="py-6 flex items-center gap-4"
        >
          <div class="w-20 h-24 rounded-lg overflow-hidden bg-nara-olive/5 flex-shrink-0">
            <img
              v-if="item.image"
              :src="item.image"
              :alt="item.name"
              class="w-full h-full object-cover"
            />
          </div>

          <div class="flex-1 min-w-0">
            <router-link :to="`/producto/${item.slug}`" class="font-medium hover:text-nara-olive">
              {{ item.name }}
            </router-link>
            <p class="text-sm text-nara-dark/50">{{ formatPrice(item.unitPrice) }} c/u</p>

            <div class="flex items-center gap-3 mt-2">
              <div class="flex items-center border border-nara-dark/15 rounded-lg overflow-hidden">
                <button
                  type="button"
                  class="w-8 h-8 flex items-center justify-center hover:bg-nara-olive/10 disabled:opacity-30 disabled:cursor-not-allowed"
                  :disabled="item.quantity <= 1"
                  @click="decreaseQuantity(item)"
                >
                  −
                </button>
                <span class="w-8 text-center text-sm">{{ item.quantity }}</span>
                <button
                  type="button"
                  class="w-8 h-8 flex items-center justify-center hover:bg-nara-olive/10 disabled:opacity-30 disabled:cursor-not-allowed"
                  :disabled="item.quantity >= item.stockAvailable"
                  @click="increaseQuantity(item)"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                class="text-xs text-nara-dark/40 hover:text-red-600 underline"
                @click="cart.removeItem(item.productId)"
              >
                Quitar
              </button>
            </div>
          </div>

          <p class="font-semibold whitespace-nowrap">{{ formatPrice(item.unitPrice * item.quantity) }}</p>
        </div>
      </div>

      <div class="mt-8 flex items-center justify-between border-t border-nara-dark/10 pt-6">
        <span class="text-lg uppercase tracking-widest text-nara-dark/60">Subtotal</span>
        <span class="text-2xl font-serif">{{ formatPrice(cart.subtotal) }}</span>
      </div>

      <button
        type="button"
        class="w-full mt-6 bg-nara-dark text-white py-4 rounded-xl hover:bg-nara-sand transition-colors uppercase tracking-widest font-semibold"
        @click="router.push('/checkout')"
      >
        Continuar al pago
      </button>
    </div>
  </div>
</template>
