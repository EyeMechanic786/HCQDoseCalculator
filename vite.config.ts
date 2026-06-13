import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const repoName = 'HCQDoseCalculator';
const base = `/${repoName}/`;

export default defineConfig({
  base,
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'pwa-icon.svg'],
      manifest: {
        name: 'HCQ Dose Calculator',
        short_name: 'HCQ Dose',
        description:
          'Clinical decision support for hydroxychloroquine dosing and retinal toxicity screening guidance.',
        theme_color: '#1e3a5f',
        background_color: '#f1f5f9',
        display: 'standalone',
        orientation: 'any',
        scope: base,
        start_url: base,
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
            purpose: 'any',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: `${base}index.html`,
      },
    }),
  ],
  test: {
    include: ['tests/**/*.test.ts'],
  },
});
