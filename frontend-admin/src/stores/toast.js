// Avisos breves ("Guardado", errores) que se muestran abajo a la derecha
import { reactive } from 'vue'

export const toasts = reactive([])
let seq = 0

export function notify(message, type = 'ok') {
  const id = ++seq
  toasts.push({ id, message, type })
  setTimeout(() => {
    const i = toasts.findIndex((t) => t.id === id)
    if (i >= 0) toasts.splice(i, 1)
  }, type === 'error' ? 6000 : 3000)
}
