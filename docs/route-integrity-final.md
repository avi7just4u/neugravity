# Route Integrity Audit — Final Report

**Sprint**: NEUGRAVITY PRODUCT RESCUE — CONTINUE FROM CURRENT STATE  
**Agent**: 1 — Route Integrity  
**Date**: 2026-09-28  
**Method**: Enumerated all page.tsx routes, extracted nav/homepage hrefs, queried Supabase for real slugs, tested 39+ production URLs

---

## Summary

- **Total routes enumerated**: 57 page.tsx files  
- **Routes tested in production**: 39  
- **200 OK**: 37  
- **404**: 2 (draft learning paths — see §1)  
- **500**: 0 (ISR + cookies conflict previously fixed in e788695)  
- **Broken nav/homepage hrefs**: 2 (see §2)

---

## P0 — Confirmed 404s

### ROUTE-P0-1: `/learn/ai-foundations` and `/learn/ai-engineer` return 404

**Root cause**: All 5 learning paths in the database have `status = 'draft'`. The route `/learn/[slug]/page.tsx` calls `CourseService.getLearningPathBySlug()` which filters `.eq("status", "published")` — so draft paths return null → `notFound()`.

**Impact**: Any user who types or bookmarks these URLs gets a 404. Internal links from any previous page (or Google cache) pointing at learning path URLs will 404.

**Safe behavior**: `/learn` page calls `getLearningPaths({ featured: true })` which also filters by `status=published`, so it correctly shows "Learning paths coming soon" and does NOT link to draft paths. No broken links from the current UI.

**Fix options**:
1. Publish at least one learning path in the Supabase admin panel (fastest)
2. If paths aren't ready for public, leave as-is — there are no current nav links pointing to them

**All 5 draft learning paths** (confirmed from DB query):
- `ai-foundations`
- `ai-engineer`
- `cloud-architect`
- `platform-engineer`
- `security-engineer`

---

## P1 — Sitemap Integrity Issues

### ROUTE-P1-1: `/community` in sitemap.ts

**File**: `src/app/sitemap.ts`  
`/community` is included as a static route at `priority: 0.6, changeFrequency: "daily"`. This route does not exist (was a placeholder, removed from navbar in the visual redesign sprint). Google will crawl it and receive a 404.

**Fix**: Remove `/community` from `staticRoutes` in `sitemap.ts`.

### ROUTE-P1-2: `/work` in sitemap.ts

**File**: `src/app/sitemap.ts`  
`/work` is included at `priority: 0.7`. The route `src/app/(public)/work/page.tsx` exists (placeholder page). But `/work/[topic]` routes do not exist — the homepage previously linked to these and has since been fixed. The `/work` index page itself returns 200.

**Decision**: Keep `/work` in sitemap (it's a real route), but lower priority from 0.7 to 0.5 since it's a placeholder.

---

## P2 — Homepage Link Audit

### All homepage hrefs verified:

| href | Status | Notes |
|------|--------|-------|
| `/tech` | 200 ✅ | |
| `/news` | 200 ✅ | |
| `/tools` | 200 ✅ | |
| `/compare` | 200 ✅ | |
| `/learn` | 200 ✅ | Shows empty state (draft paths) |
| `/courses` | 200 ✅ | |
| `/enterprise` | 200 ✅ | |
| `/enterprise#services` | 200 ✅ | Hash nav |
| `/work` | 200 ✅ | |

No broken homepage hrefs in current codebase. Previously broken `/learn/paths/[slug]` and `/work/[topic]` hrefs were fixed in e788695.

---

## Already Correct

| Check | Status |
|---|---|
| `/news/[slug]` force-dynamic (ISR+cookies fix) | ✅ |
| `/articles/[slug]` force-dynamic | ✅ |
| `/compare/[slug]` force-dynamic | ✅ |
| `/companies/[slug]` force-dynamic | ✅ |
| `/courses/[slug]` force-dynamic | ✅ |
| Middleware narrowed to admin/auth routes only | ✅ |
| `robots.ts` correctly allows `/courses/` | ✅ |
| Canonical URL uses `NEXT_PUBLIC_SITE_URL` env var | ✅ |
| All admin routes redirect to `/login` when unauth'd | ✅ |
| `/learn/dashboard` redirects to `/login` when unauth'd | ✅ |
| Sitemap domain: `neugravity.vercel.app` | ✅ |

---

## Fix Checklist

| Priority | Issue | File | Effort |
|----------|-------|------|--------|
| P0 | Publish a learning path in admin OR accept 404s | Supabase admin | — |
| P1 | Remove `/community` from sitemap static routes | `sitemap.ts` | 2 min |
| P2 | Lower `/work` priority from 0.7 → 0.5 in sitemap | `sitemap.ts` | 1 min |
