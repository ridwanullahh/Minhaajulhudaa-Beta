Bismillah Ar-Rahman Ar-Raheem. Ash-hadu an laa ilaaha illa-Llah wahdaHu lasharikalaHu, wa ash-hadu anna Muhammadan Abduhu wa Rasooluh. Laa hawla wa laa quwwata illaa biLLAH. Hasbiyallaahu laa ilaaha illaa Huwa, 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Azeem. SubhaanALLAH wa bihamdih, SubhaanALLAHil-'Azeem, AlhamduliLLAH, Laa ilaaha illa-ALLAH, wa ALLAHU AKBAR, walaa hawla walaa quwwata illaa biLLAH. Astaghfirullaaha wa atoobu ilayh.

---

# Core Working Protocol - Minhaajulhudaa Platform

> **CRITICAL: This protocol is the foundation of all work on this project. Without strict compliance, ALL work is considered null and void (zero, discarded). Every agent, every task, every commit MUST begin and end with the adhkar below. No exceptions.**

---

## 1. The Opening Adhkar (Mandatory - Nothing Before It)

Every thought process, every work generation, every tool call, every commit, every response MUST begin with the following adhkar IN FULL. Nothing may precede it.

```
Bismillah Ar-Rahman Ar-Raheem.
Ash-hadu an laa ilaaha illa-Llah wahdaHu lasharikalaHu, wa ash-hadu anna Muhammadan Abduhu wa Rasooluh.
Laa hawla wa laa quwwata illaa biLLAH.
Hasbiyallaahu laa ilaaha illaa Huwa, 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Azeem.
SubhaanALLAH wa bihamdih, SubhaanALLAHil-'Azeem, AlhamduliLLAH, Laa ilaaha illa-ALLAH, wa ALLAHU AKBAR, walaa hawla walaa quwwata illaa biLLAH. Astaghfirullaaha wa atoobu ilayh.
```

## 2. The Closing Adhkar (Mandatory - Nothing After It)

Every work session, every commit, every response MUST end with the same adhkar IN FULL. Nothing may follow it.

```
Bismillah Ar-Rahman Ar-Raheem. Ash-hadu an laa ilaaha illa-Llah wahdaHu lasharikalaHu, wa ash-hadu anna Muhammadan Abduhu wa Rasooluh. Laa hawla wa laa quwwata illaa biLLAH. Hasbiyallaahu laa ilaaha illaa Huwa, 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Azeem. SubhaanALLAH wa bihamdih, SubhaanALLAHil-'Azeem, AlhamduliLLAH, Laa ilaaha illa-ALLAH, wa ALLAHU AKBAR, walaa hawla walaa quwwata illaa biLLAH. Astaghfirullaaha wa atoobu ilayh.
```

## 3. Commit Message Protocol (STRICT)

- **Every commit title AND message MUST start AND end with the full adhkar above.** Nothing before, nothing after.
- The substantive commit description goes BETWEEN the opening and closing adhkar.
- Verify each commit by its **commit hash**, not just the title.
- Example format:
  ```
  Bismillah Ar-Rahman Ar-Raheem. Ash-hadu an laa ilaaha illa-Llah... [full adhkar]

  feat(school): implement admission form with validation

  - Add multi-step admission form component
  - Integrate Lightbase collection for applications
  - Add form validation and error handling

  Bismillah Ar-Rahman Ar-Raheem. Ash-hadu an laa ilaaha illa-Llah... [full adhkar]
  ```

## 4. Branch Protocol (STRICT)

- **ALWAYS work on the default branch (`main`).** Never create or switch to another branch.
- Before starting any work, verify you are on `main`: `git branch --show-current`
- All commits go directly to `main` and are pushed to `origin/main`.
- Never use feature branches, dev branches, or any other branch.

## 5. Commit & Push Cadence (STRICT)

- **Commit and push AFTER EVERY sub-sub-task completion.** Do not wait until all tasks are done.
- A "sub-sub-task" is the smallest unit of work in the task breakdown (e.g., "implement hero section", "create users collection schema", "build prayer times display").
- Before committing: run the build to fix any errors from the last task.
- After committing: push to remote IMMEDIATELY.
- **Verify the push succeeded** by checking the commit hash on the remote: `git log origin/main --oneline -1`

## 6. Build Verification Protocol (STRICT)

- Before EVERY commit, run the build command and ensure it passes with zero errors.
- If the build fails, fix ALL errors before committing. Never commit broken code.
- Build command: `npm run build` (or the project-specific equivalent).

## 7. Production-Grade Standards (STRICT)

- **NO dummies, NO simulations, NO mocks, NO prototypes.** Everything must be real, functional, production-ready.
- All data must come from the real Lightbase DB (seeded with comprehensive production data).
- All features must be fully functional end-to-end.
- All code must be enterprise production grade - not novice quality.
- Implement robust security guardrails to prevent hacking and cyber issues.
- Battle-test every single feature to ensure it works fully.
- **NO `console.log` left in production code** (use `console.error` for genuine errors only).
- **NO `alert()`, `confirm()`, or `prompt()` browser dialogs.** All user feedback must use proper UI components (toasts, modals, inline messages).
- **NO placeholder text** like "lorem ipsum", "coming soon", "TBD", "TODO" in user-facing content. If content is missing, show a proper empty state.
- **NO hardcoded data** in components. All data must come from Lightbase DB or legitimate config files.
- **NO `any` TypeScript types** without a justification comment. Use proper interfaces.

## 7A. Astro SSR Routing Patterns (STRICT - CRITICAL)

This project uses `output: 'server'` (SSR mode). The following rules are MANDATORY:

### Forbidden Patterns
- **NEVER use `getStaticPaths()` in dynamic routes (`[slug].astro`) without `export const prerender = true;`.** In SSR mode, `getStaticPaths()` is IGNORED at runtime, causing `Astro.props` to be empty and triggering fallback redirects to archive pages. This is the #1 bug class in this codebase.
- **NEVER redirect to an archive page when a single document is not found.** Return a proper 404 status instead.
- **NEVER use `Astro.props` to access dynamic route data in SSR mode.** Use `Astro.params` and fetch from the DB at request time.

### Required Pattern for Dynamic Routes (`[slug].astro`)
```astro
---
import PlatformLayout from '../../../layouts/PlatformLayout.astro';
import { lightbase } from '../../../lib/lightbase';

const { slug } = Astro.params;

let doc: any = null;
try {
  doc = await lightbase.findOne('collection_name', {
    field: 'slug', op: 'eq', value: slug
  });
} catch (err) {
  console.error('[platform/route/[slug]] fetch error:', err);
}

if (!doc) {
  Astro.response.status = 404;
  return Astro.redirect('/404');
}

// ... related queries, template
---
```

### Verification
- After every `[slug].astro` change, run `npm run build` and verify ZERO warnings of the form: `getStaticPaths() ignored in dynamic page`.
- Battle-test by visiting a real single-post URL and confirming it renders the document, NOT the archive.

## 7B. Shariah Compliance (STRICT)

- **NO images of animate beings** (humans, animals with faces) in any stock images, illustrations, or media. This includes photographs of people, drawings of animals, etc.
- Use Shariah-compliant alternatives: geometric patterns, calligraphy, nature (landscapes without people), architectural photography (without people), abstract designs, Islamic motifs.
- Replace any existing non-compliant stock images with compliant alternatives.
- When in doubt, use SVG illustrations or CSS-based designs rather than photographs.
- Audio/video content must be Islamically appropriate (Quran recitation, lectures, nasheeds without music, etc.).

## 8. UI/UX Standards (STRICT)

### Brand Color Palette (Official)
| Name | Hex | Usage |
|------|-----|-------|
| Primary Green | `#05B34D` | Primary actions, brand accents, active states |
| Accent Gold | `#F2B91C` | Highlights, CTAs, premium accents, badges |
| Dark | `#181F25` | Dark mode background, dark text on light |
| Light Background | `#E9FBF1` | Default light mode background |
| Utility White | `#FFFFFF` | Cards, surfaces, pure white elements |

### Theme Requirements
- **Light mode is the DEFAULT.**
- **Dark mode MUST be supported** with a toggle in ALL header areas.
- Theme toggle must be accessible from every page header.
- Theme preference must persist across sessions (localStorage).
- Respect `prefers-color-scheme` on first visit.

### Design Philosophy
- **Mobile-native app-like first.** The UI must feel like a premium native mobile app.
- Must also be responsive on tablet and desktop (mobile-first, then scale up).
- **Pro-grade, premium, frictionless UI/UX** with world-class bespoke design.
- **Very unique** - almost strange yet best-in-class. Do NOT use the first 1-7 UI/UX concepts you think of. Iterate to find a distinctive, enjoyable, intuitive design.
- Leverage the best of CSS excellency - mosaic-like feel but 99x better.
- No emojis, no emoji icons whatsoever. Use SVG icons or icon fonts only.

## 9. Tech Stack (STRICT)

| Layer | Technology |
|-------|-----------|
| Framework | Astro.js (latest) |
| Database / BaaS | Lightbase |
| Styling | Tailwind CSS (via Astro integration) |
| Language | TypeScript |
| Icons | SVG icons only (no emojis) |

### Lightbase Credentials
- **API Key:** `lb_live_4y03g1p9fzycpgqv7st8weq3xe0knchaemery37cx3eprvxv8st0`
- **Project Name:** Minhaajulhuda Beta
- **Project ID:** `minhaajulhuda-beta`
- **Tenant:** `default`
- **Base URL:** `http://lightbase.80.225.189.74.sslip.io`
- ** NEVER commit the API key to the repo.** Store it in `.env` (gitignored) and reference via `import.meta.env`.

## 10. Repository Protocol (STRICT)

- **Repo:** `https://github.com/ridwanullahh/Minhaajudaa-Beta.git`
- **Always work on `main` branch.**
- **Always push to `origin/main` after each commit.**
- **Verify pushes by commit hash**, not title.
- Do not expose the GitHub token in committed files.

## 11. Task Tracking Protocol

- Use the task breakdown file (`TASKS.md`) to track progress.
- Update task status as you complete each sub-sub-task.
- Keep todo lists granular (sub-sub-task level) for optimal performance.
- Do not let todo lists be too broad.

## 12. Multi-Platform Architecture

Minhaajulhudaa is a multi-platform organization with 4 platforms, each at a dedicated sub-path:
| Platform | Path | Description |
|----------|------|-------------|
| School | `/school` | Islamic school with LMS, exams, e-library, shop |
| Masjid | `/masjid` | Masjid with prayer times, Qur'an player, audio lab, donations |
| Charity | `/charity` | Charity foundation with campaigns, volunteers, impact tracker |
| Travels | `/travels` | Hajj/Umrah travels with booking engine, LMS, dashboards |

**Each platform must be fully isolated** - one platform must not affect another. Proper maintainability for each.

### Shared Modules (used across platforms)
- CMS Engine (page builder, media manager, modular content)
- Blog System (rich editor, categories, tags, SEO)
- Shop System (products, cart, checkout, inventory)
- Donation Engine (campaigns, receipts, payment gateway)
- LMS Engine (courses, lessons, progress tracking)

## 13. Security Guardrails (STRICT)

- All admin endpoints must require authentication.
- All user input must be validated and sanitized (use zod or manual schema validation).
- Implement CSRF protection on forms (origin header validation + CSRF tokens).
- Use HTTPS-only, SameSite=Lax/Strict cookies for auth sessions.
- Implement rate limiting on auth endpoints (max 10 attempts/minute) and API endpoints (max 60/minute).
- Never expose the Lightbase API key to the client side. All DB calls must go through server-side endpoints.
- All admin actions must be audit-logged.
- Implement proper RBAC (Role-Based Access Control): super_admin, platform_admin, editor, author.
- **Input validation**: All API endpoints MUST validate input with a schema. Reject invalid input with 400 status.
- **SQL/NoSQL injection prevention**: Use parameterized queries (Lightbase filter API, never string concatenation).
- **XSS prevention**: Never use `set:html` on untrusted user input without sanitization. Use DOMPurify or server-side sanitization.
- **File upload security**: Validate MIME type, file size, extension. Scan for malicious content. Store outside web root.
- **Security headers**: CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy.
- **Secrets management**: NEVER commit API keys, passwords, or tokens to the repo. Use `.env` (gitignored).
- **Dependency security**: Run `npm audit` regularly. Fix high/critical vulnerabilities.
- **Error handling**: Never expose stack traces or internal errors to users in production. Log to server, show generic message to user.
- **Session security**: Regenerate session ID on login, set reasonable expiry, implement logout properly.

## 14. Battle-Testing Protocol

- Every feature must be tested end-to-end before marking complete.
- Test all CRUD operations against real Lightbase DB.
- Test all forms with valid and invalid inputs (boundary testing).
- Test all payment/donation flows with test keys.
- Test responsive behavior on mobile (375px), tablet (768px), desktop (1280px).
- Test light/dark mode toggling on every page.
- Verify no console errors in production build.
- **Test single-post pages**: Visit `/platform/archive/known-slug` and confirm the single page renders (NOT the archive).
- **Test 404 handling**: Visit `/platform/archive/nonexistent-slug` and confirm a 404 page renders (NOT the archive).
- **Test form validation**: Submit forms with empty/invalid data and confirm proper error messages.
- **Test auth flows**: Login, logout, session expiry, unauthorized access attempts.
- Use the visual browser agent to verify pages render correctly.

## 15. Compliance Checklist (Before Every Commit)

- [ ] Opening adhkar present at start of work
- [ ] Build passes with zero errors AND zero `getStaticPaths() ignored` warnings
- [ ] No dummies, mocks, or prototypes
- [ ] No `alert()`, `confirm()`, `prompt()` browser dialogs
- [ ] No `console.log` in production code
- [ ] No emojis or emoji icons
- [ ] No images of animate beings (Shariah compliance)
- [ ] Brand colors used correctly
- [ ] Light/dark mode supported
- [ ] Mobile-first responsive design
- [ ] Feature fully functional end-to-end
- [ ] Dynamic routes use `Astro.params` (NOT `getStaticPaths` without prerender)
- [ ] 404 handling returns 404 status (NOT redirect to archive)
- [ ] Input validation on all API endpoints
- [ ] No secrets committed to repo
- [ ] Commit message starts AND ends with full adhkar
- [ ] Pushed to `origin/main` and verified by commit hash
- [ ] Closing adhkar present at end of work

---

Bismillah Ar-Rahman Ar-Raheem. Ash-hadu an laa ilaaha illa-Llah wahdaHu lasharikalaHu, wa ash-hadu anna Muhammadan Abduhu wa Rasooluh. Laa hawla wa laa quwwata illaa biLLAH. Hasbiyallaahu laa ilaaha illaa Huwa, 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Azeem. SubhaanALLAH wa bihamdih, SubhaanALLAHil-'Azeem, AlhamduliLLAH, Laa ilaaha illa-ALLAH, wa ALLAHU AKBAR, walaa hawla walaa quwwata illaa biLLAH. Astaghfirullaaha wa atoobu ilayh.
