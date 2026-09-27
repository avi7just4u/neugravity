# Lesson Player — Architecture Reference

## Route

`/courses/[courseSlug]/lessons/[lessonId]`

## Auth / Access Control

1. `createClient()` → `auth.getUser()` — if no user, redirect to `/login?next=...`
2. `EnrollmentService.getEnrollment(userId, courseId)` — if not enrolled, redirect to course page
3. All content fetched via `createAdminClient()` (bypasses RLS, server-only)

## Page Structure

```
<LessonViewerPage>           (server component)
  <InProgressTracker />      (client — useEffect fires once, marks in_progress + analytics)
  <header>                   progress bar, breadcrumb, lesson position
  <aside.lg:flex>            desktop curriculum sidebar with ✓/●/○ indicators
  <main>
    <details.lg:hidden>      mobile curriculum accordion
    <div.content>
      lesson title + completion badge
      <LearningObjectives /> (server)
      <VideoLesson />        (server — iframe embed)
      <ArticleLesson />      (server — custom parser)
      <QuizLesson />         (client — interactive quiz)
      <ProjectLesson />      (client — submission form)
      prev/next + MarkCompleteButton
```

## Lesson Types

| type | component | completion mechanism |
|------|-----------|----------------------|
| video | `VideoLesson` | `MarkCompleteButton` → POST `/api/progress/[lessonId]` |
| article | `ArticleLesson` | `MarkCompleteButton` |
| interactive | `ArticleLesson` | `MarkCompleteButton` |
| quiz | `QuizLesson` | auto-complete on passing score via quiz API |
| project | `ProjectLesson` | auto-complete on submission |
| assignment | `ProjectLesson` | auto-complete on submission |

## Quiz Flow

```
QuizLesson (client)
  user selects answers
  → POST /api/quiz/[quizId]
      server fetches correct_answer (never returned to client)
      grades → score, passed, explanations per question
      inserts quiz_attempts row
      returns { score, passed, results[] }
  if passed → POST /api/progress/[lessonId] {status:"completed"}
  shows score + per-question review
```

**Security invariant:** `correct_answer` is fetched and consumed server-side in the API route. It is explicitly stripped (`{ correct_answer: _ca, ...q }`) in `getQuizForLesson()` so it never reaches the page's `props` and cannot be seen in RSC payload or DevTools.

## Progress Tracking

- `InProgressTracker` fires `in_progress` status + `lesson_view` analytics event once on mount
- `MarkCompleteButton` fires `completed` status + `progress_percent: 100`
- Quiz/project completion fires automatically after successful submission
- All progress POSTs to `/api/progress/[lessonId]` which gets `user_id` from session

## Curriculum Sidebar

Ordered by `course_modules.sort_order` then `lessons.sort_order`. Progress map built server-side from a single bulk query against `lesson_progress`. Three states:
- `completed` → `<CheckCircle>` (emerald)
- `lessonId === activeId` → filled blue dot
- otherwise → empty bordered dot

## Navigation

Flat `allLessons` array = all published lessons across all modules in `sort_order`. `currentIdx` drives `prevLesson` and `nextLesson`. Last lesson shows "Finish Course" instead of "Next".

## Mobile

`<details>/<summary>` accordion (no JS). Collapsible curriculum max-height 16rem with scroll. Sidebar hidden at `< lg` breakpoints.
