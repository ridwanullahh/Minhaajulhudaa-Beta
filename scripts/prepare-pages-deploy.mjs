// Bismillah - Deploy script for Cloudflare Pages
// Restructures the build output for Pages compatibility:
// 1. Moves _worker.js to dist root (from dist/server/entry.mjs)
// 2. Moves static assets to dist root (from dist/client/)
// 3. Patches wrangler.json for Pages config
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const DIST = path.join(PROJECT_ROOT, 'dist');
const SERVER = path.join(DIST, 'server');
const CLIENT = path.join(DIST, 'client');

console.log('Restructuring build output for Cloudflare Pages...');

// 1. Copy _worker.js to dist root
const workerSrc = path.join(SERVER, 'entry.mjs');
const workerDst = path.join(DIST, '_worker.js');
if (fs.existsSync(workerSrc)) {
  fs.copyFileSync(workerSrc, workerDst);
  console.log('  Copied _worker.js to dist root');
}

// 2. Copy chunks to dist root (needed by _worker.js)
const chunksSrc = path.join(SERVER, 'chunks');
const chunksDst = path.join(DIST, 'chunks');
if (fs.existsSync(chunksSrc)) {
  fs.cpSync(chunksSrc, chunksDst, { recursive: true });
  console.log('  Copied chunks/ to dist root');
}

// 3. Copy virtual_astro_middleware.mjs
const mwSrc = path.join(SERVER, 'virtual_astro_middleware.mjs');
const mwDst = path.join(DIST, 'virtual_astro_middleware.mjs');
if (fs.existsSync(mwSrc)) {
  fs.copyFileSync(mwSrc, mwDst);
  console.log('  Copied virtual_astro_middleware.mjs');
}

// 4. Move static assets from dist/client/ to dist/
// Pages serves static files from the output directory root
const staticItems = fs.readdirSync(CLIENT);
for (const item of staticItems) {
  const src = path.join(CLIENT, item);
  const dst = path.join(DIST, item);
  if (fs.existsSync(dst)) {
    // Merge directories
    fs.cpSync(src, dst, { recursive: true });
  } else {
    fs.renameSync(src, dst);
  }
}
console.log('  Moved static assets from dist/client/ to dist/');

// 5. Patch wrangler.json for Pages
const wranglerPath = path.join(SERVER, 'wrangler.json');
if (fs.existsSync(wranglerPath)) {
  const config = JSON.parse(fs.readFileSync(wranglerPath, 'utf8'));
  
  // Create Pages-compatible config (no main, no assets binding, no rules)
  const pagesConfig = {
    name: config.name || 'minhaajulhudaa',
    compatibility_date: config.compatibility_date || '2024-09-23',
    compatibility_flags: config.compatibility_flags || ['nodejs_compat'],
    pages_build_output_dir: DIST,
    vars: {
      DB_FALLBACK_ENABLED: 'true',
      DB_FALLBACK_ONLY: 'true', // Use local DB until Lightbase is fully seeded
      SITE_URL: 'https://minhaajulhudaa.pages.dev',
    },
    jsx_factory: config.jsx_factory,
    jsx_fragment: config.jsx_fragment,
  };
  
  fs.writeFileSync(wranglerPath, JSON.stringify(pagesConfig, null, 2));
  // Also copy to dist root
  fs.writeFileSync(path.join(DIST, 'wrangler.json'), JSON.stringify(pagesConfig, null, 2));
  console.log('  Patched wrangler.json for Pages');
}

// 6. Create _routes.json to tell Pages which routes go to the Worker
// This ensures static assets are served directly, not through the Worker
const routesConfig = {
  version: 1,
  include: ['/*'],
  exclude: [
    '/_astro/*',
    '/favicon.svg',
    '/images/*',
    '/sitemap*.xml',
    '/robots.txt',
  ],
};
fs.writeFileSync(path.join(DIST, '_routes.json'), JSON.stringify(routesConfig, null, 2));
console.log('  Created _routes.json (static assets excluded from Worker)');

console.log('\nDone! dist/ is ready for Cloudflare Pages deployment.');
