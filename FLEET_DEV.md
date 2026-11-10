# FLEET_DEV.md — Continuous Development Guide

> BismiLLAH Ar-Rahman Ar-Raheem. One-page map for working on this platform inside the
> Appserver1-beta fleet. Read once; then just build. Operates under `Core_Working_Protocol.md`.

## The two planes (where your code runs)

| Plane | Host | Code lives in | What it serves |
|---|---|---|---|
| **Static (public, SEO)** | `minhaajulhudaa.pages.dev` (Cloudflare Pages) | THIS repo (source of truth) + `Appserver1-beta/apps/minhaajulhudaa-api/` (deployable copy) | Prerendered marketing/SEO pages; listings client-hydrate cross-origin |
| **SSR + API** | `https://appserver-10134675676.development.catalystappsail.com/<slug>` | `Appserver1-beta/apps/minhaajulhudaa-api/` | All `/api/*` routes, authed areas, server-rendered pages, live DB reads |

The static plane consumes the API plane **cross-origin via env-driven config**:
`/app-config.js` is generated at package time from the **Pages project's env settings**
(`API_BASE`, `SITE_BASE`) — editable in the CF dashboard at any time, never baked into code.

## Everyday flows

### 1. Frontend change (page, component, style)
```bash
# in THIS repo: edit src/... then mirror the change into the deployable copy
rsync -a --delete src/ /path/to/Appserver1-beta/apps/minhaajulhudaa-api/src/   # or edit there directly + mirror back
cd /path/to/Appserver1-beta
bash scripts/package-pages.sh minhaajulhudaa      # builds static tier + deploys to Pages (~2-5 min)
```
Deep DB-backed detail pages (blog posts, courses, wiki, docs) need no build — they are
**adopted live from the SSR tier** by `fleet-runtime.js` (v3). Only structure/new static
pages need a repackage.

### 2. Backend / API change
```bash
cd /path/to/Appserver1-beta/apps/minhaajulhudaa-api   # edit here (standalone app, own package.json)
bun install && bun run build                   # build the SSR artifact
# commit + push, then:
python3 deploy/fleet-deploy.py --memory 512 --disk 256
```

### 3. Database (Lightbase)
- Base URL + project id + per-app API key: `deploy/.env.fleet` (git-ignored; template in
  `deploy/.env.fleet.example`). NEVER commit keys (Protocol §4).
- Collections/seed: `bash scripts/ensure-fleet-db.sh <app>` — idempotent, zero duplicates.

### 4. AI features (all apps)
AI routes through **AIRouter combos** (multi-provider, never single-provider):
`combo:fleet-core-fallback` (agnes-3.0-flash → agnes-2.5-flash → NVIDIA) and
`combo:fleet-speed-race` (3-way parallel race). Combos are data, not code — manage them in
the AIRouter DB/dashboard.

## Environment map (no baking, ever)

- **CF Pages env** (project settings page): `API_BASE`, `SITE_BASE` — the only config the
  static plane needs; edit there + repackage to apply.
- **Instance env** (`deploy/.env.fleet` → AppSail app env): per-app Lightbase keys, session
  secrets, gateway controls (`FLEET_MAX_RESIDENT`, `FLEET_MAX_CONCURRENT_SPAWNS`, …).
- **Never** hardcode hosts or keys in source; the gateway rewrites child redirects into the
  slug namespace, so SSR code uses plain root-absolute paths.

## Battle-test contract (per change)

1. Golden path on the LIVE static plane (login with the test account, one DB-backed page,
   one AI feature).
2. `GET /health` + `GET /<slug>/health` after backend deploys.
3. Zero-worker verification ships inside `scripts/build-static.mjs` (fails on any worker artifact).

## Test account

`alpharidwanullah@gmail.com` / (the fleet password — see `deploy/.env.fleet` `FLEET_ADMIN_PASSWORD`).

*BismiLLAH we build, AlhamduliLLAH we verify.*
