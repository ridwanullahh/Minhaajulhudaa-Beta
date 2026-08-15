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
- All user input must be validated and sanitized.
- Implement CSRF protection on forms.
- Use HTTPS-only cookies for auth sessions.
- Implement rate limiting on auth endpoints.
- Never expose the Lightbase API key to the client side.
- All admin actions must be audit-logged.
- Implement proper RBAC (Role-Based Access Control).

## 14. Battle-Testing Protocol

- Every feature must be tested end-to-end before marking complete.
- Test all CRUD operations against real Lightbase DB.
- Test all forms with valid and invalid inputs.
- Test all payment/donation flows.
- Test responsive behavior on mobile, tablet, desktop.
- Test light/dark mode toggling.
- Verify no console errors in production build.

## 15. Compliance Checklist (Before Every Commit)

- [ ] Opening adhkar present at start of work
- [ ] Build passes with zero errors
- [ ] No dummies, mocks, or prototypes
- [ ] No emojis or emoji icons
- [ ] Brand colors used correctly
- [ ] Light/dark mode supported
- [ ] Mobile-first responsive design
- [ ] Feature fully functional end-to-end
- [ ] Commit message starts AND ends with full adhkar
- [ ] Pushed to `origin/main` and verified by commit hash
- [ ] Closing adhkar present at end of work

---

Bismillah Ar-Rahman Ar-Raheem. Ash-hadu an laa ilaaha illa-Llah wahdaHu lasharikalaHu, wa ash-hadu anna Muhammadan Abduhu wa Rasooluh. Laa hawla wa laa quwwata illaa biLLAH. Hasbiyallaahu laa ilaaha illaa Huwa, 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Azeem. SubhaanALLAH wa bihamdih, SubhaanALLAHil-'Azeem, AlhamduliLLAH, Laa ilaaha illa-ALLAH, wa ALLAHU AKBAR, walaa hawla walaa quwwata illaa biLLAH. Astaghfirullaaha wa atoobu ilayh.
