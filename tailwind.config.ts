import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{vue,js,ts,jsx,tsx}',
    './app/app.vue',
    './error.vue',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        // ── Verde principal STI ──────────────────────────────
        primary: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534', // ← Color principal STI
          900: '#14532d',
          950: '#052e16',
        },
        // ── Amarillo STI ─────────────────────────────────────
        accent: {
          50:  '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04', // ← Amarillo principal
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
          950: '#422006',
        },
        // ── Ámbar suave STI ──────────────────────────────────
        warning: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b', // ← Ámbar suave
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        // ── Neutros STI (slate oscuro) ───────────────────────
        surface: {
          50:  '#e0f2fe',
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
      },
      backgroundImage: {
        'sti-gradient': 'linear-gradient(135deg, #166534 0%, #15803d 60%, #16a34a 100%)',
        'sti-hero':     'linear-gradient(160deg, #052e16 0%, #14532d 50%, #166534 100%)',
        'sti-card':     'linear-gradient(135deg, rgba(22,101,52,0.08) 0%, rgba(21,128,61,0.04) 100%)',
      },
      boxShadow: {
        'primary':    '0 4px 30px rgba(22, 101, 52, 0.15)',
        'primary-lg': '0 12px 50px rgba(22, 101, 52, 0.25)',
        'card':       '0 2px 16px rgba(0, 0, 0, 0.06)',
        'card-dark':  '0 2px 16px rgba(0, 0, 0, 0.35)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-in-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
