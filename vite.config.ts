import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',

      registerType: 'autoUpdate',
      injectRegister: 'auto',

      includeAssets: [
        'icons/icon-192x192.png',
        'icons/icon-512x512.png'
      ],
      manifest: {
        name: 'Mi Aplicación Progresiva',
        short_name: 'MiPWA',
        description: 'Aplicación web progresiva creada con React + Vite + TypeScript',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1976d2',
        icons: [
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      },

      devOptions: {
        enabled: true,

        type: 'module'
      }
    }),
  ],
})
