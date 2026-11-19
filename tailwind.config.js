/** @type {import('tailwindcss').Config} */
// Paleta extraída del logo de LaLiga Lytics: tinta navy + cian/azul de acción + verde menta para cuotas/valor + rojo del emblema.
// `slate`, `sky`, `lime`, `rose`, `emerald` y `violet` se redefinen para que todas las pantallas adopten el tema sin reescribirlas.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Titulares de página: Barlow Condensed (cursiva 800 en MAYÚSCULAS se aplica en index.css).
        display: ['"Barlow Condensed"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        // Cifras, probabilidades y métricas (accuracy / MAE): ancho fijo para que las columnas no bailen.
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      // Esquinas casi rectas: controles 4px, tarjetas y paneles 6px. Los nombres de clase existentes se conservan.
      borderRadius: {
        sm: '2px',
        DEFAULT: '4px',
        md: '4px',
        lg: '4px',
        xl: '4px',
        '2xl': '6px',
        '3xl': '6px',
      },
      colors: {
        // Tinta navy: 900 = fondo de página (#06121c), 800 = superficie (#0b1c2c), 700 = línea/relieve.
        slate: {
          50: '#f1f6fb',
          100: '#e3edf6',
          200: '#c9d8e7',
          300: '#9fb4c9',
          400: '#7690a9',
          500: '#54708a',
          600: '#34506a',
          700: '#1a3046',
          800: '#0b1c2c',
          900: '#06121c',
          950: '#030b12',
        },
        // Azul/cian primario del emblema (#0868d8 → #12c0ee → #1fe6fe).
        sky: {
          50: '#e8fbff',
          100: '#c9f5fd',
          200: '#94ebfb',
          300: '#5fdffa',
          400: '#2fd2f6',
          500: '#12c0ee',
          600: '#0a9bd6',
          700: '#0868d8',
          800: '#0a4fa8',
          900: '#0a3a7a',
          950: '#07224a',
        },
        // Verde menta de las barras de datos: cuotas, valor y estados positivos.
        lime: {
          300: '#86f8c5',
          400: '#2bf29a',
          500: '#16c77a',
        },
        emerald: {
          200: '#c3fbe0',
          300: '#86f8c5',
          400: '#2bf29a',
          500: '#16c77a',
        },
        // Rojo del arco del emblema (#e90218): errores, derrotas, estados negativos.
        rose: {
          100: '#ffe3e6',
          200: '#ffc2c8',
          300: '#ff8f9a',
          400: '#ff5565',
          500: '#ea1a2f',
        },
        // Púrpura del emblema: tercer color de gráficos (empate) y badges especiales.
        violet: {
          200: '#ebc0dc',
          300: '#d58bba',
          400: '#b5528f',
          500: '#8b2a6b',
        },
        ligalytics: {
          bg: '#06121c',
          panel: '#0b1c2c',
          accent: '#12c0ee',
          odds: '#2bf29a',
        },
      },
      boxShadow: {
        card: '0 1px 0 rgba(255,255,255,.03) inset, 0 12px 32px -16px rgba(0,0,0,.7)',
        float: '0 1px 0 rgba(255,255,255,.04) inset, 0 18px 40px -18px rgba(0,0,0,.85)',
        glow: '0 0 0 1px rgba(18,192,238,.4), 0 10px 28px -12px rgba(18,192,238,.45)',
      },
      keyframes: {
        // Solo opacity + transform (compositor): sin blur ni layout, seguro con decenas de tarjetas a la vez.
        rise: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // Modal / menú: escala desde 0.96 con fade (transitions.dev modal open).
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
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
        // Destello de dato en vivo: pulso de luz verde menta breve, sin escalar (no mueve el layout vecino).
        flash: {
          '0%': { backgroundColor: 'rgba(43,242,154,.40)', boxShadow: '0 0 0 3px rgba(43,242,154,.25)' },
          '100%': { backgroundColor: 'rgba(43,242,154,0)', boxShadow: '0 0 0 0 rgba(43,242,154,0)' },
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
        rise: 'rise .26s cubic-bezier(.16,1,.3,1) both',
        'scale-in': 'scale-in .22s cubic-bezier(.16,1,.3,1) both',
        'fade-in': 'fade-in .18s ease-out both',
        'ping-soft': 'ping-soft 1.8s cubic-bezier(0,0,.2,1) infinite',
        'pop-in': 'pop-in .22s cubic-bezier(.2,.8,.2,1) both',
        'pulse-dot': 'pulse-dot 1.4s ease-in-out infinite',
        flash: 'flash .8s cubic-bezier(.16,1,.3,1) both',
        shimmer: 'shimmer 1.6s linear infinite',
        'toast-in': 'toast-in .35s cubic-bezier(.16,1,.3,1) both',
        'toast-timer': 'toast-timer 5s linear forwards',
      },
    },
  },
  plugins: [],
}
