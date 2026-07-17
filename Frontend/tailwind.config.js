/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#0A192F",
        gold: "#D4AF37",
        "gold-light": "#F1D279",
      },
      borderRadius: {
        '4xl': '2rem',
        '2.5xl': '1.25rem',
        '1.5xl': '0.75rem',
      },
      animation: {
        'slow-pulse': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
