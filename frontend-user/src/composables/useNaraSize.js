// Tabla de tallas NARA (horma mid-size). Única fuente de verdad para
// el asistente de tallas del producto y la calculadora de la home.
export const SIZE_RANGES = [
  { label: '6 (XS)', waist: 68, hip: 94 },
  { label: '8 (S)', waist: 73, hip: 99 },
  { label: '10 (M)', waist: 78, hip: 104 },
  { label: '12 (L)', waist: 83, hip: 109 },
  { label: '14 (XL)', waist: 88, hip: 114 },
]

export const CUSTOM_SIZE = 'Personalizada'

export function sizeFor(waist, hip) {
  const w = Number(waist)
  const h = Number(hip)
  const match = SIZE_RANGES.find((r) => w <= r.waist && h <= r.hip)
  return match ? match.label : CUSTOM_SIZE
}
