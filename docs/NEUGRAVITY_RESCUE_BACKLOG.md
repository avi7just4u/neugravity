# NEUGRAVITY RESCUE BACKLOG
**Updated:** 2026-09-28 | **Sprint:** Phase 4.4.2 (Product Rescue Round 2)  
**Sources:** 6 audit agents — SEO, Route Integrity, Mobile UX, Student UX, Design System, Product Truth

---

## What Was Fixed This Sprint

| Commit | Fix |
|---|---|
| 93d60e4 | Canonical URL domain standardized (all pages → `neugravity.vercel.app`) |
| 93d60e4 | `/community` and `/work` removed from sitemap (were 404s) |
| 93d60e4 | `NewsArticle` JSON-LD added to `news/[slug]` |
| 93d60e4 | `Organization` JSON-LD added to `companies/[slug]` |
| 93d60e4 | Learn page title: "Learn" → "Learn Technology — Courses & Learning Paths" |
| 147d5de | N+1 in `getContinueLearningLesson` fixed (30+ queries → 3) |
| 831e8bd | Focus trap in mobile drawer dialog (WCAG 2.5.3) |

---

## P0 — Data / Content Blockers

### P0-1: No published learning paths
All 5 paths are `status=draft` → `/learn` shows empty state, `/learn/[slug]` returns 404.  
**Fix:** Publish at least one path in the Supabase admin panel. No code change needed.

### P0-2: Courses have zero modules/lessons
Enrollment API works, but courses have no content to progress through.  
**Fix:** Add real content via admin UI before marketing any course.

### P0-3: Demo content visible in production
All news, articles, comparisons, companies have `is_demo=true` and are publicly indexed.  
`FILTER_DEMO_DATA` env var not set in Vercel.  
**Fix:** Set `FILTER_DEMO_DATA=true` in Vercel env vars. Verify service-layer filtering is applied.

---

## P1 — Critical UX

### P1-1: No link to `/learn/dashboard` anywhere in the product
Users with enrolled courses cannot reach their dashboard without knowing the URL directly.  
No link in navbar, `/learn` page, or course pages.  
**Fix (minimal):** Add "My Learning →" CTA to `/learn` page for authenticated users.  
**Full fix:** Auth-aware "My Learning" nav item in navbar.

### P1-2: Search dead end — all queries return "coming soon"
`/search` page shows a "coming soon" stub for every query. Mobile users who tap search, type, submit → hit a hard dead end.  
**Fix:** Redirect to `/tech?q=<query>` or show top-level entity lists as fallback. Remove the "coming soon" message.  
**File:** `src/app/(public)/search/search-island.tsx:83`

### P1-3: Tablet nav gap (768px–1023px)
At tablet widths, Enterprise link shows in header but all 7 core nav items are behind the hamburger. Core content (Learn, News, Tools) is less accessible than Enterprise at this breakpoint.  
**Fix:** Either hide Enterprise until `lg:`, or expose top 3 items at `md:`.  
**File:** `src/components/layout/navbar.tsx:129-134`

### P1-4: Tools page placeholder sections always rendered
"Key Features" and "Pricing" render as large empty cards (~300px each) on mobile even when no structured data exists for the tool. Every tool page wastes significant mobile scroll.  
**Fix:** Conditionally render sections only when data exists (`tool.features`, `tool.pricing_tiers`).  
**File:** `src/app/(public)/tools/[slug]/page.tsx:211-247`

### P1-5: Sidebar metadata unreachable on mobile (tech/tools)
`grid lg:grid-cols-3` collapses sidebar below all main content on mobile. Key facts are 2000px+ below fold.  
**Fix:** Add a compact key-facts strip immediately below the hero for mobile (`lg:hidden`).  
**Files:** `tech/[slug]/page.tsx`, `tools/[slug]/page.tsx`

---

## P2 — Quality

### P2-1: Add `id="main-content"` to layout main element
Skip-to-content link exists (`layout.tsx` has `<a href="#main-content">`), but no element has `id="main-content"`.  
**Fix:** Add `id="main-content"` to the `<main>` wrapper element.  
**File:** `src/app/layout.tsx` (2 min)

### P2-2: Learn page h1 uses raw Tailwind, not design system class
`<h1 className="text-4xl font-bold ...">` should use `.text-headline` for consistent responsive clamp.  
**File:** `src/app/(public)/learn/page.tsx:36` (2 min)

### P2-3: `compare/[slug]` missing JSON-LD
No structured data. Add `@type: ItemList` or two `SoftwareApplication` entities.

### P2-4: CSP header missing
No Content-Security-Policy set. Start in report-only mode in `next.config.ts`.

### P2-5: next/image for logo/icon images
Several pages use raw `<img>` with `eslint-disable`. Replace with `next/image`.  
**Files:** `tools/[slug]`, `companies/[slug]`

### P2-6: UnderstandTabs overflow indicator
No visual fade/gradient to show hidden tabs on narrow viewports.  
**Fix:** Add `mask-image: linear-gradient(to right, black 85%, transparent)` to tab container.

---

## P3 — Nice to Have

- Completion experience: no celebration, certificate, or next-course recommendation
- Auth-aware navbar "My Learning" item (full version — requires session state in layout)
- Hero stats hardcoded ("500+ Technologies", "50K+ Learners") — should be DB counts or removed
- `/work` reintroduced to sitemap at priority 0.5 (was accidentally removed; route exists)
- Dashboard "Continue" buttons: add `aria-label="Continue [course title]"` for screen readers

---

## Already Correct — Do Not Revisit

| Item | Status |
|---|---|
| ISR + cookies() → `force-dynamic` on 6 detail pages | ✅ e788695 |
| robots.txt unblocks `/courses/` | ✅ |
| Middleware narrowed to admin/auth routes | ✅ |
| Quiz onComplete wired to router.refresh() | ✅ |
| Enrollment marks status=completed at 100% | ✅ |
| getUserEnrollments returns active + completed | ✅ |
| Focus trap in mobile drawer | ✅ 831e8bd |
| N+1 in getContinueLearningLesson | ✅ 147d5de |
| Blue→Indigo in all public pages | ✅ |
| UnderstandTabs: 44px min-height | ✅ |
| Hamburger: 44px touch target | ✅ |
| Drawer close button: 44px touch target | ✅ |
| Mobile drawer: body scroll lock + aria-modal | ✅ |
| Search modal: type="search", ESC, autoFocus | ✅ |
| Framer Motion: useReducedMotion respected | ✅ |
