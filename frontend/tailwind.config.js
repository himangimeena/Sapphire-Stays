/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        sapphire: {
          dark: '#08203E',
          blue: '#0F3D6E',
          light: '#1A5494'
        },
        gold: {
          primary: '#D4AF37',
          light: '#F4E3B2'
        },
        red: {
          650: '#cb2121'
        },
        emerald: {
          650: '#0a986c'
        },
        amber: {
          550: '#e78b08'
        },
        slate: {
          450: '#7b8c9e',
          550: '#526071',
          850: '#172033',
          855: '#131b2b',
          950: '#020617'
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Outfit', 'sans-serif']
      }
    },
  },
  plugins: [],
}
