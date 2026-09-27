# NeuGravity — Rescue Plan

**Sprint**: Phase 4.4.2  
**Date**: 2026-09-28  
**Rule**: No new features. No fake content. No Phase 5. Fix what's broken.

---

## P0 — Production Blockers (implement first)

### P0-A: Fix 500 on 5 detail pages (ISR + cookies() conflict)
- Add `export const dynamic = "force-dynamic"` to: `news/[slug]`, `articles/[slug]`, `compare/[slug]`, `companies/[slug]`, `interviews/[slug]`, `courses/[slug]`
- Remove existing `export const revalidate = N` from each

### P0-B: Fix robots.txt blocking course catalog
- Change `/courses/` → `/courses/*/lessons/` in all 3 rule sets in `robots.ts`
- Only the lesson player needs to be private, not course landing pages

### P0-C: Fix quiz/project onComplete no-op
- `lesson/[lessonId]/page.tsx` L373, L394: `onComplete={() => {}}` → no-op prevents UI refresh after quiz pass
- Fix: wire to router.refresh() in the client components (QuizLesson / ProjectLesson) or via a small client wrapper

### P0-D: Fix homepage dead links
- `/learn/paths/${path.slug}` → `/learn/${path.slug}` (wrong route)
- `/work/${topic.toLowerCase()}` → remove these links (no /work/[slug] route exists)

### P0-E: Fix layout.tsx metadata
- Remove `/rss.xml` from alternates (route doesn't exist)
- Remove broken og-image reference from openGraph.images and twitter.images
- Fix canonical URL: `https://neugravity.com` → `process.env.NEXT_PUBLIC_SITE_URL ?? "https://neugravity.vercel.app"`
- Fix openGraph.url: same

---

## P1 — Major UX Issues

### P1-A: Mobile enrollment CTA (courses/[slug])
- Add fixed sticky bar at bottom of viewport: `lg:hidden fixed bottom-0 left-0 right-0 z-30`
- Contains EnrollButton or "Continue Learning" button (same props as sidebar)
- Add `pb-24 lg:pb-0` to main content to prevent overlap

### P1-B: Hamburger tap target
- `h-9 w-9` (36px) → `h-11 w-11` (44px) in navbar.tsx

### P1-C: Lesson prev/next labels
- Remove `hidden sm:block` from "Previous" and "Next" spans in lesson player

### P1-D: Narrow middleware to admin/auth routes only
- Current matcher hits every public request → adds Supabase auth round-trip to all pages
- New matcher: `['/admin/:path*', '/api/admin/:path*', '/login', '/signup', '/learn/dashboard/:path*', '/courses/:path*/lessons/:path*']`

### P1-E: Remove hardcoded hero stats from homepage
- "500+ Technologies", "1200+ Tools", "50K+ Learners" — not real data, remove

### P1-F: Remove /work/[slug] topic links
- `work/page.tsx` topic cards link to `/work/${t.slug}` — route doesn't exist
- Change to `href="/work"` on each card or remove individual card links

### P1-G: prefers-reduced-motion
- Add `@media (prefers-reduced-motion: reduce)` block to `globals.css`

### P1-H: Enrollment completion status
- In `enrollment.service.ts`: after `updateLessonProgress` marks status=completed, check if all lessons complete → set enrollment status="completed"
- Or: add completion check in `/api/progress/[lessonId]` route after calling updateLessonProgress

### P1-I: Wire ⌘K keyboard shortcut in navbar
- Add `useEffect` with keydown listener: `if ((e.metaKey || e.ctrlKey) && e.key === "k") setSearchOpen(true)`

### P1-J: Add skip-to-main link
- Add `<a href="#main-content" className="sr-only focus:not-sr-only ...">Skip to main content</a>` as first child in public layout
- Add `id="main-content"` to `<main>`

### P1-K: Mobile drawer aria-modal
- Add `aria-modal="true"` to the mobile nav drawer `<nav>` element

### P1-L: Progress bar ARIA role
- Add `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax` to progress bar div in lesson player

---

## Implementation Order

1. P0-A (ISR fixes) — unblocks 5 broken pages immediately
2. P0-B (robots.txt) — unblocks course catalog from Google
3. P0-E (layout metadata) — fixes SEO issues site-wide
4. P0-D (homepage hrefs) — fixes dead links
5. P0-C (quiz onComplete) — fixes learner progress
6. P1-D (middleware) — biggest performance win
7. P1-A (mobile CTA) — biggest mobile UX win
8. P1-B, P1-C (tap targets, labels) — mobile polish
9. P1-G (reduced-motion) — accessibility
10. P1-H (enrollment completion) — learner UX
11. P1-I, P1-J, P1-K, P1-L (accessibility) — a11y
12. P1-E, P1-F (remove fake content) — content accuracy

---

## What This Sprint Does NOT Do

- Does not add Phase 5 features
- Does not add fake/placeholder content
- Does not change the ingestion pipeline
- Does not auto-publish content
- Does not add community, payments, or subscriptions
- Does not redesign — only targeted fixes
