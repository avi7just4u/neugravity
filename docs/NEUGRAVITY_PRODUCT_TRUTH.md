# NEUGRAVITY — Product Truth

**Generated**: 2026-09-28 (Second Rescue Sprint — Agent 7: Product Inventory)  
**Method**: Live Supabase queries + file analysis across all src/ routes  
**Status**: Authoritative. Supersedes all prior inventory docs.

---

## Executive Summary

| Area | Health | Reality |
|---|---|---|
| Tech/Tool catalog | GREEN | 32 technologies, 31 real tools — functional |
| News/Articles | RED | 12/19 news items demo, 6/6 articles demo — demo content publicly visible |
| Companies/Comparisons | RED | ALL 15 companies demo, ALL 4 comparisons demo — demo content live |
| Courses | YELLOW | 4 published courses, 0 modules, 0 lessons — shell only |
| Learning paths | RED | 5 paths, ALL draft, ALL demo — /learn is always empty |
| Interviews | RED | 0 records — page renders empty state |
| Routes | YELLOW | All public routes 200 after rescue sprint; ISR/cookies fixes applied |
| Search | GREEN | Functional, logs queries, dedup works |
| Admin pipeline | GREEN | Ingestion, editorial review, content lifecycle functional |
| Auth | GREEN | All protected routes redirect correctly |

**Overall health: YELLOW.** Product is functional for browsing tech/tools. Course launch is blocked (no content). Demo content is live on 4 content types. Learning section is empty.

---

## Database Content Reality

### Technologies (32 published)
- **Real**: Yes — no is_demo field conflicts detected
- **Public**: Yes — `/tech/[slug]` pages work
- **ISR**: 3600s — safe (no cookies() call in tech services)
- **Status**: GREEN

### Tools (38 total)
- **Real**: 31 real (is_demo=False), 7 demo (is_demo=True)
- **Public**: All 38 visible — no demo filter applied on list/detail pages
- **Fix needed**: Add `.eq("is_demo", false)` to `ToolService.getPublished()`
- **Status**: YELLOW (7 demo tools visible)

### News Items (19 total)
- **Real**: 7 real (is_demo=False)
- **Demo**: 12 (is_demo=True) — **ALL publicly visible**
- **Fix needed**: Add `.eq("is_demo", false)` to `NewsService.getPublished()`
- **Status**: RED (63% demo content live)

### Long-form Articles (6 total, all published)
| Title | is_demo |
|---|---|
| PostgreSQL vs MongoDB: When to Use Each in 2026 | True |
| The Rise of the MCP Protocol and What It Means for AI Tools | True |
| The State of AI Coding Assistants in 2026 | True |
| Why Rust Is Winning the Systems Programming War | True |
| How Cloudflare Became the Internet's Security Layer | True |
| Building Production RAG Systems That Actually Work | True |
- **Real**: 0
- **Fix needed**: Add `.eq("is_demo", false)` to `ContentService.getPublishedArticles()` (will return empty — need real articles)
- **Status**: RED (100% demo content live)

### Companies (15 total, all published)
- **Real**: 0 — ALL is_demo=True
- **Public**: All 15 visible on `/companies`
- **Fix needed**: Add `.eq("is_demo", false)` to company service (will return empty — need real companies)
- **Status**: RED (100% demo content live)

### Comparisons (4 total, all published)
| Title | is_demo |
|---|---|
| React vs Vue | True |
| PostgreSQL vs MongoDB | True |
| AWS vs Google Cloud | True |
| Cursor vs GitHub Copilot | True |
- **Real**: 0
- **Status**: RED (100% demo content live)

### Interviews (0 records)
- **DB**: Empty table
- **Page**: `/interviews` renders with real service call but empty state
- **Status**: RED (no content)

### Courses (4 published)
| Title | Difficulty | is_demo |
|---|---|---|
| Building with LLMs: From API to Production | intermediate | False |
| Kubernetes for Platform Engineers | advanced | False |
| TypeScript Deep Dive | intermediate | False |
| Modern Data Engineering with dbt and ClickHouse | advanced | False |
- **Modules**: 0 — `course_modules` table is empty
- **Lessons**: 0 — `lessons` table is empty
- **Enrollment metrics**: Seed data values (enrollment_count, rating_count) — NOT real user data
- **Status**: RED (courses exist but have no content to deliver)

### Course Modules & Lessons
- `course_modules`: 0 rows
- `lessons`: 0 rows
- **Impact**: `/courses/[slug]` curriculum section is empty. Lesson player has nothing to serve. Enrollment flows are untestable.
- **Status**: CRITICAL BLOCKER for course launch

### Learning Paths (5 total)
| Title | Status | is_demo |
|---|---|---|
| AI Foundations | draft | True |
| AI Engineer | draft | True |
| Cloud Engineer | draft | True |
| Software Engineering Foundations | draft | True |
| Technology for Product Managers | draft | True |
- **Public**: None — all draft, not returned by public queries
- **Impact**: `/learn` always shows empty state
- **Status**: RED (section exists but has no published content)

### Content Opportunities (102 total)
- Captured by ingestion pipeline, pending editorial review
- **Status**: GREEN (pipeline working)

### Search Query Log (25 entries)
- Log entries exist, dedup working, signal topics display correctly
- **Status**: GREEN

---

## Route Reality (Post-Rescue Sprint)

| Route | HTTP | Data | Notes |
|---|---|---|---|
| `/` | 200 | Mixed | Hero stats hardcoded; 2 dead links removed |
| `/tech` | 200 | 32 real | Working — ISR 3600s |
| `/tech/[slug]` | 200 | Real | Working — ISR |
| `/tools` | 200 | 38 (7 demo) | Demo filter not applied |
| `/tools/[slug]` | 200 | Mixed | Demo filter not applied |
| `/news` | 200 | 19 (12 demo) | Demo filter not applied |
| `/news/[slug]` | 200 | Mixed | ISR fixed → force-dynamic |
| `/articles` | 200 | 6 (all demo) | Demo filter not applied |
| `/articles/[slug]` | 200 | Demo | ISR fixed → force-dynamic |
| `/compare` | 200 | 4 (all demo) | Demo filter not applied |
| `/compare/[slug]` | 200 | Demo | ISR fixed → force-dynamic |
| `/companies` | 200 | 15 (all demo) | Demo filter not applied |
| `/companies/[slug]` | 200 | Demo | ISR fixed → force-dynamic |
| `/interviews` | 200 | Empty | 0 records in DB |
| `/interviews/[slug]` | 200 | N/A | ISR fixed → force-dynamic; no data to test |
| `/courses` | 200 | 4 shells | No module/lesson content |
| `/courses/[slug]` | 200 | Shell | ISR fixed → force-dynamic; empty curriculum |
| `/courses/[slug]/lessons/[id]` | 307 | — | Redirects to login (correct) |
| `/learn` | 200 | Empty | All paths draft |
| `/learn/dashboard` | 307 | — | Redirects to login (correct) |
| `/work` | 200 | Static | 69 lines, no DB, hardcoded content |
| `/community` | 200 | Static | 61 lines, no DB, placeholder |
| `/status` | 200 | Static | 185 lines, no DB, placeholder |
| Admin routes | 307 | — | All redirect to login correctly |

---

## Pages With No Real Data Connection

These public pages render static/placeholder content — no live DB:

| Page | Lines | Reality |
|---|---|---|
| `/work` | 69 | Hardcoded content, no DB |
| `/community` | 61 | Static placeholder, no DB |
| `/status` | 185 | Static placeholder, no DB; `status_services` table exists but unused |

---

## What Is NOT Real

- **Hero stats** — "500+ Technologies", "1200+ Tools", "50K+ Learners": hardcoded in JSX, not from DB
- **Course enrollment counts** — e.g., `enrollment_count=5230`: seed data, not real users
- **Course ratings** — `rating_count=1240`, `rating_average=4.8`: seed data, not real
- **Learning path cards** — were hardcoded on homepage with wrong routes; removed in rescue sprint
- **og-image.png** — removed from layout.tsx (file never existed)
- **rss.xml** — removed from layout.tsx alternates (route doesn't exist)

---

## Demo Content Visibility (P0 Fix)

All four content types below have `is_demo=True` rows that are publicly served because no filter exists in the service queries:

```typescript
// Required fix — add to each service's public query:
.eq("is_demo", false)
```

| Service | Method | File |
|---|---|---|
| ToolService | getPublished() | src/lib/services/tool.service.ts |
| NewsService | getPublished() | src/lib/services/news.service.ts |
| ContentService | getPublishedArticles() | src/lib/services/content.service.ts |
| CompanyService | getPublished() | src/lib/services/company.service.ts |
| ComparisonService | getPublished() | src/lib/services/comparison.service.ts |

After applying these filters: articles → 0 visible, companies → 0 visible, comparisons → 0 visible, news → 7 visible, tools → 31 visible.

**Implication**: Applying these filters will make /articles, /companies, /compare entirely empty. Real content must be created before filtering is enabled.

---

## Course Launch Blockers (Ordered)

1. **No modules in DB** — `course_modules` table: 0 rows
2. **No lessons in DB** — `lessons` table: 0 rows
3. **Enrollment system untested** — no users have enrolled (enrollments table 404 via PostgREST, schema not published)
4. **Lesson player untested** — quiz onComplete, progress tracking, completion all untested end-to-end
5. **Enrollment "completed" logic** — fixed in enrollment.service.ts but never exercised

---

## Admin Pipeline Status

| Area | Status |
|---|---|
| Ingestion | Functional — 102 opportunities captured |
| Editorial review | Functional — content lifecycle UI working |
| AI assists | Functional — no auto-publish (AI assists, humans approve) |
| Sources | Functional |
| Knowledge graph | Functional |
| Content scheduling | Functional |

---

## Infrastructure

| Layer | Status |
|---|---|
| Supabase | Live |
| Vercel deployment | Live |
| Auth (Supabase SSR) | Working |
| RLS | Active (service-role bypasses for admin) |
| Middleware | Fixed — narrow matcher (admin/auth only) |
| Search logging | Working — admin client, dedup in-process |

---

## Phase Boundary

| Phase | Status |
|---|---|
| Phase 1–3 | COMPLETE |
| Phase 4.5 (content intelligence, search signals) | COMPLETE |
| Phase 4.4.2 (rescue sprint — routes, SEO, UX) | COMPLETE — committed `e788695` |
| Second rescue sprint (this doc) | IN PROGRESS |
| Phase 5+ (community, payments, subscriptions, AI autopublish) | NOT STARTED — out of scope |
