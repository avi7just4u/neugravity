# Phase 4.2 — Learning Paths + Course Architecture

**Status: Implementation complete, hardening in progress (Phase 4.2 QA pass)**

---

## Database Schema

### Core Education Tables (migration 001)
| Table | Key Columns | Notes |
|-------|-------------|-------|
| `courses` | title, slug, description, long_description, outcome, difficulty, estimated_hours, price, status, featured | Extended in 018 |
| `course_modules` | course_id, title, sort_order | sort_order controls rendering |
| `lessons` | module_id, title, lesson_type, content, video_url, sort_order, is_preview | Extended in 018 with status, learning_outcomes |
| `quizzes` | lesson_id, passing_score, time_limit_minutes | Linked to lesson |
| `quiz_questions` | quiz_id, question_type, options (jsonb), correct_answer (jsonb), explanation | single_choice/multiple_choice/true_false/short_answer |
| `learning_paths` | title, slug, description, difficulty, estimated_hours, career_outcomes, published, featured | Extended in 018 |
| `learning_path_courses` | learning_path_id, course_id, sort_order, is_required | Junction; sort_order is authoritative ordering |
| `course_enrollments` | user_id, course_id, status, enrolled_at, completed_at | UNIQUE(user_id, course_id) |
| `lesson_progress` | user_id, lesson_id, status, progress_percent, video_position_seconds, completed_at | UNIQUE(user_id, lesson_id) |

### Phase 4.2 Additions (migration 018)
| Table | Added Columns | Notes |
|-------|---------------|-------|
| `courses` | subtitle, short_description, hero_image_url, learning_outcomes[], audience, is_demo | status CHECK extended: draft/review/approved/published/archived |
| `course_modules` | updated_at | Trigger added |
| `lessons` | status (draft/review/published/archived), learning_outcomes[], published_at | Index on status |
| `learning_paths` | short_description, hero_image_url, outcome, is_demo, status | Status: draft/review/approved/published/archived (approved added in migration 020) |
| `learning_path_courses` | description | Step description for path editor |
| `course_entities` (NEW) | course_id, entity_type, entity_id, relationship_type (TEACHES/COVERS/PREREQUISITE/APPLIES), sort_order | Links courses to knowledge graph |
| `course_projects` (NEW) | course_id, module_id, title, description, instructions, submission_type (text/url/github/file), technology_ids[] | Project/assignment foundation |

### Migration 020 (bug fix)
- Adds 'approved' to learning_paths status CHECK constraint

### RLS Policies
| Table | Policy |
|-------|--------|
| `course_enrollments` | User sees/modifies only own enrollments (user_id = auth.uid()) |
| `lesson_progress` | User sees/modifies only own progress (user_id = auth.uid()) |
| `course_entities` | Public read for published non-demo courses; admin/course_manager write |
| `course_projects` | Admin/course_manager read+write only |

---

## Architecture

```
Public Pages (ISR/SSG)
  ↓ createAnonClient() — no cookies, respects RLS as anon user
  CourseService / EnrollmentService
  ↓
  Supabase (RLS filters non-published and is_demo=true)

Admin Pages (server-only, force-dynamic)
  ↓ createAdminClient() — service-role, bypasses RLS
  CourseService.admin* methods
  ↓
  Supabase (sees all records)

Admin API Routes
  requireAdminAuth() → role check against public.users
  ↓ createAdminClient()
  Supabase

Learner API Routes (/api/enroll, /api/progress)
  EnrollmentService.getCurrentUserId() → user_id from auth session (NOT from payload)
  ↓ createAdminClient() (write) / RLS (read)
  Supabase
```

---

## Services

### CourseService (`src/lib/services/course.service.ts`)
**Public reads** — all use `createAnonClient()`, filter `status='published' AND is_demo=false`:
- `getCourses(opts)` — paginated course listing
- `getCourseBySlug(slug)` — single course
- `getCourseWithCurriculum(slug)` — course + modules + published lessons
- `getCourseEntities(courseId)` — course ↔ knowledge graph links
- `getFeaturedCourses(limit)` — homepage featured
- `getLearningPaths(opts)` — path listing, optionally featured
- `getLearningPathBySlug(slug)` — path + ordered steps + published courses
- `getCoursesForTechnology(technologyId, limit)` — via course_entities TEACHES/COVERS
- `getLearningPathsForTechnology(technologyId, limit)` — via course_entities → learning_path_courses

**Admin reads/writes** — all use `createAdminClient()`, no demo filter:
- `adminGetCourses(opts)` — all courses, paginated
- `adminGetCourseById(id)` — full course + all lessons
- `adminGetLearningPaths(opts)` — all paths
- `adminGetLearningPathWithSteps(id)` — path + steps + course details

### EnrollmentService (`src/lib/services/enrollment.service.ts`)
- `getEnrollment(userId, courseId)` — check enrollment
- `enroll(userId, courseId)` — upsert enrollment (prevents duplicates)
- `getUserEnrollments(userId)` — all active enrollments
- `getLessonProgress(userId, lessonId)` — single lesson progress
- `updateLessonProgress(userId, lessonId, updates)` — upsert progress
- `getCourseProgress(userId, courseId)` — derived from lesson_progress (not stored)
- `getPathProgress(userId, pathId)` — derived from required course enrollments (not stored)
- `getCurrentUserId()` — user_id from auth session

---

## API Routes

### Admin Education (all require requireAdminAuth)
| Method | Route | Roles | Notes |
|--------|-------|-------|-------|
| GET/POST | `/api/admin/education/paths` | editor+ | List/create paths |
| PATCH/DELETE | `/api/admin/education/paths/[id]` | editor+/admin | Update/delete; syncs published boolean |
| GET/POST | `/api/admin/education/courses` | editor+ | List/create courses |
| GET/PATCH/DELETE | `/api/admin/education/courses/[id]` | editor+/admin | Full CRUD; publication quality gate |
| PATCH | `/api/admin/education/lessons/[id]` | editor+ | Update lesson; per-type publication gate |
| POST | `/api/admin/education/reorder` | editor+ | Up/down reorder for steps/modules/lessons |

### Learner
| Method | Route | Auth | Notes |
|--------|-------|------|-------|
| GET/POST | `/api/enroll/[courseId]` | Authenticated | Check/create enrollment |
| GET/POST | `/api/progress/[lessonId]` | Authenticated | Check/update lesson progress |

---

## Public Pages

| Route | Rendering | Service | Notes |
|-------|-----------|---------|-------|
| `/learn` | SSG (revalidate=300) | getLearningPaths(featured) + getFeaturedCourses | Empty state if no published paths |
| `/learn/[slug]` | SSG (revalidate=300) | getLearningPathBySlug | Path detail + ordered course steps |
| `/learn/dashboard` | Dynamic (force-dynamic) | getUserEnrollments + getCourseProgress | Auth-gated; redirects to /login |
| `/courses` | Dynamic | getCourses | Pre-existing |
| `/courses/[slug]` | SSG (revalidate=300) | getCourseWithCurriculum | Curriculum accordion, JSON-LD |
| `/courses/[slug]/lessons/[lessonId]` | SSG (revalidate=300) | Lesson by ID + siblings | Auth-gated for non-preview |
| `/tech/[slug]` | SSG (revalidate=300) | getCoursesForTechnology + getLearningPathsForTechnology | Learn sidebar section; hidden if empty |

---

## Admin Pages

| Route | Notes |
|-------|-------|
| `/admin/education` | Dashboard: stat cards + recent activity |
| `/admin/education/paths` | Path list with status filter |
| `/admin/education/paths/[id]` | Path editor: steps, metadata, status transitions, reorder |
| `/admin/education/courses` | Course list with status filter, enrollment counts |
| `/admin/education/courses/[id]` | Course editor: curriculum, learning outcomes, status transitions, reorder |

---

## Status Workflows

### Course Status
```
draft → review → approved → published → archived
         ↑                      |
         └──────────────────────┘ (return to review)
draft ← archived (re-draft)
```
- `editor` can: draft → review
- `course_manager/admin` can: all transitions including publish
- Publication quality gate (server-side): requires title, description, learning_outcomes, difficulty, audience, at least 1 published lesson

### Learning Path Status
```
draft → review → approved → published → archived
```
- Same role constraints as courses
- `published` boolean synced from `status === 'published'`

### Lesson Status
```
draft → review → published → archived
```
- Per-type publication gate (server-side):
  - article: content required
  - video: video_url required
  - quiz: quiz + at least 1 question required
  - assignment/project: content (instructions) required

---

## Knowledge Graph Integration

`course_entities` connects courses to the Phase 4.1 knowledge graph:

```
course_entities
  course_id  → courses.id
  entity_type = 'technology'
  entity_id  → technologies.id
  relationship_type: TEACHES | COVERS | PREREQUISITE | APPLIES
```

**Technology → Course** (`/tech/[slug]`):
1. Look up `technologies.id` by slug
2. Query `course_entities WHERE entity_type='technology' AND entity_id={tech.id} AND relationship_type IN ('TEACHES','COVERS')`
3. Fetch matching published non-demo courses
4. Render "Learn {tech.name}" sidebar section (hidden if empty)

**Technology → Learning Path** (`/tech/[slug]`):
1. Find course IDs via course_entities for this technology
2. Find path IDs via learning_path_courses where course_id IN (those course IDs)
3. Fetch published non-demo paths

**Note**: No real `course_entities` records exist yet (no published courses). The Learn section on `/tech/[slug]` will be hidden until real curriculum is authored and published.

---

## Demo Content Isolation

- All seed data (5 learning paths) is `is_demo=true, status='draft'`
- Public queries always filter `status='published' AND is_demo=false`
- Admin queries see all content regardless of demo/status
- Demo paths are visible only to admin users via `/admin/education/paths`
- Public pages show empty states (not fake content) when no real courses/paths exist

---

## Ordering

All ordering uses explicit `sort_order INT NOT NULL DEFAULT 0` columns:
- `course_modules.sort_order` — module ordering within course
- `lessons.sort_order` — lesson ordering within module
- `learning_path_courses.sort_order` — course ordering within path
- `course_entities.sort_order` — entity ordering for display

Queries always use `.order("sort_order")` — never insertion order.

Admin reorder: up/down controls call `POST /api/admin/education/reorder` which swaps `sort_order` values between adjacent items.

---

## Missing / Deferred

| Feature | Status | Notes |
|---------|--------|-------|
| Quiz admin UI | MISSING | DB foundation exists; no admin create/edit interface |
| Quiz learner experience | MISSING | DB foundation exists; not rendered in lesson viewer |
| Course entity admin UI | MISSING | Cannot link courses to technologies via UI; API only |
| Bookmarks | DEFERRED | No generic bookmark table in schema |
| Analytics event calls | DEFERRED | Infrastructure exists; education pages don't call it |
| Revision history | DEFERRED | RevisionService exists; not wired to education |
| Course → Technology back-links | DEFERRED | `/courses/[slug]` doesn't link to `/tech/[slug]` |
| Certificates | OUT OF SCOPE | Phase 4.3+ |
| Payments | OUT OF SCOPE | Phase 4.3+ |
| Adaptive learning | OUT OF SCOPE | Future |
