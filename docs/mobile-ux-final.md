# Mobile UX Final Audit — NeuGravity
**Audit date:** 2026-09-28  
**Auditor:** Agent 2 (Mobile UX)  
**Viewport targets:** 360px / 390px / 430px / 768px (tablet)  
**Sources:** Full read of navbar, all public page files, UnderstandTabs, SearchIsland

---

## Scope

Pages audited:
- Navbar + Mobile Drawer (`src/components/layout/navbar.tsx`)
- Homepage (`src/app/(public)/page.tsx`)
- Tech Detail (`src/app/(public)/tech/[slug]/page.tsx`)
- UnderstandTabs (`src/components/tech/understand-tabs.tsx`)
- Tools Detail (`src/app/(public)/tools/[slug]/page.tsx`)
- News Detail (`src/app/(public)/news/[slug]/page.tsx`)
- Learn Hub (`src/app/(public)/learn/page.tsx`)
- Search (`src/app/(public)/search/search-island.tsx`)
- Course Detail (from prior audit context)
- Lesson Player (from prior audit context)

---

## P0 — Critical Blockers

### MOB-P0-1: UnderstandTabs touch targets too small (32px)
**File:** `src/components/tech/understand-tabs.tsx:45`  
Tab buttons use `px-4 py-2` (8px top + 8px bottom + ~16px text = 32px). WCAG 2.5.5 requires 44px minimum. Five tabs at 32px on a 360px screen means users frequently mis-tap adjacent tabs.

**Fix:** Change to `py-3` (44px total) or add `min-h-[44px]` to button class.

### MOB-P0-2: Mobile drawer close X is 36px (h-9 w-9)
**File:** `src/components/layout/navbar.tsx:190`  
The close (X) button inside the drawer uses `h-9 w-9` (36px). The hamburger was correctly fixed to `h-11 w-11` (44px), but the drawer's own X close button was missed. Users already in the drawer can't reliably close it.

**Fix:** Change `h-9 w-9` → `h-11 w-11` on drawer close button.

### MOB-P0-3: No focus trap in mobile drawer
**File:** `src/components/layout/navbar.tsx:174-276`  
The mobile nav has `role="dialog" aria-modal="true"` but no JavaScript focus trap. When the drawer is open, pressing Tab cycles to background page content behind the opaque backdrop. Screen reader users are not confined to the dialog.

**Fix:** Add focus trap via `useEffect` that intercepts Tab/Shift+Tab and Escape, constraining focus to elements within `#mobile-nav`. Return focus to hamburger on close.

### MOB-P0-4: Search page is a dead end
**File:** `src/app/(public)/search/search-island.tsx:83`  
Any search query renders: "Search is coming soon. Full database-powered search will be available once the search index is connected." Mobile users who tap the search icon, type a query, and submit hit a hard dead end with no results and no fallback.

**Fix (short term):** Remove the "coming soon" stub and redirect to the browse/tech page with a filter param, or show the top-level entity lists as a fallback. Long term: wire up the search index.

---

## P1 — High-Impact Issues

### MOB-P1-1: Tablet navigation gap (768px–1023px)
**File:** `src/components/layout/navbar.tsx:91`  
Desktop nav is `hidden lg:flex` (visible only at ≥1024px). Mobile hamburger is `lg:hidden`. Between 768px–1023px (tablet), the header shows: Logo | Search | Enterprise | Hamburger — but the Enterprise link is `hidden md:flex` and shows at ≥768px.

This creates an asymmetry: Enterprise is promoted to the header at 768px but all 7 core nav items (Learn, News, Tools, Compare, Tech, Companies, Status) are behind a hamburger. A tablet user sees Enterprise more prominently than "Learn" or "News".

**Fix:** Either expose the top 3–4 nav items at `md:` or hide Enterprise until `lg:` and rely on the hamburger at all sizes below 1024px.

### MOB-P1-2: Sidebar metadata below the fold on mobile (Tech + Tools)
**Files:** `src/app/(public)/tech/[slug]/page.tsx`, `src/app/(public)/tools/[slug]/page.tsx`  
Both pages use `grid lg:grid-cols-3` — correct. But on mobile, the sidebar (Key Facts, Signals, Latest News, Details, Rating) appears **below all main content**: explanations (5 tabs), flow diagram, prerequisites, ecosystem, related technologies. Users must scroll 2000px+ to see Key Facts.

This is a structural mobile UX issue. For tech/tool pages, the metadata sidebar contains the most scannable information.

**Fix options:**
1. Render a compact key-facts strip immediately below the hero header on mobile (hide on `lg`), with a separate full sidebar on desktop.
2. Or lift Key Facts card to top of the sidebar and order it before explanations on mobile with CSS order utilities.

### MOB-P1-3: Blue vs. Indigo inconsistency on Learn page
**File:** `src/app/(public)/learn/page.tsx:74,114`  
Learning path cards: `group-hover:text-blue-600 dark:group-hover:text-blue-400`  
Featured course cards: `group-hover:text-blue-600 dark:group-hover:text-blue-400`  
The design system uses indigo (`text-indigo-600`, `text-indigo-400`). Blue is a different hue. On mobile where interactions are immediate (tap = hover state triggers the transition), this inconsistency is visible as a color flash.

**Fix:** Replace `blue-600/400` with `indigo-600/400` on both card types in learn/page.tsx.

### MOB-P1-4: No skip-to-content link
**File:** `src/app/layout.tsx` (root layout)  
No "Skip to main content" link at top of page. Screen reader and keyboard users on mobile must tab through the entire navbar (logo, 7 nav items, search, enterprise, auth) before reaching page content.

**Fix:** Add `<a href="#main-content" class="sr-only focus:not-sr-only">Skip to main content</a>` as first element in body, with `id="main-content"` on the `<main>` element.

### MOB-P1-5: UnderstandTabs has no scroll overflow indicator
**File:** `src/components/tech/understand-tabs.tsx:26`  
The tab container uses `overflow-x-auto` — correct. But there's no visual affordance (fade gradient, arrow, scroll shadow) to indicate additional tabs exist when the viewport is narrow. A user on 360px with 5 tabs may see only "30 Sec | Simple | Beginner" and not realize "Engineer" and "Architect" tabs exist.

**Fix:** Add a CSS `mask-image: linear-gradient(to right, black 80%, transparent 100%)` on the tab container when tabs overflow, or add a right-edge fade via pseudo-element.

---

## P2 — Lower Priority

### MOB-P2-1: Search input type should be `type="search"`
**File:** `src/app/(public)/search/search-island.tsx:46`  
Input uses `type="text"`. Using `type="search"` on iOS shows a "Search" key on the virtual keyboard instead of "Return", provides a native clear (×) button, and triggers `inputmode="search"` semantics automatically.

**Fix:** Change `type="text"` → `type="search"` and add `role="search"` to the surrounding `<form>`.

### MOB-P2-2: Learn page hero h1 uses raw Tailwind, not design system class
**File:** `src/app/(public)/learn/page.tsx:36`  
`<h1 className="text-4xl font-bold ...">` — should use `.text-headline` (the design system class with responsive clamp). Identical inconsistency exists across other hub pages.

**Fix:** Replace `text-4xl font-bold` with `text-headline`.

### MOB-P2-3: News breadcrumb headline truncation at 320px
**File:** `src/app/(public)/news/[slug]/page.tsx:63`  
Headline breadcrumb uses `truncate max-w-xs` (max-width 320px). On 360px screens with 8px body padding on each side, the content area is 344px. `max-w-xs` = 320px, so most headlines will truncate — expected and fine. But the breadcrumb's `gap-1.5` and chevrons consume width before the headline span, meaning the truncation starts earlier than 320px of actual text.

**Fix (nice-to-have):** Remove `max-w-xs` and let `truncate` (which requires a constrained parent) do the work naturally via `flex-1 min-w-0`.

### MOB-P2-4: Tools page placeholder sections consume mobile viewport
**File:** `src/app/(public)/tools/[slug]/page.tsx:211-247`  
"Key Features" and "Pricing" are placeholder-only (no real data). On mobile, these render as large empty-state cards with amber warnings — they take ~300px of vertical space each with no useful content. Mobile users scroll past two "coming soon" sections before reaching alternatives.

**Fix (short term):** Conditionally hide Key Features and Pricing sections when there's no structured data, rather than always rendering the placeholder.

### MOB-P2-5: No social sharing on news articles
**File:** `src/app/(public)/news/[slug]/page.tsx`  
News detail pages have no share button. On mobile this is especially valuable (native share API). Low priority since this is a growth feature, not a core UX issue.

---

## What's Working Well

| Feature | Status |
|---|---|
| Hamburger touch target (h-11 w-11 = 44px) | ✅ Pass |
| Mobile drawer: backdrop + body scroll lock | ✅ Pass |
| Mobile drawer: aria-modal + role=dialog | ✅ Pass |
| Search modal: ESC closes, autoFocus, inputMode="search" | ✅ Pass |
| All pages: `px-4 sm:px-6 lg:px-8` consistent padding | ✅ Pass |
| Tech/Tools/News: `grid lg:grid-cols-3` collapses correctly | ✅ Pass |
| Orbital diagram hidden on mobile (`hidden xl:block`) | ✅ Pass |
| Framer Motion: prefers-reduced-motion respected | ✅ Pass |
| UnderstandTabs: `overflow-x-auto flex-shrink-0` for tab scroll | ✅ Pass |
| Course detail: `fixed bottom-0` mobile sticky CTA (`lg:hidden`) | ✅ Pass |
| Lesson player: 3-zone bottom nav for prev/next navigation | ✅ Pass |
| News breadcrumb: truncate with `max-w-xs` | ✅ Acceptable |
| Homepage hero: `min-h-[88vh]` (avoids 100vh iOS bar issue) | ✅ Pass |
| Badge rows: `flex-wrap` on all detail pages | ✅ Pass |

---

## Issue Inventory

| ID | Severity | Component | Description |
|---|---|---|---|
| MOB-P0-1 | P0 | UnderstandTabs | Tab buttons 32px tall (need 44px) |
| MOB-P0-2 | P0 | Navbar | Drawer close X is 36px (need 44px) |
| MOB-P0-3 | P0 | Navbar | No focus trap in mobile drawer dialog |
| MOB-P0-4 | P0 | Search | All queries return "coming soon" dead end |
| MOB-P1-1 | P1 | Navbar | Tablet (768-1023px): Enterprise in header, nav behind hamburger |
| MOB-P1-2 | P1 | Tech/Tools | Sidebar metadata after 2000px+ of content on mobile |
| MOB-P1-3 | P1 | Learn | `text-blue-600` hover states (should be indigo) |
| MOB-P1-4 | P1 | Layout | No skip-to-content link |
| MOB-P1-5 | P1 | UnderstandTabs | No scroll overflow indicator for hidden tabs |
| MOB-P2-1 | P2 | Search | Input `type="text"` should be `type="search"` |
| MOB-P2-2 | P2 | Learn | h1 uses `text-4xl` not `.text-headline` |
| MOB-P2-3 | P2 | News | Breadcrumb truncation sub-optimal at 360px |
| MOB-P2-4 | P2 | Tools | Placeholder sections waste mobile scroll space |
| MOB-P2-5 | P2 | News | No native share API integration |

---

## Recommended Fix Order

1. **MOB-P0-2** — 2 min: `h-9 w-9` → `h-11 w-11` on drawer X. Zero risk.
2. **MOB-P0-1** — 5 min: `py-2` → `py-3` on UnderstandTabs buttons. Zero risk.
3. **MOB-P1-3** — 5 min: `blue-600/400` → `indigo-600/400` in learn/page.tsx.
4. **MOB-P2-2** — 2 min: `text-4xl font-bold` → `text-headline` in learn/page.tsx.
5. **MOB-P2-1** — 2 min: `type="text"` → `type="search"` in search-island.tsx.
6. **MOB-P0-3** — 30 min: implement focus trap in mobile drawer.
7. **MOB-P1-4** — 15 min: add skip-to-content link in root layout.
8. **MOB-P1-5** — 20 min: add right-edge fade to UnderstandTabs container.
9. **MOB-P0-4** — Depends on search infrastructure timeline; short-term fallback: redirect to /tech.
10. **MOB-P1-1** — 15 min: decide tablet nav strategy, implement.
11. **MOB-P1-2** — 1 hr: add compact key-facts strip above fold on mobile for tech/tools pages.
12. **MOB-P2-4** — 15 min: conditionally hide placeholder sections in tools detail.
