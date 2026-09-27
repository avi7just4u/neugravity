# NEUGRAVITY — Product Truth

**Generated**: 2026-09-28 (Phase 4.4.2 Rescue Sprint)  
**Method**: 8 parallel read-only audit agents + integration synthesis  

---

## What NeuGravity Is (Right Now)

A tech intelligence and learning platform in active development. Phase 1–4.5 complete. Production at `neugravity.vercel.app`.

**Working**: tech pages, tools, comparisons, companies, news/articles/interviews (list views), search, admin editorial pipeline, auth, learn/dashboard.

**Broken**: 5 detail pages return 500 (ISR + cookies() conflict). Course detail broken. Homepage has 2 dead links.

**Missing**: No course content in DB (0 modules, 0 lessons). All learning paths are draft. og-image.png doesn't exist. rss.xml route doesn't exist but is declared.

---

## Live Production Status

| Route | Status | Notes |
|---|---|---|
| `/` | 200 | 2 WRONG_HREF (learning paths, work topics) |
| `/tech`, `/tech/[slug]` | 200 | Working — ISR 3600s |
| `/tools`, `/tools/[slug]` | 200 | Working — force-dynamic (could be ISR) |
| `/news` | 200 | Working |
| `/news/[slug]` | **500** | ISR + cookies() conflict |
| `/articles/[slug]` | **500** | ISR + cookies() conflict |
| `/compare/[slug]` | **500** | ISR + cookies() conflict |
| `/companies/[slug]` | **500** | ISR + cookies() conflict |
| `/interviews/[slug]` | unknown | No data to test |
| `/courses` | 200 | Working |
| `/courses/[slug]` | **500** | revalidate + createClient() conflict |
| `/courses/[slug]/lessons/[id]` | 307 | Redirects to login correctly |
| `/learn` | 200 | Shows empty state (all paths draft) |
| `/learn/[slug]` | 404 | All paths are status=draft |
| `/learn/dashboard` | 307 → login | Correct |
| `/work` | 200 | Working |
| `/work/[topic]` | 404 | Route doesn't exist (homepage links to it) |
| Admin routes | 307 → login | All protected correctly |

---

## Database Content Reality

| Content Type | Count | Published | is_demo | Notes |
|---|---|---|---|---|
| Technologies | ~50 | yes | mixed | Working |
| Tools | ~100 | yes | mixed | Working |
| News articles | 12+ | yes | **all is_demo=true** | Publicly visible — FILTER_DEMO_DATA not set in Vercel |
| Long-form articles | 6+ | yes | **all is_demo=true** | Same issue |
| Comparisons | 4 | yes | **all is_demo=true** | Same issue |
| Companies | 15 | yes | **all is_demo=true** | Same issue |
| Courses | 2+ | yes | mixed | 0 modules, 0 lessons — enrollment/metrics fabricated |
| Course modules | **0** | — | — | No real content |
| Course lessons | **0** | — | — | No real content |
| Learning paths | 5 | **all draft** | — | /learn always shows empty state |

**Critical**: `FILTER_DEMO_DATA` env var is NOT set in Vercel production. All is_demo=true content is publicly visible.

**Critical**: Enrollment metrics on course cards are fabricated DB values (enrollment_count=5230, rating_count=1240) — not real user data.

---

## Architecture (Accurate)

```
UI → Service → Repository → Supabase
```

Three Supabase clients:
- `createClient()` — anon + typed + **cookies()** → NOT safe for ISR pages
- `createAdminClient()` — service-role, no cookies → safe everywhere
- `createServiceClient()` — anon + **cookies()** → NOT safe for ISR pages

**Root cause of 500s**: pages with `revalidate = N` that call services using `createClient()` or `createServiceClient()`. During ISR background revalidation, there is no request context, so `cookies()` throws → 500.

**Fix chosen**: `export const dynamic = "force-dynamic"` on each broken page (page-level fix, no service layer changes).

---

## What Is NOT Real

- Hero stats: "500+ Technologies", "1200+ Tools", "50K+ Learners" — hardcoded, not from DB
- Learning path cards on homepage: hardcoded inline array with fake slugs pointing to `/learn/paths/[slug]` (wrong route)
- Course enrollment counts, ratings: fabricated seed data
- og-image.png: referenced everywhere, file doesn't exist
- rss.xml: declared in layout alternates, route doesn't exist

---

## Known Gaps Before Launch

**SEO**: robots.txt blocks `/courses/` for all crawlers including Googlebot. Canonical URL hardcoded to wrong domain.

**Mobile**: Course enrollment CTA is buried below entire curriculum on mobile. Hamburger button is 36px (below 44px minimum).

**Learning**: Quiz onComplete is a no-op — progress header doesn't update after quiz pass. Enrollment never marked "completed" even at 100%.

**Performance**: Middleware runs auth check on every public request (including ISR pages) → adds ~200-300ms TTFB to every page.

**Accessibility**: No skip-to-main link. ⌘K shortcut shown but not implemented. Mobile drawer has no focus trap.

---

## Phase Boundary

- Phase 4.5: COMPLETE (search signal pipeline, dedup, ingestion, admin UX)
- Phase 4.4.2 (this sprint): Rescue — fix broken routes, SEO, mobile UX, learner UX, accessibility
- Phase 5+: NOT STARTED, NOT PLANNED in this sprint (no community, payments, subscriptions, AI autopublish)
