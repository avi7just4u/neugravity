# NeuGravity Design System

Brand direction: **intelligence · signal · motion · clarity**

Source of truth: `src/app/globals.css`
Motion primitives: `src/components/ui/motion.tsx`

---

## 1. Design Tokens

All tokens are CSS custom properties set in `:root` (light) and `.dark` (dark). Tailwind v4 maps them to `--color-*` utilities via `@theme inline` — no `tailwind.config.ts` exists.

### Color Tokens

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--background` | `#ffffff` | `#09090b` | Page background |
| `--foreground` | `#09090b` | `#fafafa` | Primary text |
| `--surface` | `#ffffff` | `#0f0f12` | Card/panel backgrounds |
| `--surface-raised` | `#f4f4f5` | `#18181b` | Elevated surfaces, secondary panels |
| `--border` | `#e4e4e7` | `#27272a` | Default border |
| `--border-subtle` | `#f4f4f5` | `#1c1c1f` | De-emphasized borders |
| `--muted` | `#52525b` | `#a1a1aa` | Secondary text |
| `--muted-foreground` | `#71717a` | `#71717a` | Tertiary/placeholder text |
| `--brand` | `#4f46e5` | `#6366f1` | Primary brand / interactive color |
| `--brand-foreground` | `#ffffff` | `#ffffff` | Text on brand backgrounds |
| `--brand-subtle` | `#eef2ff` | `#1e1b4b` | Brand-tinted backgrounds |
| `--ring` | `#4f46e5` | `#6366f1` | Focus ring |

### Tailwind Utilities (auto-generated from tokens)

```
bg-background        text-foreground
bg-surface           bg-surface-raised
border-border        border-border-subtle
text-muted           text-muted-foreground
bg-brand             text-brand
bg-brand-subtle      text-brand-foreground
```

### Special Values (hardcoded, not tokenized)

These are intentionally hardcoded — they are fixed values not intended to vary by theme:

| Value | Location | Purpose |
|---|---|---|
| `::selection` bg | `#c7d2fe` / `.dark` `#312e81` | Text selection highlight |
| `.signal-dot--live` | `#22c55e` | Live/active status indicator |
| `.bg-dot-grid` | zinc-300 (`#d4d4d8`) / zinc-800 (`#27272a`) | Hero dot-grid pattern |
| `.text-gradient` | `#4f46e5 → #7c3aed → #6366f1` light, `#818cf8 → #a78bfa → #6366f1` dark | Brand gradient text |

---

## 2. Typography Scale

All type classes are defined as CSS utility classes in `globals.css`. Use these everywhere — not raw `text-*` size utilities.

| Class | Size | Weight | Letter-spacing | Line-height | Use |
|---|---|---|---|---|---|
| `.text-display` | `clamp(2.5rem, 6vw, 4.5rem)` | 800 | -0.03em | 1.05 | Hero/page titles |
| `.text-headline` | `clamp(1.5rem, 3vw, 2.25rem)` | 700 | -0.02em | 1.15 | Section headlines |
| `.text-title` | `1.125rem` | 600 | -0.01em | 1.35 | Card/sub-section titles |
| `.text-label` | `0.6875rem` | 600 | +0.08em (uppercase) | — | Metadata, labels, tags |

### Gradient Text Utilities

```css
.text-gradient         /* Full brand gradient — hero accent words */
.text-gradient-subtle  /* foreground→muted gradient — headings */
```

### Font Families

```
--font-sans: Geist Sans → system-ui → -apple-system → Segoe UI → sans-serif
--font-mono: Geist Mono → JetBrains Mono → Fira Code → monospace
```

---

## 3. Component Patterns

### Cards

```css
/* Base card — all entity cards */
.card-base
  background: var(--surface)
  border: 1px solid var(--border)
  border-radius: 0.75rem
  hover → border-color: var(--brand) + brand glow shadow

/* Clickable card — adds cursor + lift transform */
.card-interactive   (always combine with .card-base)
  hover → translateY(-1px)

/* Elevated surface card */
.card-raised
  background: var(--surface-raised)
  border: 1px solid var(--border-subtle)
  border-radius: 0.75rem
```

### Buttons

```css
.btn-brand
  background: var(--brand)
  color: var(--brand-foreground)
  border-radius: 0.5rem
  font-weight: 600
  hover → opacity 0.92 + translateY(-1px)
```

`src/components/ui/button.tsx` also has a `default` variant using `bg-indigo-600` (see Color Consistency Issues — this is a known inconsistency).

### Section Layout

```css
.section-container
  max-width: 1400px
  padding-inline: clamp(1rem, 4vw, 2rem)
  margin-inline: auto

.section-header
  display: flex, space-between, mb-6
  (wrap title + optional "View all" link)

.section-label
  uppercase, tracked, 0.6875rem, font-weight 600
  color: var(--brand)
  (use for eyebrow labels above section headings)
```

### Status / Progress Indicators

```css
.signal-dot           /* 6×6px dot, color: currentColor */
.signal-dot--live     /* green #22c55e with pulsing box-shadow */
```

### Background Patterns

```css
.bg-dot-grid          /* Radial dot grid — use on hero sections */
.glow-brand           /* Pseudo-element brand radial glow behind element */
```

### Line Clamp Utilities

```css
.line-clamp-1   .line-clamp-2   .line-clamp-3
```

---

## 4. Animation Primitives

Two systems exist in parallel. Use Framer Motion (scroll-triggered) for page sections; use CSS classes for simple one-shot entrance animations on individual elements.

### CSS Animations (`globals.css`)

| Class | Keyframe | Duration | Use |
|---|---|---|---|
| `.animate-fade-in` | opacity 0→1 + translateY 8px→0 | 0.35s | Single element entrance |
| `.animate-fade-in-fast` | opacity 0→1 | 0.2s | Quick reveal (modals, tooltips) |
| `.animate-slide-up` | opacity 0→1 + translateY 16px→0 | 0.4s | Heavier entrance |
| `.animate-children` | applies `fade-in` to every direct child with staggered delays | 60ms steps, up to 6 children | Grid/list stagger without JS |

**Stagger delays for `.animate-children`:** 0ms, 60ms, 120ms, 180ms, 240ms, 300ms (nth-child 1–6).

### Framer Motion Components (`src/components/ui/motion.tsx`)

All components respect `prefers-reduced-motion` — they fall back to plain `<div>` when reduced motion is requested.

| Export | Type | Trigger | Props | Use |
|---|---|---|---|---|
| `AnimatedSection` | `motion.div` | scroll into view | `delay`, `className` | Wraps any page section |
| `StaggerContainer` | `motion.div` | scroll into view | `fast`, `delay`, `className` | Parent for staggered children |
| `StaggerChild` | `motion.div` (forwardRef) | inherits from parent | `className` | Must be direct child of `StaggerContainer` |
| `AnimatedCard` | `motion.div` | scroll into view + hover | `className` | Cards with entrance + hover lift |
| `WordReveal` | `motion.span` | mounts (not scroll) | `text`, `delay` | Hero heading word-by-word reveal |
| `motion` | re-export | — | — | Direct framer-motion access |

#### Variants (exported, reusable)

```ts
fadeUp      // { opacity: 0, y: 24 } → { opacity: 1, y: 0 }, 0.5s custom ease
fadeIn      // opacity 0→1, 0.4s easeOut
stagger     // staggerChildren: 0.08, delayChildren: 0.1
staggerFast // staggerChildren: 0.05, delayChildren: 0.05
scaleIn     // opacity+scale 0.92→1, 0.45s custom ease
```

#### Easing

All Framer Motion animations use `[0.22, 1, 0.36, 1]` (expo-out) for entrances — matches the brand feel of sharp acceleration and soft landing.

---

## 5. Color Consistency Issues

### The Problem

Two categories of non-token color usage exist:

**Category A — `indigo-*` Tailwind classes instead of `--brand` token (105 occurrences)**
These are semantically correct (right color) but wrong abstraction level. If the brand color ever changes, all of these must be updated manually.

**Category B — `blue-*` Tailwind classes (53 occurrences across 25 files)**
These use a different color entirely. Some are intentional semantic differences (status badges: "approved", "running", "info"), but many are inconsistent with the brand palette.

### Files Using `blue-*` — Full List

**Public-facing pages (user-visible):**

| File | Notes |
|---|---|
| `src/app/(public)/page.tsx` | `border-l-blue-500` on a card variant — should be `border-l-brand` |

**Components (shared):**

| File | Key Usages |
|---|---|
| `src/components/ui/badge.tsx` | `bg-blue-100 text-blue-800` badge variant |
| `src/components/ui/button.tsx` | `bg-indigo-600` on default variant (uses indigo, not token) |
| `src/components/admin/stat-card.tsx` | `info` variant: `bg-blue-50 text-blue-600` |
| `src/components/admin/status-badge.tsx` | Pending/Discovered/Enriching: `bg-blue-500` |
| `src/components/admin/explanation-editor.tsx` | `approved` state, focus rings, submit button all `blue-*` |
| `src/components/lesson/callouts.tsx` | Info/note callout: `bg-blue-50 border-blue-200 text-blue-700` |
| `src/components/lesson/article-lesson.tsx` | Inline code `text-blue-600`, blockquote `border-blue-400`, list bullets `text-blue-500` |
| `src/components/tech/prerequisite-card.tsx` | Hover state `text-blue-600`, icon badge `bg-blue-100` |
| `src/components/tech/concept-flow.tsx` | Hover border `border-blue-400`, hover text `text-blue-600` |
| `src/components/tech/ecosystem-section.tsx` | Hover text `text-blue-600` — 2 instances |
| `src/components/tech/related-news-section.tsx` | Hover text `text-blue-600` |

**Admin pages (internal, lower priority):**

| File | Key Usages |
|---|---|
| `src/app/admin/editorial/page.tsx` | "official" badge `bg-blue-50 text-blue-600` |
| `src/app/admin/editorial/news/[id]/page.tsx` | `enriched` status, "official" badge, link color, approved status |
| `src/app/admin/education/page.tsx` | `approved` status badge |
| `src/app/admin/education/paths/page.tsx` | `intermediate` difficulty badge |
| `src/app/admin/education/paths/[id]/path-editor-actions.tsx` | "Submit for Review" button `bg-blue-600` |
| `src/app/admin/education/courses/page.tsx` | `intermediate` difficulty badge |
| `src/app/admin/education/courses/[id]/course-editor-actions.tsx` | "Submit for Review" button `bg-blue-600` |
| `src/app/admin/education/courses/[id]/page.tsx` | "preview" badge `text-blue-500` |
| `src/app/admin/system/automation/page.tsx` | Link colors, RSS icon `text-blue-500` |
| `src/app/admin/system/jobs/page.tsx` | `running` job status badge |
| `src/app/admin/knowledge/page.tsx` | `USES` relationship type badge |
| `src/app/admin/content-calendar/page.tsx` | `review` status, hover text, links |
| `src/app/admin/sources/source-actions.tsx` | "Pause" button border+text |
| `src/app/admin/sources/page.tsx` | `official` source type badge |

### `indigo-*` vs `--brand` Token (105 occurrences across most public pages)

Key public-facing files with direct `indigo-*` usage (should use `text-brand`, `bg-brand`, `bg-brand-subtle`):

- `src/app/(public)/page.tsx` — 25+ instances (buttons, hover states, background blurs, labels)
- `src/app/(public)/courses/[slug]/page.tsx` — 15+ instances (progress bars, buttons, badges)
- `src/app/(public)/courses/[slug]/lessons/[lessonId]/page.tsx` — 10+ instances
- `src/components/layout/navbar.tsx` — 15+ instances (logo bg, active states, CTA button)
- `src/components/layout/footer.tsx` — 6 instances (logo, social hover states, links)
- `src/components/ui/badge.tsx` — `bg-indigo-600` brand variant
- `src/components/ui/button.tsx` — `bg-indigo-600` default variant

---

## 6. Pages Missing Animation

The following public pages have zero Framer Motion usage (`AnimatedSection`, `StaggerContainer`) and no CSS animation classes (`animate-fade-in`, `animate-slide-up`). They render immediately with no entrance motion.

**33 pages with no animation:**

```
src/app/(public)/contact/page.tsx
src/app/(public)/learn/page.tsx
src/app/(public)/learn/dashboard/page.tsx
src/app/(public)/learn/[slug]/page.tsx
src/app/(public)/tools/page.tsx
src/app/(public)/tools/[slug]/page.tsx
src/app/(public)/privacy/page.tsx
src/app/(public)/enterprise/page.tsx
src/app/(public)/signup/page.tsx
src/app/(public)/articles/page.tsx
src/app/(public)/articles/[slug]/page.tsx
src/app/(public)/terms/page.tsx
src/app/(public)/about/page.tsx
src/app/(public)/status/page.tsx
src/app/(public)/search/page.tsx
src/app/(public)/courses/page.tsx
src/app/(public)/courses/[slug]/page.tsx
src/app/(public)/courses/[slug]/lessons/[lessonId]/page.tsx
src/app/(public)/news/page.tsx
src/app/(public)/news/[slug]/page.tsx
src/app/(public)/work/page.tsx
src/app/(public)/forgot-password/page.tsx
src/app/(public)/compare/page.tsx
src/app/(public)/compare/[slug]/page.tsx
src/app/(public)/reset-password/page.tsx
src/app/(public)/community/page.tsx
src/app/(public)/tech/page.tsx
src/app/(public)/tech/[slug]/page.tsx
src/app/(public)/interviews/page.tsx
src/app/(public)/interviews/[slug]/page.tsx
src/app/(public)/login/page.tsx
src/app/(public)/companies/page.tsx
src/app/(public)/companies/[slug]/page.tsx
```

**Pages with animation (motion.tsx imported):**

```
src/app/(public)/page.tsx          ← home page only
src/components/ui/motion.tsx       ← definition file
```

The home page is the only public page using `AnimatedSection`/`StaggerContainer`. Every other route renders static.

---

## 7. P0 Fixes (Must Fix)

These issues affect user-visible, brand-critical surfaces.

### P0-1: Token brand color in `button.tsx` and `badge.tsx`

**Files:**
- `src/components/ui/button.tsx:25` — `bg-indigo-600 text-white hover:bg-indigo-700` → `bg-brand text-brand-foreground hover:opacity-90`
- `src/components/ui/badge.tsx:25` — `bg-indigo-600 text-white` → `bg-brand text-brand-foreground`

These are shared primitives. Fixing them propagates to every page that uses `<Button>` or `<Badge variant="brand">`.

### P0-2: Navbar and footer use raw `indigo-*` throughout

**Files:**
- `src/components/layout/navbar.tsx` — logo background `bg-indigo-600`, active nav `text-indigo-600 bg-indigo-50`, CTA button `bg-indigo-600`
- `src/components/layout/footer.tsx` — logo `bg-indigo-600`, social icon hovers

These are rendered on every page. Replace all `indigo-*` with appropriate token utilities (`bg-brand`, `text-brand`, `bg-brand-subtle`).

### P0-3: Tech component cluster uses `blue-*` hover states

The `/tech/[slug]` detail page and its child components render with blue hover colors that are off-brand:

- `src/components/tech/prerequisite-card.tsx` — hover `text-blue-600`, badge `bg-blue-100 text-blue-600`
- `src/components/tech/concept-flow.tsx` — hover `border-blue-400`, `text-blue-600`
- `src/components/tech/ecosystem-section.tsx` — hover `text-blue-600`
- `src/components/tech/related-news-section.tsx` — hover `text-blue-600`

Replace all with `text-brand` / `border-brand` equivalents.

### P0-4: Home page (`/`) uses raw `indigo-*` for all interactive elements

`src/app/(public)/page.tsx` has 25+ `indigo-*` usages on buttons, hover states, and background blurs. The CTA buttons at lines 176 and 513 use `bg-indigo-600 hover:bg-indigo-700` — these should be `.btn-brand` or `bg-brand`.

### P0-5: Lesson content uses wrong brand color

`src/components/lesson/article-lesson.tsx` uses `text-blue-600` for inline code, `border-blue-400` for blockquotes, `text-blue-500` for list bullets. Lesson content is core product — these should be `text-brand` or `text-muted`.

---

## 8. P1 Improvements

These are quality improvements — no user-facing bugs, but meaningful polish.

### P1-1: Extend `AnimatedSection` to content listing pages

The highest-impact pages missing animation are:

1. `src/app/(public)/articles/page.tsx` — article list
2. `src/app/(public)/courses/page.tsx` — course catalog
3. `src/app/(public)/tech/page.tsx` — tech catalog
4. `src/app/(public)/news/page.tsx` — news feed
5. `src/app/(public)/companies/page.tsx` — company directory

Pattern: wrap the grid with `<StaggerContainer>` and each card with `<StaggerChild>`. Import from `src/components/ui/motion.tsx`.

### P1-2: Animate article/course detail pages

`src/app/(public)/articles/[slug]/page.tsx` and `src/app/(public)/courses/[slug]/page.tsx` render the hero header statically. Wrap the header block with `<AnimatedSection>` and the sidebar with `<AnimatedSection delay={0.1}>`.

### P1-3: Add `AnimatedSection` to `/about` and `/enterprise`

Both are conversion-critical pages that currently have no motion. Wrapping sections with `<AnimatedSection>` would improve perceived quality with minimal code change.

### P1-4: Normalize all `indigo-*` to `--brand` token in public pages

After P0 fixes to primitives (button, badge, navbar, footer), sweep remaining public pages:

- `src/app/(public)/courses/[slug]/page.tsx` — progress bar, lesson numbers, CTA
- `src/app/(public)/courses/[slug]/lessons/[lessonId]/page.tsx` — progress bar, active lesson highlight, buttons
- `src/app/(public)/learn/dashboard/page.tsx` — progress bar `bg-indigo-600`

Use `bg-brand` for solid fills and `bg-brand-subtle` for tinted backgrounds.

### P1-5: Create semantic blue aliases for status colors

`blue-*` is used legitimately for status semantics (running, approved, info, enriched, intermediate difficulty). Rather than leaving these as raw Tailwind classes, add CSS tokens:

```css
/* In globals.css :root / .dark */
--info:          #3b82f6;   /* light */
--info-subtle:   #eff6ff;
/* dark */
--info:          #60a5fa;
--info-subtle:   #1e3a5f;
```

This allows `text-info`, `bg-info-subtle` utilities and decouples status semantics from the brand palette entirely.

### P1-6: Extend `.animate-children` stagger beyond 6 children

The current CSS stagger handles up to 6 children. Several grids (tech cards, course cards) have more. Either extend to 10, or replace with `StaggerContainer` + `StaggerChild` for grids larger than 6.

### P1-7: Add `WordReveal` to section headlines on landing page

`WordReveal` exists in `motion.tsx` but is only used on the home page hero. Section headlines on `/enterprise`, `/about`, and high-intent landing pages would benefit from the word reveal for "intelligence" branding effect.

---

## Appendix: File Map

| File | Role |
|---|---|
| `src/app/globals.css` | All design tokens, typography classes, component classes, animations |
| `src/components/ui/motion.tsx` | Framer Motion primitives (AnimatedSection, StaggerContainer, etc.) |
| `src/components/ui/button.tsx` | Button component — has raw `indigo-600` (P0) |
| `src/components/ui/badge.tsx` | Badge component — has raw `indigo-600` and `blue-100` (P0) |
| `src/components/layout/navbar.tsx` | Global nav — heavy `indigo-*` usage (P0) |
| `src/components/layout/footer.tsx` | Global footer — `indigo-*` usage (P0) |
| `src/components/tech/` | Tech detail page components — `blue-*` hover states (P0) |
| `src/components/lesson/` | Lesson content components — `blue-*` for code/blockquotes (P0) |
| `src/components/admin/` | Admin-only components — `blue-*` for status/info (P1-5) |
