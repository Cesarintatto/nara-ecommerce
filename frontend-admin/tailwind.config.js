/** @type {import('tailwindcss').Config} */
// Tokens del manual de marca de Naracol Estudio v1.0 (ver RULES.md).
// Verde 60 % · Crema 30 % · Rosa 10 %. El rosa nunca va como texto sobre crema.
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        verde: { DEFAULT: '#1F3A2E', profundo: '#0F2219' },
        crema: '#F2EFE8',
        rosa: '#E8899F',
      },
      fontFamily: {
        // Space Mono es la única familia de la marca
        sans: ['"Space Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        mono: ['"Space Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      letterSpacing: {
        etiqueta: '0.3em',
      },
      boxShadow: {
        // "La capa": copia rosada desplazada hacia abajo y a la derecha, sin desenfoque
        capa: '4px 4px 0 0 #E8899F',
        'capa-sm': '2px 2px 0 0 #E8899F',
        'capa-lg': '8px 8px 0 0 #E8899F',
      },
      maxWidth: {
        sitio: '76rem',
      },
    },
  },
  plugins: [],
}
