/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Dark, neon-friendly surface palette
        canvas: '#07070d',
        card: '#0f0f1a',
        ink: '#F4F5FB',
        subtle: '#CBCFE0',
        faint: '#9297AE',
        line: '#20212E',
        // Neon accents (for glows, logo, active states)
        accent: {
          purple: '#a855f7',
          blue: '#38bdf8',
          cyan: '#22d3ee',
          green: '#34d399',
          pink: '#ec4899',
          yellow: '#eab308',
        },
      },
      fontFamily: {
        display: ['Orbitron', 'Space Grotesk', 'system-ui', 'sans-serif'],
        sans: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 10px 40px rgba(0,0,0,0.45)',
        pop: '0 14px 46px rgba(56,189,248,0.22)',
        glow: '0 0 20px rgba(168,85,247,0.35)',
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
