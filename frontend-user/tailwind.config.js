/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        nara: {
          olive: '#a8ae89',
          sand: '#b69d86',
          light: '#ffffff',
          dark: '#000000',
        },
      },
      fontFamily: {
        roboto: ['"Roboto"', 'sans-serif'],
        montserrat: ['"Montserrat"', 'sans-serif'],
        manrope: ['"Manrope"', 'sans-serif'],
        'noto-serif': ['"Noto Serif"', 'serif'],
      },
      borderRadius: {
        nara: '12px',
      },
    },
  },
  plugins: [],
}
