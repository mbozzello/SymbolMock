/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        surfaceMuted: 'var(--color-surfaceMuted)',
        text: 'var(--color-text)',
        textMuted: 'var(--color-textMuted)',
        primary: 'var(--color-primary)',
        accent: 'var(--color-accent)',
        success: 'var(--color-success)',
        danger: 'var(--color-danger)',
        warning: 'var(--color-warning)',
        border: 'var(--color-border)',
        'border-strong': 'var(--color-border-strong)',
      },
    },
  },
  plugins: [],
}
