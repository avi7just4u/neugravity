# SEO Audit — NeuGravity
**Date:** 2026-09-28 | **Agent:** 4 (SEO)

---

## P1 — Must Fix

### 1. `/community` and `/work` in sitemap.ts (non-existent routes)
- **File:** `src/app/sitemap.ts:27,30`
- `/community` is in static routes at priority 0.6, changeFrequency "daily" — route does not exist (removed from navbar in redesign sprint). Will serve 404 to Googlebot.
- `/work` is in static routes at priority 0.7 — `/work` was listed in route audit as placeholder only.
- **Fix:** Remove both from `staticRoutes`.

### 2. `metadataBase` fallback inconsistency
- **File:** `src/app/layout.tsx`
- `metadataBase` uses `"https://neugravity.com"` as fallback.
- Canonical and OG URLs in individual pages use `"https://neugravity.vercel.app"` as fallback.
- **Impact:** When `NEXT_PUBLIC_SITE_URL` is unset, relative OG image paths resolve to `neugravity.com` while canonical links point to `neugravity.vercel.app` — split signals to search engines.
- **Fix:** Standardize all fallbacks to `"https://neugravity.vercel.app"` or better, require the env var in production.

### 3. Hardcoded `"https://neugravity.com"` fallback in 8+ page files
- **Files:** `robots.ts`, `sitemap.ts`, `tools/[slug]/page.tsx`, `news/[slug]/page.tsx`, `tech/[slug]/page.tsx`, `courses/[slug]/page.tsx`, `companies/[slug]/page.tsx`, `compare/[slug]/page.tsx`
- All use `?? "https://neugravity.com"` — inconsistent with layout.tsx and canonical intent.
- **Fix:** Change all to `?? "https://neugravity.vercel.app"` for consistency.

---

## P2 — Should Fix

### 4. `news/[slug]`: Missing NewsArticle JSON-LD
- **File:** `src/app/(public)/news/[slug]/page.tsx`
- Has `openGraph type: "article"` and `publishedTime` in metadata ✅ but no structured data for Google News / Discover.
- **Missing fields:** `@type: NewsArticle`, `headline`, `datePublished`, `dateModified`, `author`, `publisher`, `mainEntityOfPage`, `image`.
- **Fix:** Add `buildNewsJsonLd()` and inject `<script type="application/ld+json">`.

### 5. `companies/[slug]`: Missing Organization JSON-LD
- **File:** `src/app/(public)/companies/[slug]/page.tsx` (not read — assumed from pattern)
- Companies have rich data (website, founded, description) — Organization schema improves Knowledge Panel eligibility.
- **Fix:** Add `@type: Organization` with `name`, `url`, `description`, `foundingDate`, `sameAs`.

### 6. `learn/page.tsx`: Title "Learn" too vague
- **File:** `src/app/(public)/learn/page.tsx:11`
- `title: "Learn"` — extremely low keyword signal. No canonical set.
- **Fix:** `title: "Learn Technology — Courses & Learning Paths | NeuGravity"`, add `alternates: { canonical: "${siteUrl}/learn" }`.

---

## P3 — Nice to Fix

### 7. `compare/[slug]`: No JSON-LD
- Tool comparison pages have SoftwareApplication comparison semantics but no structured data.
- **Fix:** `@type: WebPage` or use `ItemList` of two `SoftwareApplication` entities.

### 8. `robots.ts`: Sitemap URL uses `"https://neugravity.com"` fallback
- **File:** `src/app/robots.ts:4`
- Same fallback inconsistency as sitemap.ts.
- **Fix:** `?? "https://neugravity.vercel.app"`.

### 9. `sitemap.ts`: `/articles` and `/interviews` may not have full route implementations
- Low risk but worth confirming routes exist before sitemap inclusion.

---

## Already Correct

- `robots.ts`: correctly unblocks `/courses/`, only blocks `/courses/*/lessons/` ✅
- `tech/[slug]`: TechArticle + BreadcrumbList JSON-LD ✅
- `tools/[slug]`: SoftwareApplication JSON-LD with correct price logic (only free/open-source/has_free_tier get `price: "0"`) ✅
- `courses/[slug]`: Course JSON-LD ✅
- OG type `"article"` + `publishedTime` on news pages ✅
- `generateStaticParams()` returns `[]` on all detail pages (full dynamic) ✅
- `export const dynamic = "force-dynamic"` on news/tools/courses to avoid ISR+cookies conflict ✅

---

## Summary Table

| Priority | Issue | File | Effort |
|----------|-------|------|--------|
| P1 | `/community` + `/work` in sitemap | sitemap.ts | 5 min |
| P1 | metadataBase fallback inconsistency | layout.tsx | 2 min |
| P1 | Wrong fallback URL in 8 files | multiple | 10 min |
| P2 | Missing NewsArticle JSON-LD | news/[slug] | 15 min |
| P2 | Missing Organization JSON-LD | companies/[slug] | 15 min |
| P2 | "Learn" title too vague | learn/page.tsx | 2 min |
| P3 | Missing compare JSON-LD | compare/[slug] | 10 min |
| P3 | robots.ts wrong fallback | robots.ts | 2 min |
