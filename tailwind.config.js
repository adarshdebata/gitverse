/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        card: 'var(--card)',
        'card-hover': 'var(--card-h)',
        border: 'var(--border)',
        'border-bright': 'var(--border-b)',
        accent: 'var(--accent)',
        cyan: 'var(--cyan)',
        emerald: 'var(--emerald)',
        amber: 'var(--amber)',
        rose: 'var(--rose)',
        purple: 'var(--purple)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        dim: 'var(--dim)',
      },
      animation: {
        'fade-up': 'fadeUp 0.45s ease both',
        'fade-in': 'fadeIn 0.3s ease both',
        'slide-right': 'slideRight 0.3s ease both',
        'node-in': 'nodeIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275) both',
        'line-draw': 'lineDraw 0.6s ease both',
        'pulse-glow': 'pulseGlow 2.5s ease infinite',
        'float': 'float 3s ease infinite',
        'blink': 'blink 1s step-end infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideRight: {
          from: { opacity: '0', transform: 'translateX(16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        nodeIn: {
          from: { transform: 'scale(0)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        lineDraw: {
          from: { strokeDashoffset: '500' },
          to: { strokeDashoffset: '0' },
        },
        pulseGlow: {
          '0%,100%': { boxShadow: '0 0 8px var(--accent-glow)' },
          '50%': { boxShadow: '0 0 20px var(--accent-glow), 0 0 40px var(--accent-glow)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        blink: {
          '0%,50%': { opacity: '1' },
          '51%,100%': { opacity: '0' },
        },
      },
      boxShadow: {
        'card': '0 4px 24px rgba(0,0,0,0.3)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px var(--border-b)',
        'glow-accent': '0 0 20px var(--accent-glow)',
        'glow-cyan': '0 0 20px rgba(34,211,238,0.25)',
      },
    },
  },
  plugins: [],
}
