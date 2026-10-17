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
      },
      colors: {
        slate: {
          50: '#f5f7f8',
          100: '#eaeef1',
          200: '#d7dee4',
          300: '#b8c2cb',
          400: '#93a1ad',
          500: '#6b7b88',
          600: '#3d4b57',
          700: '#2a3742',
          800: '#1a252e',
          900: '#121b22',
          950: '#0b1217',
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
          bg: '#121b22',
          panel: '#1a252e',
          accent: '#ff5000',
          odds: '#a3e635',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,.35), 0 8px 24px -12px rgba(0,0,0,.5)',
        glow: '0 0 0 1px rgba(255,80,0,.5), 0 8px 24px -8px rgba(255,80,0,.45)',
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
      },
      animation: {
        rise: 'rise .6s cubic-bezier(.16,1,.3,1) both',
        'ping-soft': 'ping-soft 1.8s cubic-bezier(0,0,.2,1) infinite',
        'pop-in': 'pop-in .22s cubic-bezier(.2,.8,.2,1) both',
        'pulse-dot': 'pulse-dot 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
