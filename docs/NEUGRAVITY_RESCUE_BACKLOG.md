# NeuGravity — Rescue Backlog (P2/P3)

Deferred items from the PRODUCT RESCUE sprint. P0 and P1 fixes were implemented in the
rescue sprint commit. Items below are not urgent enough to block launch but should be
addressed in the next sprint cycle.

---

## P2 — Address Before Scale

### P2-1: Focus trap in mobile nav drawer
**File**: `src/components/layout/navbar.tsx`
**Description**: The mobile navigation drawer (`role="dialog"`) does not trap keyboard focus.
Users can tab outside the drawer while it is open, which breaks WCAG 2.1 SC 2.1.2 (No
Keyboard Trap, inverse). Implement a focus trap using a lightweight hook or `focus-trap-react`.
**Effort**: ~2h

### P2-2: N+1 query in getContinueLearningLesson
**File**: `src/lib/services/enrollment.service.ts` — `getContinueLearningLesson` function
**Description**: The function iterates over modules in a loop, then lessons in a nested loop,
issuing a separate Supabase query per lesson to fetch `lesson_progress`. On a course with
5 modules × 8 lessons = 40 sequential round trips. Replace with a single query that fetches
all lesson IDs for the course, then all progress rows in one `IN` query, and walks the sorted
list in memory.
**Effort**: ~1.5h

### P2-3: JSON-LD on news, companies, and compare pages
**Files**:
- `src/app/(public)/news/[slug]/page.tsx` — add `NewsArticle` schema
- `src/app/(public)/companies/[slug]/page.tsx` — add `Organization` schema
- `src/app/(public)/compare/[slug]/page.tsx` — add `Article` or `ItemList` schema
**Description**: Tools and tech pages already emit JSON-LD. The three remaining entity types
are missing structured data, limiting rich-result eligibility in search.
**Effort**: ~2h total

### P2-4: Dashboard link missing from navbar
**File**: `src/components/layout/navbar.tsx`
**Description**: Authenticated users have no visible nav link to `/learn/dashboard`. They
must know the URL directly. Add a "My Learning" link that renders only when the user has
an active session (requires reading auth state client-side or passing it via server component).
**Effort**: ~1.5h

### P2-5: CSP header
**File**: `next.config.ts` (or middleware)
**Description**: No Content-Security-Policy header is set. Add a CSP that permits
`'self'`, `fonts.googleapis.com`, `fonts.gstatic.com`, and the Supabase project URL.
Start in report-only mode, then enforce once violations are cleared.
**Effort**: ~2h

---

## P3 — Nice to Have

### P3-1: Adopt next/image for all logo and icon images
**Files**: Multiple — `src/app/(public)/tools/[slug]/page.tsx`,
`src/app/(public)/companies/[slug]/page.tsx`, and others that use `<img>` directly
**Description**: Several pages use raw `<img>` tags (suppressed with `eslint-disable`).
Replacing them with `next/image` provides automatic format negotiation (WebP/AVIF), lazy
loading, and layout-shift prevention. Requires adding allowed hostnames to `next.config.ts`.
**Effort**: ~2h

### P3-2: Course module parallel fetch optimization
**File**: `src/app/(public)/courses/[slug]/lessons/[lessonId]/page.tsx` —
`getCourseWithCurriculum` function
**Description**: Module lessons are fetched with `Promise.all(moduleList.map(...))` which
is already parallel per-module, but each module still makes a separate query. On large courses
(10+ modules), this generates many round trips. Consolidate into a single query on `lessons`
filtered by `module_id IN (...)` and group in memory.
**Effort**: ~1h

### P3-3: SEO — seo.test.ts URL assertion mismatch
**File**: `src/app/__tests__/seo/seo.test.ts`
**Description**: The SEO test file still uses `https://neugravity.com` as the expected base
URL (hardcoded in test constants). Update the expected values to `https://neugravity.vercel.app`
to match the canonical fallback used in production code.
**Effort**: ~30min

---

*Sprint: PRODUCT RESCUE | Date: 2026-09-28 | Author: Claude (rescue-agent)*
