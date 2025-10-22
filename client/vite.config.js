import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'OmniBiz - Complete Business Management Platform',
        short_name: 'OmniBiz',
        description: 'Your all-in-one business management solution for inventory, e-commerce, payments, and analytics',
        theme_color: '#16a34a',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'any',
        scope: '/',
        start_url: '/',
        categories: ['business', 'finance', 'productivity'],
        screenshots: [
          {
            src: 'screenshots/dashboard.png',
            sizes: '1280x720',
            type: 'image/png',
            label: 'Dashboard Overview'
          }
        ],
        icons: [
          {
            src: 'icons/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Dashboard',
            short_name: 'Dashboard',
            description: 'Go to Dashboard',
            url: '/dashboard',
            icons: [{ src: 'icons/dashboard-96.png', sizes: '96x96' }]
          },
          {
            name: 'Orders',
            short_name: 'Orders',
            description: 'View Orders',
            url: '/dashboard/orders',
            icons: [{ src: 'icons/orders-96.png', sizes: '96x96' }]
          },
          {
            name: 'Inventory',
            short_name: 'Inventory',
            description: 'Manage Inventory',
            url: '/dashboard/inventory',
            icons: [{ src: 'icons/inventory-96.png', sizes: '96x96' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff,woff2}'],
        navigateFallback: null,
        navigateFallbackDenylist: [/^\/api/], // Don't fallback for API routes
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB limit
        runtimeCaching: [
          {
            // Only cache GET requests to API
            urlPattern: ({ url, request }) => {
              return url.pathname.startsWith('/api/') && request.method === 'GET';
            },
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 5,
              cacheableResponse: {
                statuses: [0, 200]
              },
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60 // 5 minutes
              }
            }
          },
          {
            // Cache images
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            // Cache fonts
            urlPattern: /\.(?:woff|woff2|ttf|eot)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: false, // IMPORTANT: Disabled in development to prevent conflicts
        type: 'module',
        navigateFallback: 'index.html'
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1 MB
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', 'sonner', 'date-fns'],
          'chart-vendor': ['recharts'],
          'socket-vendor': ['socket.io-client'],
          'radix-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs', '@radix-ui/react-scroll-area']
        }
      }
    }
  },
  server: {
    hmr: {
      port: 5174,
      host: 'localhost'
    },
    host: 'localhost',
    port: 5173
  },
})