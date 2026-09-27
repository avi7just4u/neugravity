# NeuGravity — Public UI / Visual Design Audit

**Audit date**: 2026-09-28  
**Auditor**: Agent 2 — Public UI / Visual Design  
**Scope**: Homepage, Tech, News, Tools, Learn, Courses, Navbar, Footer, component system

---

## 1. Current State: Honest Assessment

**Verdict: Generic Vercel/Tailwind SaaS template. Not premium.**

NeuGravity currently reads as a well-executed template site, not a distinctive product. The zinc monochrome palette, Geist Sans font, and card patterns are identical to hundreds of Vercel/shadcn starter kits. Nothing visually signals that this is a technology *intelligence* platform. A user cannot distinguish NeuGravity from a generic landing page within the first five seconds.

What works:
- Clean, readable layout
- Good information density on homepage
- Dark mode foundation exists
- Responsive grid structure is sound
- Component library (Radix + cva) is solid

What does not work:
- Zero visual identity or brand differentiation
- No brand color — blue-600 hover state is Tailwind's uncustomized default
- Logo is a Zap icon in a zinc square — no personality
- No visual metaphor (gravity, orbit, signal, intelligence) anywhere
- Homepage hero has no visual element — left column text, right column is a blurred circle
- Stats in hero (500+, 1200+, 200+, 50+ Courses) appear hardcoded and may be inaccurate
- Breadcrumbs, section headers, and cards are all hand-rolled inline with no shared component

---

## 2. Design Token Audit

### Tokens that exist (globals.css)
```css
--background: #ffffff / #09090b
--foreground: #09090b / #fafafa
--ring: #a1a1aa / #52525b
```

**That's it.** Three tokens. No semantic system.

### What Tailwind classes are doing the heavy lifting
Everything else is raw Tailwind: `zinc-*`, `blue-*`, `green-*`, etc. — no abstraction, no design language.

### Missing tokens (critical gaps)
| Token name | Purpose | Currently |
|---|---|---|
| `--color-brand` | Primary interactive color | absent — blue-600 hardcoded everywhere |
| `--color-brand-subtle` | Backgrounds, hover states | absent |
| `--color-surface` | Card/panel backgrounds | absent — white/zinc-900 hardcoded |
| `--color-surface-raised` | Elevated card | absent |
| `--color-border` | Unified border | absent — zinc-200/zinc-800 hardcoded |
| `--color-muted` | Muted text | absent — zinc-400/500 hardcoded |
| `--color-success` | Positive signals | absent — green-* inline |
| `--color-warning` | Caution signals | absent — yellow-* inline |
| `--color-error` | Errors | absent — red-* inline |

### Contrast
- Body text: zinc-900 on white → ~16:1 ✅
- Muted text: zinc-500 on white → ~4.5:1 ✅ (marginal for small text)
- zinc-400 on white → ~3.2:1 ❌ (fails WCAG AA for body text, used extensively)
- Card border zinc-200 → decorative only, fine

---

## 3. Typography Audit

### Fonts
- **Sans**: Geist Sans (Google Fonts variable) — clean but overused across the ecosystem
- **Mono**: Geist Mono — appropriate for code/technical content

### Current "scale" (extracted from homepage)
| Usage | Classes | Computed |
|---|---|---|
| Hero H1 | `text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold` | 36–72px |
| Section title | `font-semibold` with no size class | 16px (inherits) — TOO SMALL |
| Card title | `font-medium text-sm` | 14px |
| Body | `text-zinc-500 text-lg md:text-xl` | 18–20px |
| Label/meta | `text-xs text-zinc-400` | 12px |

**Problems:**
1. Section titles (`h2`) throughout homepage have `font-semibold` but NO explicit size — they collapse to 16px, creating barely any hierarchy below the hero
2. The jump from 72px hero to 16px section title is extreme and creates a visual void
3. No defined display style for feature titles
4. Technical labels and metadata (12px zinc-400) fail WCAG AA contrast

### Missing scale levels
- Display (large feature titles, course names): needs ~32–48px, semibold/bold
- Section title: needs explicit 20–24px, semibold
- Subheading: 16–18px, medium
- Technical label: 11–12px, uppercase + tracking, but needs contrast fix

---

## 4. Color System Audit

### Current effective palette
| Color | Hex | Usage |
|---|---|---|
| Zinc 900 | `#18181b` | Primary text, buttons |
| Zinc 500 | `#71717a` | Muted text, metadata |
| Zinc 400 | `#a1a1aa` | Icons, secondary meta |
| Zinc 200 | `#e4e4e7` | Borders |
| Zinc 100 | `#f4f4f5` | Surface/bg alt |
| Blue 600 | `#2563eb` | Hover text links |
| Green 600 | `#16a34a` | Success badges |
| Yellow 600 | `#ca8a04` | Warning badges |
| Red 600 | `#dc2626` | Error/destructive |

### Brand color: none
The "brand" button (`bg-zinc-900`) and "brand" badge (`bg-blue-600`) use different colors. The product has no unified primary brand color. Blue-600 is Tailwind's uncustomized default.

---

## 5. Component System Audit

### UI primitives (src/components/ui/)
| Component | Quality | Notes |
|---|---|---|
| Button | ✅ Good | 6 variants, 5 sizes, proper Radix Slot |
| Badge | ✅ Good | 7 variants including brand/success/warning |
| Card | ✅ Adequate | Basic structure, no specialist variants |
| Dialog | ✅ Present | Radix-based |
| DropdownMenu | ✅ Present | Radix-based |
| Input | ✅ Present | Basic |
| Tabs | ✅ Present | Radix-based |
| Select | ✅ Present | Radix-based |

### Layout components
| Component | Quality | Notes |
|---|---|---|
| Navbar | ⚠️ Adequate | Functional but identity-free; mobile drawer works |
| Footer | ✅ Adequate | Clean 4-column layout |

### Specialist components
| Component | Quality | Notes |
|---|---|---|
| UnderstandTabs | ✅ Good | Clever depth-switching tab pattern |
| ConceptFlow | ✅ Good | Sequential numbered flow — unique to NeuGravity |
| PrerequisiteCard | Present | |
| EcosystemSection | Present | |
| RelatedNewsSection | Present | |
| VideoLesson, ArticleLesson, QuizLesson, ProjectLesson | Present | |

### Missing components (critical)
| Missing | Impact |
|---|---|
| `SectionHeader` | Every page hand-rolls h2 + icon + "see all" link differently |
| `EntityCard` (reusable) | Tech, Tool, News, Course cards are all separate inline implementations |
| `EmptyState` | 4+ different empty state patterns across pages |
| `Breadcrumb` | Copy-pasted in every detail page with slightly different markup |
| `SkeletonCard` | No loading states — hard switch from nothing to content |
| `StatsDisplay` | Hero stats are inline, not reusable |
| `PageHero` | Every page writes its own hero section |
| `CalloutBanner` | No reusable highlight/callout component for important info |

### Card inconsistency (major)
Cards appear in 5+ different inline implementations:
1. Tech grid card: `p-4 rounded-xl border hover:shadow-sm`
2. Tool list card: `p-3 rounded-lg border hover:shadow-sm flex`
3. Tool grid card: `p-5 rounded-xl border hover:shadow-sm flex-col`
4. News item: `py-5 divide-y` — no card border
5. Learning path card: `p-5 rounded-xl border hover:shadow-md flex-col`
6. Comparison item: `p-3 rounded-lg border flex items-center`

All look slightly different. No unified `EntityCard` abstraction.

---

## 6. Page-by-Page Assessment

### Homepage
**Above fold**: Large text hero, 3 CTA buttons, hardcoded stats  
**Problems**:
- Stats (500+, 1200+, 200+, 50+) are hardcoded strings — not real DB counts. If these are inaccurate, they undermine trust immediately.
- Hero right-side decoration is a single blurred zinc-100 circle — no visual story
- Three equal-weight CTAs (Explore Technology, Start Learning, Explore Tools) compete — no clear primary action
- Section header labels ("Trending Technology", "Technology News", "Tool Explorer") are visually tiny relative to the content below — no hierarchy
- "Technology Radar" section uses hardcoded RADAR_ITEMS (not from DB)
- Learning paths section uses hardcoded data (AI Engineer, Cloud Architecture, Full Stack) — not from DB
- Inside Work tags link to `/work/${topic.toLowerCase()}` routes that may not exist

### Tech Detail Page (/tech/[slug])
- Strong information architecture: breadcrumb → header → tabs → content → sidebar
- UnderstandTabs is genuinely differentiated — multiple explanation depths is a brand idea
- ConceptFlow is unique and valuable
- Right sidebar correctly shows facts, ecosystem, related courses
- No visual treatment for the technology — no icon, no visual category indicator above the fold

### Courses Page (/courses/[slug])
- Clean 2/3 + 1/3 layout (content + sidebar)
- `<details>` accordion for curriculum — functional but has no animation
- Sidebar sticky enrollment card is missing (based on code, no sticky positioning)
- "Curriculum details coming soon" empty state is visible to users if DB is thin

### Learn Page (/learn)
- Very minimal — just a hero and a grid
- Hardcoded demo data visible if learning paths aren't in DB yet
- No visual entry point or motivation — just a list

### News Page (/news)
- Clean list layout — appropriate for news
- First item is slightly larger (text-xl vs text-base) — minimal hierarchy
- Right sidebar has trending topics (hardcoded: "Model Context Protocol", "AI Agents", etc.)

### Tools Page (/tools)
- Grid card layout is clean
- Filter tabs exist but are client-side category filter (static)
- Icon fallback is initial letter — functional but crude for a tool directory

---

## 7. Proposed NeuGravity Design Language

### Brand Direction: Signal + Clarity + Intelligence

NeuGravity should feel like the Wall Street Journal of technology — authoritative, data-dense, visually confident. Not playful. Not maximalist. Not generic SaaS.

The visual language should be built on:
- **Precision** — tight grids, exact spacing, deliberate typography
- **Signal** — clear visual hierarchy that pulls eyes to what matters
- **Depth** — layers that suggest there is more to discover
- **Connection** — subtle use of lines, relationships, graph-like visual hints

Avoid: floating neon blobs, animated backgrounds, gradient overload, glassmorphism, stock-photo sections.

---

### Proposed Color Palette

**Primary brand: NeuGravity Indigo** — not Tailwind's generic blue, not purple, not green. A sophisticated blue-indigo that reads as intelligent, technical, and modern.

```css
/* globals.css additions */
:root {
  /* Brand */
  --color-brand:          #4F46E5;   /* indigo-600 — primary actions, links */
  --color-brand-hover:    #4338CA;   /* indigo-700 */
  --color-brand-subtle:   #EEF2FF;   /* indigo-50 — hover backgrounds */
  --color-brand-muted:    #6366F1;   /* indigo-500 — lighter contexts */
  
  /* Surface system */
  --color-bg:             #FFFFFF;
  --color-bg-subtle:      #FAFAFA;   /* barely-off-white panels */
  --color-bg-inset:       #F4F4F5;   /* zinc-100 — inset areas */
  --color-surface:        #FFFFFF;   /* cards */
  --color-surface-raised: #FFFFFF;   /* elevated cards */
  
  /* Text */
  --color-text:           #09090B;   /* zinc-950 */
  --color-text-secondary: #52525B;   /* zinc-600 — improved from 500 for contrast */
  --color-text-muted:     #71717A;   /* zinc-500 — decorative/meta only */
  --color-text-inverse:   #FFFFFF;
  
  /* Border */
  --color-border:         #E4E4E7;   /* zinc-200 */
  --color-border-subtle:  #F4F4F5;   /* zinc-100 — very subtle */
  --color-border-strong:  #A1A1AA;   /* zinc-400 — emphasis borders */
  
  /* Semantic */
  --color-success:        #16A34A;
  --color-success-subtle: #DCFCE7;
  --color-warning:        #CA8A04;
  --color-warning-subtle: #FEF9C3;
  --color-error:          #DC2626;
  --color-error-subtle:   #FEE2E2;
}

.dark {
  --color-brand:          #6366F1;   /* indigo-500 — slightly lighter on dark */
  --color-brand-hover:    #818CF8;   /* indigo-400 */
  --color-brand-subtle:   #1E1B4B;   /* indigo-950 */
  --color-brand-muted:    #4F46E5;
  
  --color-bg:             #09090B;
  --color-bg-subtle:      #0F0F11;
  --color-bg-inset:       #18181B;   /* zinc-900 */
  --color-surface:        #18181B;
  --color-surface-raised: #1F1F23;
  
  --color-text:           #FAFAFA;
  --color-text-secondary: #A1A1AA;
  --color-text-muted:     #71717A;
  --color-text-inverse:   #09090B;
  
  --color-border:         #27272A;   /* zinc-800 */
  --color-border-subtle:  #18181B;
  --color-border-strong:  #52525B;
}
```

**Why indigo**: Indigo reads as technical and intelligent without being corporate-blue (too standard) or purple (too design/creative). It's used by Linear, Prisma, Replicate — products that appeal to developers and feel premium. It differentiates from Tailwind's default blue-600.

---

### Proposed Typography Scale

Add a second typeface for display headings — or use Geist Sans at controlled weights with letter-spacing to create hierarchy:

```css
@theme inline {
  /* Type scale */
  --text-display:    clamp(2.5rem, 5vw, 4.5rem); /* 40–72px — hero only */
  --text-title-xl:   2rem;    /* 32px — section feature titles */
  --text-title-lg:   1.5rem;  /* 24px — page titles, section headers */
  --text-title-md:   1.25rem; /* 20px — subsection headers */
  --text-title-sm:   1rem;    /* 16px — card titles, labels */
  --text-body-lg:    1.125rem; /* 18px — lead paragraph */
  --text-body:       0.9375rem; /* 15px — primary body */
  --text-body-sm:    0.875rem; /* 14px — secondary body */
  --text-label:      0.75rem;  /* 12px — uppercase labels, metadata */
  --text-micro:      0.6875rem; /* 11px — badge text only */
  
  --leading-display: 1.05;
  --leading-tight:   1.25;
  --leading-snug:    1.375;
  --leading-normal:  1.6;
  --leading-relaxed: 1.75;
  
  --tracking-display:  -0.03em;
  --tracking-tight:    -0.015em;
  --tracking-label:     0.08em;
}
```

---

### Proposed Visual Motifs

**DO use:**

1. **Node/connection lines on knowledge graph pages** — thin SVG lines connecting related technologies, tools, companies. Not a full force-directed graph (too heavy), but a static curated diagram that shows relationships.

2. **Signal pulse indicator** — small animated dot for live/real-time content (status page, trending items). Single pulsing circle, restrained.

3. **Numbered concept flows** — already exists (ConceptFlow). Make it more prominent and visual — wider nodes, subtle gradient borders.

4. **Layered cards** — for course curriculum, use subtle z-depth shadows to show "stack" of content. Implies depth of learning.

5. **Thin rule decorations** — horizontal rules between sections with subtle gradient fades (zinc → transparent → zinc). Replaces the blunt border-b approach.

6. **Icon consistency** — pick a unified icon treatment: all filled or all stroke, one weight. Currently mixed. Recommend lucide-react stroke only, 1.5px weight.

**DO NOT use:**
- Large blurred radial gradient blobs as "background art"
- Glassmorphism on cards
- Neon or fluorescent accent colors
- Animated floating elements
- Full-screen space/galaxy imagery

---

### Logo & Brand Mark

The current logo (Zap icon in zinc square) is entirely generic. 

**Recommendation:**
- Create a custom SVG logomark based on the "NG" letterform or an abstract gravity/orbit concept — a circle with an offset orbital path, suggesting knowledge in motion.
- Until custom mark is ready: replace Zap with a more considered icon — `Orbit` or `Atom` from lucide, or a custom 2-path SVG.
- The wordmark "NeuGravity" should use `font-bold tracking-tight` with the brand indigo on the dot/accent of the "G" — subtle brand touch.

---

## 8. Homepage Redesign Recommendation

### Current structure (what exists)
1. Hero (text + 3 CTAs + hardcoded stats + blur blob)
2. Trending Technology grid
3. News + Tools side-by-side
4. Radar + Comparisons side-by-side
5. Learning Paths (hardcoded 3 paths)
6. Inside Work
7. Enterprise (dark section)
8. Newsletter

### Problems
- Hero stats are hardcoded — remove or replace with real DB counts
- Learning Paths section uses hardcoded data
- Radar section uses hardcoded data
- Technology Radar is listed 5th — it's actually a strong differentiator and should be higher
- Enterprise section looks like a footer decoration, not a CTA

### Recommended structure
1. **Hero** — "What do you want to understand?" + search bar as primary CTA + 3 secondary navigation cards (Learn, Explore, Tools)
2. **Live signals strip** — thin strip: "Trending Now: [5 technologies from DB]" — real data, always fresh
3. **Technology Radar** — move up, flagship differentiator
4. **Trending Technology** — real DB data, grid of 6
5. **News + Tools** — same side-by-side layout (works well)
6. **Learn** — real course/path data; remove hardcoded paths
7. **Comparisons** — keep
8. **Enterprise** — stronger visual treatment
9. **Newsletter** — keep at bottom

### Hero fix
Replace blurred circle with a minimal interactive element: a 3×3 grid of tech category icons that link to `/tech?type=X`. This immediately communicates "technology database" and is clickable.

Replace 3 equal-weight buttons with 1 primary ("Start Learning" or "Explore Technology") + search bar + 2 ghost links.

Remove hardcoded stats OR replace with real DB counts fetched at build time.

---

## 9. Component Gaps to Address

### Create these shared components

**`SectionHeader`**
```tsx
<SectionHeader icon={TrendingUp} title="Trending Technology" href="/tech" />
```
Eliminates the 8+ hand-rolled `flex items-center gap-2` section headers.

**`EntityCard`** (base card for all entities)
```tsx
<EntityCard 
  icon={<Cpu />} 
  title={tech.name} 
  meta={tech.type}
  badge={<Badge>Trending</Badge>}
  href={`/tech/${tech.slug}`}
/>
```
Unifies Tech, Tool, Course, Company, Comparison cards to a shared visual baseline.

**`EmptyState`**
```tsx
<EmptyState icon={BookOpen} message="Learning paths coming soon." />
```
Consistent across all pages. Currently 4+ ad-hoc implementations.

**`Breadcrumb`**
```tsx
<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Courses", href: "/courses" }, { label: c.title }]} />
```
Copy-pasted in every detail page — extract once.

**`PageHero`**
```tsx
<PageHero 
  eyebrow="Learn" 
  title="Learn Technology" 
  description="Structured learning paths..."
/>
```
Consistent above-fold section for all index pages.

**`SkeletonCard`** — Loading skeleton for card grids (ISR pages need it)

---

## 10. Prioritized Design Actions

### P0 — Fix immediately
1. Remove or verify hardcoded stats in homepage hero (500+, 1200+, 200+, 50+) — if inaccurate, it's trust-damaging
2. Remove hardcoded Learning Paths section in homepage — shows fabricated data to users
3. Remove hardcoded Technology Radar items — or clearly label as editorial curation
4. Fix muted text contrast: `text-zinc-400` on white fails WCAG AA — change to `text-zinc-500` minimum for functional text

### P1 — Major UX improvement
1. Add brand color system (indigo tokens) to globals.css — single color change ripples across all brand-colored elements
2. Create `SectionHeader` component — eliminate 8+ inconsistent hand-rolled headers
3. Create `EmptyState` component — eliminate 4+ inconsistent empty state patterns
4. Create `Breadcrumb` component — eliminate copy-paste across detail pages
5. Fix section header sizes — add explicit `text-xl` or `text-2xl` to all h2 section titles on homepage
6. Replace hero decoration (blur blob) with actual content (tech category grid or conceptual visualization)

### P2 — Polish
1. Unify EntityCard abstraction across Tech/Tool/Course/Comparison/Company
2. Add hover transitions to ConceptFlow nodes
3. Apply brand indigo to primary CTAs and interactive hover states
4. Add logo/brand mark improvement
5. Add `SkeletonCard` loading states

### P3 — Refinement
1. Motion: add `prefers-reduced-motion` aware page entrance transitions
2. Add subtle connecting-lines visual to Knowledge Graph section
3. Improve course card to show progress bars for enrolled users
4. Add signal pulse to trending/live content
