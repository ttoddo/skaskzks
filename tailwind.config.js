/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#07060b',
          900: '#0c0a12',
          850: '#100d18',
          800: '#15111f',
          700: '#1d1829',
          600: '#292236',
          500: '#3a3149',
        },
        gold: {
          200: '#f9e7b8',
          300: '#f3d48b',
          400: '#e8b94f',
          500: '#d4a02a',
          600: '#b07f19',
        },
        arcane: {
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        ember: '#e2663f',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 40px -8px rgba(232, 185, 79, 0.45)',
        'glow-violet': '0 0 50px -10px rgba(139, 92, 246, 0.55)',
        card: '0 24px 60px -30px rgba(0, 0, 0, 0.9)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: 0, transform: 'translateY(14px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: 0.35 },
          '50%': { opacity: 0.8 },
        },
        'dice-roll': {
          '0%': { transform: 'rotate(0deg) scale(0.8)' },
          '60%': { transform: 'rotate(320deg) scale(1.15)' },
          '100%': { transform: 'rotate(360deg) scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 0.4s ease both',
        float: 'float 7s ease-in-out infinite',
        shimmer: 'shimmer 3s linear infinite',
        'pulse-soft': 'pulseSoft 4s ease-in-out infinite',
        'dice-roll': 'dice-roll 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both',
      },
      backgroundImage: {
        'radial-gold': 'radial-gradient(circle at center, rgba(232,185,79,0.22), transparent 65%)',
        'radial-violet': 'radial-gradient(circle at center, rgba(139,92,246,0.22), transparent 65%)',
      },
    },
  },
  plugins: [],
}
