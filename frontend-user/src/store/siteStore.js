// Datos compartidos del sitio: ajustes (WhatsApp, redes) y secciones del menú.
// Se cargan una sola vez y los usan el navbar, el footer y el botón de WhatsApp.
import { defineStore } from 'pinia'
import api from '../api/client'

const DEFAULT_SETTINGS = {
  whatsappNumber: '573054050812',
  whatsappMessage: 'Hola Naracol, quiero hacer un pedido.',
  instagramUrl: 'https://www.instagram.com/somosnaracol',
  tiktokUrl: 'https://www.tiktok.com/@somosnaracol',
  facebookUrl: 'https://www.facebook.com/somosnaracol',
  contactEmail: '',
}

export const useSiteStore = defineStore('site', {
  state: () => ({
    settings: { ...DEFAULT_SETTINGS },
    sections: [],
    sectionsLoaded: false,
    sectionsError: false,
    _loading: null,
  }),

  actions: {
    // Idempotente: varias llamadas comparten la misma petición
    load() {
      if (this._loading) return this._loading
      this._loading = Promise.allSettled([api.get('/settings'), api.get('/sections')]).then(
        ([settings, sections]) => {
          if (settings.status === 'fulfilled') this.settings = { ...DEFAULT_SETTINGS, ...settings.value.data }
          if (sections.status === 'fulfilled') this.sections = sections.value.data
          else this.sectionsError = true
          this.sectionsLoaded = true
        },
      )
      return this._loading
    },

    // Enlace wa.me con mensaje prellenado
    whatsappLink(message) {
      const text = message || this.settings.whatsappMessage
      return `https://wa.me/${this.settings.whatsappNumber}?text=${encodeURIComponent(text)}`
    },
  },
})
