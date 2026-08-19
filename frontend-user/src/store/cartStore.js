import { defineStore } from 'pinia'

const STORAGE_KEY = 'nara_cart'

function loadItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: loadItems(),
  }),

  getters: {
    itemCount: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: (state) => state.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
  },

  actions: {
    persist() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items))
    },

    addItem(product, quantity = 1) {
      const maxQty = product.stockAvailable
      const existing = this.items.find((item) => item.productId === product.id)

      if (existing) {
        existing.quantity = Math.min(existing.quantity + quantity, maxQty)
      } else {
        this.items.push({
          productId: product.id,
          slug: product.slug,
          name: product.name,
          image: product.images?.[0] || null,
          unitPrice: Number(product.basePrice),
          quantity: Math.min(quantity, maxQty),
          stockAvailable: maxQty,
        })
      }
      this.persist()
    },

    removeItem(productId) {
      this.items = this.items.filter((item) => item.productId !== productId)
      this.persist()
    },

    updateQuantity(productId, quantity) {
      const item = this.items.find((item) => item.productId === productId)
      if (!item) return
      item.quantity = Math.max(1, Math.min(quantity, item.stockAvailable))
      this.persist()
    },

    clear() {
      this.items = []
      this.persist()
    },
  },
})
