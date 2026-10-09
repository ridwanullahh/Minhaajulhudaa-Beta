# Cloudflare Pages — Lightbase Edge deployment

> BismiLLAH Ar-Rahman Ar-Raheem. This document is the deployment contract for
> running this platform as **full Node SSR on Cloudflare Pages with ZERO
> Cloudflare Workers** via the Lightbase Edge.

## Architecture (zero CF Workers, full Node SSR)

| Layer | What runs | Where |
|---|---|---|
| Static tier | Client assets (`/_astro/*`, fonts, icons) + the universal bridge shell (`_redirects`, `index.html` shell, `sw.js`) + the sha-pinned SSR bundle under `/_lb/<appId>/<hash>/server.js` | Cloudflare Pages CDN (unmetered, no Workers quota) |
| SSR tier | The full Node SSR app (Astro `output: 'server'` + `@astrojs/node` standalone), executed per-request inside the Lightbase Edge hardened worker runtime | Lightbase instance (`LIGHTBASE_URL`) |

- The service worker (`sw.js`) runs **in the browser**, not on Cloudflare —
  it reverse-proxies navigations/dynamic requests to the Lightbase Edge
  gateway (preflight-free wire protocol: `__lbjar`, `__lbmethod`, `__lbct`).
- The SSR bundle is a portable CJS bundle built by `lightbase-edge`
  (esbuild), published as a **static file on this app's own Pages
  deployment**, sha256-pinned and fail-closed at the edge.
- Secrets never enter the bundle. They ride `LIGHTBASE_EDGE_ENV` (a JSON
  string) at deploy time and are sealed AES-256-GCM server-side by
  Lightbase; the sandbox receives them only at execution.

## One-time setup

```sh
npm i -D lightbase-edge
npx lightbase-edge init   # wrote lightbase.edge.json + wired postbuild
```

`lightbase.edge.json` (committed) pins:

```json
{
  "appId": "minhaajulhudaa",
  "name": "Minhaajulhudaa Platform",
  "framework": "astro",
  "entry": "dist/server/entry.mjs",
  "staticOut": "dist-pages",
  "clientDir": "dist/client",
  "assetPrefixes": ["/_astro/", "/fonts/", "/images/", "/favicon", "/icons/"],
  "corsOpen": false,
  "timeoutMs": 60000,
  "auth": "public"
}
```

`package.json` wiring:

```json
"scripts": {
  "postbuild": "lightbase-edge deploy"
}
```

## Environment variables

### CF Pages project (Settings → Environment variables)

| Key | Value |
|---|---|
| `LIGHTBASE_URL` | `https://lightbase-10133292663.development.catalystappsail.com` |
| `LIGHTBASE_PROJECT_ID` | `minhaajulhudaa-beta` |
| `LIGHTBASE_DEPLOY_TOKEN` | `lb_live_…` deploy/admin-scope key for the project |
| `PUBLIC_SITE_URL` | `https://<app>.pages.dev` |
| `LIGHTBASE_EDGE_ENV` | JSON string of the app's server-side env (secrets — see `.env.example`) |

Server-side env shipped via `LIGHTBASE_EDGE_ENV` (all sealed server-side;
values are per-app and documented in `.env.example`): `LIGHTBASE_BASE_URL`,
`LIGHTBASE_PROJECT_ID`, `LIGHTBASE_API_KEY`, `SESSION_SECRET`, `SITE_URL`,
admin users (`ADMIN_USERS_*`), SMTP (`SMTP_*`, `FROM_EMAIL`), optional
integrations (`CLOUDINARY_*`, `PAYSTACK_*`).

## Deploy (direct upload, race-free)

```sh
SITE_URL=https://<app>.pages.dev npm run build          # full Node SSR build
LIGHTBASE_URL=… LIGHTBASE_PROJECT_ID=… LIGHTBASE_DEPLOY_TOKEN=… \
PUBLIC_SITE_URL=https://<app>.pages.dev \
  npx lightbase-edge deploy --no-register               # assemble dist-pages
npx wrangler pages deploy dist-pages --project-name <app> --branch main
LIGHTBASE_EDGE_ENV='{"SESSION_SECRET":"…", …}' npx lightbase-edge register
```

- `--no-register` assembles everything (bundle + bridge + `_lb-manifest.json`)
  WITHOUT the manifest PUT; `register` runs AFTER the static files are live
  on the Pages origin — the edge's first fetch can never race.
- A new content hash ⇒ sha-pinned manifest update ⇒ **instant real-time
  invalidation** on the edge (no waiting, no baking).

## Local verification

```sh
npm run build
npx lightbase-edge status   # app status + stats from Lightbase
npx lightbase-edge logs     # tail the app's structured log ring
```

Smoke: `curl https://<app>.pages.dev/` returns the bridge shell; the SSR
document is fetched by the shell/service worker from
`https://<lightbase-host>/api/v1/projects/<projectId>/edge/gw/<appId>/…`.

## Hard rules

1. Commit messages start AND end with the full Bismillah dhikr (see
   `Core_Working_Protocol.md`).
2. Zero Cloudflare Workers/Functions — this project stays a static Pages
   project; any server need belongs to the Lightbase Edge.
3. Secrets are never committed; they flow through `LIGHTBASE_EDGE_ENV` /
   Pages env vars only.
4. After deployment, verify: gateway SSR 200, pages.dev shell 200, and at
   least one deep route rendering real Lightbase data.
