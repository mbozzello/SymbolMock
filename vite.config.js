import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { quoteApiPlugin } from './vite-api-plugin.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), quoteApiPlugin()],
  server: {
    port: 3000,
    strictPort: false,
    open: true,
  },
})
