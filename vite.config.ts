import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  // Capacitor native builds must NOT include any service worker — it causes
  // an infinite reload loop inside WKWebView on iOS.
  const isCapacitor = mode === 'capacitor';

  return {
    plugins: [
      tailwindcss(),
      react(),
      // Completely skip the PWA plugin for native builds
      ...(!isCapacitor ? [VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon-180x180.png', 'pwa-192x192.png', 'pwa-512x512.png', 'maskable-icon-512x512.png'],
        manifest: {
          name: 'Trackr',
          short_name: 'Trackr',
          description: 'Track and manage your subscriptions, goals, habits & documents',
          theme_color: '#6366f1',
          background_color: '#0f0f1a',
          display: 'standalone',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: 'maskable-icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'firebase-cache',
                networkTimeoutSeconds: 10,
              },
            },
          ],
        },
      })] : []),
    ],
  };
});
