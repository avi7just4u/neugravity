# NeuGravity — Performance & Architecture Audit

**Date**: 2026-09-28  
**Auditor**: Agent 5 (Performance/Architecture)  
**Scope**: Read-only. No code was modified.

---

## 1. Measured Production TTFB

| Route | TTFB (cold) | TTFB (warm) | HTTP | Notes |
|---|---|---|---|---|
| `/` | 1.46s | 1.27s | 200 | ISR revalidate=60 but still slow warm |
| `/news` | 1.06s | 0.63s | 200 | ISR revalidate=60 |
| `/tools` | 1.07s | 0.65s | 200 | ISR revalidate=3600 |
| `/tech/kubernetes` | 0.12s | — | 200 | Excellent — ISR cache hit |
| `/learn` | 0.34s | — | 200 | Good |
| `/status` | 0.40s | — | 200 | Acceptable |
| `/courses/kubernetes-for-platform-engineers` | 0.92s | — | **500** | Runtime error — see §6 |

**Baseline observations:**
- `/tech/kubernetes` at 120ms proves ISR works when the cache is warm and no cookie-based rendering is needed.
- `/`, `/news`, `/tools` are 0.6–1.5s even warm — indicating either ISR regeneration on each benchmark request, or middleware overhead.
- The middleware runs a `supabase.auth.getUser()` on **every request** including public ISR pages — this adds a Supabase round-trip to cold renders.

---

## 2. Render Strategy — Current vs Recommended

| Route | Current | Recommended | Issue |
|---|---|---|---|
| `/` (homepage) | `revalidate=60` | `revalidate=300` | Regenerates too aggressively; 5 parallel DB queries on each regeneration |
| `/tech` (list) | `revalidate=3600` | `revalidate=3600` ✅ | Correct |
| `/tech/[slug]` | `revalidate=3600` | `revalidate=3600` ✅ | Good; generateStaticParams returns `[]` so no pre-built pages |
| `/tools` (list) | `revalidate=3600` | `revalidate=3600` ✅ | Correct |
| `/tools/[slug]` | `force-dynamic` | `revalidate=3600` | **Should not be force-dynamic** — no personalized content; see §5 |
| `/news` (list) | `revalidate=60` | `revalidate=300` | 60s is excessive; news doesn't change every minute |
| `/news/[slug]` | `revalidate=60` | `revalidate=3600` | News articles are immutable once published |
| `/learn` | `revalidate=300` | `revalidate=300` ✅ | Correct |
| `/learn/[slug]` (path) | `revalidate=300` | `revalidate=3600` | Learning path content rarely changes |
| `/courses` (list) | `revalidate=300` (assumed) | `revalidate=3600` | Course catalog is not volatile |
| `/courses/[slug]` | `revalidate=300` | **BROKEN** | Calls `createClient()` (uses cookies) — must be force-dynamic or restructured |
| `/courses/[slug]/lessons/[id]` | `force-dynamic` | `force-dynamic` ✅ | Correct — per-user progress |
| `/companies/[slug]` | `revalidate=3600` | `revalidate=3600` ✅ | Correct |
| `/compare/[slug]` | `revalidate=3600` | `revalidate=3600` ✅ | Correct |
| `/status` | `revalidate=120` | `revalidate=60` | Status should be fresher |
| `/learn/dashboard` | `force-dynamic` | `force-dynamic` ✅ | Correct — private |

---

## 3. Critical: Middleware Runs on All Public Routes

`src/middleware.ts` matcher:
```
/((?!_next/static|_next/image|favicon\.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)
```

This matches **every public page request** including ISR-cached pages. On each request, middleware calls `supabase.auth.getUser()` — a network round-trip to Supabase.

**Impact**: ISR pages served from Vercel's edge cache still incur Supabase auth latency on every request. This explains the consistently slow homepage TTFB (~1.3s warm) despite `revalidate=60` ISR.

**Recommendation**: Narrow the middleware matcher to only routes that need auth:
```typescript
matcher: ['/admin/:path*', '/api/admin/:path*', '/login', '/signup']
```
Public ISR pages do not need middleware auth checks.

---

## 4. Server/Client Boundary Issues

**"use client" components — all appropriately client-side:**
- `navbar.tsx` — 19 useState/useEffect/onClick hooks ✅ needs to be client
- `search-island.tsx` ✅ search input state
- `enroll-button.tsx` ✅ form interaction
- `mark-complete-button.tsx` ✅ mutation
- `understand-tabs.tsx` ✅ tab state
- `tech-page-analytics.tsx` ✅ useEffect for analytics ping
- Radix UI primitives (button, dialog, tabs, etc.) ✅ all correct

**Unnecessary "use client" — none found.** The island pattern is correctly applied.

**Admin components correctly client-side:** editor, reorder, actions — all need interactivity.

No server-renderable content is being pushed client-side unnecessarily.

---

## 5. `tools/[slug]` is Incorrectly `force-dynamic`

```typescript
export const dynamic = "force-dynamic"
```

The tool detail page has no personalized content, no cookies, no auth requirements for public users. `ToolService.getToolBySlug()` reads from `createClient()` which calls `cookies()` — that's what forced it to dynamic.

**Root cause**: `ToolService` uses `createClient()` (cookie-aware) instead of `createAnonClient()` for public reads.

**Fix**: Switch tool public reads to `createAnonClient()` and set `revalidate=3600`. This would serve tool pages from CDN edge cache — potentially 10-50x faster for uncached tool pages.

---

## 6. `courses/[slug]` 500 Error

Production URL `https://neugravity.vercel.app/courses/kubernetes-for-platform-engineers` returns HTTP 500.

The page:
1. Has `revalidate=300` but calls `await createClient()` (which calls `cookies()`)
2. Calling `cookies()` in a page with `revalidate` set causes a conflict — Next.js may error
3. The `EnrollmentService.getCurrentUserId()` triggers this via `createClient()`

**Actual error**: likely a runtime exception from `cookies()` being called in an ISR segment. The page should either:
- Be `force-dynamic` (since it checks enrollment), OR
- Split into a static shell + client island for the enrollment-aware portion

---

## 7. Database Query Issues

### Critical: `select("*")` Overfetching

| Service | Location | Table | Impact |
|---|---|---|---|
| `technology.service.ts` | `getBySlug()` line ~62 | `technologies` | Fetches all columns including large text fields |
| `technology.service.ts` | `getWithRelationships()` line ~121 | `technologies` | Fetches all columns; then joins 8 related tables |
| `technology.service.ts` | line ~136 | `technology_explanations` | All explanation columns including full content |
| `course.service.ts` | 6+ locations | `courses`, `modules`, `lessons` | All columns on multiple tables |
| `content.service.ts` | 2 locations | various | All columns |

### N+1 Pattern: Course Modules

Both `getCourseWithCurriculum` (public) and `adminGetCourseWithCurriculum` (admin) use:

```typescript
const modulesWithLessons = await Promise.all(
  moduleList.map(async (mod) => {
    const { data: lessons } = await db.from("lessons").select("*").eq("module_id", mod.id)
    return { ...mod, lessons }
  })
)
```

This is N queries for N modules — not an N+1 (it's parallel via `Promise.all`), but it is still N round-trips to Supabase. For a course with 5 modules: 1 (course) + 1 (modules) + 5 (lessons) = 7 queries. Can be resolved with a joined select or a single query fetching all lessons by course_id.

### Sequential Fallback on Homepage

```typescript
// Line 102-104: runs AFTER the parallel Promise.all
const latestNews = featuredNews.data.length > 0
  ? featuredNews.data
  : await ContentService.getPublishedNews({ perPage: 4 }).then(r => r.data)
```

If no featured news exists (likely in current seed state), this fires a **second sequential query** after the first Promise.all completes — adding 200-400ms to homepage render time.

---

## 8. Image Optimization

**No `next/image` used anywhere** (0 files). All 8 `<img>` tags are raw HTML elements.

Files with raw `<img>`:
- `tools/page.tsx` — tool icons from Supabase storage
- `tools/[slug]/page.tsx` — tool logo
- `courses/page.tsx` — course thumbnails
- `interviews/page.tsx` — interview thumbnails
- `interviews/[slug]/page.tsx` — interview hero
- `companies/page.tsx` — company logos
- `companies/[slug]/page.tsx` — company logo

**Impact**: No automatic WebP/AVIF conversion, no lazy loading, no size optimization, no LCP optimization for hero images.

**Note**: `next.config.ts` has `formats: ["image/avif", "image/webp"]` and correct `remotePatterns` configured — next/image would work immediately for Supabase, Unsplash, Wikimedia, and GitHub CDN.

**Exception**: Tools icons from external domains not in `remotePatterns` (e.g., tool vendor CDNs) would need to stay as `<img>`.

---

## 9. Bundle Concerns

**No heavy dependencies detected:**
- `date-fns` is used only for `formatDistanceToNow` in 2 files — tree-shaking keeps this small
- No Lodash, Moment, Chart.js, D3, Three.js, Framer Motion, or animation libraries
- No PDF, Excel, or large editor libraries
- Radix UI is correctly imported per-primitive (not the entire library)
- `@anthropic-ai/sdk` is server-only (AI service); not bundled into client

**Bundle risk factors:**
- `cmdk` (command palette) — only used in one place, acceptable
- Radix UI: 20+ primitives imported — these are tree-shaken individually but add up to significant total
- `next-themes` — small, acceptable

**No critical bundle issues** at current scale.

---

## 10. Fonts

Two Google Fonts loaded via `next/font/google` (Geist, Geist Mono):
- ✅ Correct — next/font handles subsetting, self-hosting, preloading, and no FOUT
- ✅ Latin subset only

---

## 11. Security Headers

Headers set globally:
- `X-Content-Type-Options: nosniff` ✅
- `X-Frame-Options: DENY` ✅
- `X-XSS-Protection: 1; mode=block` ✅
- `Referrer-Policy: strict-origin-when-cross-origin` ✅
- `Permissions-Policy: camera=(), microphone=(), geolocation=()` ✅
- API routes: `Cache-Control: no-store` ✅

Missing: `Content-Security-Policy` (not set — medium priority)

---

## 12. Prioritized Recommendations

### P0 — Fix immediately

1. **`/courses/[slug]` returns 500** — Add `export const dynamic = "force-dynamic"` to `courses/[slug]/page.tsx` to resolve the `cookies()` in ISR conflict. The page reads user enrollment, so it should be dynamic anyway.

2. **Middleware hitting all public routes** — Narrow matcher to admin/auth routes only. This is likely the primary cause of 1.3s warm homepage TTFB.

### P1 — Major performance improvement

3. **`tools/[slug]` force-dynamic → ISR** — Switch `ToolService` public reads from `createClient()` to `createAnonClient()`, change page to `revalidate=3600`. Tool pages are pure content; no personalization needed.

4. **Fix select("*") in hot paths** — At minimum: `TechnologyService.getBySlug()`, `TechnologyService.getWithRelationships()`, `CourseService.getCourseWithCurriculum()`. Specify exact columns to reduce payload size and improve query planning.

5. **Homepage sequential news fallback** — Run both `featured=true` and `featured=false` queries in the initial `Promise.all` to eliminate the sequential fallback fetch.

6. **Course module N+1 → single query** — Fetch all lessons by `course_id` in one query and group in JavaScript, eliminating per-module round-trips.

### P2 — Meaningful improvements

7. **Add `next/image`** to `courses/page.tsx` (thumbnails are LCP candidates), `tools/[slug]/page.tsx` (logo), `companies/[slug]/page.tsx` (logo). These are on controlled domains in `remotePatterns`.

8. **Increase `revalidate` for immutable content** — `news/[slug]` to 3600, `/learn/[slug]` to 3600. Published articles don't change.

9. **Add `Content-Security-Policy` header** to `next.config.ts`.

### P3 — Polish

10. **Add `priority` prop** to first-fold images once next/image is adopted (LCP optimization).

11. **Reduce Radix UI surface** — only import primitives actually used to minimize initial JS parse time.

---

## Summary

| Area | Status |
|---|---|
| ISR strategy (tech/tools list) | ✅ Correct |
| ISR strategy (tool detail) | ❌ force-dynamic unnecessarily |
| ISR strategy (course detail) | ❌ `revalidate` + `cookies()` conflict → 500 |
| Middleware scope | ❌ Hits all public routes — adds Supabase latency to every request |
| Server/client boundaries | ✅ Correct — islands pattern properly applied |
| Image optimization | ❌ No next/image anywhere |
| select("*") overfetch | ❌ Multiple hot paths |
| Course module queries | ⚠️ N-round-trips (parallelized but avoidable) |
| Homepage waterfall | ⚠️ Sequential fallback fetch if no featured news |
| Bundle size | ✅ No heavy dependencies |
| Fonts | ✅ next/font correctly configured |
| Security headers | ✅ Good (missing CSP) |
| TTFB best case | ✅ 120ms (`/tech/kubernetes` warm ISR) |
| TTFB worst case | ❌ 1.46s (homepage cold, middleware overhead) |
