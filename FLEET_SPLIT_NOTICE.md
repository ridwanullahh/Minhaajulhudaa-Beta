# BismiLLAH — Fleet Split Deployment Notice

> In the name of Allah, Most Gracious, Most Merciful.

**Status (2026-11-08):** This platform now runs on the fleet split deployment.

- **API backend**: deployed from the `Appserver1-beta` monorepo (standalone copy under
  `apps/minhaajulhudaa-api/`) to Zoho Catalyst AppSail, live at `https://appserver-10134675676.development.catalystappsail.com/minhaajulhudaa`.
  The backend code in THIS repository is intentionally left intact but is **not deployed
  from here** (frontend-only repo for Cloudflare Pages). Nothing was removed.
- **Frontend**: pure static plane on Cloudflare Pages (assets + robots + sitemap), bridging
  dynamic routes to the AppSail backend.
- **Data plane**: Lightbase (unchanged).
- Continuous development: backend changes → `Appserver1-beta/apps/minhaajulhudaa-api/` (commit + push +
  `python3 deploy/fleet-deploy.py`); frontend changes → this repo → CF Pages deploy.

Binding rules: `Appserver1-beta/Core_Working_Protocol.md`.
