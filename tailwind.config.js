/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme (default)
        background: '#0b0f14',
        surface: '#0f141a',
        surfaceMuted: '#111820',
        text: '#e6edf3',
        textMuted: '#9aa9b2',
        primary: '#2aa6ff',
        success: '#17c964',
        danger: '#f31260',
        warning: '#f5a524',
      },
    },
  },
  plugins: [],
}


