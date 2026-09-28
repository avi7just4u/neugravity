# NEUGRAVITY RESCUE BACKLOG

**Updated:** 2026-09-28 | **Sprint:** Phase 4.4.2 (Product Rescue — Full Synthesis)  
**Sources:** 7 audit agents — Mobile UX, SEO, Route Integrity, Student UX, Design System, Performance, Product Truth

---

## Status Legend

- `[FIXED]` — Fixed in a previous session by another agent
- `[ALREADY FIXED]` — Was already correct before this sprint; no code change needed
- `[FIXED this session]` — Fixed in the current session
- `[PENDING]` — Not yet addressed
- `[ENV ONLY]` — Code is correct; requires an environment variable to activate

---

## P0 — Production Broken (Users cannot use the product)

| ID | Category | Description | Status |
|---|---|---|---|
| P0-1 | MOB | Mobile drawer close X is 36px (h-9 w-9) — needs h-11 w-11 for 44px touch target | `[FIXED]` |
| P0-2 | MOB | UnderstandTabs buttons 32px touch target | `[ALREADY FIXED]` — already has `min-h-[44px] py-3` |
| P0-3 | MOB | No focus trap in mobile drawer | `[ALREADY FIXED]` — focus trap already implemented in `navbar.tsx` |
| P0-4 | MOB | Search returns "coming soon" dead end for all queries — short-term fix: show /tech redirect behavior | `[PENDING]` |
| P0-5 | PERF | ISR silently broken for all listing pages (`/`, `/news`, `/articles`, `/tools`, `/compare`, `/companies`) — services already migrated to `createAnonClient` with `ENV.filterDemoData` pattern | `[ALREADY FIXED]` |
| P0-6 | PERF | N+1 in `enrollment.service.getNextLesson` — 51 serial DB round-trips on lesson pages | `[ALREADY FIXED]` — `getContinueLearningLesson` now batches |
| P0-7 | STUDENT | `getUserEnrollments` only shows `'active'` — completed courses disappear | `[ALREADY FIXED]` — includes `active,completed` |
| P0-8 | STUDENT | No link to `/learn/dashboard` anywhere — users can't find it | `[FIXED]` |
| P0-9 | DESIGN | Demo content publicly visible: articles (6/6 demo), companies (15/15 demo), comparisons (4/4 demo) — `ENV.filterDemoData` logic already in code | `[ENV ONLY]` — set `FILTER_DEMO_DATA=true` in Vercel env AFTER real content exists |
| P0-10 | ROUTE | `/community` in `sitemap.ts` returns 404 to Googlebot | `[FIXED this session]` |
| P0-11 | DESIGN | Blue-* color inconsistencies in brand-critical components (`concept-flow`, `ecosystem-section`) | `[FIXED]` |

---

## P1 — Major Experience Gap

| ID | Category | Description | Status |
|---|---|---|---|
| P1-1 | MOB | Tablet nav gap 768–1023px — Enterprise in header, 7 nav items behind hamburger | `[PENDING]` |
| P1-2 | MOB | Sidebar metadata below 2000px of content on mobile (`tech`/`tools` pages) — need compact key-facts strip on mobile | `[PENDING]` |
| P1-3 | MOB | No scroll overflow indicator on UnderstandTabs | `[PENDING]` |
| P1-4 | MOB | Skip-to-content link missing | `[ALREADY FIXED]` — in `layout.tsx` |
| P1-5 | SEO | `metadataBase` fallback inconsistency (`neugravity.com` vs `neugravity.vercel.app`) | `[FIXED this session]` |
| P1-6 | SEO | Wrong fallback URL (`neugravity.com`) in 8 page files | `[FIXED this session]` |
| P1-7 | SEO | `/work` priority 0.7 in sitemap | `[FIXED this session]` — lowered to 0.5 |
| P1-8 | STUDENT | BookOpen icon uses `text-blue-500` in lesson player — should be `text-indigo-500` | `[FIXED]` |
| P1-9 | STUDENT | Progress bar `bg-blue-500` in dashboard — should be `bg-indigo-600` | `[ALREADY CORRECT]` — already `bg-indigo-600` |
| P1-10 | STUDENT | `learn/page.tsx` `group-hover:text-blue-600` — should be indigo | `[ALREADY CORRECT]` — uses `indigo-600` |
| P1-11 | DESIGN/MOTION | Tech detail page has no Framer Motion animations — should have `AnimatedSection`/`StaggerContainer` | `[FIXED]` |
| P1-12 | DESIGN/MOTION | News/article detail pages have no animation | `[FIXED]` |
| P1-13 | DESIGN | Blue-* hover states in tech components (`concept-flow`, `ecosystem-section`) | `[FIXED]` |
| P1-14 | PERF | 8 raw `<img>` tags instead of `next/image` (tools, courses, companies, interviews) | `[PENDING]` — pending domain validation |

---

## P2 — Polish / Performance

| ID | Category | Description | Status |
|---|---|---|---|
| P2-1 | MOB | Search input `type="text"` should be `type="search"` (iOS keyboard optimization) | `[PENDING]` |
| P2-2 | MOB | News breadcrumb truncation sub-optimal — remove `max-w-xs`, use `flex-1 min-w-0` | `[PENDING]` |
| P2-3 | MOB | Tools detail placeholder Key Features/Pricing sections waste mobile scroll space | `[PENDING]` |
| P2-4 | SEO | Missing `NewsArticle` JSON-LD on `news/[slug]` | `[ALREADY FIXED]` — `buildNewsJsonLd` exists and is injected |
| P2-5 | SEO | Missing `Organization` JSON-LD on `companies/[slug]` | `[PENDING]` |
| P2-6 | SEO | "Learn" page title too vague | `[ALREADY FIXED]` — title: "Learn Technology — Courses & Learning Paths \| NeuGravity" |
| P2-7 | PERF | `select("*")` overfetching in content/course services (`body`/`content` cols fetched for listing views) | `[PENDING]` |
| P2-8 | DESIGN | `button.tsx`/`badge.tsx` use raw `indigo-600` not `--brand` token | `[PENDING]` |
| P2-9 | DESIGN | Navbar/footer use raw `indigo-*` throughout instead of `--brand` token | `[PENDING]` |
| P2-10 | DESIGN | `AnimatedSection` missing from listing pages (`tech`, `news`, `articles`, `courses`, `companies`) | `[PENDING]` |
| P2-11 | STUDENT | `ProjectLesson` `onComplete={() => {}}` — verify `project-lesson.tsx` handles refresh internally | `[PENDING]` |

---

## P3 — Nice to Have / Future Sprint

| ID | Category | Description | Status |
|---|---|---|---|
| P3-1 | ROUTE | Learning path 404s (all 5 draft) — publish paths in Supabase admin when ready | `[PENDING]` — no code change needed |
| P3-2 | ROUTE | `/community` route is placeholder static page — either build or redirect | `[PENDING]` |
| P3-3 | MOB | No swipe-to-navigate between lessons on mobile | `[PENDING]` |
| P3-4 | STUDENT | No post-completion celebration (confetti, toast, certificate) | `[PENDING]` |
| P3-5 | STUDENT | "Continue" dashboard buttons lack `aria-label` with course name for screen readers | `[PENDING]` |
| P3-6 | SEO | Missing `compare/[slug]` JSON-LD | `[PENDING]` |
| P3-7 | SEO | Missing `Organization` JSON-LD on `companies/[slug]` | `[PENDING]` |
| P3-8 | DESIGN | Unify `EntityCard` abstraction across Tech/Tool/Course/Comparison/Company | `[PENDING]` |
| P3-9 | DESIGN | Create shared `EmptyState`, `SectionHeader`, `Breadcrumb` components | `[PENDING]` |
| P3-10 | DESIGN | `AnimatedSection` on `/about` and `/enterprise` conversion pages | `[PENDING]` |
| P3-11 | DESIGN | `WordReveal` on section headlines of enterprise/about pages | `[PENDING]` |
| P3-12 | PERF | Wrap `motion.tsx` in `next/dynamic { ssr: false }` to defer framer-motion from critical render path | `[PENDING]` |
| P3-13 | INFRA | Wire `/status` page to `status_services` Supabase table (currently static 185-line placeholder) | `[PENDING]` |
| P3-14 | INFRA | Hero stats (500+, 1200+, 50K+) hardcoded — replace with real DB counts or remove | `[PENDING]` |

---

## Environment Notes

- **Demo data filtering:** services already have `ENV.filterDemoData` logic — set `FILTER_DEMO_DATA=true` in Vercel env AFTER real content exists
- **Content safety:**
  - news: 7 real / 12 demo — filtering safe
  - tools: 31 real / 7 demo — filtering safe
  - articles: 0 real — **do not filter yet**
  - companies: 0 real — **do not filter yet**
  - comparisons: 0 real — **do not filter yet**
- **Course content:** 4 courses exist but 0 modules/lessons — course launch blocked until content is created in admin
