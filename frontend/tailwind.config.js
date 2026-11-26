/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cousp: {
          blue: '#0B3B60', // Bleu institutionnel République du Congo
          'blue-dark': '#06233B',
          'blue-light': '#1A5A8E',
          gold: '#C59B27', // Accent républicain
          red: '#C53030',
          green: '#22543D',
        }
      }
    },
  },
  plugins: [],
}

