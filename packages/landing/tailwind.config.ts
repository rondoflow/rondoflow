import type { Config } from 'tailwindcss'

// Light-themed marketing palette. Derived from the app's design system
// (packages/ui globals.css): ink #161616, and the canvas node-status colors
// (idle/running/waiting/error) which double as the signature "wire" colors of
// the flow visuals on this page. Adapted to a white ground for the promo site.
const config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: { '2xl': '1200px' },
    },
    extend: {
      colors: {
        // Theme-dependent tokens resolve to CSS variables (RGB channels) so the
        // same classes work in light and dark; values live in globals.css.
        paper: 'rgb(var(--paper) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        surface2: 'rgb(var(--surface2) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        faint: 'rgb(var(--faint) / <alpha-value>)',
        // Canvas node-status colors - the product's own visual language (fixed in both themes).
        node: {
          agent: '#3c83f5', // running / blue
          skill: '#21c45d', // idle / green
          wait: '#e7af08', // waiting / amber
          error: '#ee4343', // error / red
        },
        accent: { DEFAULT: '#3c83f5', ink: 'rgb(var(--accent-ink) / <alpha-value>)' },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,18,22,0.04), 0 8px 24px -12px rgba(16,18,22,0.12)',
        lift: '0 2px 4px rgba(16,18,22,0.05), 0 24px 48px -24px rgba(16,18,22,0.22)',
        node: '0 1px 2px rgba(16,18,22,0.06), 0 6px 16px -10px rgba(16,18,22,0.25)',
      },
      keyframes: {
        // Edge "draw" - mirrors the app's rondoflowEdge dashdraw animation.
        dashdraw: {
          to: { strokeDashoffset: '0' },
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        dashdraw: 'dashdraw 1.1s linear infinite',
        floaty: 'floaty 6s ease-in-out infinite',
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both',
      },
    },
  },
  plugins: [],
} satisfies Config

export default config
