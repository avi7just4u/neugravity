# Phase 4.3 — Learner Experience + Lesson Player

## Audit Baseline

Phase 4.2 state at start of Phase 4.3:
- Lesson page: basic viewer, no completion indicators, no progress header, no mobile curriculum
- Course page: static enroll button not connected to any action
- Dashboard: continue link used `last_lesson_id` (recency-based, not curriculum-order-based)
- Quiz/project: "coming soon" placeholders
- No `quiz_attempts` or `project_submissions` tables
- Analytics calls: none from learner-facing pages

---

## Architecture Decisions

### Lesson player layout
Server component shell with client components only where interactivity is required:
- `InProgressTracker` — marks `in_progress` + fires `lesson_view` analytics on mount
- `QuizLesson` — manages quiz state, submits to server, never exposes `correct_answer`
- `ProjectLesson` — manages submission state, upserts via server API

### Article rendering
Custom `ArticleLesson` component — no external markdown library. Handles: headings (H1–H3), paragraphs, bold/italic/inline-code, fenced code blocks with language labels, unordered/ordered lists, blockquotes, horizontal rules.

### Quiz security
The `correct_answer` field is stripped server-side in `getQuizForLesson()` before the data is passed to any client component. The grading route `/api/quiz/[quizId]` fetches `correct_answer` from the DB on the server, grades, and stores the result — the client never receives the answer key.

### Continue learning algorithm
`getContinueLearningLesson()` iterates modules by `sort_order`, then lessons by `sort_order`, and returns the first lesson where `lesson_progress.status != 'completed'`. This is curriculum-order-correct vs. the previous `last_lesson_id` approach (which returned the most recently-touched lesson, not the next incomplete one).

### Mobile curriculum
`<details>/<summary>` — no JS, semantically correct, accessible keyboard nav.

### Completion indicators
Three states in curriculum sidebar: `✓` (completed, emerald), `●` (active, blue), `○` (not started, bordered). Progress bar in header derived from `lesson_progress` count.

---

## Files Created / Modified

### New components
- `src/components/lesson/callouts.tsx` — KeyIdea, Analogy, Important, WatchOut, Example, Takeaway, LearningObjectives
- `src/components/lesson/article-lesson.tsx` — custom markdown renderer
- `src/components/lesson/video-lesson.tsx` — YouTube/iframe embed with duration
- `src/components/lesson/quiz-lesson.tsx` — interactive quiz (client)
- `src/components/lesson/project-lesson.tsx` — project/assignment submission (client)
- `src/components/lesson/in-progress-tracker.tsx` — analytics + in_progress on mount (client)

### Pages (rewritten)
- `src/app/(public)/courses/[slug]/lessons/[lessonId]/page.tsx`
- `src/app/(public)/courses/[slug]/page.tsx`
- `src/app/(public)/learn/dashboard/page.tsx`

### New page component
- `src/app/(public)/courses/[slug]/enroll-button.tsx` — client, calls `/api/enroll/[courseId]`

### New API routes
- `src/app/api/quiz/[quizId]/route.ts` — POST: grade quiz, store `quiz_attempts`
- `src/app/api/project/[projectId]/route.ts` — POST/GET: upsert `project_submissions`

### Service additions
- `EnrollmentService.getContinueLearningLesson()` in `src/lib/services/enrollment.service.ts`

### Database
- `database/migrations/021_quiz_project_submissions.sql` — `quiz_attempts` + `project_submissions` tables with RLS

### Types
- `QuizAttempt`, `QuizQuestion`, `Quiz`, `ProjectSubmission` appended to `src/types/index.ts`

### Tests
- 26 new test cases added to `src/__tests__/education/education.test.ts`
- Total: 65 tests (up from 39)

---

## Security Properties

| Property | Implementation |
|----------|----------------|
| `correct_answer` never sent to client | Stripped in `getQuizForLesson()` before page render |
| `user_id` from session only | All progress/quiz/project APIs call `EnrollmentService.getCurrentUserId()` |
| Enrollment required to access lessons | Server-side redirect if no enrollment |
| Auth required to access lessons | Server-side redirect to `/login?next=...` |
| RLS on quiz_attempts | `user_id = auth.uid()` |
| RLS on project_submissions | `user_id = auth.uid()` |

---

## Requirement Coverage (Phase 4.3)

| # | Requirement | Status |
|---|-------------|--------|
| 1 | Lesson player: curriculum sidebar with ✓/●/○ | DONE |
| 2 | Lesson player: progress header | DONE |
| 3 | Lesson player: mobile curriculum (collapsible) | DONE |
| 4 | VideoLesson component | DONE |
| 5 | ArticleLesson custom renderer | DONE |
| 6 | QuizLesson interactive (never exposes correct_answer) | DONE |
| 7 | ProjectLesson submission | DONE |
| 8 | Callout components (6 types + LearningObjectives) | DONE |
| 9 | Previous/next navigation by sort_order | DONE |
| 10 | Continue learning: first incomplete by sort_order | DONE |
| 11 | Enrollment button wired on course page | DONE |
| 12 | Auth-aware CTA on course page (enrolled → Continue) | DONE |
| 13 | Clickable lesson links with completion state in curriculum | DONE |
| 14 | Analytics: lesson_view on mount (InProgressTracker) | DONE |
| 15 | in_progress tracking on lesson open | DONE |
| 16 | Quiz grading server-side, result stored in quiz_attempts | DONE |
| 17 | Project submissions stored in project_submissions | DONE |
| 18 | DB: quiz_attempts + RLS | DONE |
| 19 | DB: project_submissions + RLS | DONE |
| 20 | Dashboard: continue learning uses sort_order algorithm | DONE |
| 21 | Dashboard: next lesson title shown | DONE |
| 22 | TypeScript: 0 errors | DONE |
| 23 | Tests: 65/65 pass | DONE |
| 24 | Build: 63 routes, clean | DONE |

### Deferred (out of Phase 4.3 scope per spec)
- Quiz admin UI (create/edit questions)
- Project admin review UI
- Assignment grading
- InteractiveLesson (content type with embedded widgets)
- AssignmentLesson (distinguishable from project)
- Certificates, payments, subscriptions, code execution, AI tutor
