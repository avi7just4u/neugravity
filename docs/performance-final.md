# NeuGravity — Performance Final Audit

_Audited: 2026-09-28_

---

## 1. Render Strategy Map

| Route | Strategy | Revalidate | Notes |
|---|---|---|---|
| `/` (home) | ISR (declared) | 60 s | **Broken** — uses createServiceClient (see §2) |
| `/news` | ISR (declared) | 60 s | **Broken** — uses ContentService/createServiceClient |
| `/articles` | ISR (declared) | 300 s | **Broken** — uses ContentService/createServiceClient |
| `/news/[slug]` | force-dynamic | — | Correct: user-specific content |
| `/articles/[slug]` | force-dynamic | — | Correct |
| `/tools` | ISR (declared) | 3600 s | **Broken** — uses ToolService/createServiceClient |
| `/tools/[slug]` | force-dynamic | — | Correct |
| `/compare` | ISR (declared) | 3600 s | **Broken** — uses ComparisonService/createServiceClient |
| `/compare/[slug]` | force-dynamic | — | Correct |
| `/tech` | ISR | 3600 s | Clean — uses TechnologyService/createAnonClient |
| `/tech/[slug]` | ISR | 3600 s | Clean — uses TechnologyService/createAnonClient |
| `/companies` | ISR (declared) | 3600 s | **Broken** — uses CompanyService/createServiceClient |
| `/companies/[slug]` | force-dynamic | — | Correct |
| `/interviews` | ISR (declared) | 300 s | **Broken** — uses InterviewService/createServiceClient |
| `/interviews/[slug]` | force-dynamic | — | Correct |
| `/courses` | ISR | 300 s | Clean — uses CourseService/createAnonClient |
| `/courses/[slug]` | force-dynamic | — | Correct (enrollment-aware) |
| `/courses/[slug]/lessons/[lessonId]` | force-dynamic | — | Correct (progress tracking) |
| `/learn` | ISR | 300 s | Clean — uses CourseService/createAnonClient |
| `/learn/[slug]` | ISR | 300 s | Clean — uses CourseService/createAnonClient |
| `/learn/dashboard` | force-dynamic | — | Correct (authenticated) |
| `/status` | ISR | 120 s | Uses StatusService/createAdminClient — ISR-safe (no cookies()) |
| `sitemap.ts` | ISR | 3600 s | **Broken** — calls ToolService, ContentService, CompanyService, ComparisonService, InterviewService (all use createServiceClient) |
| All `/admin/**` | force-dynamic | — | Correct (admin, auth-required) |
| `/api/search` | — | Cache-Control s-maxage=60, swr=300 | HTTP-level caching only |
| All `/api/admin/**` | force-dynamic | — | Correct |

### generateStaticParams

All dynamic public routes return `[]` from `generateStaticParams`, disabling build-time pre-rendering and enabling full on-demand ISR. This is intentional per project convention.

---

## 2. ISR Blocker Analysis

### Root cause

`createServiceClient()` calls `cookies()` from `next/headers` internally. Next.js detects the `cookies()` call during ISR background revalidation and throws:

> _"cookies() was called inside a cached function..."_

This forces Next.js to treat the route as dynamic regardless of the declared `revalidate` value. The `revalidate = N` export is silently ignored — the page serves but never populates the ISR cache.

### Services using createServiceClient (ISR-incompatible)

| Service | File | Used by public routes |
|---|---|---|
| `ContentService` | `content.service.ts` | `/` (home), `/news`, `/articles`, `sitemap.ts` |
| `ToolService` | `tool.service.ts` | `/`, `/tools`, `sitemap.ts` |
| `CompanyService` | `company.service.ts` | `/companies`, `sitemap.ts` |
| `ComparisonService` | `comparison.service.ts` | `/`, `/compare`, `sitemap.ts` |
| `InterviewService` | `interview.service.ts` | `/interviews`, `sitemap.ts` |
| `ExplanationService` (partial) | `explanation.service.ts` | Admin-only reads; some methods use createServiceClient |

### Services already ISR-safe (using createAnonClient)

| Service | File | Public routes served |
|---|---|---|
| `TechnologyService` | `technology.service.ts` | `/tech`, `/tech/[slug]` |
| `CourseService` (read methods) | `course.service.ts` | `/courses`, `/learn`, `/learn/[slug]` |
| `KnowledgeService` (read methods) | `knowledge.service.ts` | Admin knowledge reads |

### Services using createAdminClient (ISR-safe — no cookies())

`createAdminClient()` uses the service-role key with no cookie dependency. It is ISR-safe. Services using it exclusively (audit, job, freshness, notification, ingestion, analytics, newsletter, deduplication, revision, tool-refresh, source, status, gap-analysis, ai, search-indexing, opportunity, enrollment) are unaffected.

### Net effect: pages stuck on full SSR

These high-traffic, cacheable listing pages currently run as full SSR on every request due to the createServiceClient blocker:

- `/` (home) — 60 s revalidate declared, never cached
- `/news` — 60 s declared, never cached
- `/articles` — 300 s declared, never cached
- `/tools` — 3600 s declared, never cached
- `/compare` — 3600 s declared, never cached
- `/companies` — 3600 s declared, never cached
- `/interviews` — 300 s declared, never cached
- `sitemap.ts` — 3600 s declared, never cached

---

## 3. Image Optimization

### Raw `<img>` tags found (should use `next/image`)

| File | Count | Field |
|---|---|---|
| `/app/(public)/tools/page.tsx:48` | 1 | `tool.icon_url` |
| `/app/(public)/tools/[slug]/page.tsx:68,149` | 2 | `tool.icon_url` |
| `/app/(public)/courses/page.tsx:30` | 1 | `c.thumbnail_url` |
| `/app/(public)/interviews/page.tsx:26` | 1 | `interview.thumbnail_url` |
| `/app/(public)/interviews/[slug]/page.tsx:67` | 1 | `interview.thumbnail_url` |
| `/app/(public)/companies/page.tsx:27` | 1 | `co.logo_url` |
| `/app/(public)/companies/[slug]/page.tsx:63` | 1 | `co.logo_url` |

**Total: 8 raw `<img>` tags** across 6 files. None receive automatic format conversion (AVIF/WebP), lazy loading, or blur placeholders. All appear above or near the fold on their respective listing pages — logo/thumbnail images are prime LCP candidates.

### next/image remotePatterns

Configured in `next.config.ts`:

```
*.supabase.co        — covers all Supabase Storage URLs
images.unsplash.com  — stock photography
upload.wikimedia.org — Wikipedia assets
*.githubusercontent.com — GitHub raw assets
```

Formats: `["image/avif", "image/webp"]` — correct, most aggressive compression enabled.

**Gap:** No wildcard pattern for arbitrary CDN domains. If `icon_url` or `thumbnail_url` values in the DB point to domains outside these four patterns, `next/image` will throw at runtime. Validate that all stored URLs fall within configured hostnames before migrating `<img>` to `<Image>`.

---

## 4. Bundle Analysis

### Framer Motion (5.6 MB in node_modules)

**Single import point:** `src/components/ui/motion.tsx` — all framer-motion usage is channeled through this barrel file. This is correct architecture.

**Consumer pages:**

| File | Imports |
|---|---|
| `/app/(public)/page.tsx` | `AnimatedSection`, `StaggerContainer`, `StaggerChild`, `WordReveal`, `AnimatedCard` + variants |

Only the home page (`/`) directly consumes the motion barrel. No other page files import from `@/components/ui/motion` or directly from `framer-motion`.

**Bundle impact assessment:**

- `motion.tsx` is marked `"use client"` — framer-motion is client-only and tree-shaken from server bundles.
- The barrel centralizes the import, so framer-motion enters only the client chunk(s) that include the home page.
- `useReducedMotion()` is properly wired — all animated components fall back to plain `<div>` when `prefers-reduced-motion` is set.
- **No dynamic import** wrapping exists. The full framer-motion client chunk loads synchronously with the home page. Since motion.tsx is only used on `/`, this is a ~150 KB (gzipped) cost for home page visitors only — acceptable given the single-page scope.
- **Optimization opportunity (P1):** Wrap `motion.tsx` exports in `next/dynamic` with `{ ssr: false }` to defer framer-motion out of the critical render path and improve TTI on the home page.

---

## 5. Query Analysis

### select("*") overfetching

57 instances of `.select("*")` found across services. High-impact cases by row/column width:

| Service | Location | Table | Risk |
|---|---|---|---|
| `course.service.ts` | 12 instances | courses, modules, lessons, enrollments | Wide tables — lessons/courses likely have content blobs |
| `content.service.ts` | 5 instances | news_items, articles | `body`/`content` columns likely large text |
| `knowledge.service.ts` | 4 instances | knowledge_nodes, edges | Graph nodes may have embedded content |
| `explanation.service.ts` | 4 instances | explanations | May include full markdown body |
| `source.service.ts` | 7 instances | sources | Credential/config fields transferred unnecessarily |
| `tool.service.ts` | 3 instances | tools | Includes all metadata even on listing views |
| `comparison.service.ts` | 4 instances | comparisons | Comparison data can be large nested JSON |
| `enrollment.service.ts` | 3 instances | enrollments, progress | Low risk — narrow tables |
| `status.service.ts` | 6 instances | status_checks, incidents | Low risk — structured status data |
| `notification.service.ts` | 4 instances | notifications | Low risk |

Most critical: `content.service.ts` listing queries (`getPublishedNews`, `getPublishedArticles`) select all columns including full body text, then render only title/slug/excerpt. This sends kilobytes of unused content per row on every listing page render.

### N+1 Patterns

**Confirmed N+1: `enrollment.service.ts` — `getNextLesson` method (lines 185–220)**

```
for (const mod of modules) {
  db.from("lessons").select(...).eq("module_id", mod.id)   // 1 query per module
  for (const lesson of lessons) {
    db.from("lesson_progress").select("status").eq("lesson_id", lesson.id)  // 1 query per lesson
  }
}
```

A course with 5 modules × 10 lessons = 51 sequential DB round-trips (1 module list + 5 lesson queries + up to 50 progress queries). This runs on every `/courses/[slug]/lessons/[lessonId]` page load (force-dynamic). Fix: fetch all lesson progress in one query with `.in("lesson_id", allLessonIds)` before the loop.

**No other confirmed N+1 loops** found in the other services checked (`learning-path.service.ts` not present — likely not yet implemented).

---

## 6. P0 Fixes

Items that directly impact Core Web Vitals or TTFB on production traffic today.

### P0-1: ISR is silently broken for all major listing pages

**Impact:** Every request to `/`, `/news`, `/articles`, `/tools`, `/compare`, `/companies`, `/interviews` hits the DB. No caching. TTFB scales with DB latency on every visitor.

**Fix:** Migrate `ContentService`, `ToolService`, `CompanyService`, `ComparisonService`, and `InterviewService` read methods from `createServiceClient()` to `createAnonClient()`. See §7 for the migration plan.

### P0-2: N+1 in enrollment.service.getNextLesson

**Impact:** Lesson player pages (`/courses/[slug]/lessons/[lessonId]`) are force-dynamic and authenticated — each page load fires up to 51 sequential DB round-trips. Directly raises TTFB for logged-in learners.

**Fix in `enrollment.service.ts`:**
1. Fetch all module IDs in one query (already done).
2. Fetch all lessons across all modules in one `.in("module_id", moduleIds)` query.
3. Fetch all progress rows in one `.in("lesson_id", allLessonIds).eq("user_id", userId)` query.
4. Walk the sorted result in memory — zero additional DB calls.

### P0-3: Raw `<img>` on above-fold LCP elements

**Impact:** Tool icons, course thumbnails, company logos, and interview thumbnails load without lazy loading, format optimization, or size hints. Browser cannot reserve layout space — causes layout shift (CLS). No AVIF/WebP served — larger payloads.

**Fix:** Replace all 8 `<img>` instances with `next/image`. Set explicit `width`/`height` or `fill` + parent `position: relative`. Verify `remotePatterns` covers all URLs stored in DB before switching.

### P0-4: Sitemap ISR is broken

**Impact:** `sitemap.ts` declares `revalidate = 3600` but calls five createServiceClient-backed services. The sitemap regenerates on every crawl request instead of being cached. Minor crawler overhead but also means Google always sees a freshly-generated (potentially inconsistent) sitemap.

**Fix:** Same as P0-1 — the sitemap migrates automatically once the underlying services switch to `createAnonClient`.

---

## 7. P1 Improvements — ISR Migration Plan

Priority order based on traffic and cache TTL gain.

### Migration template

For each affected service, replace:
```ts
import { createServiceClient } from "@/lib/supabase/server"
// ...
const supabase = await createServiceClient()
```
with:
```ts
import { createAnonClient } from "@/lib/supabase/server"
// ...
const supabase = createAnonClient()   // synchronous, no cookies() call
```

`createAnonClient` uses the anon key with no cookie dependency. RLS applies. Read-only public queries work identically. Admin write methods in the same service should keep `createAdminClient` (already service-role, already ISR-safe).

### Migration order

**Week 1 — highest traffic, shortest revalidate**

1. `content.service.ts` — unblocks `/` (60 s), `/news` (60 s), `/articles` (300 s), sitemap
   - Methods to migrate: `getPublishedNews`, `getPublishedArticles`, `getNewsBySlug`, `getArticleBySlug`, `getFeaturedContent`, `getRecentContent`
   - Opportunity: replace `select("*")` with narrow column lists on listing methods (exclude `body`, `content`, `metadata`)

2. `tool.service.ts` — unblocks `/tools` (3600 s), sitemap
   - Methods to migrate: `getPublishedTools`, `getToolBySlug`, `getAllTools`
   - Opportunity: listing query needs only `id, name, slug, tagline, icon_url, category` — not all columns

**Week 2 — medium traffic**

3. `comparison.service.ts` — unblocks `/compare` (3600 s), sitemap, home page comparison widget
   - Methods to migrate: `getComparisons`, `getComparisonBySlug`, `getFeaturedComparisons`

4. `interview.service.ts` — unblocks `/interviews` (300 s), sitemap
   - Methods to migrate: `getPublishedInterviews`, `getInterviewBySlug`

5. `company.service.ts` — unblocks `/companies` (3600 s), sitemap
   - Methods to migrate: `getCompanies`, `getCompanyBySlug`

**Week 3 — cleanup**

6. `explanation.service.ts` — partial migration. Methods `getExplanationsByTech` and `getExplanationBySlug` use createServiceClient. These serve the admin knowledge editor (already force-dynamic). Low urgency, but eliminate the pattern.

7. Narrow `select("*")` in `content.service.ts`, `tool.service.ts`, `course.service.ts` listing queries — separate PR per service, add TypeScript return types to enforce the column subset.

8. Wrap `src/components/ui/motion.tsx` re-exports in `next/dynamic({ ssr: false })` on the home page to defer framer-motion out of the critical render path.

### Expected outcome after migration

| Route | Before | After |
|---|---|---|
| `/` (home) | Full SSR, ~DB latency TTFB | ISR, CDN-cached, ~10 ms TTFB |
| `/news` | Full SSR | ISR 60 s |
| `/articles` | Full SSR | ISR 300 s |
| `/tools` | Full SSR | ISR 3600 s |
| `/compare` | Full SSR | ISR 3600 s |
| `/companies` | Full SSR | ISR 3600 s |
| `/interviews` | Full SSR | ISR 300 s |
| `sitemap.ts` | Full SSR | ISR 3600 s |

On-demand revalidation via `revalidatePath()` in `/api/worker/publish-content` already exists and will continue to work — ISR cache busted immediately on publish.
