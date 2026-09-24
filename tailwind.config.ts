import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#080b0d',
        surface: '#101517',
        emerald: {
          350: '#4adea4',
          450: '#23c983',
          550: '#10b981',
        },
        cream: '#f2f0e9',
        coral: '#ff7c68',
      },
      fontFamily: {
        sans: ['Barlow', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      boxShadow: {
        glass: '0 24px 80px rgba(0, 0, 0, 0.28)',
        glow: '0 0 45px rgba(16, 185, 129, 0.13)',
      },
      opacity: {
        12: '0.12',
        15: '0.15',
        22: '0.22',
        23: '0.23',
        24: '0.24',
        25: '0.25',
        27: '0.27',
        28: '0.28',
        32: '0.32',
        33: '0.33',
        35: '0.35',
        38: '0.38',
        42: '0.42',
        45: '0.45',
        55: '0.55',
        65: '0.65',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up .45s ease-out both',
        'scale-in': 'scale-in .2s ease-out both',
        shimmer: 'shimmer 2.2s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
