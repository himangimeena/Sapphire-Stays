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
