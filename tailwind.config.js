/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Light, friendly surface palette
        canvas: '#F6F7FB',
        card: '#FFFFFF',
        ink: '#1E2233',
        subtle: '#5B6178',
        faint: '#8A90A6',
        line: '#E7E9F2',
        // Status accents (saturated, for dots/icons/bars)
        accent: {
          green: '#22C55E',
          red: '#EF4444',
          yellow: '#EAB308',
          purple: '#A855F7',
          blue: '#3B82F6',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(20,24,45,0.04), 0 8px 24px rgba(20,24,45,0.06)',
        pop: '0 8px 30px rgba(99,102,241,0.18)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out both',
      },
    },
  },
  plugins: [],
}
