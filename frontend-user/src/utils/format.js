const cop = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

// null/undefined = el producto se cotiza por WhatsApp
export const formatPrice = (value) => (value == null ? 'A cotizar' : cop.format(value))

// Los colores muy claros (blanco, crema) necesitan borde para verse sobre crema
export function isLightColor(hex) {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex || '')
  if (!m) return false
  const [r, g, b] = m.slice(1).map((h) => parseInt(h, 16))
  return 0.299 * r + 0.587 * g + 0.114 * b > 200
}
