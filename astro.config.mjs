// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL || 'https://minhaajulhudaa.pages.dev',
  output: 'server',
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
    define: {
      // Pass build-time env vars to the client
      'import.meta.env.DB_FALLBACK_ONLY': JSON.stringify(process.env.DB_FALLBACK_ONLY || 'true'),
      'import.meta.env.DB_FALLBACK_ENABLED': JSON.stringify(process.env.DB_FALLBACK_ENABLED || 'true'),
    },
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
});
