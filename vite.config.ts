import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages serves a project site at https://<user>.github.io/<repo>/.
// Override with VITE_BASE=/ for a custom domain or Cloudflare Pages.
const base = process.env.VITE_BASE ?? '/throne-tally/'

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon.png', 'icons/icon.svg'],
      manifest: {
        name: 'Throne Tally',
        short_name: 'Throne',
        description: 'Two-player bathroom tracker. Most trips by midnight wins the day.',
        lang: 'en',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#f1f5f8',
        theme_color: '#f1f5f8',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache the app shell so it opens offline; Firestore queues writes until back online.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        cleanupOutdatedCaches: true,
      },
      devOptions: { enabled: false },
    }),
  ],
})
