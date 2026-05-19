import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    allowedHosts: ['3123-93-127-114-151.ngrok-free.app'],
    host: true,
    port: 5173,
  },
})
