Bismillah Ar-Rahman Ar-Raheem. Ash-hadu an laa ilaaha illa-Llah wahdaHu lasharikalaHu, wa ash-hadu anna Muhammadan Abduhu wa Rasooluh. Laa hawla wa laa quwwata illaa biLLAH. Hasbiyallaahu laa ilaaha illaa Huwa, 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Azeem. SubhaanALLAH wa bihamdih, SubhaanALLAHil-'azeem, AlhamduliLLAH, Laa ilaaha illa-ALLAH, wa ALLAHU AKBAR, walaa hawla walaa quwwata illaa biLLAH. Astaghfirullaaha wa atoobu ilayh.

---

# Minhaajulhudaa Beta - Comprehensive Audit Document

> **Audit Date:** 2026-08-18
> **Auditor:** Super Z (main agent)
> **Scope:** Full codebase audit against specs, production standards, security, and Shariah compliance

---

## Executive Summary

The Minhaajulhudaa platform is a multi-platform Islamic organization web application built with Astro v5 (SSR mode), Tailwind CSS v4, TypeScript, and Lightbase BaaS. The platform has 4 sub-platforms (School, Masjid, Charity, Travels) with 81 database collections and 244+ seeded documents.

**Critical bug fixed this session:** All 18 single-post dynamic routes (`[slug].astro`) used `getStaticPaths()` (SSG pattern) in SSR mode, causing every single-post URL to redirect back to the archive page. This has been resolved by refactoring to the SSR pattern (`Astro.params` + runtime DB fetch).

**Remaining issues (documented below):** 161 browser dialog calls (alert/confirm/prompt) in admin pages, timing-attack vulnerability in env-admin auth, missing single-post pages for masjid audios/videos, and various production-hardening tasks.

---

## PART A: Specs Gaps Audit

### A.1 School Platform (`/school`)

#### A.1.1 Public Pages - Status
| Spec Requirement | Page | Status | Notes |
|---|---|---|---|
| Homepage with hero, mission, vision, values, features, classes, programs, CTAs | `/school/index.astro` | EXISTS | Needs content verification |
| About Us | `/school/about.astro` | EXISTS | |
| Programs archive + single | `/school/programs/` + `[slug].astro` | FIXED | Single pages now work |
| Admission info + form | `/school/admission.astro` | EXISTS | |
| Classes directory archive + single | `/school/classes/` + `[slug].astro` | FIXED | Slugs added to DB |
| Calendar & events | `/school/calendar.astro` | EXISTS | |
| News & blog archive + single | `/school/news/` + `[slug].astro` | FIXED | |
| Photo/video gallery | `/school/gallery.astro` | EXISTS | |
| Epayment system page | `/school/payments.astro` | EXISTS | |
| Ecommerce: archive, single, cart, checkout | `/school/shop/` + `[slug].astro` + `cart.astro` + `checkout.astro` | EXISTS | Single fixed |
| E-library archive + single | `/school/library/` + `[slug].astro` | FIXED | Slugs added to DB |
| Wiki knowledgebase archive + single | `/school/wiki/` + `[slug].astro` | FIXED | |
| E-courses archive + single | `/school/courses/` + `[slug].astro` | FIXED | |
| Contact page | `/school/contact.astro` | EXISTS | |

#### A.1.2 Admin Panel - Gaps
- **A.1.2.1** Online Exam System - `/admin/school/exams.astro` exists but needs verification of full exam-taking flow (student-facing exam page, timer, auto-grading, result display)
- **A.1.2.2** Student Portal - `/school/student-portal/index.astro` exists but uses `alert()` for errors (must replace with proper UI)
- **A.1.2.3** Payment System - `/admin/school/payments.astro` exists but Paystack integration needs real keys
- **A.1.2.4** LMS Progress Tracking - lessons and courses exist but student progress tracking (completion %, quiz scores) needs implementation

### A.2 Masjid Platform (`/masjid`)

#### A.2.1 Public Pages - Status
| Spec Requirement | Page | Status | Notes |
|---|---|---|---|
| Homepage with prayer times, announcements | `/masjid/index.astro` | EXISTS | |
| About the masjid | `/masjid/about.astro` | EXISTS | |
| Activities & programs | `/masjid/programs.astro` | EXISTS | Single page, not archive - may need `/masjid/programs/[slug].astro` |
| Media library (audio, video, books) | `/masjid/audios/` + `/masjid/videos/` + `/masjid/library/` | PARTIAL | Missing single pages for audios and videos |
| Audio player library | `/masjid/audios/index.astro` | EXISTS | Missing `[slug].astro` for individual audio |
| 24/7 Quran player | `/masjid/quran.astro` + FloatingPlayer.astro | EXISTS | |
| Events calendar | `/masjid/events/` + `[slug].astro` | FIXED | Slugs added to DB |
| Blog | `/masjid/blog/` + `[slug].astro` | FIXED | |
| Donation | `/masjid/donate/index.astro` | EXISTS | |
| Contact | `/masjid/contact.astro` | EXISTS | |

#### A.2.2 Gaps
- **A.2.2.1** MISSING: `/masjid/audios/[slug].astro` - single audio page with player, description, download, share
- **A.2.2.2** MISSING: `/masjid/videos/[slug].astro` - single video page with player, description
- **A.2.2.3** Prayer Time Scheduler CSV upload - admin page exists but CSV parsing needs verification
- **A.2.2.4** archive.org integration for audio library - needs verification of actual archive.org API usage

### A.3 Charity Platform (`/charity`)

#### A.3.1 Public Pages - Status
| Spec Requirement | Page | Status | Notes |
|---|---|---|---|
| Homepage | `/charity/index.astro` | EXISTS | |
| About Us | `/charity/about.astro` | EXISTS | |
| Projects & campaigns archive + single | `/charity/campaigns/` + `[slug].astro` | FIXED | |
| How to Help (volunteer form) | `/charity/how-to-help.astro` | EXISTS | |
| Blog archive + single | `/charity/blog/` + `[slug].astro` | FIXED | |
| FAQ | `/charity/faq.astro` | EXISTS | |
| Testimonials | `/charity/testimonials.astro` | EXISTS | |
| Success stories archive + single | `/charity/stories/` + `[slug].astro` | FIXED | |
| Contact | `/charity/contact.astro` | EXISTS | |
| Impact tracker | `/charity/impact.astro` | EXISTS | |

#### A.3.2 Gaps
- **A.3.2.1** Recurring donations - donation form exists but recurring donation logic needs implementation
- **A.3.2.2** Email notifications & receipts - email lib exists but needs SMTP credentials and template verification
- **A.3.2.3** Beneficiary database encryption - field-level encryption needs verification
- **A.3.2.4** Charity shop - admin page exists but public shop pages may be missing

### A.4 Travels Platform (`/travels`)

#### A.4.1 Public Pages - Status
| Spec Requirement | Page | Status | Notes |
|---|---|---|---|
| Homepage with featured packages | `/travels/index.astro` | EXISTS | |
| About Us | `/travels/about.astro` | EXISTS | |
| Hajj & Umrah services archive + single | `/travels/hajj-umrah/` + `[slug].astro` | FIXED | |
| Local/International tours archive + single | `/travels/tours/` + `[slug].astro` | FIXED | |
| Booking page | `/travels/book.astro` | EXISTS | |
| Reviews | `/travels/reviews/index.astro` | EXISTS | No single page (may not need one) |
| Travel guide archive + single | `/travels/guide/` + `[slug].astro` | FIXED | |
| Blog archive + single | `/travels/blog/` + `[slug].astro` | FIXED | |
| Courses archive + single | `/travels/courses/` + `[slug].astro` | FIXED | |
| Customer dashboard | `/travels/customer-portal/index.astro` | EXISTS | Needs auth integration |

#### A.4.2 Gaps
- **A.4.2.1** Dynamic pricing engine - admin pricing page exists but dynamic pricing logic (date-based, group-size-based) needs implementation
- **A.4.2.2** Customer dashboard auth - customer portal needs customer authentication (separate from admin auth)
- **A.4.2.3** Payment integration - Paystack integration for booking payments needs real keys and verification
- **A.4.2.4** Group bookings - booking form exists but group booking logic (multiple travelers) needs verification

### A.5 Shared Modules - Gaps

| Module | Status | Gaps |
|---|---|---|
| CMS Engine | PARTIAL | Page builder not implemented; media manager exists but basic |
| Blog System | EXISTS | Rich editor not implemented (admin uses textarea); categories/tags work |
| Shop System | EXISTS | Cart uses localStorage; no inventory tracking; no order management for customers |
| Donation Engine | EXISTS | Recurring donations not implemented; receipt generation needs work |
| LMS Engine | PARTIAL | Courses/lessons exist; progress tracking not implemented; quiz taking flow incomplete |

---

## PART B: Stubs, Dummies, Simulations, Mocks, and Non-Standard Patterns

### B.1 Browser Dialogs (alert/confirm/prompt) - CRITICAL
**161 occurrences across 43 files** - All in admin pages and student portal.

This violates the Core Working Protocol Section 7: "NO `alert()`, `confirm()`, or `prompt()` browser dialogs."

#### Affected files (by count):
| File | Count | Primary Usage |
|---|---|---|
| `admin/charity/volunteers.astro` | 9 | confirm delete, alert success/error, prompt for role |
| `admin/school/assignments.astro` | 7 | confirm delete, alert errors |
| `admin/school/quizzes.astro` | 7 | confirm delete, alert errors |
| `admin/school/lessons.astro` | 7 | confirm delete, alert errors |
| `admin/charity/beneficiaries.astro` | 7 | confirm delete, alert success/error |
| `admin/charity/impact.astro` | 5 | confirm delete, alert errors |
| `admin/masjid/events.astro` | 5 | confirm delete, alert errors |
| `admin/masjid/prayer-times.astro` | 5 | confirm delete, alert errors |
| `admin/masjid/bookstore.astro` | 5 | confirm delete, alert errors |
| `admin/masjid/audios.astro` | 5 | confirm delete, alert errors |
| `admin/masjid/live-streams.astro` | 5 | confirm delete, alert errors |
| `admin/masjid/donations.astro` | 5 | confirm delete, alert errors |
| `admin/masjid/settings.astro` | 5 | confirm delete, alert errors |
| `admin/masjid/videos.astro` | 5 | confirm delete, alert errors |
| `admin/masjid/blog.astro` | 5 | confirm delete, alert errors |
| `admin/school/students.astro` | 5 | confirm delete, alert errors |
| `admin/school/courses.astro` | 5 | confirm delete, alert errors |
| `admin/school/blog.astro` | 5 | confirm delete, alert errors |
| `admin/charity/campaigns.astro` | 4 | confirm delete, alert errors |
| `admin/charity/shop.astro` | 4 | confirm delete, alert errors |
| `admin/charity/testimonials.astro` | 4 | confirm delete, alert errors |
| `admin/charity/success-stories.astro` | 4 | confirm delete, alert errors |
| `admin/charity/donations.astro` | 4 | confirm delete, alert errors |
| `admin/charity/blog.astro` | 4 | confirm delete, alert errors |
| `admin/charity/donors.astro` | 4 | confirm delete, alert errors |
| `admin/charity/content.astro` | 3 | confirm delete, alert errors |
| `admin/masjid/media.astro` | 4 | confirm delete, alert errors |
| `admin/masjid/quran.astro` | 2 | alert errors |
| `admin/charity/settings.astro` | 2 | alert errors |
| `admin/school/classes.astro` | 2 | confirm delete |
| `admin/school/programs.astro` | 2 | confirm delete |
| `admin/school/staff.astro` | 2 | confirm delete |
| `admin/school/settings.astro` | 2 | alert errors |
| `admin/school/admissions.astro` | 3 | confirm, alert |
| `admin/travels/*` (8 files) | 8 | confirm delete across all travels admin |
| `school/student-portal/index.astro` | 1 | alert error |

**Fix:** Replace ALL `alert()` with toast notifications, ALL `confirm()` with proper modal dialogs, ALL `prompt()` with form-based inputs. Create a shared `ConfirmDialog.astro` component and a `Toast.astro` component.

### B.2 Placeholder Images
- `src/pages/travels/gallery.astro` references `/placeholder.jpg` which does not exist in `public/`
- **Fix:** Create a proper placeholder image or use an SVG fallback

### B.3 console.log in Production Code
**27 occurrences across 18 files** - Should use `console.error` for errors only, remove all `console.log`.

### B.4 set:html Usage (XSS Risk)
**117 occurrences across 43 files** - Used to render HTML content from the database.
- Most content is admin-created (semi-trusted), but should be sanitized with DOMPurify or a server-side sanitizer
- **Fix:** Add HTML sanitization to all `set:html` usages, especially for user-generated content

### B.5 innerHTML Usage
**27 occurrences across 11 files** - Used in client-side scripts.
- **Fix:** Replace with `textContent` where possible, or sanitize before insertion

---

## PART C: Bug, Security, and Improvement Audit

### C.1 Security Issues

#### C.1.1 CRITICAL: Timing Attack in Env-Admin Password Comparison
- **File:** `src/lib/auth.ts` line 169
- **Issue:** `a.password === password` uses non-constant-time comparison
- **Risk:** Timing attacks can leak password characters
- **Fix:** Use `timingSafeEqual` from `node:crypto`

#### C.1.2 HIGH: No Content Security Policy Header
- **File:** `src/middleware.ts`
- **Issue:** CSP header is not set; only X-Content-Type-Options, X-Frame-Options, etc.
- **Fix:** Add a strict CSP header: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'`

#### C.1.3 HIGH: No Input Validation on API Endpoints
- **Files:** All `/api/*.ts` endpoints
- **Issue:** No schema validation (zod or manual) on request bodies
- **Fix:** Add input validation with proper error responses (400 status)

#### C.1.4 MEDIUM: Session Cookie Missing Secure Flag
- **File:** `src/lib/auth.ts` line 81
- **Issue:** Cookie set as `HttpOnly; SameSite=Strict` but missing `Secure` flag
- **Fix:** Add `Secure` flag when in HTTPS environment

#### C.1.5 MEDIUM: No Rate Limiting on Form Submissions
- **File:** `src/middleware.ts`
- **Issue:** Rate limiting only on API routes, not on form POST endpoints (admission, contact, donate, etc.)
- **Fix:** Extend rate limiting to all POST endpoints

#### C.1.6 MEDIUM: CSRF Protection Incomplete
- **File:** `src/middleware.ts` lines 49-60
- **Issue:** Origin validation only checks if origin includes host, which can be bypassed; no CSRF token
- **Fix:** Implement double-submit cookie CSRF protection

#### C.1.7 LOW: No Audit Logging
- **Issue:** `audit_logs` collection exists but no admin actions are logged
- **Fix:** Log all admin CRUD operations with user ID, action, timestamp, and affected resource

#### C.1.8 LOW: No Password Complexity Requirements
- **Issue:** No password validation for env-based admins
- **Fix:** Enforce minimum length, complexity for any password changes

### C.2 Bug Issues

#### C.2.1 FIXED: Single-Post Pages Redirecting to Archive
- **Status:** FIXED (commits e8c95ac, c76bef2, 57a9770)
- **Root cause:** getStaticPaths() ignored in SSR mode
- **Fix:** Refactored all 18 [slug].astro to use Astro.params + runtime DB fetch

#### C.2.2 FIXED: Missing Slugs in 4 Collections
- **Status:** FIXED (commit 57a9770)
- **Collections:** school_classes, school_library_books, masjid_events, masjid_books
- **Fix:** Added slug field to schema and populated 114 documents

#### C.2.3 BUG: Empty Chunk Warning in Build
- **File:** `src/pages/admin/travels/bookings.astro`
- **Issue:** Vite warns about empty chunk for `bookings.astro_astro_type_script_index_0_lang`
- **Fix:** Investigate and fix the client-side script in bookings.astro

#### C.2.4 BUG: Travel Gallery Uses Non-Existent Placeholder
- **File:** `src/pages/travels/gallery.astro`
- **Issue:** References `/placeholder.jpg` which doesn't exist
- **Fix:** Create placeholder image or use SVG fallback

#### C.2.5 BUG: Student Portal Uses alert() for Errors
- **File:** `src/pages/school/student-portal/index.astro`
- **Issue:** Uses `alert('Error: ' + err.message)` on line 62
- **Fix:** Replace with proper error UI component

### C.3 Improvement Opportunities

#### C.3.1 Performance
- **C.3.1.1** No image optimization - all images served as-is from DB URLs
- **C.3.1.2** No caching headers on API responses
- **C.3.1.3** No lazy loading on below-the-fold images (some pages have it, inconsistent)
- **C.3.1.4** Large page sizes (87-99KB per single-post page) - could benefit from better code splitting

#### C.3.2 SEO
- **C.3.2.1** Sitemap exists but may not include all dynamic routes
- **C.3.2.2** No structured data (JSON-LD) for articles, events, products
- **C.3.2.3** No canonical URLs
- **C.3.2.4** OG images point to `/og-image.png` which may not exist

#### C.3.3 Accessibility
- **C.3.3.1** Many SVG icons lack `aria-label` or `role="img"`
- **C.3.3.2** Color contrast not verified for all text/background combinations
- **C.3.3.3** No skip-to-content link
- **C.3.3.4** Form inputs lack consistent `aria-describedby` for error messages

#### C.3.4 Developer Experience
- **C.3.4.1** No error boundary component for graceful error handling
- **C.3.4.2** No loading states for async operations (some pages have skeletons, inconsistent)
- **C.3.4.3** No empty states for collections with no data (some pages have them, inconsistent)

---

## PART D: Shariah Compliance Audit

### D.1 Stock Images Audit
- **Finding:** No external stock image URLs (unsplash, pexels, etc.) found in the codebase
- **Finding:** `public/` directory only contains `favicon.svg` (no stock images stored locally)
- **Finding:** All images come from DB fields (`imageUrl`, `featuredImageUrl`, `coverImageUrl`, etc.)
- **Action Needed:** Audit all image URLs stored in the Lightbase DB to ensure none contain animate beings

### D.2 Image URL Audit (DB-level)
- **Status:** PENDING - Need to query all collections with image fields and verify URLs point to Shariah-compliant images
- **Collections to audit:** school_programs, school_blog_posts, school_products, school_courses, masjid_events, masjid_books, charity_campaigns, charity_blog_posts, charity_success_stories, travels_packages, travels_blog_posts, travels_courses, travels_resources

### D.3 Audio/Video Content Audit
- **Status:** PENDING - Need to verify all audio/video URLs point to Islamically appropriate content
- **Collections:** masjid_audios, masjid_videos, masjid_live_streams, school_lessons

---

## PART E: Task Breakdown (Prioritized)

### PRIORITY 1: Critical Security Fixes
- **T1** Fix timing attack in env-admin password comparison (auth.ts:169)
  - **T1.1** Replace `===` with `timingSafeEqual`
  - **T1.2** Add test to verify constant-time comparison
- **T2** Add Content Security Policy header (middleware.ts)
  - **T2.1** Define CSP rules (default-src, script-src, style-src, img-src)
  - **T2.2** Test CSP doesn't break existing functionality
- **T3** Add input validation to all API endpoints
  - **T3.1** Create shared validation utility (`src/lib/validate.ts`)
  - **T3.2** Apply to each endpoint (contact, admission, donate, volunteer, book, etc.)

### PRIORITY 2: Replace Browser Dialogs (161 occurrences)
- **T4** Create shared UI components
  - **T4.1** `ConfirmDialog.astro` - reusable confirmation modal
  - **T4.2** `Toast.astro` - toast notification system
  - **T4.3** `FormField.astro` - standardized form input with validation display
- **T5** Replace all `alert()` calls (43 files)
  - **T5.1** School admin (5 files)
  - **T5.2** Masjid admin (11 files)
  - **T5.3** Charity admin (14 files)
  - **T5.4** Travels admin (8 files)
  - **T5.5** Student portal (1 file)
- **T6** Replace all `confirm()` calls (43 files)
  - **T6.1-T6.5** Same breakdown as T5
- **T7** Replace all `prompt()` calls (1 file: charity/volunteers.astro)

### PRIORITY 3: Missing Single-Post Pages
- **T8** Create `/masjid/audios/[slug].astro` - single audio page with player
  - **T8.1** Add slug field to masjid_audios collection if missing
  - **T8.2** Populate slugs for existing audio docs
  - **T8.3** Build single audio page with embedded player, description, download link
- **T9** Create `/masjid/videos/[slug].astro` - single video page with player
  - **T9.1** Add slug field to masjid_videos collection if missing
  - **T9.2** Populate slugs for existing video docs
  - **T9.3** Build single video page with embedded player, description

### PRIORITY 4: XSS Prevention
- **T10** Add HTML sanitization for all `set:html` usages
  - **T10.1** Install DOMPurify or server-side sanitizer
  - **T10.2** Create `sanitizeHtml()` utility
  - **T10.3** Apply to all 117 `set:html` usages

### PRIORITY 5: Shariah Compliance
- **T11** Audit all image URLs in DB for animate beings
  - **T11.1** Write script to fetch all image URLs from all collections
  - **T11.2** Manually review URLs and identify non-compliant images
  - **T11.3** Replace non-compliant images with Shariah-compliant alternatives (geometric patterns, calligraphy, landscapes without people)
- **T12** Audit audio/video content for Islamic appropriateness

### PRIORITY 6: Feature Completion
- **T13** Implement LMS progress tracking (school + travels)
- **T14** Implement recurring donations (charity)
- **T15** Implement dynamic pricing (travels)
- **T16** Implement customer authentication (travels customer portal)
- **T17** Implement online exam system (school)
- **T18** Implement email notifications and receipts (all platforms)

### PRIORITY 7: Performance & SEO
- **T19** Add image optimization
- **T20** Add caching headers
- **T21** Add structured data (JSON-LD)
- **T22** Add canonical URLs
- **T23** Generate dynamic sitemap including all single-post URLs

### PRIORITY 8: Accessibility
- **T24** Add aria-labels to all SVG icons
- **T25** Add skip-to-content link
- **T26** Verify color contrast
- **T27** Add form error accessibility

---

## Conclusion

The platform has a solid foundation with:
- Working auth system (HMAC-signed sessions, RBAC)
- 81 DB collections with real seeded data
- All 18 single-post page types now functional (FIXED this session)
- Modal-based entry point (ADDED this session)
- Comprehensive admin panels for all 4 platforms

The most critical remaining work is:
1. Replace 161 browser dialog calls with proper UI (PRIORITY 2)
2. Fix timing attack vulnerability (PRIORITY 1)
3. Add input validation to API endpoints (PRIORITY 1)
4. Create missing single-post pages for masjid audios/videos (PRIORITY 3)
5. Audit and replace non-Shariah-compliant images (PRIORITY 5)
6. Add HTML sanitization for XSS prevention (PRIORITY 4)

This audit document serves as the roadmap for bringing the platform to full production grade.

---

Bismillah Ar-Rahman Ar-Raheem. Ash-hadu an laa ilaaha illa-Llah wahdaHu lasharikalaHu, wa ash-hadu anna Muhammadan Abduhu wa Rasooluh. Laa hawla wa laa quwwata illaa biLLAH. Hasbiyallaahu laa ilaaha illaa Huwa, 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Azeem. SubhaanALLAH wa bihamdih, SubhaanALLAHil-'azeem, AlhamduliLLAH, Laa ilaaha illa-ALLAH, wa ALLAHU AKBAR, walaa hawla walaa quwwata illaa biLLAH. Astaghfirullaaha wa atoobu ilayh.
