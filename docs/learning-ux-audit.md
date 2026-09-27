# NeuGravity — Learning UX Audit

**Agent 4: Student / Course UX Audit**
**Scope:** Public learning surfaces, lesson player, enrollment flow, progress tracking, quiz, projects

---

## 1. Student First-Time Experience Walkthrough

### Entry Point: `/learn`

A first-time visitor lands on a page with:
- "Learn Technology" heading + a generic subtitle
- Learning paths grid (or empty state: "Learning paths coming soon.")
- Featured courses grid (or empty state)
- A single CTA: "Browse Courses"

**Problems:**
- No immediate answer to "What is NeuGravity and why should I learn here?"
- No instructor credibility on any card
- No enrollment counts, ratings, or social proof anywhere
- No sample content / preview visible from catalog
- Difficulty badges exist but no explanation of what levels mean
- Empty states ("coming soon") are publicly visible — a first-time visitor cannot know if the product is live or in beta

### Entry Point: `/courses`

A grid of course cards with thumbnail placeholder, difficulty badge, title, description snippet, duration, and price.

**Problems:**
- Thumbnail placeholder is a grey box with a BookOpen icon — not premium
- No instructor shown on card
- No category filter, difficulty filter, or search
- `rating_average` field exists on the `Course` type and is fetched, but the course detail page never renders instructor, rating, or enrollment count
- Course catalog has no stated ordering logic (featured? newest? most popular?)

---

## 2. Course Landing Page Scorecard

| Student Question | Present? | Quality | Notes |
|---|---|---|---|
| What will I learn? | Partial | Weak | `learning_outcomes` array renders if populated; falls back to single `outcome` string; neither is guaranteed to exist |
| Who is this for? | Partial | Poor | `audience` shown only in sidebar metadata as plain text — not prominent |
| How long? | Yes | OK | `estimated_hours` shown, lesson count shown |
| Is this beginner-friendly? | Partial | OK | Difficulty badge shown but no explanation of what levels mean |
| What do I need first? | No | Missing | `prerequisites` field does not exist on the `Course` type; no prerequisites section |
| Can I trust the instructor? | No | Missing | `instructor_id` exists on `Course` but the detail page never fetches or renders instructor data — no name, bio, or credentials shown |
| Can I see a preview? | Partial | Weak | Preview lessons are accessible if `is_preview=true` but there is no prominent "Preview this lesson" CTA — just a small blue "Preview" label on the curriculum row |
| How do I know I'm progressing? | Enrolled only | OK | Progress bar visible in lesson player; no overall progress shown on course detail until enrolled |
| What happens after this course? | No | Missing | No "Next step" recommendations, no related path, no certificate mention |

**Overall course landing page score: 4/9 questions answered adequately**

### Critical Gaps
1. **No instructor identity.** The page renders `Price`, `Duration`, `Lessons`, and `Audience` — but never an instructor name or bio. This is the single biggest trust gap for a learning platform.
2. **No prerequisites.** No schema field; no UI section.
3. **No post-completion path.** "Finish Course" returns to course detail with no recommendation.
4. **Rating field exists but is never displayed.** `rating_average` and `rating_count` on `Course` type are fetched but the course detail page does not render them (appropriate since data may be zero/null, but the gap remains if real ratings exist).

---

## 3. Lesson Experience Scorecard

### Structural Quality

The lesson player layout is architecturally sound:
- Sticky progress header with course title + progress bar + lesson count
- Desktop: fixed left sidebar showing curriculum with completion indicators
- Mobile: collapsible accordion for curriculum (max-height 64, scrollable)
- Content in a centred `max-w-3xl` reading column
- Bottom navigation: Previous / Mark Complete / Next

### Lesson Types Implemented

| Type | Component | Status |
|---|---|---|
| Video | `VideoLesson` — YouTube embed + iframe | LIVE |
| Article | `ArticleLesson` — markdown-like parser | LIVE |
| Quiz | `QuizLesson` — single/multiple choice | LIVE |
| Project/Assignment | `ProjectLesson` — text, URL, GitHub submission | LIVE |
| Interactive | Falls back to article parser | PARTIAL |

### Learning Objectives

`LearningObjectives` component renders `lesson.learning_outcomes[]` with "After this lesson, you can:" heading — good pattern, clearly framed.

### Callout Components

Defined but only rendered if content author explicitly uses them: `KeyIdea`, `Analogy`, `Important`, `WatchOut`, `Example`, `Takeaway`. These are not automatically applied — they require manual authoring.

### Cognitive Load Issues

| Issue | Severity |
|---|---|
| Article renderer is a custom line-by-line parser — no support for tables, images, horizontal rules in all positions, nested lists | Medium |
| No estimated read time on article lessons | Low |
| No "Video not yet available" fallback looks like a blank lesson (currently renders a grey placeholder box) | High |
| Quiz: "Submit Quiz" is disabled until all questions answered, with no progress indicator ("3 of 5 answered") | Medium |
| On quiz failure: "Try again" resets all answers but does not scroll to top | Low |
| `onComplete` prop in `QuizLesson` and `ProjectLesson` is always `() => {}` — callback is a no-op; server refresh does not happen after quiz pass | High |

### Navigation

- Prev/Next lesson buttons work correctly
- "Finish Course" at the end of the last lesson returns to course detail — no completion celebration, no next-step recommendation
- Mobile curriculum accordion is capped at 64px height (about 2-3 lessons visible), requiring scroll; not ideal for long courses

---

## 4. Progress / Enrollment State Audit

### Enrollment Flow

1. Anonymous user → clicks "Enroll Free" → 401 → redirect to `/login?next=/courses/[slug]`
2. After login → redirect back → enrollment POST → redirect to first lesson ✅
3. Already enrolled → "Continue Learning" button → correct resume lesson ✅

**Enrollment upsert is idempotent** (uses `onConflict: "user_id,course_id"`) — safe to re-enroll.

### Progress Tracking

- `InProgressTracker` fires on lesson mount: marks lesson `in_progress` immediately on page load ✅
- `MarkCompleteButton` fires POST to `/api/progress/[lessonId]` then calls `router.refresh()` ✅
- Quiz auto-marks complete on pass via `/api/progress` ✅
- Project auto-marks complete on submission ✅

### Course Completion

**Critical gap:** When all lessons are marked complete, `enrollment.status` is never updated to `"completed"`. The `getCourseProgress` computes `percent=100` correctly, but there is no trigger or service call to set `course_enrollments.status = 'completed'`. The dashboard shows `enrollment.status` as `"active"` even for 100%-complete courses.

### N+1 Query in `getContinueLearningLesson`

`getContinueLearningLesson` loops over every module, then every lesson, issuing one DB query per lesson to check progress:
```
for (const mod of modules) {
  for (const lesson of lessons) {
    await db.from("lesson_progress").select("status")...  // 1 query per lesson
  }
}
```
For a course with 30 lessons this is 30 separate DB round-trips. This runs on every lesson page load and dashboard render.

### Learner Dashboard (`/learn/dashboard`)

- Shows enrolled courses with progress bars and "Continue" / "Review" buttons ✅
- Shows `enrollment.status` as a capitalized label (e.g. "Active") — will always show "Active" even at 100% ❌
- No total time spent, no streak, no completion date, no achievement
- No browse/discover section to encourage enrollment in adjacent courses
- Dashboard is correctly `noindex` ✅

---

## 5. The NeuGravity Learning Method — Current Support

The prescribed learning method: Problem → Analogy → Simple explanation → Visual model → Technical explanation → Example → Practice → Takeaway

| Step | Infrastructure exists? | Notes |
|---|---|---|
| Problem | ✅ Partial | `lesson.description` can frame the problem; no dedicated field |
| Analogy | ✅ Component | `Analogy` callout exists; requires author adoption |
| Simple explanation | ✅ Via article content | No dedicated field or required structure |
| Visual model | ❌ Missing | No image support in `ArticleLesson`; no diagram component |
| Technical explanation | ✅ Via article content + code blocks | Article parser supports code fences |
| Example | ✅ Component | `Example` callout exists |
| Practice | ✅ Quiz + Project | Both implemented |
| Takeaway | ✅ Component | `Takeaway` callout exists |

**Summary:** The callout system provides the scaffolding for the NeuGravity method. The missing pieces are:
- Image/visual support in article lessons
- A structural template that guides authors to follow the method
- No way for a reader to know the lesson follows this method

---

## 6. Critical Fixes Before Course Launch

### P0 — Blockers

| # | Issue | Location | Fix |
|---|---|---|---|
| 1 | `onComplete` callback is `() => {}` in both `QuizLesson` and `ProjectLesson` — course progress header doesn't update after quiz pass without a full page reload | `lesson/[lessonId]/page.tsx` L373, L394 | Replace no-op with `router.refresh()` or optimistic state update |
| 2 | Enrollment `status` never set to `"completed"` when course is 100% done | `enrollment.service.ts` | Add `updateEnrollmentStatus(userId, courseId, "completed")` call when `progress.percent === 100` after lesson mark-complete |
| 3 | N+1 query in `getContinueLearningLesson` — one DB query per lesson | `enrollment.service.ts:196–216` | Batch-fetch all lesson progress for the course in one query, then find first incomplete |

### P1 — Major UX Issues Before Launch

| # | Issue | Fix |
|---|---|---|
| 4 | No instructor displayed on course detail or course catalog | Fetch instructor via `instructor_id`; add instructor card with name + brief bio |
| 5 | No prerequisites section | Add `prerequisites` to `Course` type + DB; render before curriculum |
| 6 | No post-completion experience | On course complete: show congratulations, "What's Next" from learning path or related courses |
| 7 | "Finish Course" at last lesson is anti-climactic — drops back to course detail silently | Add a completion screen or modal with achievement + next step CTA |
| 8 | Course rating shown on catalog page (`Star` icon renders `rating_average`) but will show `0` or nothing for courses with no real ratings — consider hiding when `rating_count === 0` | Conditional render in `CourseCard` |
| 9 | No preview CTA — preview lessons are accessible but not promoted | Add a "Preview first lesson" button prominently on course landing |
| 10 | Empty states ("coming soon") are publicly visible | Gate learn page: only show sections that have real published content |

### P2 — Polish

| # | Issue |
|---|---|
| 11 | No read-time estimate on article lessons |
| 12 | Quiz: no "X of Y answered" progress indicator during quiz |
| 13 | Mobile curriculum accordion max-height too small for courses >5 lessons |
| 14 | No visual distinction between required and optional lessons in curriculum sidebar |
| 15 | Dashboard shows `enrollment.status = "Active"` even at 100% — misleading label |

---

## 7. Recommendations for Premium Learning Experience

### Immediate (before first course launch)

1. **Instructor presence is non-negotiable.** Every course page must show: instructor name, photo, 1-2 sentence bio. Without it the platform has no credibility.

2. **Fix the completion loop.** When a learner finishes the last lesson, they should see:
   - A completion animation or screen (not just "Finish Course" dropping to the course page)
   - What they just accomplished
   - One clear next step (next course in path, or recommended course)
   Enrollment status should flip to `completed`.

3. **Batch the continue-learning query.** The N+1 in `getContinueLearningLesson` must be fixed before any meaningful scale — it will cause noticeable latency on the dashboard and lesson pages with large courses.

4. **Fix quiz `onComplete` no-op.** Currently a quiz pass does not update the UI progress header until the user manually refreshes. Use `router.refresh()`.

### Strategic (before broader marketing)

5. **First-screen promise.** The course detail page should, in its first visible viewport, answer: title, outcome in 1 sentence, difficulty, duration, and instructor. Currently this information is scattered or missing.

6. **Image support in lessons.** The `ArticleLesson` parser has no image (`![]()`) support. Lessons with visual content cannot be authored effectively.

7. **NeuGravity Method as an author template.** Create an admin template in the lesson editor that pre-populates sections: Problem / Analogy / Explanation / Visual / Example / Practice / Takeaway. This both enforces brand pedagogy and reduces author cognitive load.

8. **Prerequisites as a concrete field.** Add `prerequisites: string[]` to the Course schema (following the same pattern as `learning_outcomes`). Render before curriculum with a "You should know" heading.

9. **Learning path progress.** The learner dashboard shows individual course progress but does not show which learning path the course belongs to. A learner working through a 4-course path should see path-level progress, not just course-level.

10. **Avoid premature gamification.** Don't add streaks, points, or badges until real usage data exists. Focus on: clear progress, visible outcomes, a meaningful completion moment.

---

## Summary Assessment

| Area | Status |
|---|---|
| Course catalog | PARTIAL — functional but generic; no instructor, no preview CTA |
| Course detail | PARTIAL — curriculum and outcomes present; no instructor, no prerequisites, no post-completion |
| Enrollment flow | LIVE — works correctly; login-gate is clear |
| Lesson player layout | LIVE — good structure; desktop sidebar excellent |
| Video lessons | LIVE — YouTube embed works |
| Article lessons | PARTIAL — no image support; parser is adequate for basic content |
| Quiz | LIVE — scoring, pass/fail, retry work; `onComplete` is a no-op |
| Project submission | LIVE — text and URL types work |
| Progress tracking | PARTIAL — per-lesson progress works; course completion status never set |
| Learner dashboard | LIVE — shows enrolled courses; completion state label wrong |
| N+1 query | BROKEN — `getContinueLearningLesson` issues 1 query per lesson |
| Instructor display | MISSING — field exists, never rendered |
| Post-completion experience | MISSING — no celebration, no next step, no status update |
| NeuGravity Learning Method | PARTIAL — callout components exist; author adoption not enforced |
