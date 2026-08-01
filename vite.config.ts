import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      // Manifest estático en public/manifest.webmanifest
      // El plugin lo precachea pero no lo regenera, evitando colisión.
      manifestFilename: 'manifest.webmanifest',
      // Sólo precache de shell y assets locales; sin CDN ni API externas
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        // No cachear requests externos (no existen en V1)
        runtimeCaching: [],
      },
      // No declarar manifest aquí: lo sirve el archivo estático de public/
      manifest: false,
      // El service worker no se activa en dev para no interferir con HMR
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
