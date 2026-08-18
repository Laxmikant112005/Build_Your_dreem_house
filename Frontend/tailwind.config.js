/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: "#0A192F",
        gold: "#D4AF37",
        "gold-light": "#F1D279",
        "gold-dark": "#B8962F",
        "surface": {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        "neu": {
          light: '#ffffff',
          base: '#e2e8f0',
          dark: '#cbd5e1',
          "shadow-light": '#a0aec0',
          "shadow-dark": '#94a3b8',
        }
      },
      borderRadius: {
        '4xl': '2rem',
        '2.5xl': '1.25rem',
        '1.5xl': '0.75rem',
      },
      boxShadow: {
        // Neumorphism - Elevated (Light)
        'neu-elevated': '8px 8px 16px #cbd5e1, -8px -8px 16px #ffffff',
        'neu-elevated-sm': '4px 4px 8px #cbd5e1, -4px -4px 8px #ffffff',
        'neu-elevated-lg': '12px 12px 24px #cbd5e1, -12px -12px 24px #ffffff',
        // Neumorphism - Pressed / Inset (Light)
        'neu-pressed': 'inset 4px 4px 8px #cbd5e1, inset -4px -4px 8px #ffffff',
        'neu-pressed-sm': 'inset 2px 2px 4px #cbd5e1, inset -2px -2px 4px #ffffff',
        'neu-pressed-lg': 'inset 8px 8px 16px #cbd5e1, inset -8px -8px 16px #ffffff',
        // Neumorphism - Convex (button-like)
        'neu-convex': '6px 6px 12px #cbd5e1, -6px -6px 12px #ffffff',
        'neu-concave': 'inset 6px 6px 12px #cbd5e1, inset -6px -6px 12px #ffffff',
        // Dark theme shadows (for future dark mode)
        'neu-dark-elevated': '8px 8px 16px #0f172a, -8px -8px 16px #1e293b',
        'neu-dark-pressed': 'inset 4px 4px 8px #0f172a, inset -4px -4px 8px #1e293b',
        // Gold accent shadows
        'gold-glow': '0 4px 14px rgba(212, 175, 55, 0.3)',
        'gold-glow-lg': '0 8px 30px rgba(212, 175, 55, 0.4)',
      },
      animation: {
        'slow-pulse': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
