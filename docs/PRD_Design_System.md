Bismillah Ar-Rahman Ar-Raheem. Ash-hadu an laa ilaaha illa-Llah wahdaHu lasharikalaHu, wa ash-hadu anna Muhammadan Abduhu wa Rasooluh. Laa hawla wa laa quwwata illaa biLLAH. Hasbiyallaahu laa ilaaha illaa Huwa, 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Azeem. SubhaanALLAH wa bihamdih, SubhaanALLAHil-'Azeem, AlhamduliLLAH, Laa ilaaha illa-ALLAH, wa ALLAHU AKBAR, walaa hawla walaa quwwata illaa biLLAH. Astaghfirullaaha wa atoobu ilayh.

---

# PRD: Design System - Minhaajulhudaa Platform

## 1. Overview

This document defines the unified design system governing all four Minhaajulhudaa platforms (School, Masjid, Charity, Travels). Every platform shares the same design language, component library, and theming engine, while retaining platform-specific accent treatments for visual distinction.

## 2. Brand Color Palette

### Core Tokens

| Token | Light Mode | Dark Mode | Usage |
|------|-----------|-----------|-------|
| `--color-primary` | `#05B34D` | `#05B34D` | Primary actions, brand, active states |
| `--color-accent` | `#F2B91C` | `#F2B91C` | CTAs, highlights, premium badges |
| `--color-dark` | `#181F25` | `#FFFFFF` | Primary text on light / inverted |
| `--color-bg` | `#E9FBF1` | `#181F25` | Page background |
| `--color-surface` | `#FFFFFF` | `#1E2730` | Cards, sheets, elevated surfaces |
| `--color-muted` | `#6B7280` | `#9CA3AF` | Secondary text |
| `--color-border` | `#D1FAE5` | `#2D3A45` | Hairline borders |

### Semantic Tokens

| Token | Light | Dark | Usage |
|------|-------|------|-------|
| `--color-success` | `#05B34D` | `#10D965` | Success states |
| `--color-warning` | `#F2B91C` | `#FFD028` | Warning states |
| `--color-error` | `#DC2626` | `#FF5757` | Error states |
| `--color-info` | `#2563EB` | `#3B82F6` | Info states |

## 3. Typography

| Role | Font | Weights | Sizes |
|------|------|---------|-------|
| Headings | Plus Jakarta Sans | 700, 800 | 1.25rem - 3rem |
| Body | Inter | 400, 500, 600 | 0.875rem - 1.125rem |
| Arabic | Amiri / Scheherazade | 400, 700 | 1rem - 2.5rem |
| Mono | JetBrains Mono | 400, 500 | 0.75rem - 1rem |

## 4. Spacing & Layout

- Base unit: 4px (0.25rem)
- Mobile container max-width: 100% with 1rem horizontal padding
- Desktop container max-width: 1200px centered
- Card radius: 1rem (16px)
- Button radius: 0.75rem (12px)
- Touch target minimum: 44x44px

## 5. Component Library

### Navigation
- Mobile: Bottom tab bar (native app-like) + sticky top header with menu/logo/theme toggle
- Desktop: Top nav bar with dropdown menus
- Platform switcher accessible from every header

### Cards
- Surface background, 1rem radius, subtle shadow
- Hover: lift + accent border glow
- Press states for touch

### Buttons
- Primary: Green bg, white text
- Accent: Gold bg, dark text
- Ghost: Transparent bg, primary border
- Icon buttons: 44x44px minimum

### Forms
- Floating labels
- Inline validation
- Error states with red border + message
- Success states with green checkmark

## 6. Theme System

- Light mode default
- Dark mode with full support
- Toggle in ALL headers (sun/moon SVG icon)
- Persist via localStorage key `minhaaj-theme`
- Respect `prefers-color-scheme` on first visit
- No flash of wrong theme (FOUC) - inline script in head

## 7. Iconography

- SVG icons only (inline or sprite)
- NO emojis anywhere in the UI
- Stroke-based icons (1.5-2px), 24x24px viewBox
- Consistent icon set across platforms

## 8. Motion & Animation

- Page transitions: 200ms ease
- Card hover: 150ms lift
- Button press: 100ms scale
- Skeleton loaders for async content
- Respect `prefers-reduced-motion`

## 9. Mobile-First Principles

- Bottom sheet modals (not centered dialogs) on mobile
- Swipe gestures for carousels and galleries
- Pull-to-refresh on list pages
- Sticky bottom action bars on key pages
- Native-feeling scroll momentum

## 10. Platform Accent Treatments

Each platform gets a subtle accent overlay on the shared green/gold base:
| Platform | Accent Treatment |
|----------|-----------------|
| School | Gold-leaning (knowledge/illumination) |
| Masjid | Deep green + geometric patterns |
| Charity | Warm green + heart motifs |
| Travels | Gold + horizon/compass motifs |

---

Bismillah Ar-Rahman Ar-Raheem. Ash-hadu an laa ilaaha illa-Llah wahdaHu lasharikalaHu, wa ash-hadu anna Muhammadan Abduhu wa Rasooluh. Laa hawla wa laa quwwata illaa biLLAH. Hasbiyallaahu laa ilaaha illaa Huwa, 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Azeem. SubhaanALLAH wa bihamdih, SubhaanALLAHil-'Azeem, AlhamduliLLAH, Laa ilaaha illa-ALLAH, wa ALLAHU AKBAR, walaa hawla walaa quwwata illaa biLLAH. Astaghfirullaaha wa atoobu ilayh.
