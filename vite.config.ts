import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { paraglideVitePlugin } from '@inlang/paraglide-js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Compiles messages/*.json → src/paraglide/ (typed message functions).
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/paraglide',
      strategy: ['localStorage', 'preferredLanguage', 'baseLocale'],
    }),
  ],
  base: './',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 5173,
    allowedHosts: true, // dev only — accept whatever host the tunnel assigns
    proxy: {
      // Browser talks only to the client origin; Vite forwards /api to the
      // API server-side, so no CORS and no mixed-content over the https tunnel.
      '/api': {
        target: 'http://localhost:5201',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
