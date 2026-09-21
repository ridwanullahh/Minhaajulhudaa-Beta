// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
import node from '@astrojs/node';

// Bismillah — dual-adapter preamble (BirrPaas battle fix).
//
// The default target stays Cloudflare Pages exactly as before. When the
// platform builds the app with BUILD_TARGET=node (full SSR on a Node host),
// the Node adapter takes over instead — the Cloudflare adapter's output
// (_worker.js) cannot run on plain Node, which is what broke deployments.
//   BUILD_TARGET=node  ASTRO_NODE_MODE=middleware  → mountable middleware build
//   BUILD_TARGET=node  (default)                   → standalone node server
//     → dist/server/entry.mjs, started with: node dist/server/entry.mjs
const BUILD_TARGET = (process.env.BUILD_TARGET || '').trim();
const NODE_MODE = (process.env.ASTRO_NODE_MODE || 'standalone').trim();

export default defineConfig({
  site: process.env.SITE_URL || 'https://minhaajulhudaa.pages.dev',
  output: 'server',
  adapter:
    BUILD_TARGET === 'node'
      ? node({ mode: /** @type {'standalone'|'middleware'} */ (NODE_MODE) })
      : cloudflare({
          platformProxy: {
            enabled: true,
          },
        }),
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
