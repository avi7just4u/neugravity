# NeuGravity — Route Inventory & 404 Audit

Generated: 2026-09-28 (Phase 4.5 Rescue Sprint)

---

## Executive Summary

- **59 page files** across public + admin route groups
- **5 routes returning 500** in production (root cause: ISR + `createServiceClient()` incompatibility)
- **2 WRONG_HREF** in homepage (links to non-existent route patterns)
- **3 MISSING_DATA** — learning paths are `status=draft` so `/learn/[slug]` always 404s
- **5 admin directories** with no `page.tsx` (stub directories)
- **All primary nav links resolve** (200)
- **No sensitive data exposed** via broken routes

---

## 1. Complete Route Inventory

### Public Pages

| Route | Source | Dynamic | DB-Dependent | Exists | HTTP Status |
|---|---|---|---|---|---|
| `/` | filesystem | no | yes (homepage sections) | yes | **200** |
| `/tech` | filesystem | no | yes | yes | **200** |
| `/tech/[slug]` | filesystem | yes | yes | yes | **200** |
| `/news` | filesystem | no | yes | yes | **200** |
| `/news/[slug]` | filesystem | yes | yes | yes | **500** ⚠️ |
| `/tools` | filesystem | no | yes | yes | **200** |
| `/tools/[slug]` | filesystem | yes | yes | yes | **200** |
| `/compare` | filesystem | no | yes | yes | **200** |
| `/compare/[slug]` | filesystem | yes | yes | yes | **500** ⚠️ |
| `/companies` | filesystem | no | yes | yes | **200** |
| `/companies/[slug]` | filesystem | yes | yes | yes | **500** ⚠️ |
| `/learn` | filesystem | no | yes | yes | **200** |
| `/learn/[slug]` | filesystem | yes | yes | yes | **404** (draft data) |
| `/learn/dashboard` | filesystem | no | yes (auth) | yes | **307** (→login) |
| `/learn/paths` | filesystem | no | no | **NO** | 404 (no page.tsx) |
| `/learn/paths/[slug]` | filesystem | yes | yes | **NO** | **404** WRONG_HREF |
| `/courses` | filesystem | no | yes | yes | **200** |
| `/courses/[slug]` | filesystem | yes | yes | yes | **500** ⚠️ |
| `/courses/[slug]/lessons/[lessonId]` | filesystem | yes | yes | yes | **307** (→login when not enrolled) |
| `/interviews` | filesystem | no | yes | yes | **200** |
| `/interviews/[slug]` | filesystem | yes | yes | yes | unknown (no data) |
| `/articles` | filesystem | no | yes | yes | **200** |
| `/articles/[slug]` | filesystem | yes | yes | yes | **500** ⚠️ |
| `/work` | filesystem | no | partial | yes | **200** |
| `/work/[topic]` | homepage | yes | no | **NO** | **404** MISSING_ROUTE |
| `/companies` | nav | no | yes | yes | **200** |
| `/status` | filesystem | no | yes | yes | **200** |
| `/community` | filesystem | no | no | yes | **200** |
| `/enterprise` | filesystem | no | no | yes | **200** |
| `/about` | filesystem | no | no | yes | **200** |
| `/contact` | filesystem | no | no | yes | **200** |
| `/privacy` | filesystem | no | no | yes | **200** |
| `/terms` | filesystem | no | no | yes | **200** |
| `/search` | filesystem | no | yes | yes | **200** |
| `/login` | filesystem | no | no | yes | **200** |
| `/signup` | filesystem | no | no | yes | **200** |
| `/forgot-password` | filesystem | no | no | yes | **200** |
| `/reset-password` | filesystem | no | no | yes | unknown |
| `/sitemap.xml` | filesystem (sitemap.ts) | no | yes | yes | **200** |

### Admin Pages

| Route | Exists | HTTP (unauth) | Notes |
|---|---|---|---|
| `/admin` | yes | 307 → /login | correct |
| `/admin/editorial` | yes | 307 | correct |
| `/admin/editorial/review` | yes | 307 | correct |
| `/admin/editorial/news/[id]` | yes | 307 | correct |
| `/admin/education` | yes | 307 | correct |
| `/admin/education/courses` | yes | 307 | correct |
| `/admin/education/courses/[id]` | yes | 307 | correct |
| `/admin/education/paths` | yes | 307 | correct |
| `/admin/education/paths/[id]` | yes | 307 | correct |
| `/admin/knowledge` | yes | 307 | correct |
| `/admin/knowledge/[slug]/explanations` | yes | 307 | correct |
| `/admin/content-opportunities` | yes | 307 | correct |
| `/admin/content-opportunities/[id]` | yes | 307 | correct |
| `/admin/content-calendar` | yes | 307 | correct |
| `/admin/content/tools/changes` | yes | 307 | correct |
| `/admin/sources` | yes | 307 | correct |
| `/admin/sources/new` | yes | 307 | correct |
| `/admin/ingestion/sources` | yes | 307 | correct |
| `/admin/freshness` | yes | 307 | correct |
| `/admin/system/automation` | yes | 307 | correct |
| `/admin/system/jobs` | yes | 307 | correct |
| `/admin/system/health` | yes | 307 | correct |
| `/admin/system/audit` | yes | 307 | correct |
| `/admin/system/ai` | yes | 307 | correct |
| `/admin/system/notifications` | yes | 307 | correct |
| `/admin/analytics` | **NO page.tsx** | 404 | stub directory |
| `/admin/seo` | **NO page.tsx** | 404 | stub directory |
| `/admin/settings` | **NO page.tsx** | 404 | stub directory |
| `/admin/users` | **NO page.tsx** | 404 | stub directory |
| `/admin/ingestion` | **NO page.tsx** | 404 | stub directory |

### API Routes (key ones)

| Route | Auth Required | Status |
|---|---|---|
| `/api/search` | no | working |
| `/api/auth/login` | no | working |
| `/api/auth/logout` | no | working |
| `/api/enroll/[courseId]` | yes | working |
| `/api/progress/[lessonId]` | yes | working |
| `/api/quiz/[quizId]` | yes | working |
| `/api/admin/opportunities` | admin | 401 for unauth ✅ |
| `/api/admin/editorial/*` | admin | 401 for unauth ✅ |
| `/api/cron/*` | cron-auth | internal |
| `/api/worker/*` | internal | internal |

---

## 2. Broken Routes — Detailed Diagnosis

### 🔴 P0: Production 500 Errors (5 routes)

**Root Cause:** Pages using `revalidate = N` (ISR) that call services using `createServiceClient()`. That function calls `cookies()` from `next/headers`, which is **not available during ISR background revalidation** — it requires an active HTTP request context. Result: runtime exception → 500.

Pages with `force-dynamic` (e.g. `/tools/[slug]`) work correctly because they always have a request context.

| Route | Service | Client Used | Revalidate | Diagnosis |
|---|---|---|---|---|
| `/news/[slug]` | ContentService.getNewsBySlug | `createServiceClient()` | 60s | ISR + cookies() crash |
| `/articles/[slug]` | ContentService.getArticleBySlug | `createServiceClient()` | 300s | ISR + cookies() crash |
| `/compare/[slug]` | ComparisonService.getComparisonBySlug | `createServiceClient()` | 3600s | ISR + cookies() crash |
| `/companies/[slug]` | CompanyService.getCompanyBySlug | `createServiceClient()` | 3600s | ISR + cookies() crash |
| `/courses/[slug]` | CourseService + EnrollmentService | `createAnonClient()` + `createClient()` | 300s | `createClient()` via EnrollmentService calls `cookies()` |

**Fix**: Change these pages to `export const dynamic = "force-dynamic"` OR change their services to use `createAnonClient()` (which does not call `cookies()`). For public content pages, `createAnonClient()` is correct because RLS should allow public reads.

---

### 🔴 P0: WRONG_HREF — Homepage links to non-existent route

**File:** `src/app/(public)/page.tsx` (line ~358)

```tsx
href={`/learn/paths/${path.slug}`}
```

This generates URLs like `/learn/paths/ai-foundations` but **no such route exists**. The correct route is `/learn/[slug]` → `/learn/ai-foundations`.

**Fix:** Change `href={`/learn/paths/${path.slug}`}` → `href={`/learn/${path.slug}`}`

---

### 🔴 P0: WRONG_HREF — Homepage links to /work/[topic] (no dynamic route)

**File:** `src/app/(public)/page.tsx` (line ~400)

```tsx
href={`/work/${topic.toLowerCase()}`}
```

Generates URLs like `/work/culture`, `/work/finance`. The `/work` page is **not dynamic** — there is no `[slug]` directory under `/work`. These links 404.

**Fix options:**
1. Remove the individual topic links and just link to `/work` 
2. Create a `/work/[topic]` dynamic route (more complex)

Recommended: Remove individual topic links until a proper work section is designed.

---

### 🟡 P1: MISSING_DATA — Learning paths all in draft status

All 5 learning paths in DB have `status = 'draft'`:
- `ai-foundations` → draft
- `ai-engineer` → draft  
- `cloud-engineer` → draft
- `software-engineering-foundations` → draft
- `technology-for-product-managers` → draft

`CourseService.getLearningPathBySlug()` filters `.eq("status", "published")` → returns null → `notFound()` → 404.

The `/learn` page renders paths but they resolve to 404 when clicked.

**Fix:** Either publish learning paths in the DB, or hide them from the `/learn` page until they're ready.

---

### 🟡 P1: MISSING_ROUTE — /learn/paths directory has no page.tsx

`src/app/(public)/learn/paths/` directory exists with `[slug]` subdirectory but **neither has a `page.tsx`**. The `[slug]` subdirectory is orphaned. The actual learning path route is `/learn/[slug]`.

**Fix:** Delete the empty `learn/paths/` and `learn/paths/[slug]` directories (they're unused). The homepage link fix above handles the href correction.

---

### ⚪ P3: Admin stub directories (not user-facing)

These admin directories exist but have no `page.tsx`. They 404 for authenticated admins navigating directly:
- `/admin/analytics`
- `/admin/seo`  
- `/admin/settings`
- `/admin/users`
- `/admin/ingestion`

No admin navigation currently links to these, so they're low priority. Worth noting for future admin nav work.

---

## 3. Navigation Audit

### Primary Navbar Links (all resolve correctly)

| Label | href | Status |
|---|---|---|
| Learn | /learn | ✅ 200 |
| News | /news | ✅ 200 |
| Tools | /tools | ✅ 200 |
| Compare | /compare | ✅ 200 |
| Tech | /tech | ✅ 200 |
| Companies | /companies | ✅ 200 |
| Work | /work | ✅ 200 |
| Interviews | /interviews | ✅ 200 |
| Community | /community | ✅ 200 |
| Enterprise | /enterprise | ✅ 200 |
| Sign in | /login | ✅ 200 |
| Get started | /signup | ✅ 200 |

### Footer Links

| Label | href | Status |
|---|---|---|
| Technology | /tech | ✅ 200 |
| News | /news | ✅ 200 |
| Tools | /tools | ✅ 200 |
| Compare | /compare | ✅ 200 |
| Learn | /learn | ✅ 200 |
| Courses | /courses | ✅ 200 |
| Companies | /companies | ✅ 200 |
| Interviews | /interviews | ✅ 200 |
| Inside Work | /work | ✅ 200 |
| Technology Status | /status | ✅ 200 |
| Community | /community | ✅ 200 |
| Learning Paths | /learn | ✅ 200 (correctly redirects to /learn not /learn/paths) |
| Enterprise Overview | /enterprise | ✅ 200 |
| AI Strategy | /enterprise#ai-strategy | ✅ 200 (anchor) |
| Technology Advisory | /enterprise#advisory | ✅ 200 (anchor) |
| Custom Training | /enterprise#training | ✅ 200 (anchor) |
| Architecture Review | /enterprise#architecture | ✅ 200 (anchor) |
| Contact Sales | /enterprise#contact | ✅ 200 (anchor) |
| About | /about | ✅ 200 |
| Contact | /contact | ✅ 200 |
| Privacy Policy | /privacy | ✅ 200 |
| Terms of Service | /terms | ✅ 200 |
| Sitemap | /sitemap.xml | ✅ 200 |

**Footer is clean — all links resolve.**

### Homepage Internal Links (problematic)

| Link | href | Status | Diagnosis |
|---|---|---|---|
| Tech section | /tech | ✅ | fine |
| Start Learning | /learn | ✅ | fine |
| Explore Tools | /tools | ✅ | fine |
| Tech entity cards | /tech/[slug] | ✅ | fine (Kubernetes, Docker etc.) |
| News cards | /news/[slug] | ⚠️ 500 | ISR bug |
| Tool cards | /tools/[slug] | ✅ | fine |
| Comparison cards | /compare/[slug] | ⚠️ 500 | ISR bug |
| Learning path cards | /learn/paths/[slug] | ❌ 404 | WRONG_HREF |
| Work topic links | /work/[topic] | ❌ 404 | MISSING_ROUTE |
| Enterprise CTA | /enterprise | ✅ | fine |

---

## 4. Recommendations (Prioritized)

### P0 — Fix immediately (users hitting broken production pages)

1. **Fix ISR + createServiceClient() incompatibility** — affects 5 public detail pages. Simplest fix: add `export const dynamic = "force-dynamic"` to `/news/[slug]`, `/articles/[slug]`, `/compare/[slug]`, `/companies/[slug]`, `/courses/[slug]`. Better fix: change their underlying services to use `createAnonClient()` for public reads (correct architectural approach — public pages don't need session cookies).

2. **Fix WRONG_HREF in homepage** — `/learn/paths/${path.slug}` → `/learn/${path.slug}`. One-line fix.

3. **Fix or remove `/work/[topic]` links** — homepage generates dead links. Remove the individual work topic links from the homepage until a proper `/work/[topic]` route exists.

### P1 — Fix before launch

4. **Publish or hide learning paths** — all 5 learning paths are `status=draft`. Either publish them (set `status=published` in DB for at least 2-3 ready paths) or remove them from the `/learn` page display until ready.

5. **Delete orphaned directories** — `src/app/(public)/learn/paths/` and `src/app/(public)/learn/paths/[slug]` are unused dead code directories.

### P3 — Housekeeping

6. **Admin stub directories** — Either create placeholder pages or remove the empty admin directories to avoid confusion for future developers.

7. **`/reset-password` page** — exists in filesystem but not tested (no link in nav/footer). Verify it works end-to-end with Supabase auth.

---

## Appendix: Route Source Map

### Routes reachable only from homepage (internal links)
- `/learn/paths/[slug]` — WRONG (should be `/learn/[slug]`)
- `/work/[topic]` — WRONG (no route exists)
- `/news/[slug]` — correct href, broken page (500)
- `/compare/[slug]` — correct href, broken page (500)
- `/tools/[slug]` — correct href, works (200)
- `/tech/[slug]` — correct href, works (200)

### Routes reachable from both nav and homepage
- `/learn`, `/news`, `/tools`, `/tech`, `/compare` — all 200

### Routes only reachable from footer
- `/about`, `/contact`, `/privacy`, `/terms`, `/sitemap.xml` — all 200

### Routes not in any navigation (orphan pages)
- `/search` — accessible via search bar interaction, not nav link
- `/forgot-password`, `/reset-password` — auth flow only
- `/learn/dashboard` — auth-gated, accessible post-login
- `/courses/[slug]/lessons/[lessonId]` — accessible post-enrollment
