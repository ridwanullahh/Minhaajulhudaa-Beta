// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

// Bismillah — FULL-SSR NODE MANDATE (2026-09-27).
//
// The platform builds and runs EXCLUSIVELY as a standalone Node server
// (full SSR, full Node runtime) for Zoho Catalyst AppSail / any Node host.
// The former Cloudflare Pages/Workers dual-adapter path is REMOVED — no
// static/edge deployment path, no wrangler, no _worker.js.
// Production start: node dist/server/entry.mjs (honours $HOST/$PORT).
const NODE_MODE = (process.env.ASTRO_NODE_MODE || 'standalone').trim();

export default defineConfig({
  site: process.env.SITE_URL || 'https://minhaajulhudaa-10133292663.development.catalystappsail.com',
  output: 'server',
  adapter: node({ mode: /** @type {'standalone'|'middleware'} */ (NODE_MODE) }),
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
    define: {
      // Pass build-time env vars to the client
      'import.meta.env.DB_FALLBACK_ONLY': JSON.stringify(process.env.DB_FALLBACK_ONLY || 'false'),
      'import.meta.env.DB_FALLBACK_ENABLED': JSON.stringify(process.env.DB_FALLBACK_ENABLED || 'false'),
    },
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
});
