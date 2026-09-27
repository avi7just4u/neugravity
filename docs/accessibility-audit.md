# NeuGravity — Accessibility & Interaction Audit

**Date**: 2026-09-28  
**Scope**: Public site, lesson player, quiz, project, search, login, admin editorial forms  
**Method**: Static analysis of source files — no automated axe/Playwright run performed

---

## Overall Grades

| Area | Grade | Notes |
|---|---|---|
| Navigation (desktop) | B | Semantic nav, aria-labels, active states — missing ⌘K keyboard handler |
| Navigation (mobile drawer) | C | No focus trap, no aria-modal, no focus restoration on close |
| Search modal (navbar) | C | autoFocus + Escape close — no aria-dialog, no focus trap, no live region |
| Search results page | C | No h1, no aria-live for results count, no list semantics on results |
| Login form | B | Labeled inputs, proper autocomplete — focus ring only `ring-1` |
| Lesson player | B | Good h1, breadcrumb, semantic nav for prev/next — progress bar missing ARIA |
| Lesson curriculum (desktop sidebar) | B | Nav landmark, links — active lesson lacks aria-current |
| Lesson curriculum (mobile accordion) | C | Uses `<details>/<summary>` — no ARIA on completion state indicators |
| Quiz | C | Buttons for answers (good) — no fieldset/legend grouping per question, no aria-live on result |
| Project submission | B | Labeled textarea/input via placeholder only — missing `<label>` elements |
| Video lesson | B | iframe has title — no aria-label on container |
| Course detail page | B | h1, breadcrumb nav, curriculum section — missing aria-current on active lesson |
| Dialog (Radix) | A | Full Radix primitive with focus trap, aria-dialog, close button with sr-only |
| Dropdown menu (Radix) | A | Full Radix primitive — keyboard accessible by default |
| Select (Radix) | A | Full Radix primitive — keyboard accessible by default |
| Tabs (UnderstandTabs) | B | role=tablist, role=tab, aria-selected, aria-controls — missing id on panels |
| Footer | B | Semantic footer, social links have aria-label — nav links lack a wrapping nav landmark |
| Admin forms (sources/new) | D | Inputs appear in form but grep shows no associated label elements visible near inputs |
| Admin opportunity actions | B | Button labels are text-only (not icon-only) — acceptable |

---

## Critical Issues (must fix)

### C1 — Mobile drawer: no focus trap, no aria-modal

**File**: `src/components/layout/navbar.tsx:150-290`

The mobile nav drawer opens as `position: fixed` but is not a `<dialog>` element and has no focus trap. A keyboard user can Tab past the drawer into obscured page content behind the overlay. There is no `aria-modal="true"` to signal to screen readers that the backdrop content is inert.

**Fix**: Add `aria-modal="true"` to the `<nav>` drawer element. Implement focus trapping (first focusable → last focusable loop on Tab). On close, return focus to the hamburger button that opened it. Consider converting to a `<dialog>` element or using Radix `Dialog`.

---

### C2 — Search modal: no focus trap, no dialog role

**File**: `src/components/layout/navbar.tsx:294-330`

The search overlay is a plain `<div>` with `autoFocus` on the input. There is no `role="dialog"`, no `aria-modal`, no `aria-label`, and no focus trap. A screen reader user has no signal that a modal context is active.

**Fix**: Add `role="dialog"`, `aria-modal="true"`, `aria-label="Search"`. Trap focus within the modal container. Return focus to the search button on Escape/close.

---

### C3 — ⌘K keyboard shortcut advertised but not implemented

**File**: `src/components/layout/navbar.tsx:108`

The search button shows `⌘K` as a keyboard shortcut but there is no `useEffect` / `addEventListener("keydown")` in the Navbar to open search on that keypress. This is a broken affordance for keyboard users.

**Fix**: Add a global keydown listener: `if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true) }`.

---

### C4 — No skip-to-main-content link

**File**: `src/app/(public)/layout.tsx`

There is no skip link. Keyboard users must tab through the entire navbar (9+ items) to reach main content on every page.

**Fix**: Add as the first element in layout:
```tsx
<a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-zinc-900 focus:text-white focus:rounded-lg">
  Skip to main content
</a>
```
And add `id="main-content"` to `<main>`.

---

### C5 — Progress bar has no ARIA role

**File**: `src/app/(public)/courses/[slug]/lessons/[lessonId]/page.tsx:211-214`

The course progress bar is a `<div>` with inline width style. Screen readers cannot announce progress.

**Fix**:
```tsx
<div
  role="progressbar"
  aria-valuenow={courseProgress.percent}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label={`Course progress: ${courseProgress.percent}%`}
  className="h-full rounded-full bg-blue-500 transition-all duration-500"
  style={{ width: `${courseProgress.percent}%` }}
/>
```

---

## Important Issues (P1)

### I1 — Quiz: no fieldset/legend grouping, no aria-live on result

**File**: `src/components/lesson/quiz-lesson.tsx`

Each question is a `<div>` with a `<p>` for the question text and `<button>` elements for options. There is no `<fieldset>`/`<legend>` grouping each question, so screen readers cannot associate the question text with its answer buttons.

The result state transition (pass/fail) is not announced via `aria-live`. A screen reader user submitting a quiz gets no announcement.

**Fix**: Wrap each question in `<fieldset>` with `<legend>{q.question_text}</legend>`. Add `aria-live="polite"` region for result announcement.

---

### I2 — Project form: inputs have placeholder-only labels

**File**: `src/components/lesson/project-lesson.tsx:108-122`

`<textarea>` and `<input type="url">` use `placeholder` as the only label. Placeholders disappear on input and are not reliably read by all screen readers as labels.

**Fix**: Add `<label htmlFor="submission">Your submission</label>` with `id="submission"` on the input.

---

### I3 — Lesson curriculum sidebar: active lesson missing aria-current

**File**: `src/app/(public)/courses/[slug]/lessons/[lessonId]/page.tsx:246-269`

The active lesson link is styled differently but has no `aria-current="page"` or `aria-current="true"`.

**Fix**: Add `aria-current={isActive ? "page" : undefined}` to the active lesson link.

---

### I4 — UnderstandTabs: panel elements missing id binding

**File**: `src/components/tech/understand-tabs.tsx:36`

Each tab button has `aria-controls={`explanation-panel-${tab.type}`}` but the corresponding panel `<div>` elements (rendered elsewhere in the page) must have matching `id` attributes. If those IDs aren't present in the explanation panel component, the `aria-controls` reference is broken.

**Action**: Verify that the explanation panels in the tech page have `id="explanation-panel-{type}"` attributes.

---

### I5 — Mobile curriculum uses `<details>` — limited ARIA support

**File**: `src/app/(public)/courses/[slug]/lessons/[lessonId]/page.tsx:278-316`

`<details>/<summary>` has partial screen reader support and inconsistent behaviour across browsers/AT combinations. The completion state indicators (empty circle vs checkmark) inside use `<span>` elements with no text alternative.

**Fix**: Replace empty span indicators with sr-only text: `<span className="sr-only">{status === "completed" ? "Completed" : "Not completed"}</span>`.

---

### I6 — Search results page: no heading, no list semantics, no aria-live

**File**: `src/app/(public)/search/search-island.tsx`

The results area starts with a `<p>` count, then results as `<Link>` divs — no `<h1>`, no `<ul>/<li>` list structure, no `aria-live="polite"` to announce when results update after a search.

**Fix**: Add `<h1 className="sr-only">Search results for "{query}"</h1>`. Wrap results in `<ul>` with `<li>` per result. Add `aria-live="polite"` to the results container.

---

### I7 — Admin sources form: inputs without label elements

**File**: `src/app/admin/sources/new/page.tsx`

Multiple `<input>` and `<textarea>` elements visible without `<label htmlFor>` pairing visible in the same file context. Even if visual context is provided by surrounding `<div>` text, screen readers need explicit label associations.

**Fix**: Audit every form field; ensure each has either `<label htmlFor="fieldId">` or `aria-label` on the input itself.

---

### I8 — Login/Contact forms: focus ring is `ring-1` (too thin)

**Files**: `src/app/(public)/login/page.tsx`, `src/app/(public)/contact/page.tsx`, `src/app/(public)/enterprise/page.tsx`

Form inputs use `focus:ring-1 focus:ring-zinc-400` — a 1px ring on a zinc-400 colour may fail WCAG 2.1 SC 1.4.11 (Non-text Contrast, 3:1 ratio). The Tailwind default global `focus-visible` rule provides a 2px zinc outline, but these inputs override it to only `ring-1`.

**Fix**: Change to `focus:ring-2 focus:ring-zinc-500` or match the global focus-visible style.

---

## Good Practices Found

- **`lang="en"` on `<html>`** — correctly set in root layout
- **`aria-label` on logo links** — `aria-label="NeuGravity home"` on both navbar and footer logos
- **`aria-label` on nav landmarks** — main and mobile navs have `aria-label="Main navigation"` / `"Mobile navigation"`
- **`aria-expanded` on mobile menu toggle** — correctly reflects open/closed state
- **`aria-expanded` on mobile "More" toggle** — correctly reflects expanded state
- **Social links have descriptive aria-labels** — footer social icon links labeled `"NeuGravity on X"` etc.
- **Dialog (Radix)** — full focus trap, aria-dialog, close button with `<span className="sr-only">Close</span>`
- **Dropdown and Select (Radix)** — full keyboard navigation, ARIA roles, managed by the primitive
- **Quiz uses `<button>` not `<div>` for answers** — correct interactive semantics
- **Video iframe has `title="Lesson video"`** — required for iframe accessibility
- **`autoFocus` on search input** — correct behavior when modal opens
- **Escape key closes search** — keyboard-dismissible
- **Form autocomplete attributes** — login inputs have `autoComplete="email"` / `"current-password"`
- **`required` on form inputs** — native validation supported
- **`disabled` state on Submit buttons** — prevents double-submit, visually indicated
- **`sr-only` text on dialog close** — `<span className="sr-only">Close</span>` present in Dialog primitive
- **`maximumScale: 5`** in viewport — does not block user scaling (important for low-vision users)
- **Radix tabs in understand-tabs** — proper `role=tablist`, `role=tab`, `aria-selected`, `aria-controls`

---

## Reduced Motion Audit

**Result: FAIL — no `prefers-reduced-motion` support**

```
grep -rn "prefers-reduced-motion" src/ → 0 results
```

Animations present:
1. `globals.css`: `@keyframes fade-in` — `opacity + translateY(8px)` — vestibular-safe if short, but not suppressed for reduced-motion users
2. `dialog.tsx`: Radix data-state animations — `animate-in`, `zoom-in-95`, `slide-in-from-top` — these can cause dizziness for motion-sensitive users; Radix respects `prefers-reduced-motion` **only** if Tailwind's `motion-safe:` / `motion-reduce:` utilities are applied or the animation CSS does so
3. Lesson progress bar: `transition-all duration-500` — minor, acceptable
4. Navbar/drawer: no CSS transitions, just conditional rendering — OK

**Fix**: Add to `globals.css`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## Touch Target Audit

### Small targets identified:

| Element | Size | Location |
|---|---|---|
| Mobile menu hamburger | `h-9 w-9` (36px) | navbar — below 44px minimum |
| Lesson curriculum links (mobile accordion) | `py-2` = ~32px | lesson page |
| Quiz answer buttons | `py-2.5` = ~40px | quiz-lesson — borderline |
| Mark Complete button | `size="sm"` = `h-8` (32px) | lesson bottom bar |
| Previous/Next lesson buttons | `size="sm"` = `h-8` (32px) | lesson bottom bar |
| More/Search buttons in mobile drawer | `py-2.5` = ~40px | navbar drawer — borderline |
| Admin action buttons | `size="sm"` = `h-8` (32px) | opportunity-actions |

**Fix priorities**:
- Mobile hamburger: increase to `h-10 w-10` (40px) minimum, preferably `h-11 w-11` (44px)
- Mark Complete and Prev/Next: use `size="default"` (`h-9`) on mobile or add min-height via responsive classes
- Lesson curriculum mobile: add `py-3` instead of `py-2`

---

## Summary Recommendations (Priority Order)

| Priority | Issue | Component | Effort |
|---|---|---|---|
| P0 | ⌘K shortcut broken | navbar.tsx | Low — add useEffect keydown |
| P0 | Skip-to-main link missing | layout.tsx | Low — add anchor + id |
| P1 | Mobile drawer: no focus trap / aria-modal | navbar.tsx | Medium — add trap + aria-modal |
| P1 | Search modal: no dialog role / focus trap | navbar.tsx | Medium |
| P1 | Progress bar: no ARIA role | lesson/page.tsx | Low — add role/aria-valuenow |
| P1 | Quiz: no fieldset/legend, no result announcement | quiz-lesson.tsx | Medium |
| P1 | No prefers-reduced-motion | globals.css | Low — add @media block |
| P1 | Active lesson: no aria-current | lesson/page.tsx | Low — add aria-current |
| P2 | Project form: no explicit labels | project-lesson.tsx | Low |
| P2 | Search results: no heading, no list, no aria-live | search-island.tsx | Medium |
| P2 | UnderstandTabs panels: verify id binding | understand-tabs / tech page | Low |
| P2 | Touch targets under 44px | navbar, lesson nav | Low-Medium |
| P2 | Focus ring ring-1 too thin on form inputs | login, contact, enterprise | Low |
| P3 | Admin sources form: explicit label elements | sources/new/page.tsx | Low |
| P3 | Mobile curriculum span indicators: sr-only text | lesson/page.tsx | Low |
| P3 | Curriculum sidebar lesson links: aria-current | lesson/page.tsx | Low |
