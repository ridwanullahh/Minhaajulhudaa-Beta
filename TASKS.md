Bismillah Ar-Rahman Ar-Raheem. Ash-hadu an laa ilaaha illa-Llah wahdaHu lasharikalaHu, wa ash-hadu anna Muhammadan Abduhu wa Rasooluh. Laa hawla wa laa quwwata illaa biLLAH. Hasbiyallaahu laa ilaaha illaa Huwa, 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Azeem. SubhaanALLAH wa bihamdih, SubhaanALLAHil-'Azeem, AlhamduliLLAH, Laa ilaaha illa-ALLAH, wa ALLAHU AKBAR, walaa hawla walaa quwwata illaa biLLAH. Astaghfirullaaha wa atoobu ilayh.

---

# TASKS.md - Minhaajulhudaa Platform Build Tracker

> Task Status Legend: `[ ]` pending, `[~]` in progress, `[x]` done

---

## Phase 1: Foundation

### T1: Project Initialization
- [x] T1.1: Clone repo and verify clean state
- [x] T1.2: Create Core_Working_Protocol.md
- [x] T1.3: Create PRD documents (Design System, 4 platforms, Shared Modules, Tech Architecture)
- [ ] T1.4: Initialize Astro.js project with TypeScript
  - [ ] T1.4.1: Run `npm create astro@latest` with minimal template
  - [ ] T1.4.2: Add TypeScript strict mode
  - [ ] T1.4.3: Install Tailwind CSS v4 integration
  - [ ] T1.4.4: Configure astro.config.mjs with site URL and integrations
  - [ ] T1.4.5: Create tsconfig.json with path aliases
- [ ] T1.5: Set up environment configuration
  - [ ] T1.5.1: Create .env with Lightbase credentials
  - [ ] T1.5.2: Create .env.example template
  - [ ] T1.5.3: Update .gitignore to exclude .env and node_modules
- [ ] T1.6: Install dependencies (fonts, icon utils, etc.)

### T2: Design System Implementation
- [ ] T2.1: Configure Tailwind theme with brand palette
  - [ ] T2.1.1: Define color tokens (primary, accent, dark, bg, surface)
  - [ ] T2.1.2: Define dark mode color tokens
  - [ ] T2.1.3: Configure typography (Plus Jakarta Sans, Inter, Amiri)
  - [ ] T2.1.4: Configure spacing, radius, shadows
- [ ] T2.2: Create global CSS
  - [ ] T2.2.1: CSS custom properties for themes
  - [ ] T2.2.2: Base reset and typography
  - [ ] T2.2.3: Utility classes for common patterns
- [ ] T2.3: Create theme toggle system
  - [ ] T2.3.1: Inline FOUC-prevention script
  - [ ] T2.3.2: Theme toggle component
  - [ ] T2.3.3: localStorage persistence
- [ ] T2.4: Build shared UI components
  - [ ] T2.4.1: Button (primary, accent, ghost variants)
  - [ ] T2.4.2: Card component
  - [ ] T2.4.3: Badge component
  - [ ] T2.4.4: Input, Select, Checkbox, Radio
  - [ ] T2.4.5: Modal (bottom sheet mobile, dialog desktop)
  - [ ] T2.4.6: Toast notifications
  - [ ] T2.4.7: Skeleton loaders
  - [ ] T2.4.8: Pagination
  - [ ] T2.4.9: Carousel
  - [ ] T2.4.10: Accordion
  - [ ] T2.4.11: Tabs
  - [ ] T2.4.12: SVG icon set (no emojis)

### T3: Lightbase Client & DB Schema
- [ ] T3.1: Create Lightbase API client (`src/lib/lightbase.ts`)
  - [ ] T3.1.1: Singleton client with env config
  - [ ] T3.1.2: CRUD methods (list, get, create, update, delete)
  - [ ] T3.1.3: Query method with filter/sort/pagination
  - [ ] T3.1.4: Search method
  - [ ] T3.1.5: Bulk operations method
  - [ ] T3.1.6: Error handling and types
- [ ] T3.2: Create collection schemas
  - [ ] T3.2.1: School collections (28 collections)
  - [ ] T3.2.2: Masjid collections (16 collections)
  - [ ] T3.2.3: Charity collections (19 collections)
  - [ ] T3.2.4: Travels collections (19 collections)
  - [ ] T3.2.5: Shared collections (admins, settings)
- [ ] T3.3: Create schema initialization script
  - [ ] T3.3.1: `scripts/create-collections.mjs`
  - [ ] T3.3.2: Idempotent creation (skip if exists)
  - [ ] T3.3.3: Verification step

### T4: Database Seeding
- [ ] T4.1: Create seed script framework
- [ ] T4.2: Seed School platform data
  - [ ] T4.2.1: Pages, announcements, events
  - [ ] T4.2.2: Students, staff, classes, programs
  - [ ] T4.2.3: Blog posts, gallery
  - [ ] T4.2.4: Courses, lessons, quizzes
  - [ ] T4.2.5: Products, library books, wiki
  - [ ] T4.2.6: Testimonials, fees, invoices
- [ ] T4.3: Seed Masjid platform data
  - [ ] T4.3.1: Prayer times, announcements, events
  - [ ] T4.3.2: Audios, videos, books
  - [ ] T4.3.3: Blog posts, gallery
  - [ ] T4.3.4: Donation campaigns, imams
  - [ ] T4.3.5: Quran player config, live streams
- [ ] T4.4: Seed Charity platform data
  - [ ] T4.4.1: Campaigns, donation records, donors
  - [ ] T4.4.2: Volunteers, beneficiaries
  - [ ] T4.4.3: Success stories, testimonials
  - [ ] T4.4.4: Blog posts, FAQ, partners
- [ ] T4.5: Seed Travels platform data
  - [ ] T4.5.1: Packages, itineraries
  - [ ] T4.5.2: Bookings, customers, payments
  - [ ] T4.5.3: Reviews, resources, courses
  - [ ] T4.5.4: Blog posts, gallery

---

## Phase 2: Shared Layout & Navigation

### T5: Layouts
- [ ] T5.1: BaseLayout.astro (HTML shell, head, fonts, theme)
- [ ] T5.2: PlatformLayout.astro (header, nav, footer wrapper)
- [ ] T5.3: AdminLayout.astro (sidebar, topbar, content)

### T6: Navigation Components
- [ ] T6.1: Header (logo, nav, platform switcher, theme toggle)
- [ ] T6.2: BottomNav (mobile bottom tab bar)
- [ ] T6.3: Footer (links, contact, social, newsletter)
- [ ] T6.4: PlatformSwitcher dropdown
- [ ] T6.5: Mobile menu (slide-in drawer)

### T7: Landing Page
- [ ] T7.1: Platform chooser landing page (`/`)
- [ ] T7.2: Brand hero with platform cards
- [ ] T7.3: Quick navigation to each platform

---

## Phase 3: School Platform (`/school`)

### T8: School Public Pages
- [ ] T8.1: Homepage (hero, mission/vision, features, classes, programs, CTA)
- [ ] T8.2: About Us page
- [ ] T8.3: Programs archive + single
- [ ] T8.4: Admission info + multi-step form
- [ ] T8.5: Classes directory archive + single
- [ ] T8.6: Calendar & events
- [ ] T8.7: News & blog archive + single
- [ ] T8.8: Gallery (photo/video)
- [ ] T8.9: E-payment page
- [ ] T8.10: E-commerce store (archive, single, cart, checkout)
- [ ] T8.11: E-library (archive + single with PDF viewer)
- [ ] T8.12: Wiki knowledgebase
- [ ] T8.13: E-courses (archive + single)
- [ ] T8.14: Contact page

### T9: School Admin Panel
- [ ] T9.1: Admin dashboard
- [ ] T9.2: Content management (pages, blog, announcements, events, gallery)
- [ ] T9.3: Academic management (students, staff, classes, programs)
- [ ] T9.4: Admission management pipeline
- [ ] T9.5: LMS management (courses, lessons, quizzes, assignments)
- [ ] T9.6: Online exam system
- [ ] T9.7: Student portal
- [ ] T9.8: Payment system
- [ ] T9.9: Shop management
- [ ] T9.10: Media manager

---

## Phase 4: Masjid Platform (`/masjid`)

### T10: Masjid Public Pages
- [ ] T10.1: Homepage (prayer times, announcements, Quran player, events)
- [ ] T10.2: About the masjid
- [ ] T10.3: Activities & programs
- [ ] T10.4: Media library (audio, video, books)
- [ ] T10.5: Audio player library (full-featured player)
- [ ] T10.6: 24/7 Quran player (floating mini-player)
- [ ] T10.7: Events calendar
- [ ] T10.8: Blog
- [ ] T10.9: Donation page
- [ ] T10.10: Contact page

### T11: Masjid Admin Panel
- [ ] T11.1: Admin dashboard
- [ ] T11.2: Prayer time management (manual + CSV)
- [ ] T11.3: Events & programs management
- [ ] T11.4: Audio library management (archive.org integration)
- [ ] T11.5: Bookstore management
- [ ] T11.6: Donation management
- [ ] T11.7: Blog management
- [ ] T11.8: Gallery management
- [ ] T11.9: Live stream management
- [ ] T11.10: Quran player config

---

## Phase 5: Charity Platform (`/charity`)

### T12: Charity Public Pages
- [ ] T12.1: Homepage (hero, campaigns, impact, how to help, stories)
- [ ] T12.2: About Us
- [ ] T12.3: Projects & campaigns (archive + single)
- [ ] T12.4: How to Help
- [ ] T12.5: Blog
- [ ] T12.6: FAQ
- [ ] T12.7: Testimonials
- [ ] T12.8: Success stories/showcases
- [ ] T12.9: Contact page

### T13: Charity Admin Panel
- [ ] T13.1: Admin dashboard
- [ ] T13.2: Campaigns management
- [ ] T13.3: Donation management
- [ ] T13.4: Donor management
- [ ] T13.5: Volunteer management
- [ ] T13.6: Beneficiary database (encrypted)
- [ ] T13.7: Impact tracker
- [ ] T13.8: Success stories management
- [ ] T13.9: Testimonials management
- [ ] T13.10: Blog management
- [ ] T13.11: Financial reports
- [ ] T13.12: Charity shop (optional)

---

## Phase 6: Travels Platform (`/travels`)

### T14: Travels Public Pages
- [ ] T14.1: Homepage (featured packages, categories, reviews)
- [ ] T14.2: About Us
- [ ] T14.3: Hajj & Umrah services
- [ ] T14.4: Local/International tours
- [ ] T14.5: Booking page (full flow)
- [ ] T14.6: Reviews
- [ ] T14.7: Travel guide & resources
- [ ] T14.8: Blog
- [ ] T14.9: Courses (LMS) archive + single

### T15: Travels Admin Panel
- [ ] T15.1: Admin dashboard
- [ ] T15.2: Package management
- [ ] T15.3: Booking management
- [ ] T15.4: Payment management
- [ ] T15.5: Dynamic pricing
- [ ] T15.6: Customer management
- [ ] T15.7: Customer dashboard (user-facing)
- [ ] T15.8: Travel resource library
- [ ] T15.9: LMS management
- [ ] T15.10: Review management
- [ ] T15.11: Blog management
- [ ] T15.12: Gallery management

---

## Phase 7: Authentication & Security

### T16: Auth System
- [ ] T16.1: Admin login page
- [ ] T16.2: Session management (HTTP-only cookies)
- [ ] T16.3: Auth middleware for admin routes
- [ ] T16.4: Role-based access control
- [ ] T16.5: Password hashing (bcrypt)
- [ ] T16.6: Logout functionality

### T17: Security Hardening
- [ ] T17.1: CSRF protection on forms
- [ ] T17.2: Input validation on all endpoints
- [ ] T17.3: Rate limiting on auth endpoints
- [ ] T17.4: HTML sanitization for user content
- [ ] T17.5: File upload validation
- [ ] T17.6: Security headers (CSP, XSS, etc.)

---

## Phase 8: Battle Testing & Polish

### T18: Testing
- [ ] T18.1: Test all public page renders
- [ ] T18.2: Test all form submissions
- [ ] T18.3: Test admin CRUD operations
- [ ] T18.4: Test theme toggle on all pages
- [ ] T18.5: Test responsive (mobile, tablet, desktop)
- [ ] T18.6: Test payment/donation flows
- [ ] T18.7: Test search and filtering
- [ ] T18.8: Test LMS progress tracking

### T19: Performance & SEO
- [ ] T19.1: Image optimization
- [ ] T19.2: Meta tags and OG tags
- [ ] T19.3: Sitemap generation
- [ ] T19.4: Robots.txt
- [ ] T19.5: Lighthouse audit pass

### T20: Final Polish
- [ ] T20.1: Consistent branding across platforms
- [ ] T20.2: Loading states everywhere
- [ ] T20.3: Error states everywhere
- [ ] T20.4: Empty states everywhere
- [ ] T20.5: Accessibility audit

---

## Commit Cadence Reminder

- Commit after EVERY sub-sub-task (T_x_y_z) completion
- Run build before every commit
- Push to `origin/main` immediately after commit
- Verify push by commit hash
- Commit message starts AND ends with full adhkar

---

Bismillah Ar-Rahman Ar-Raheem. Ash-hadu an laa ilaaha illa-Llah wahdaHu lasharikalaHu, wa ash-hadu anna Muhammadan Abduhu wa Rasooluh. Laa hawla wa laa quwwata illaa biLLAH. Hasbiyallaahu laa ilaaha illaa Huwa, 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Azeem. SubhaanALLAH wa bihamdih, SubhaanALLAHil-'Azeem, AlhamduliLLAH, Laa ilaaha illa-ALLAH, wa ALLAHU AKBAR, walaa hawla walaa quwwata illaa biLLAH. Astaghfirullaaha wa atoobu ilayh.
