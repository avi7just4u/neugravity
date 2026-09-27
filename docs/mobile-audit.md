# NeuGravity — Mobile UX Audit

**Date**: 2026-09-28  
**Agent**: AGENT 3 — Mobile UX  
**Scope**: Read-only audit of all public-facing pages at 360–768px breakpoints

---

## Summary

NeuGravity has a functional hamburger-drawer navigation and uses Tailwind responsive breakpoints consistently. The public pages are mostly safe from horizontal overflow. However several critical mobile UX gaps exist:

1. **No persistent bottom tab bar** — the hamburger drawer is slow and buried for mobile-first navigation
2. **Lesson player prev/next buttons are text-hidden on mobile** — only icons show below ~640px; "Previous" and "Next" labels hidden with `hidden sm:block`
3. **Course detail sidebar becomes bottom-stacked** — the enrollment/CTA card falls below the entire curriculum on mobile (lg:grid-cols-3 collapses to single column, sidebar renders last)
4. **Hero CTA buttons stack vertically** — `flex-col sm:flex-row` is correct but three equal-weight buttons with no primary visual hierarchy
5. **Technology page explanation tabs may overflow on very narrow screens** — tab row with 5 tabs (`quick/simple/beginner/technical/architect`) at 360px could clip
6. **Footer is 2-column on mobile** — manageable but dense; four link groups at 360px is borderline cluttered
7. **Search modal positions at `mt-20`** — on 360px this is fine, but keyboard pushing viewport up may partially hide the input

---

## Page-by-Page Analysis

### Navbar (`src/components/layout/navbar.tsx`)

**Current behavior**:
- Desktop nav hidden below `lg` breakpoint with `hidden lg:flex`
- Mobile shows: logo + search button (icon only) + hamburger toggle
- Hamburger opens a right-sliding `w-72` drawer with: Home, Learn, News, Tools, Compare (4 primary items), then Search shortcut, More toggle (Tech, Companies, Work, Interviews, Community, Enterprise)
- Drawer includes full-width Sign in / Get started buttons at bottom

**Issues at 360–430px**:
- `h-9 w-9` hamburger button = 36px tap target — **below 44px recommended minimum**
- Logo word "NeuGravity" in `text-lg font-bold` — fine at all widths  
- Search button shows icon only on mobile (no label), `h-9` = 36px tap target — borderline small
- **`/compare` and `/community` are in primary nav but both routes have uncertain 404 status** (noted for Agent 1 to verify); listing them in mobile nav is a risk
- Drawer `w-72` on a 360px screen leaves only 88px of backdrop — correct behavior, but the close-on-backdrop tap area is small

**Missing**:
- No `aria-label` on the search button text ("Search")
- No keyboard trap in the drawer modal — focus can escape behind the backdrop

**Severity**: P1 (hamburger tap target), P2 (nav route verification)

---

### Homepage (`src/app/(public)/page.tsx`)

**Breakpoint behavior**:

| Element | 360–430px | 768px |
|---|---|---|
| Hero h1 (`text-4xl`) | ~36px — readable | OK |
| Hero CTAs | `flex-col` (stacked) | `flex-row` |
| Trending tech grid | `grid-cols-2` | `grid-cols-3` → `grid-cols-6` |
| Stats row (`flex-wrap gap-6`) | wraps to 2×2 | single row |
| Section headings | fine | fine |

**Issues**:
- Three hero CTA buttons with equal visual weight in stacked layout — "Explore Technology", "Start Learning", "Explore Tools" — no clear primary action at mobile size. `Button size="lg"` with `gap-2` is fine in `sm:flex-row` but in `flex-col` all three look identical
- Trending tech at `grid-cols-2` puts cards at ~160px wide on a 360px screen — adequate but tight with the icon + name + type text
- Stat numbers ("500+", "1,200+") at `text-2xl` below a `pt-8 border-t` — good, readable
- Background gradient div (`absolute right-0 -z-10`) is harmless on mobile

**Severity**: P2 (CTA hierarchy)

---

### Technology Detail (`src/app/(public)/tech/[slug]/page.tsx`)

**Breakpoint behavior**:
- `grid lg:grid-cols-3` → single column at mobile; the right sidebar (facts/links) stacks below main content
- `flex-wrap` on badge/status row — handles narrow screens correctly
- `h1` is `text-4xl` — 36px on mobile, readable
- External links buttons (`Website`, `GitHub`, `Docs`) use `flex-wrap` — stack correctly

**Issues at 360px**:
- **Explanation tabs** (`UnderstandTabs` component): 5 tabs side-by-side. Not reviewed in source but likely to overflow at 360px if implemented as `flex` without scroll or wrapping. Need verification. If tabs are `overflow-x-auto` this is fine; if not, text could clip.
- **Facts grid** (sidebar on desktop): falls to bottom of page on mobile — users must scroll past all explanations, prerequisites, ecosystem before seeing basic facts (type, year, license). This buries useful quick-reference data.
- `ConceptFlow` component — not audited here (separate component), potential overflow risk for node diagrams at narrow width
- `EcosystemSection` — tools shown as cards, likely `grid-cols-1 sm:grid-cols-2` pattern

**Severity**: P1 (explanation tabs overflow), P2 (facts buried on mobile)

---

### Tools List (`src/app/(public)/tools/page.tsx`)

**Breakpoint behavior**:
- Filter pills use `flex flex-wrap gap-2` — correct, wraps on narrow
- Tool grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` — single column at 360px ✅
- Tool cards at full width are fine: icon + name + tagline + pricing + type

**Issues**:
- Filter pills `px-3 py-1.5 text-sm` — tap target height ~36px — borderline small
- No mobile search/filter control — 6 filter pills visible, if more are added it will wrap awkwardly

**Severity**: P3

---

### Learn Hub (`src/app/(public)/learn/page.tsx`)

**Breakpoint behavior**:
- Path cards: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` — single column at 360px ✅  
- Featured courses: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` — 1 col at 360 ✅
- "Browse Courses" CTA button — full-width is not set, left-aligned — usable

**Issues**:
- No difficulty or duration visible above the fold at mobile — card has difficulty badge + title + description + hours; layout is fine but `line-clamp-2` on description can cut info too early on small cards
- No way to browse all courses directly from `/learn` without scrolling to the "Featured Courses" section header and then clicking "All courses"

**Severity**: P3

---

### Course Detail (`src/app/(public)/courses/[slug]/page.tsx`)

**Critical issue**: On mobile, the layout is `grid lg:grid-cols-3`. At mobile it collapses to a single column with **left column (content)** rendered first and **right column (sidebar with enrollment CTA)** rendered second. This means:

**Mobile order**:
1. Breadcrumb
2. Difficulty/free badges
3. Title
4. Subtitle
5. Long description
6. What You'll Learn (potentially long grid)
7. Course Curriculum (entire accordion, potentially 100+ lines of content)
8. **→ Enrollment CTA button finally appears here**

A mobile user must **scroll past the entire curriculum** before seeing the "Start Learning" or "Enroll" button.

**Additional issues**:
- Sidebar `sticky top-20` only applies on desktop; on mobile it's not sticky
- No floating/fixed enrollment CTA at mobile
- Curriculum accordion items use `px-5 py-3.5` summary (50px height) — fine tap target  
- Module lesson items `px-5 py-3 pl-14` — the `pl-14` (56px) left padding at narrow width leaves very little space for lesson title text at 360px
- `grid sm:grid-cols-2 gap-2` for learning outcomes — at 360px this is 1-column; fine

**Severity**: **P0** — enrollment CTA buried below fold is a conversion-critical bug

---

### Lesson Player (`src/app/(public)/courses/[slug]/lessons/[lessonId]/page.tsx`)

This is the highest-priority mobile screen.

**Current mobile structure** (from the code):

```
[Sticky header: course title + progress bar + lesson count]
[details/summary: "Course curriculum" accordion — max-h-64 overflow-y-auto]
[Lesson content area: max-w-3xl w-full px-4 py-10]
  - Breadcrumb
  - Title (text-2xl sm:text-3xl)
  - Learning objectives
  - Description
  - Video / Article / Quiz / Project content
  - [Bottom nav: prev | mark complete | next]
```

**At 360–430px**:

| Element | Status | Issue |
|---|---|---|
| Sticky header | ✅ h-14, progress bar visible | Course title hidden with `hidden sm:block` below 640px — only BookOpen icon shows |
| Curriculum accordion | ⚠️ | `details/summary` native HTML — no custom styling, arrow doesn't animate consistently cross-browser; max-h-64 is a good constraint |
| Lesson title h1 | ✅ `text-2xl` (24px) readable | |
| Video `aspect-video` | ✅ responsive iframe | 16:9 fills width correctly |
| Code blocks in article | ⚠️ | `overflow-x-auto` is present on `pre` — horizontal scroll within code blocks is acceptable but jarring on mobile |
| Prev/Next buttons | ⚠️ | "Previous" and "Next" labels use `hidden sm:block` — **on mobile only icons show**. The "Previous" button is just `<ChevronLeft />` with no visible label. Accessibility and discoverability issue. |
| "Mark Complete" button | ✅ | `MarkCompleteButton` — no label visibility issues noted in outer page code |
| Bottom nav area | ⚠️ | `flex items-center justify-between` with `pt-6 border-t` — at 360px with three controls (prev + mark-complete + next), this can be cramped |

**Specific concerns**:
1. **Course name invisible on mobile** (`hidden sm:block` on course title in header) — user loses context of which course they're in
2. **Prev/Next icons-only** — `<ChevronLeft>` alone is ambiguous; a user could tap it thinking it's a back button to the course, not the previous lesson
3. **Curriculum drawer is not persistent** — it's a `<details>` element that closes on link click (loses state on navigation); a bottom sheet or persistent slide-over would be better for course navigation
4. **No bottom-docked nav** — bottom navigation with prev/next/curriculum is a standard pattern for mobile learning apps (Coursera, Udemy); the current bottom nav is inline within the content scroll area and disappears when reading long lessons
5. **`px-4 py-10`** — vertical padding of 40px at top and bottom of content area wastes screen real estate on mobile

**Severity**: P1 (prev/next labels, course title hidden, no docked bottom nav)

---

### Search Modal

**At 360px**:
- `mt-20` positions the modal 80px from top — with keyboard open (~300px), the search input should remain visible
- Input is `autoFocus` — triggers keyboard immediately ✅
- No `inputmode="search"` attribute — keyboard will show standard QWERTY, not optimized search keyboard
- No touch feedback on search submit

**Severity**: P2

---

### Footer

**At 360px**:
- `grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5` → 2 columns at mobile
- Brand column is `col-span-2` at mobile — takes full width, then 4 link groups split into 2×2
- Links are `text-sm` — 14px with `py-0` — **tap targets are too small** (text links with no padding = ~20px height)
- No collapse/accordion behavior for mobile footer sections

**Severity**: P2

---

## Critical Issues by Severity

### P0 — Must Fix Immediately

| # | Issue | Location | Impact |
|---|---|---|---|
| P0-1 | Enrollment CTA buried below entire curriculum on mobile | `courses/[slug]/page.tsx` | Conversion-critical; user must scroll 1000px+ to enroll |

### P1 — Major UX Problem

| # | Issue | Location | Impact |
|---|---|---|---|
| P1-1 | Lesson player: "Previous"/"Next" labels hidden on mobile (`hidden sm:block`) | `courses/[slug]/lessons/[lessonId]/page.tsx` | Ambiguous navigation; icon-only is confusing |
| P1-2 | Lesson player: course title hidden on mobile (`hidden sm:block`) | Same | Student loses course context mid-lesson |
| P1-3 | Lesson player: no docked bottom nav bar for curriculum + prev/next | Same | Standard pattern for mobile learning apps; content scrolls, controls disappear |
| P1-4 | Hamburger button tap target 36px (h-9 w-9) | `navbar.tsx` | Below 44px minimum |
| P1-5 | Explanation tabs (UnderstandTabs) likely overflow at 360px | `tech/[slug]/page.tsx` | Tabs may clip or cause horizontal scroll |

### P2 — Important Improvement

| # | Issue | Location | Impact |
|---|---|---|---|
| P2-1 | No persistent bottom tab bar for mobile primary navigation | `navbar.tsx` | Hamburger is slow; primary actions require 2+ taps |
| P2-2 | Footer link tap targets are undersized (text-only, no padding) | `footer.tsx` | Difficult to tap small links |
| P2-3 | Search modal missing `inputmode="search"` | `navbar.tsx` | Non-optimized mobile keyboard |
| P2-4 | Technology facts buried below fold on mobile (sidebar collapses to bottom) | `tech/[slug]/page.tsx` | Users want quick facts at top |
| P2-5 | Hero CTAs lack visual hierarchy on mobile (3 equal-weight stacked buttons) | `page.tsx` | Unclear primary action |

### P3 — Polish

| # | Issue | Location | Impact |
|---|---|---|---|
| P3-1 | Filter pills on /tools page tap target ~36px | `tools/page.tsx` | Minor friction |
| P3-2 | Curriculum drawer loses open state on lesson navigation | Lesson player | Slight friction; reopening is not obvious |
| P3-3 | Lesson content `py-10` wastes vertical space on mobile | Lesson player | Less content per scroll |

---

## Specific Fix Recommendations

### P0-1: Float enrollment CTA on mobile for course detail

Add a fixed bottom CTA bar on mobile when not enrolled:

```tsx
{/* Mobile sticky enrollment bar */}
<div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-zinc-950/95 
                border-t border-zinc-200 dark:border-zinc-800 p-4 backdrop-blur-sm">
  <EnrollButton courseId={c.id} courseSlug={slug} isFree={isFree} firstLessonId={firstLessonId} />
</div>
```

And add `pb-24 lg:pb-0` to the page content wrapper to prevent content being hidden behind the sticky bar.

---

### P1-1/P1-2: Lesson player mobile header — show course name + lesson labels

In `lesson-player header`:
```tsx
{/* Show course title always */}
<span className="truncate">{course.title}</span>
{/* not: hidden sm:block */}
```

For prev/next buttons — show short labels even on mobile:
```tsx
<ChevronLeft className="h-4 w-4 mr-1" />
<span>Prev</span>  {/* instead of hidden sm:block Previous */}
```

---

### P1-3: Docked bottom lesson nav bar

Replace the inline `pt-6 border-t` bottom nav with a docked fixed bar:

```tsx
{/* Mobile: fixed bottom bar */}
<div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-zinc-200 
                dark:border-zinc-800 bg-white dark:bg-zinc-950 
                flex items-center justify-between px-4 h-14">
  {/* Curriculum toggle | Prev | Mark Complete | Next */}
</div>
```

Bottom bar slots:
- **[≡]** — opens curriculum drawer  
- **[← Prev]** — previous lesson  
- **[✓ Complete]** — mark complete (or status indicator if done)  
- **[Next →]** — next lesson

Add `pb-14 lg:pb-0` to main content area.

---

### P1-4: Navbar hamburger tap target

Change `h-9 w-9` to `h-11 w-11` (44px) and adjust icon centering:
```tsx
className="flex items-center justify-center h-11 w-11 rounded-md border border-zinc-200 lg:hidden"
```

Also increase search button: `h-11 px-3`.

---

### P1-5: Explanation tabs overflow

In `UnderstandTabs`, ensure the tabs container has:
```tsx
className="flex gap-1 overflow-x-auto no-scrollbar pb-1"
```
With `no-scrollbar` utility (hide scrollbar visually but allow scroll). Tab labels should use short labels on mobile: "30s", "Simple", "Beginner", "Engineer", "Architect".

---

## Proposed Mobile Navigation Structure

**Current**: Top sticky navbar with hamburger drawer (right slide-in)  
**Recommendation**: Keep top navbar for brand/search, add **persistent bottom tab bar** for mobile primary navigation

### Bottom Tab Bar (mobile only, ≤1024px)

```
[Home] [Learn] [News] [Tools] [Search] [More]
```

| Tab | Route | Icon | Exists? |
|---|---|---|---|
| Home | `/` | House | ✅ |
| Learn | `/learn` | BookOpen | ✅ |
| News | `/news` | Newspaper | ✅ |
| Tools | `/tools` | Wrench | ✅ |
| Search | (modal) | Search | ✅ |
| More | drawer | MoreHorizontal | — |

**More drawer** (secondary items):
- Tech → `/tech`
- Compare → `/compare` *(verify 200 first — P0 for Agent 1)*
- Companies → `/companies`
- Work → `/work`
- Interviews → `/interviews`
- Status → `/status`
- Enterprise → `/enterprise`

**Do not include**: Community (`/community`) until route is verified.

### Implementation approach:
```tsx
{/* Bottom tab bar — mobile only */}
<nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-zinc-200 
                bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm
                flex items-center h-16 px-1 safe-area-pb">
  {PRIMARY_TABS.map(tab => (
    <Link key={tab.href} href={tab.href} 
          className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 
                     min-h-[44px] text-zinc-500 dark:text-zinc-400
                     data-[active=true]:text-zinc-900 dark:data-[active=true]:text-white">
      {tab.icon}
      <span className="text-[10px] font-medium">{tab.label}</span>
    </Link>
  ))}
</nav>
```

Add `pb-16 lg:pb-0` to the main content area and `safe-area-pb` utility for iPhone home bar.

---

## Lesson Player Mobile Redesign Recommendation

**Target**: Premium learning app feel (Coursera/Linear course-player quality on mobile)

### Proposed Layout

```
┌─────────────────────────────────┐  ← sticky header (h-14)
│ ← KubernetesOps  ████████ 4/12 │
├─────────────────────────────────┤
│ [Curriculum ▾ — tap to expand]  │  ← details/summary (keep)
├─────────────────────────────────┤
│                                 │
│  Module 1 · Lesson 3            │  ← breadcrumb (smaller)
│  Introduction to Pods           │  ← h1 text-xl (was 2xl/3xl)
│                                 │
│  ┌─────────────────────────┐    │
│  │    Video / Content      │    │
│  └─────────────────────────┘    │
│                                 │
│  Learning Objectives            │
│  · Understand pod lifecycle     │
│  · Configure resource limits    │
│                                 │
│  [lesson content body]          │
│                                 │
│                  ↕ scroll        │
│                                 │
└─────────────────────────────────┘
┌─────────────────────────────────┐  ← fixed bottom bar (h-14)
│ [≡]   [← Prev]   [✓]   [Next→] │
└─────────────────────────────────┘
```

**Key changes from current**:
1. Course title always visible in header (remove `hidden sm:block`)
2. Prev/Next show "Prev" / "Next" text labels (not icon-only)
3. Bottom bar is fixed/docked — never scrolls away
4. Bottom bar includes curriculum toggle (≡) to open/close the accordion
5. Reduce lesson content top padding from `py-10` to `py-6`
6. H1 title at `text-xl` on mobile (currently `text-2xl sm:text-3xl`) to give more content space
7. `inputmode="search"` on search inputs

---

## Breakpoint Summary Table

| Page | 360px | 390px | 430px | 768px |
|---|---|---|---|---|
| Homepage | ⚠️ CTA hierarchy | ⚠️ | OK | OK |
| Navbar | ⚠️ small targets | ⚠️ | OK | OK |
| /tech/[slug] | ⚠️ tabs risk | ⚠️ | OK | OK |
| /tools | ✅ | ✅ | ✅ | ✅ |
| /learn | ✅ | ✅ | ✅ | ✅ |
| /courses/[slug] | 🔴 CTA buried | 🔴 | ⚠️ | OK |
| Lesson player | ⚠️ icon-only nav | ⚠️ | ⚠️ | OK |
| /compare/[slug] | ✅ | ✅ | ✅ | ✅ |
| Footer | ⚠️ small targets | ⚠️ | OK | OK |

🔴 = P0, ⚠️ = P1/P2, ✅ = OK

---

*Agent 1 should verify: `/compare`, `/community`, `/enterprise`, `/about`, `/privacy`, `/terms` — these are linked from navbar/footer and their 404 status directly affects mobile nav link safety.*
