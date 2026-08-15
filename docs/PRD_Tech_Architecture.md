Bismillah Ar-Rahman Ar-Raheem. Ash-hadu an laa ilaaha illa-Llah wahdaHu lasharikalaHu, wa ash-hadu anna Muhammadan Abduhu wa Rasooluh. Laa hawla wa laa quwwata illaa biLLAH. Hasbiyallaahu laa ilaaha illaa Huwa, 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Azeem. SubhaanALLAH wa bihamdih, SubhaanALLAHil-'Azeem, AlhamduliLLAH, Laa ilaaha illa-ALLAH, wa ALLAHU AKBAR, walaa hawla walaa quwwata illaa biLLAH. Astaghfirullaaha wa atoobu ilayh.

---

# PRD: Technical Architecture - Minhaajulhudaa Platform

## 1. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Astro.js | Latest (v5+) |
| Database | Lightbase BaaS | v0.1.0 |
| Styling | Tailwind CSS | v4 |
| Language | TypeScript | v5+ |
| Icons | Inline SVG (no emojis) | - |
| Fonts | Plus Jakarta Sans, Inter, Amiri | - |
| Package Manager | npm | v11+ |
| Runtime | Node.js | v24+ |

## 2. Project Structure

```
Minhaajudaa-Beta/
├── astro.config.mjs          # Astro config with integrations
├── tailwind.config.mjs       # Tailwind theme config
├── tsconfig.json             # TypeScript config
├── package.json
├── .env                      # Environment variables (gitignored)
├── .env.example              # Template for .env
├── .gitignore
├── Core_Working_Protocol.md
├── TASKS.md                  # Task tracking
├── docs/                     # PRD and design docs
│   ├── PRD_Design_System.md
│   ├── PRD_School.md
│   ├── PRD_Masjid.md
│   ├── PRD_Charity.md
│   ├── PRD_Travels.md
│   ├── PRD_Shared_Modules.md
│   └── PRD_Tech_Architecture.md
├── src/
│   ├── components/           # Shared UI components
│   │   ├── layout/
│   │   ├── navigation/
│   │   ├── content/
│   │   ├── forms/
│   │   └── feedback/
│   ├── lib/
│   │   ├── lightbase.ts      # Lightbase API client
│   │   ├── auth.ts           # Auth utilities
│   │   ├── utils.ts          # General utilities
│   │   └── constants.ts      # App constants
│   ├── styles/
│   │   ├── global.css        # Global styles + Tailwind
│   │   └── themes.css        # Light/dark theme variables
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   ├── PlatformLayout.astro
│   │   └── AdminLayout.astro
│   ├── pages/
│   │   ├── index.astro       # Landing page (platform chooser)
│   │   ├── school/           # School platform pages
│   │   │   ├── index.astro
│   │   │   ├── about.astro
│   │   │   ├── programs/
│   │   │   ├── admission.astro
│   │   │   ├── classes/
│   │   │   ├── calendar.astro
│   │   │   ├── news/
│   │   │   ├── gallery.astro
│   │   │   ├── shop/
│   │   │   ├── library/
│   │   │   ├── courses/
│   │   │   ├── contact.astro
│   │   │   └── admin/
│   │   ├── masjid/           # Masjid platform pages
│   │   ├── charity/          # Charity platform pages
│   │   ├── travels/          # Travels platform pages
│   │   └── api/              # API endpoints (server-side)
│   │       ├── auth/
│   │       ├── school/
│   │       ├── masjid/
│   │       ├── charity/
│   │       └── travels/
│   └── assets/
│       ├── icons/            # SVG icons
│       ├── images/
│       └── fonts/
├── scripts/
│   ├── create-collections.mjs  # DB schema creation
│   ├── seed-data.mjs           # Comprehensive data seeding
│   └── verify-seed.mjs         # Verify seeded data
└── public/
    ├── favicon.svg
    ├── robots.txt
    └── assets/
```

## 3. Lightbase Integration

### Client Library (`src/lib/lightbase.ts`)
- Singleton client configured from env vars
- Methods: `list`, `get`, `create`, `update`, `delete`, `query`, `search`, `aggregate`
- Automatic error handling and retries
- TypeScript types for all collections

### Environment Variables
```
LIGHTBASE_API_KEY=lb_live_xxx
LIGHTBASE_PROJECT_ID=minhaajulhuda-beta
LIGHTBASE_BASE_URL=http://lightbase.80.225.189.74.sslip.io
```

### API Pattern
- Server-side: Direct Lightbase API calls via `src/lib/lightbase.ts`
- Client-side: Calls to Astro API routes (`/api/*`) which proxy to Lightbase
- Never expose the API key to the client

## 4. Authentication

- Admin auth via session cookies (HTTP-only, secure)
- Credentials stored in a `platform_admins` collection
- Password hashing with bcrypt
- Role-based access: `super_admin`, `platform_admin`, `editor`, `author`
- Each platform can have its own admin users or share

## 5. Theme System

### Implementation
- CSS custom properties for all colors
- `data-theme="light|dark"` on `<html>`
- Inline script in `<head>` to prevent FOUC
- Toggle button in every header
- Persist via `localStorage`

### Tailwind Config
- Extend colors with brand palette
- Dark mode via `class` strategy
- Custom spacing, radius, shadows

## 6. Performance

- Astro's island architecture for minimal JS
- Image optimization via Astro's `<Image>` component
- Font preloading and `font-display: swap`
- Lazy loading for below-fold content
- Pagination for large lists
- Caching at the Lightbase client level

## 7. Security

- Input validation on all forms (server-side)
- CSRF tokens on POST/PUT/DELETE
- Rate limiting on auth endpoints
- HTTPS-only cookies for sessions
- Sanitize all user-generated HTML
- Never expose API keys to client
- Admin routes protected by auth middleware
- File upload validation (type, size)
- SQL/NoSQL injection prevention via parameterized queries

## 8. Build & Deploy

- `npm run dev` - Development server
- `npm run build` - Production build to `dist/`
- `npm run preview` - Preview production build
- Output: Static site with SSR for dynamic routes (hybrid rendering)

---

Bismillah Ar-Rahman Ar-Raheem. Ash-hadu an laa ilaaha illa-Llah wahdaHu lasharikalaHu, wa ash-hadu anna Muhammadan Abduhu wa Rasooluh. Laa hawla wa laa quwwata illaa biLLAH. Hasbiyallaahu laa ilaaha illaa Huwa, 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Azeem. SubhaanALLAH wa bihamdih, SubhaanALLAHil-'Azeem, AlhamduliLLAH, Laa ilaaha illa-ALLAH, wa ALLAHU AKBAR, walaa hawla walaa quwwata illaa biLLAH. Astaghfirullaaha wa atoobu ilayh.
