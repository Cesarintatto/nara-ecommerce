import { defineStore } from 'pinia'

const STORAGE_KEY = 'nara_cart'

function loadItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const items = raw ? JSON.parse(raw) : []
    // Carritos guardados antes de las tallas no traen variantId: se descartan
    return Array.isArray(items) ? items.filter((item) => item?.variantId) : []
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
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items))
      } catch {
        // Sin almacenamiento disponible: el carrito vive solo en esta pestaña
      }
    },

    // Cada línea del carrito es una prenda en una talla (variant)
    addItem(product, variant, quantity = 1) {
      const maxQty = variant.stockAvailable
      const existing = this.items.find((item) => item.variantId === variant.id)

      if (existing) {
        existing.quantity = Math.min(existing.quantity + quantity, maxQty)
      } else {
        this.items.push({
          productId: product.id,
          variantId: variant.id,
          size: variant.size,
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

    removeItem(variantId) {
      this.items = this.items.filter((item) => item.variantId !== variantId)
      this.persist()
    },

    updateQuantity(variantId, quantity) {
      const item = this.items.find((item) => item.variantId === variantId)
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
