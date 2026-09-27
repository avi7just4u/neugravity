# NeuGravity — Product Implementation Inventory

**Date**: 2026-09-28  
**Status**: Authoritative state of production at `https://neugravity.vercel.app`

---

## Executive Summary Table

| Feature Area | Route(s) | DB | Service | Admin | Public UI | Production | Status |
|---|---|---|---|---|---|---|---|
| Foundation / Auth | /login /signup | ✅ | ✅ | — | ✅ | ✅ | **LIVE** |
| Middleware / Session | — | ✅ | ✅ | — | — | ✅ | **LIVE** |
| Navigation (Navbar) | — | — | — | — | ✅ | ✅ | **PARTIAL** |
| Footer | — | — | — | — | ✅ | ✅ | **PARTIAL** |
| Search | /search /api/search | ✅ | ✅ | — | ✅ | ✅ | **LIVE** |
| Technology (list) | /tech | ✅ | ✅ | ✅ | ✅ | ✅ | **LIVE** |
| Technology (detail) | /tech/[slug] | ✅ | ✅ | ✅ | ✅ | ✅ | **LIVE** |
| Tools (list) | /tools | ✅ | ✅ | — | ✅ | ✅ | **LIVE** |
| Tools (detail) | /tools/[slug] | ✅ | ✅ | — | ✅ | ✅ | **LIVE** |
| News (list) | /news | ✅ | ✅ | ✅ | ✅ | ✅ | **LIVE** |
| News (detail) | /news/[slug] | ✅ | ✅ | ✅ | ✅ | ❌ 500 | **BROKEN** |
| Articles (list) | /articles | ✅ | ✅ | ✅ | ✅ | ✅ | **LIVE** |
| Articles (detail) | /articles/[slug] | ✅ | ✅ | — | ✅ | ❌ 500 | **BROKEN** |
| Companies (list) | /companies | ✅ | ✅ | — | ✅ | ✅ | **LIVE** |
| Companies (detail) | /companies/[slug] | ✅ | ✅ | — | ✅ | ❌ 500 | **BROKEN** |
| Comparisons (list) | /compare | ✅ | ✅ | — | ✅ | ✅ | **LIVE** |
| Comparisons (detail) | /compare/[slug] | ✅ | ✅ | — | ✅ | ❌ 500 | **BROKEN** |
| Interviews (list) | /interviews | ✅ | ✅ | — | ✅ | ✅ | **LIVE** |
| Interviews (detail) | /interviews/[slug] | ✅ | ✅ | — | ✅ | ❌ 500 | **BROKEN** |
| Status / Outages | /status | ✅ | ✅ | — | ✅ | ✅ | **LIVE** |
| Inside Work (list) | /work | — | — | — | ✅ | ✅ | **PLACEHOLDER** |
| Inside Work (detail) | /work/[slug] | ❌ | ❌ | ❌ | ❌ | ❌ 404 | **MISSING** |
| Learn Home | /learn | ✅ | ✅ | ✅ | ✅ | ✅ | **LIVE** |
| Learn Dashboard | /learn/dashboard | ✅ | ✅ | — | ✅ | 307→login | **LIVE (auth required)** |
| Learning Path (detail) | /learn/[slug] | ✅ | ✅ | ✅ | ✅ | 404 (all draft) | **PARTIAL** |
| Courses (catalog) | /courses | ✅ | ✅ | ✅ | ✅ | ✅ | **LIVE** |
| Courses (detail) | /courses/[slug] | ✅ | ✅ | ✅ | ✅ | ❌ 500 | **BROKEN** |
| Lessons (player) | /courses/[slug]/lessons/[id] | ✅ | ✅ | ✅ | ✅ | 307→login | **LIVE (no content)** |
| Enrollment | /api/enroll/[id] | ✅ | ✅ | — | ✅ | ✅ | **LIVE** |
| Progress | /api/progress/[id] | ✅ | ✅ | — | ✅ | ✅ | **LIVE** |
| Quizzes | /api/quiz/[id] | ✅ | ✅ | — | ✅ | ✅ (no data) | **PARTIAL** |
| Projects | /api/project/[id] | ✅ | ✅ | — | ✅ | ✅ (no data) | **PARTIAL** |
| Knowledge Graph | /admin/knowledge | ✅ | ✅ | ✅ | ❌ | Admin-only | **PARTIAL** |
| Content Opportunities | /admin/content-opportunities | ✅ | ✅ | ✅ | ❌ | Admin-only | **LIVE** |
| Admin CMS | /admin/* | ✅ | ✅ | ✅ | ❌ | ✅ | **LIVE** |
| Community | /community | ❌ | ❌ | ❌ | 🔒 waitlist | Coming soon | **PLACEHOLDER** |
| Enterprise | /enterprise | ❌ DB | ✅ lead API | — | ✅ | ✅ | **PARTIAL** |
| Analytics | /api/analytics/track | ✅ | ✅ | — | — | ✅ | **LIVE** |
| Newsletter | /api/newsletter/subscribe | ✅ | ✅ | — | ✅ | ✅ | **LIVE** |

---

## Critical Root Cause: ISR + cookies() = 500

**5 services use `createServiceClient()` which internally calls `cookies()`. In Next.js ISR mode (revalidate=N), calling `cookies()` during rendering throws an error → 500.**

Affected detail pages:
- `/news/[slug]` — ContentService → createServiceClient
- `/articles/[slug]` — ContentService → createServiceClient  
- `/companies/[slug]` — CompanyService → createServiceClient
- `/compare/[slug]` — ComparisonService → createServiceClient
- `/interviews/[slug]` — InterviewService → createServiceClient
- `/courses/[slug]` — EnrollmentService.getCurrentUserId() → createClient() → cookies()

**Fix**: Switch broken services to `createAnonClient()` (no cookies dependency), OR add `export const dynamic = "force-dynamic"` to affected pages.

TechnologyService and CourseService already use `createAnonClient()` — tech/[slug] works. Tool pages use `force-dynamic` — works.

---

## Detailed Feature Breakdown

### 1. Foundation / Auth

**Status: LIVE**

- Auth via Supabase Auth + @supabase/ssr
- Middleware refreshes JWT on every request
- Admin routes protected: `/admin/*` → 307 to `/login` if unauthenticated
- Auth APIs: `/api/auth/login`, `/api/auth/logout`, `/auth/callback`
- Role system defined: user, author, reviewer, editor, course_manager, analyst, admin, super_admin
- Password reset flow: `/forgot-password`, `/reset-password` pages exist
- **Single real user in DB**: 1 user (admin only)

### 2. Navigation

**Status: PARTIAL**

Navbar items:
- Learn ✅, News ✅, Tools ✅, Compare ✅, Tech ✅, Companies ✅, Work ✅, Interviews ✅, Community ✅

**Problems**:
- `/work` links internally to `/work/[slug]` routes that **don't exist** → 404 on click
- `/community` → coming-soon placeholder (valid, should probably not be in main nav)
- `/interviews` → list page works but 0 interviews in DB → empty state

Footer links include `/community` (coming-soon), `/enterprise#*` hash anchors (work), all basic routes.

### 3. Search

**Status: LIVE**

- Full-text search across technologies, tools, companies, news, articles, courses
- Alias resolution (k8s → Kubernetes ✅)
- Search logging to `search_query_log` (in-process dedup, service-role only)
- `/api/search?q=kubernetes` → 200, returns structured results
- `/search` page with client-side island (`search-island.tsx`)

### 4. Technology Pages

**Status: LIVE**

- 32 published technologies (27 is_demo=True, 5 real from migration 017)
- `createAnonClient()` — ISR-safe
- Detail page: tech page, explanations (35 in DB), relationships (8 in DB), related tools/companies/news
- Knowledge graph explanations: "quick", "simple", "beginner", "technical", "architect" modes
- Admin: explanation editor, relationship management at `/admin/knowledge`

**Demo data exposure**: 27 demo technologies are publicly visible (FILTER_DEMO_DATA not set in Vercel env)

### 5. Tools Pages

**Status: LIVE**

- 38 published tools (7 is_demo=True, 31 real from migration 015)
- force-dynamic — always fresh, never ISR
- Detail page: tool info, pricing, features, alternatives
- Tool refresh cron (`/api/cron/refresh-tools`)
- Tool change event admin at `/admin/content/tools/changes`

### 6. News Pages

**Status: BROKEN (detail), LIVE (list)**

- List (`/news`): 12 published news items visible — works
- Detail (`/news/[slug]`): **500 for all slugs** — createServiceClient + ISR incompatibility
- 12 published news: all `is_demo=True`
- 7 draft news items: ingested but not published
- News ingestion pipeline: sources, polling cron, editorial queue
- Admin editorial workflow: `/admin/editorial` — works

### 7. Status / Outages

**Status: LIVE**

- 11 status providers (AI, cloud, developer tools)
- 37 status incidents in DB
- Live data via `/api/cron/poll-status` and status monitor worker
- Page at `/status` displays live incidents and provider status

### 8. Companies

**Status: BROKEN (detail), LIVE (list)**

- List (`/companies`): 15 published companies visible — works
- Detail (`/companies/[slug]`): **500 for all slugs** — createServiceClient + ISR
- All 15 published companies are `is_demo=True`
- CompanyService has no tech stack or news relationship methods currently implemented

### 9. Comparisons

**Status: BROKEN (detail), LIVE (list)**

- List (`/compare`): 4 published comparisons — works
- Detail (`/compare/[slug]`): **500** — createServiceClient + ISR
- All 4 comparisons are `is_demo=True`
- Detail page renders a placeholder ("comparison data being compiled") when it loads — no real data tables
- ComparisonService.getComparisonBySlug works but page 500s before data is used

### 10. Articles

**Status: BROKEN (detail), LIVE (list)**

- List (`/articles`): 6 published articles visible — works
- Detail (`/articles/[slug]`): **500** — createServiceClient + ISR
- All 6 articles are `is_demo=True`
- Articles have body content (markdown) in DB

### 11. Interviews

**Status: BROKEN (detail), EMPTY (list)**

- List (`/interviews`): renders but 0 interviews in DB → empty state
- Detail: 0 items, 500 if hit directly anyway (InterviewService → createServiceClient)
- InterviewService exists with full CRUD
- 0 interviews seeded or created

### 12. Inside Work

**Status: PLACEHOLDER**

- `/work` page: hardcoded topic list + hardcoded fake article list
- Links to `/work/engineering`, `/work/how-engineering-teams-structured`, etc. → **all 404**
- No `/work/[slug]` route exists in filesystem
- No DB schema for Work articles
- No service layer

### 13. Learning / Paths

**Status: PARTIAL**

- `/learn`: renders featured paths + courses from DB — works
- `/learn/[slug]` (learning path detail): route exists, service works, but **all 5 paths are draft** → 404
- `/learn/dashboard`: auth-gated, works for logged-in users
- 5 learning paths in DB: all `is_demo=True`, all `status=draft` — none publicly accessible
- Learning path steps (courses) not yet assigned (seed says "add via admin after courses created")

### 14. Courses

**Status: BROKEN (detail), LIVE (catalog), EMPTY (no curriculum)**

**CRITICAL for course launch:**

- Catalog (`/courses`): 4 courses visible — works
- Detail (`/courses/[slug]`): **500** — EnrollmentService.getCurrentUserId() → createClient() → cookies() in ISR
- **0 modules in DB** — `course_modules` table is empty
- **0 lessons in DB** — `lessons` table is empty
- **0 quizzes in DB** — `quizzes` table is empty
- **0 projects in DB** — `course_projects` table is empty
- 4 courses in DB have **fabricated metrics** from seed: enrollment_count=3420/5230, ratings=842/1240
- These fake metrics are publicly visible on the catalog page
- Courses were seeded in migration 004 with `is_demo=False` — NOT filtered
- Admin course editor exists at `/admin/education/courses`

**Course launch blockers**:
1. Course detail page 500s
2. No curriculum content (modules/lessons)
3. Fabricated enrollment/rating numbers display publicly
4. Lesson player requires enrollment (force-dynamic, correct) but no lessons to play

### 15. Quizzes

**Status: PARTIAL**

- Schema exists (migration 021)
- API route `/api/quiz/[quizId]` fully implemented
- Quiz UI component (`quiz-lesson.tsx`) exists
- **0 quizzes in DB** — cannot test end-to-end

### 16. Projects

**Status: PARTIAL**

- Schema exists (migration 021)
- API route `/api/project/[projectId]` fully implemented
- Project UI component (`project-lesson.tsx`) exists
- **0 projects in DB** — cannot test end-to-end

### 17. Enrollment + Progress

**Status: LIVE (APIs), EMPTY (no real users or courses)**

- Enrollment API: `/api/enroll/[courseId]` — works
- Progress API: `/api/progress/[lessonId]` — works
- `course_enrollments`: 0 real enrollments
- `lesson_progress`: 0 real progress records
- Dashboard shows enrolled courses for authenticated user

### 18. Knowledge Graph

**Status: PARTIAL**

- 8 entity relationships in DB (very sparse)
- 10 entity aliases
- 35 technology explanations (by explanation type)
- Admin management at `/admin/knowledge` with pending/verified workflow
- Public exposure: tech detail page shows related technologies, tools, companies, news
- No public graph visualization — admin-only table view
- `/admin/knowledge/[slug]/explanations` — explanation editor per technology

### 19. Content Opportunities (Phase 4.5)

**Status: LIVE**

- 102 opportunities in DB
- Gap analysis engine (6 analyzers) working
- Brief generation (YouTube, Article, Technology types)
- Admin UI: `/admin/content-opportunities`, `/admin/content-calendar`
- Cron: daily at 3:00 AM UTC

### 20. Admin / CMS

**Status: LIVE**

All admin routes protected and functional:
- `/admin` — dashboard with stats
- `/admin/editorial` — news review queue
- `/admin/education` — course/path management
- `/admin/knowledge` — graph management
- `/admin/sources` — ingestion source management
- `/admin/system/jobs` — job queue management
- `/admin/system/audit` — audit log
- `/admin/system/automation` — cron/job status
- `/admin/content-opportunities` — editorial opportunity management

### 21. Community

**Status: PLACEHOLDER**

- `/community` — renders a "get notified" waitlist form
- No forum/discussion DB schema
- No community posts, moderation, voting
- `CommunityPost` type defined in types/index.ts but no migration or service
- Form submits to `/api/newsletter/subscribe` (works)

### 22. Enterprise

**Status: PARTIAL**

- `/enterprise` — static marketing page, works
- Lead capture form → `/api/enterprise/leads` → DB insert (works)
- **Fabricated metrics displayed**: "50+ Enterprise engagements", "4.9/5 Client satisfaction" — these are hardcoded fake numbers
- No real enterprise accounts, usage tracking, or billing

### 23. Analytics

**Status: LIVE (tracking), PARTIAL (no dashboard)**

- `/api/analytics/track` — event tracking endpoint
- `AnalyticsService` — writes to `analytics_events` table
- Search query logging in `search_query_log` (Phase 4.5)
- No public analytics dashboard
- Admin system health page (`/admin/system/health`) exists

---

## Real vs Demo Data

| Data Type | Total | Real | Demo (is_demo=True) | Notes |
|---|---|---|---|---|
| Technologies | 32 published | 5 | 27 | Migration 017 added 5 real flagship techs |
| Tools | 38 published | 31 | 7 | Migration 015 real tool catalog |
| News | 12 published | 0 | 12 | All from seed migration 004 |
| Articles | 6 published | 0 | 6 | All from seed migration 004 |
| Companies | 15 published | 0 | 15 | All from seed migration 004 |
| Comparisons | 4 published | 0 | 4 | All from seed migration 004 |
| Interviews | 0 | 0 | 0 | None created |
| Courses | 4 published | 0 | 0 | Seeded with is_demo=False, but FAKE metrics |
| Modules | 0 | 0 | 0 | Empty — no curriculum |
| Lessons | 0 | 0 | 0 | Empty — no curriculum |
| Learning Paths | 5 | 0 | 5 | All draft+is_demo=True, not public |
| Users | 1 | 1 (admin) | 0 | Only admin account |
| Enrollments | 0 | 0 | — | No real students |
| Status Providers | 11 | 11 | — | Real external status feeds |
| Status Incidents | 37 | ~real | — | Polled from real status pages |

**FILTER_DEMO_DATA environment variable is NOT set** — demo data is publicly visible.

---

## Routes Exposed Publicly That Shouldn't Be

1. **`/community`** — lists it as a feature that doesn't exist, not harmful but misleading
2. **`/work`** — links to `/work/[topic-slug]` and `/work/[article-slug]` which are 404 (WRONG_HREF + MISSING_ROUTE)
3. **`/courses/*` in sitemap** — courses are in sitemap but 500 in production; also no actual curriculum
4. **Demo content in news/articles/companies/comparisons** — all published content is seeded demo data, publicly indexed in sitemap

---

## What is Missing for Course Launch

**Must have before any course launch:**

1. ✅ Course catalog page (works)
2. ❌ **Course detail page 500s** — fix ISR/cookies issue (P0)
3. ❌ **0 modules + lessons** — actual curriculum must be created
4. ❌ **Fake enrollment/rating numbers** — must be zeroed or removed before launch
5. ❌ **Lesson player untested** — no lesson data to test against
6. ❌ **Quizzes and projects empty** — schema and API exist but no data
7. ✅ Enrollment API works
8. ✅ Progress tracking API works
9. ✅ Admin course editor exists (`/admin/education/courses`)

---

## What is PARTIAL and What's Needed to Complete

| Feature | What's Built | What's Missing |
|---|---|---|
| Knowledge Graph | Admin management, 8 relationships, 35 explanations | Public visualization, more relationships |
| Comparisons | 4 comparison shells | Actual comparison data/tables in the detail page |
| Companies | List + detail page code | Detail page 500 (ISR fix needed), no tech stack data |
| Interviews | Full service + page | 0 actual interviews |
| Inside Work | List page with static content | `/work/[slug]` route + DB schema + real articles |
| Learning Paths | 5 demo paths | Real paths, course assignments, public status |
| Courses | Catalog + shells | Curriculum content, fixed detail page, real metrics |
| Enterprise | Marketing page + lead API | Real case studies (not fabricated numbers) |
| Quizzes | Schema + API + UI | Actual quiz data attached to lessons |

---

## ISR / createServiceClient 500 Fix Summary

**Root cause**: `createServiceClient()` (and `createClient()`) call `cookies()` internally. In ISR mode (any `revalidate = N`), Next.js does not allow `cookies()` during rendering → `Error: Dynamic server usage`.

**Services to migrate from createServiceClient → createAnonClient:**
- `src/lib/services/content.service.ts`
- `src/lib/services/interview.service.ts`
- `src/lib/services/comparison.service.ts`
- `src/lib/services/company.service.ts`

**Pages to add `force-dynamic` OR switch to createAnonClient-based auth-free load:**
- `src/app/(public)/courses/[slug]/page.tsx` — needs auth-free ISR + optional auth via client-side

All these services are doing public reads (no session required). `createAnonClient()` is correct for them.

---

## Deployment State

- **Production URL**: https://neugravity.vercel.app
- **Latest commit**: `7bb36f9` (search signal topic fix)
- **TypeScript**: 0 errors
- **Tests**: 125/125 passing
- **Migrations applied**: 022 (all applied)
- **Admin protected**: ✅ all 307/401 for unauthenticated access
