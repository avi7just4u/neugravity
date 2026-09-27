# Navigation Route Audit

**Date:** 2026-09-27  
**Scope:** Desktop navbar, mobile nav, footer — public navigation only

---

## Route Reference

All public pages live under `src/app/(public)/`. The `(public)` route group does **not** appear in URLs.

| File path | URL |
|-----------|-----|
| `src/app/(public)/learn/page.tsx` | `/learn` |
| `src/app/(public)/learn/paths/` | *(no page.tsx — only `[slug]` subdirectory, also empty)* |
| `src/app/(public)/learn/[slug]/page.tsx` | `/learn/[slug]` |

No `(public)` strings were found inside any `href` attributes or URL strings. Route-group paths are not leaking into navigation.

---

## Desktop Navbar Audit

Source: `src/components/layout/navbar.tsx` — `primaryNavItems` array

| Label | Href | Route exists | Status |
|-------|------|-------------|--------|
| Learn | `/learn` | ✓ | 200 ✓ |
| News | `/news` | ✓ | 200 ✓ |
| Tools | `/tools` | ✓ | 200 ✓ |
| Compare | `/compare` | ✓ | 200 ✓ |
| Tech | `/tech` | ✓ | 200 ✓ |
| Companies | `/companies` | ✓ | 200 ✓ |
| Work | `/work` | ✓ | 200 ✓ |
| Interviews | `/interviews` | ✓ | 200 ✓ |
| Community | `/community` | ✓ | 200 ✓ |
| Enterprise | `/enterprise` | ✓ | 200 ✓ |
| Sign in | `/login` | ✓ | 200 ✓ |
| Get started | `/signup` | ✓ | 200 ✓ |
| Search | `/search` (modal → `/search?q=`) | ✓ | 200 ✓ |

**Result: 0 broken desktop navbar links.**

---

## Mobile Navigation Audit

Source: `src/components/layout/navbar.tsx` — `mobilePrimary` (first 4 of `primaryNavItems`) + `mobileMore` (remaining) + Enterprise hardcoded

Mobile primary (always visible):
- Learn `/learn` ✓
- News `/news` ✓
- Tools `/tools` ✓
- Compare `/compare` ✓

Mobile More drawer:
- Tech `/tech` ✓
- Companies `/companies` ✓
- Work `/work` ✓
- Interviews `/interviews` ✓
- Community `/community` ✓
- Enterprise `/enterprise` ✓

Auth:
- Sign in `/login` ✓
- Get started `/signup` ✓

**Result: 0 broken mobile navigation links.**

---

## Footer Audit

Source: `src/components/layout/footer.tsx` — `footerLinks` object

### Before fixes

| Group | Label | Href | Status |
|-------|-------|------|--------|
| Platform | Technology | `/tech` | 200 ✓ |
| Platform | News | `/news` | 200 ✓ |
| Platform | Tools | `/tools` | 200 ✓ |
| Platform | Compare | `/compare` | 200 ✓ |
| Platform | Learn | `/learn` | 200 ✓ |
| Platform | Courses | `/courses` | 200 ✓ |
| Explore | Companies | `/companies` | 200 ✓ |
| Explore | Interviews | `/interviews` | 200 ✓ |
| Explore | Inside Work | `/work` | 200 ✓ |
| Explore | Technology Status | `/status` | 200 ✓ |
| Explore | Community | `/community` | 200 ✓ |
| Explore | **Learning Paths** | `/learn/paths` | **404 ✗** |
| Enterprise | Enterprise Overview | `/enterprise` | 200 ✓ |
| Enterprise | AI Strategy | `/enterprise#ai-strategy` | 200 ✓ |
| Enterprise | Technology Advisory | `/enterprise#advisory` | 200 ✓ |
| Enterprise | Custom Training | `/enterprise#training` | 200 ✓ |
| Enterprise | Architecture Review | `/enterprise#architecture` | 200 ✓ |
| Enterprise | Contact Sales | `/enterprise#contact` | 200 ✓ |
| Company | About | `/about` | 200 ✓ |
| Company | Contact | `/contact` | 200 ✓ |
| Company | Privacy Policy | `/privacy` | 200 ✓ |
| Company | Terms of Service | `/terms` | 200 ✓ |
| Company | **RSS Feed** | `/rss.xml` | **404 ✗** |
| Company | Sitemap | `/sitemap.xml` | 200 ✓ |

Social icons:
- X (Twitter) → `https://x.com/neugravity` (external) ✓
- GitHub → `https://github.com/neugravity` (external) ✓
- LinkedIn → `https://linkedin.com/company/neugravity` (external) ✓
- **RSS** → `/rss.xml` **404 ✗** (removed)

---

## Broken Links Found

### BL-1 — Footer "Learning Paths" → `/learn/paths` (404)

**Category:** A — Wrong href. The correct destination exists.

**Root cause:** `src/app/(public)/learn/paths/` has only an empty `[slug]` subdirectory, no `page.tsx` at the index level. The public-facing learning paths index is `/learn`, which already renders the Learning Paths section via `CourseService.getLearningPaths()`.

**Fix:** Change href from `/learn/paths` → `/learn`.

### BL-2 — Footer "RSS Feed" link + RSS icon → `/rss.xml` (404)

**Category:** C — Route does not exist, feature not built.

**Root cause:** No RSS feed route has been implemented. No `src/app/rss.xml/` or `src/app/rss.xml.ts` exists.

**Fix:** Remove "RSS Feed" from footer Company links and remove RSS icon from social icons. Do not create a fake RSS feed.

---

## After Fixes

| Group | Label | Href | Status |
|-------|-------|------|--------|
| Explore | Learning Paths | `/learn` | 200 ✓ |
| Company | RSS Feed | *removed* | — |
| Social | RSS icon | *removed* | — |

**Result: 0 broken footer links.**

---

## Deferred / Future Routes

| Label | Former href | Reason deferred |
|-------|-------------|----------------|
| RSS Feed | `/rss.xml` | Not implemented. Add when RSS generation is a product requirement. |
| Learning Paths detail | `/learn/paths/[slug]` | No public page exists. Admin paths UI is live; public detail page is future work. Empty directory left in codebase for future implementation. |

---

## Production Results

| Section | Links tested | Broken before | Broken after |
|---------|-------------|--------------|-------------|
| Desktop navbar | 13 | 0 | 0 |
| Mobile navigation | 12 | 0 | 0 |
| Footer | 24 | 2 | 0 |
| **Total** | **49** | **2** | **0** |
