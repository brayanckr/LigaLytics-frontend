/** @type {import('tailwindcss').Config} */
// Paleta inspirada en portales deportivos: carbón profundo + naranja de acción + lima para cuotas/valor.
// `slate` y `sky` se redefinen para que todas las pantallas existentes adopten el nuevo tema sin reescribirlas.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        // Cifras, probabilidades y métricas (accuracy / MAE): ancho fijo para que las columnas no bailen.
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      colors: {
        // Tinta azulada: 900 = fondo de página (#0b0e14), 800 = superficie (#121721), 700 = línea/relieve.
        slate: {
          50: '#f4f6fa',
          100: '#e8ecf3',
          200: '#d3dae6',
          300: '#aeb8c9',
          400: '#8793a8',
          500: '#5f6b80',
          600: '#3a4457',
          700: '#232b3a',
          800: '#121721',
          900: '#0b0e14',
          950: '#07090d',
        },
        sky: {
          50: '#fff4ed',
          100: '#ffe4d1',
          200: '#ffc7a3',
          300: '#ff9f66',
          400: '#ff7a33',
          500: '#ff5000',
          600: '#e04600',
          700: '#b83a00',
          800: '#8f3000',
          900: '#6b2500',
          950: '#3d1500',
        },
        lime: {
          300: '#bef264',
          400: '#a3e635',
          500: '#84cc16',
        },
        ligalytics: {
          bg: '#0b0e14',
          panel: '#121721',
          accent: '#ff5000',
          odds: '#a3e635',
        },
      },
      boxShadow: {
        card: '0 1px 0 rgba(255,255,255,.03) inset, 0 12px 32px -16px rgba(0,0,0,.7)',
        float: '0 1px 0 rgba(255,255,255,.04) inset, 0 18px 40px -18px rgba(0,0,0,.85)',
        glow: '0 0 0 1px rgba(255,80,0,.45), 0 10px 28px -10px rgba(255,80,0,.5)',
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(14px)', filter: 'blur(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)', filter: 'blur(0)' },
        },
        'ping-soft': {
          '0%': { transform: 'scale(1)', opacity: '.6' },
          '80%,100%': { transform: 'scale(2.4)', opacity: '0' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'translateY(6px) scale(.97)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'pulse-dot': {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '.35' },
        },
        flash: {
          '0%': { backgroundColor: 'rgba(163,230,53,.65)', transform: 'scale(1.3)', boxShadow: '0 0 0 4px rgba(163,230,53,.35)' },
          '60%': { backgroundColor: 'rgba(163,230,53,.18)', transform: 'scale(1.05)', boxShadow: '0 0 0 2px rgba(163,230,53,.1)' },
          '100%': { backgroundColor: 'rgba(163,230,53,0)', transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(163,230,53,0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'toast-in': {
          '0%': { opacity: '0', transform: 'translateY(-16px) scale(.96)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'toast-timer': {
          '0%': { transform: 'scaleX(1)' },
          '100%': { transform: 'scaleX(0)' },
        },
      },
      animation: {
        rise: 'rise .6s cubic-bezier(.16,1,.3,1) both',
        'ping-soft': 'ping-soft 1.8s cubic-bezier(0,0,.2,1) infinite',
        'pop-in': 'pop-in .22s cubic-bezier(.2,.8,.2,1) both',
        'pulse-dot': 'pulse-dot 1.4s ease-in-out infinite',
        flash: 'flash 1.4s ease-out both',
        shimmer: 'shimmer 1.6s linear infinite',
        'toast-in': 'toast-in .35s cubic-bezier(.16,1,.3,1) both',
        'toast-timer': 'toast-timer 5s linear forwards',
      },
    },
  },
  plugins: [],
}
