import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/Delivery-Tracker/',
  build: {
    outDir: '../docs',
    emptyOutDir: true
  }
})
