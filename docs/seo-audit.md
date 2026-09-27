# NeuGravity — SEO / AI Discovery Audit

**Date**: 2026-09-28  
**Auditor**: Agent 6 (read-only)

---

## 1. Sitemap State

**File**: `src/app/sitemap.ts`  
**Revalidates**: every 3600s (1 hour) ✅

### Static routes included
`/`, `/tech`, `/news`, `/tools`, `/compare`, `/companies`, `/learn`, `/courses`, `/interviews`, `/work`, `/articles`, `/community`, `/status`, `/enterprise`, `/about`, `/contact`, `/privacy`, `/terms`

### Dynamic routes included
- `/tech/[slug]` — from TechnologyService ✅
- `/tools/[slug]` — from ToolService ✅
- `/news/[slug]` — from ContentService (published only) ✅
- `/articles/[slug]` — from ContentService (published only) ✅
- `/companies/[slug]` — from CompanyService ✅
- `/compare/[slug]` — from ComparisonService ✅
- `/courses/[slug]` — from CourseService ✅
- `/interviews/[slug]` — from InterviewService (published only) ✅

### Issues

| Issue | Severity |
|---|---|
| `/community` in sitemap — page is a placeholder with no real content | P1 |
| `/courses/` disallowed in robots.txt, but `/courses/[slug]` entries ARE in sitemap — crawlers blocked from verifying sitemap URLs | P0 |
| `/articles` and `/articles/[slug]` in sitemap — are there published articles in DB? If 0, empty sitemap sections are harmless but misleading | P2 |
| Base URL uses `process.env.NEXT_PUBLIC_SITE_URL ?? "https://neugravity.com"` — production env is `https://neugravity.vercel.app`, so all sitemap URLs are `neugravity.vercel.app` not `neugravity.com` | P1 |

---

## 2. Robots.txt State

**File**: `src/app/robots.ts`

### Disallowed for all crawlers
`/admin/`, `/api/`, `/login`, `/signup`, `/learn/dashboard`, `/courses/`

### Issues

| Issue | Severity |
|---|---|
| `/courses/` is disallowed — this blocks the entire course catalog AND individual course pages from indexing. Course detail pages (`/courses/[slug]`) are legitimate SEO targets and should be crawlable. Only `/courses/[slug]/lessons/` (the lesson player) and authenticated paths need blocking. | P0 |
| `/rss.xml` listed in `layout.tsx` alternates type link — no RSS route exists. This causes a broken alternate link in every page's `<head>`. | P1 |
| Sitemap URL in robots.txt uses env var — on Vercel production resolves to `neugravity.vercel.app/sitemap.xml`, not `neugravity.com/sitemap.xml` | P1 |

---

## 3. Per-Page Metadata Quality

| Page | Title | Description | Canonical | og:title | og:image | Twitter | noindex |
|---|---|---|---|---|---|---|---|
| Homepage `/` | ✅ Static, strong | ✅ | ✅ | ✅ | ✅ (but /og-image.png missing) | ✅ | No |
| `/tech/[slug]` | ✅ Dynamic, DB-driven | ✅ | ✅ | ✅ | ❌ None | ❌ No twitter card | No |
| `/tools/[slug]` | ✅ Dynamic | ✅ | ✅ | ✅ | ❌ None | ✅ summary | No |
| `/news/[slug]` | ✅ Dynamic | ✅ | ✅ | ✅ | ❌ None | ✅ summary_large_image | No |
| `/courses/[slug]` | ✅ Dynamic | ✅ | ✅ | ✅ | ❌ None | ❌ No twitter card | No (but robots.txt blocks path!) |
| `/companies/[slug]` | ✅ Dynamic | ✅ | ✅ | ✅ | ❌ None | ❌ None | No |
| `/compare/[slug]` | ✅ Dynamic | ✅ | ✅ | ✅ | ❌ None | ❌ None | No |
| `/interviews/[slug]` | ✅ Dynamic | ✅ | ✅ | ✅ | ❌ None | ❌ None | No |
| `/articles/[slug]` | ✅ Dynamic | ✅ | ✅ | ✅ | ❌ None | ❌ None | No |
| `/learn/[slug]` | ✅ Dynamic | ✅ | ✅ | ✅ | ❌ None | ❌ None | No |
| `/learn/dashboard` | Static | Static | ❌ No canonical | ❌ | ❌ | ❌ | ✅ noindex |
| `/courses/[slug]/lessons/[id]` | ✅ Dynamic | ❌ None | ❌ No canonical | ❌ | ❌ | ❌ | ✅ noindex |
| `/search` | ✅ | ✅ | ❌ No canonical | ❌ | ❌ | ❌ | ✅ noindex |
| `/status` | ✅ | ✅ | ❌ No canonical | ❌ | ❌ | ❌ | No |
| `/work` | ✅ | ✅ | ❌ No canonical | ❌ | ❌ | ❌ | No |
| `/enterprise` | ✅ | ✅ | ❌ No canonical | ❌ | ❌ | ❌ | No |
| `/community` | ✅ | ✅ | ❌ No canonical | ❌ | ❌ | ❌ | No (should be noindex — placeholder page) |

**Critical missing asset**: `/public/og-image.png` does not exist. Every page that relies on the default OG image will produce a broken social preview. This affects the root layout fallback for all pages without explicit og:image.

---

## 4. Structured Data Inventory

| Page | Schema type | Status | Issues |
|---|---|---|---|
| Homepage | Organization + WebSite + SearchAction | ✅ | `Organization` missing `@id` logo field; `sameAs` not set |
| `/tech/[slug]` | TechArticle + BreadcrumbList | ✅ | Good. No fabricated fields. |
| `/tools/[slug]` | SoftwareApplication | ✅ | Free-tier offer is factually derived from DB field. aggregateRating correctly omitted. |
| `/courses/[slug]` | Course | ⚠️ Partial | Missing: `provider`, `courseMode`, `teaches`, `educationalLevel`. No `hasCourseInstance`. These are standard Course fields that help AI discovery. |
| `/news/[slug]` | ❌ None | Missing | Should emit NewsArticle with `headline`, `datePublished`, `dateModified`, `author`. |
| `/articles/[slug]` | ❌ None | Missing | Should emit Article or TechArticle. |
| `/companies/[slug]` | ❌ None | Missing | Should emit Organization schema. |
| `/compare/[slug]` | ❌ None | Missing | No standard schema; at minimum emit BreadcrumbList. |
| `/interviews/[slug]` | ❌ None | Missing | Should emit Person (guest) + Episode or Clip if video; at minimum BreadcrumbList. |
| `/learn/[slug]` (learning path) | ❌ None | Missing | Could emit LearningResource or Course. |

### Fabricated data check
No fabricated `aggregateRating`, student counts, review counts, or pricing found in structured data. ✅

---

## 5. Indexability Issues

| Issue | Severity | Detail |
|---|---|---|
| **`/courses/` disallowed in robots.txt blocks all course pages** | **P0** | The disallow rule `/courses/` matches `/courses/`, `/courses/slug`, and everything under it. Course landing pages are legitimate public content that should be indexed. Only `/courses/[slug]/lessons/` needs blocking. Fix: change disallow to `/courses/**/lessons/` |
| **`/og-image.png` missing** | **P0** | Referenced in root layout and homepage OG metadata. Missing file means broken social cards for all pages without explicit og:image. |
| **`/rss.xml` declared but not implemented** | **P1** | Root `layout.tsx` declares `alternates.types["application/rss+xml"] = "/rss.xml"`. No route exists. This produces a broken link in every page `<head>`. Either implement it or remove the alternate. |
| **Hardcoded `https://neugravity.com` in layout OG** | **P1** | `layout.tsx` lines 30, 65 have `url: "https://neugravity.com"` and `canonical: "https://neugravity.com"` hardcoded instead of using the env var. Production deployment at `neugravity.vercel.app` will emit wrong canonical and OG URLs. |
| **`/community` indexed as a real page** | **P1** | Community page is a placeholder. It is in the sitemap at priority 0.6 with `changeFrequency: "daily"`. Should be either implemented or noindexed. |
| **No per-page og:image on entity pages** | **P2** | `/tech/[slug]`, `/tools/[slug]`, `/courses/[slug]`, etc. have no og:image. Social shares will fall back to root layout og-image (which is also missing). |
| **`/courses/[slug]` has no robots noindex override but path is blocked** | P0 | Conflict between page intent (indexable) and robots.txt rule (blocked). |

---

## 6. Internal Linking Analysis

### Strengths
- `/tech/[slug]` links to: related tech (`/tech/[slug]`), learning paths (`/learn/[slug]`), courses (`/courses/[slug]`), comparisons (`/compare/[slug]`) ✅
- `/tools/[slug]` links to alternative tools ✅
- `/courses/[slug]` links breadcrumb back to `/courses` ✅
- `/news/[slug]` links breadcrumb back to `/news` ✅

### Weaknesses

| Gap | Impact |
|---|---|
| No links from `/tech/[slug]` to `/news/` items about that technology | Medium |
| No links from `/tools/[slug]` to related `/tech/[slug]` pages | Medium |
| `/articles/[slug]` — "Related Courses" shows "coming soon" text, no actual links | Low |
| `/compare/[slug]` — no cross-links to individual tool pages | Medium |
| `/interviews/[slug]` — no links to related technology or tool pages | Low |
| Homepage hardcodes demo learning paths (`/learn/ai-engineer`, etc.) — if these slugs don't exist in DB, they 404 | **High** |

---

## 7. AI Discovery / Agentic Search

### What exists
- `SearchAction` in WebSite schema — AI agents can discover the search interface ✅
- Semantic heading structure: most pages use proper H1/H2/H3 hierarchy ✅
- Technology pages expose multi-level explanations (quick, beginner, technical, architect) — excellent for AI consumption ✅
- `dateModified` on TechArticle from DB `updated_at` ✅
- `sameAs` linking to official website on tech pages ✅

### What is missing or weak
- No `author` field on any article or news structured data
- No `datePublished` in TechArticle (only `dateModified`)
- Technology relationships not expressed in structured data (only in page DOM)
- No `breadcrumb` on news, articles, companies, interviews — only tech and courses have it
- No `inLanguage` declaration
- Company pages have no Organization schema to disambiguate from homepage Organization

---

## 8. Recommendations by Priority

### P0 — Must fix before any crawl/index matters

1. **Fix robots.txt `/courses/` rule** — Change `"/courses/"` to `"/courses/**/lessons/"` (and `/courses/*/lessons/*`). Course landing and listing pages must be crawlable.
2. **Create `/public/og-image.png`** — 1200×630 NeuGravity branded image. Every page without an explicit og:image falls back here.
3. **Remove or fix `/rss.xml` alternate** — Remove from `layout.tsx` alternates if no RSS route. Or implement a minimal RSS feed for news.

### P1 — Fix before launch

4. **Fix hardcoded `https://neugravity.com` in `layout.tsx`** — Use `process.env.NEXT_PUBLIC_SITE_URL` for `openGraph.url` and `alternates.canonical`.
5. **Add noindex to `/community`** — It is currently in sitemap at priority 0.6 with daily change frequency, pointing to a placeholder page. Adds crawl budget waste and can harm domain quality signals.
6. **Add NewsArticle structured data to `/news/[slug]`** — Minimal: `headline`, `datePublished`, `dateModified`, `url`. This is standard for news discovery by Google and AI agents.
7. **Fix homepage demo learning path links** — `/learn/ai-engineer`, `/learn/cloud-architecture`, `/learn/full-stack-developer` are hardcoded. If these slugs don't exist in DB they produce 404s from the homepage. Verify they exist or remove them.

### P2 — Important improvement

8. **Add Article/TechArticle structured data to `/articles/[slug]`**
9. **Add Organization schema to `/companies/[slug]`**
10. **Add BreadcrumbList to news, articles, companies, interviews, compare pages**
11. **Enhance Course schema** — Add `provider`, `teaches`, `educationalLevel`, `courseMode`
12. **Add og:image to key entity pages** — At minimum tech and course pages (use entity icon/logo from DB where available)
13. **Add canonical to static pages** — `/status`, `/work`, `/enterprise`, `/community` lack `alternates.canonical`

### P3 — Polish

14. **Add `inLanguage: "en-US"` to structured data**
15. **Add `datePublished` to TechArticle** (currently only `dateModified`)
16. **Express technology relationships in structured data** (e.g. `isRelatedTo`)
17. **Implement minimal news RSS feed** — High-value for AI crawler discovery and newsletter aggregators
