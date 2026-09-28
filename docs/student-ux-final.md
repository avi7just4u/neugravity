# Student UX Audit — Final Report

**Sprint**: NEUGRAVITY PRODUCT RESCUE — CONTINUE FROM CURRENT STATE  
**Agent**: 5 — Learner / Course UX  
**Date**: 2026-09-28  
**Scope**: /learn, /courses/[slug], /courses/[slug]/lessons/[lessonId], /learn/dashboard, enrollment service

---

## 1. Course Discovery → Decision (learn/page.tsx + courses/[slug]/page.tsx)

**Current state:**
- `/learn` shows featured learning paths + featured courses grid
- Learning paths: ALL are draft status → empty state "Learning paths coming soon." (user-facing dead end)
- Courses grid: title, description, lesson count, difficulty badge — adequate for scanning
- `/courses/[slug]`: two-column hero (title/outcomes left, sticky sidebar right), curriculum accordion (module 1 open), mobile sticky CTA bar

**Gaps:**
- No course duration estimate on course listing cards or course hero
- No difficulty/level displayed on course page hero (only in listing cards)
- `learning_outcomes` conditional: if DB field is null/empty, the entire "What you'll learn" section disappears with zero fallback
- No prerequisites section or field (doesn't exist in schema)
- No "who this course is for" copy
- Instructor identity absent — "By NeuGravity" is the only attribution
- `learn/page.tsx` still uses `group-hover:text-blue-600` — not migrated to `text-indigo-600`

**Verdict**: 6/10. Course page itself is solid; discovery path (learn → paths) is broken by all-draft status.

---

## 2. Enrollment Flow (api/enroll/[courseId]/route.ts)

**Current state:**
- `POST /api/enroll/[courseId]` → `EnrollmentService.enroll()` → upsert with `onConflict: "user_id,course_id"`
- Returns 201 with enrollment record
- `GET /api/enroll/[courseId]` → check enrollment status (used by course page for CTA state)

**Gaps:**
- No redirect after enrollment — client-side code must handle redirect to first lesson
- No enrollment confirmation UI (email or on-page toast)
- `upsert` is idempotent which is correct, but a repeated enroll after completion resets nothing (status stays "completed") — safe

**Verdict**: 8/10. Enrollment API is correct and safe.

---

## 3. Lesson Player (courses/[slug]/lessons/[lessonId]/page.tsx)

**Current state:**
- `force-dynamic`, requires auth, requires enrollment, 404 if course not found
- Correct-answer stripping for quiz questions (server-side only)
- Four lesson types handled: video, article, quiz, project/assignment
- Desktop: sticky 72px curriculum sidebar with completion indicators
- Mobile: `<details>` accordion curriculum (max-h-64 scroll)
- Bottom nav: prev/next buttons with truncated lesson title, "Finish Course →" at end
- Progress header: indigo progress bar, lessons x/y count, module/lesson position (desktop)
- `BookOpen` icon in header still references `text-blue-500` (line 208) — not indigo

**Bugs:**
- **line 208**: `<BookOpen className="h-4 w-4 shrink-0 text-blue-500" />` — should be `text-indigo-600`
- **line 378**: `onComplete={() => {}}` in QuizLesson prop — the component itself calls `router.refresh()` internally (fix from e788695), so the empty prop is not actively broken but is misleading dead code. ProjectLesson `onComplete` at line 399 has the same pattern — if ProjectLesson doesn't have the internal refresh fix, project completion won't update the progress bar

**Verdict**: 8/10. Solid lesson player. Minor color inconsistency + ProjectLesson onComplete needs verification.

---

## 4. Progress Tracking (EnrollmentService)

**Current state:**
- `updateLessonProgress`: upserts with `onConflict: "user_id,lesson_id"`, sets `completed_at` when status=completed ✓
- `getCourseProgress`: batch-fetches all lesson IDs, then all progress rows — efficient
- `updateEnrollmentStatus`: sets `status: "completed"` + `completed_at` when course finishes ✓ (fixed in e788695)
- `getContinueLearningLesson`: **N+1 query** — iterates modules → lessons → individual DB call per lesson to check progress. For a 30-lesson course, this is 30 serial Supabase round-trips

**Bugs:**
- `getContinueLearningLesson` N+1: replace with a single batch progress fetch, then find first incomplete in JS

**Verdict**: 7/10. getCourseProgress is efficient; getContinueLearningLesson is not.

---

## 5. Learner Dashboard (/learn/dashboard/page.tsx)

**Current state:**
- Auth-gated, force-dynamic
- Shows enrolled courses with progress bar, lesson count, "Continue" or "Review Course" CTA
- "Next lesson" label under progress bar
- Empty state with links to /learn and /courses

**Critical Bugs:**

1. **BLOCKER — Dashboard is unreachable**: No link to `/learn/dashboard` in the navbar, no link from `/learn` page, no link from course page after enrollment. Users who have enrolled courses cannot find their dashboard without knowing the URL.

2. **BLOCKER — Completed courses vanish from dashboard**: `getUserEnrollments` filters `status = "active"` only (line 49). When a course completes, enrollment status becomes "completed" and disappears from the dashboard. Users see their course count drop — confusing and appears to be data loss.

3. **Progress bar color**: line 119 uses `bg-blue-500` — should be `bg-indigo-600` to match the brand.

**Verdict**: 3/10 (blocked by two critical navigation/data bugs).

---

## 6. Post-Completion Experience

**Current state:**
- Course page shows "Finish Course →" at last lesson
- Dashboard shows "Review Course" button for completed enrollments (but only if you can reach the dashboard)
- `updateEnrollmentStatus` marks the enrollment as completed in DB

**Missing:**
- No completion celebration (no animation, no confetti, no toast)
- No certificate of completion
- No next-course recommendation
- No progress summary ("You completed 12 lessons in 3 days")
- Completed courses aren't surfaced at all (see bug 2 above)

**Verdict**: 2/10. Completion exists in the database but is invisible in the product.

---

## 7. Mobile Learner Experience

**Lesson player mobile:**
- `<details>` accordion for curriculum — works but requires an extra tap to navigate
- Header shows progress bar + lesson count (adequate)
- No swipe-to-navigate between lessons
- Prev/Next buttons at bottom ("Previous" / "Next" labels on mobile — good)
- `lg:hidden` mobile sticky CTA bar on course page — correct

**Dashboard mobile:**
- Single-column grid on mobile — OK
- Cards adequate size for touch

**Verdict**: 7/10. Functional but no swipe navigation in lesson player.

---

## 8. Accessibility

- Progress bar has `role="progressbar"`, `aria-valuenow/min/max`, `aria-label` ✓
- Mobile curriculum has `<details>`/`<summary>` — native accessible ✓
- Curriculum sidebar links are plain `<Link>` — keyboard navigable ✓
- `BookOpen` icon in header is decorative but has no `aria-hidden` — minor
- Dashboard "Continue" buttons are not labeled with course title — screen reader reads "Continue" without context

---

## 9. Issues & Priority Backlog

| # | Severity | File | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | CRITICAL | navbar.tsx | No link to /learn/dashboard | Add "My Learning" to nav when user is logged in (needs auth-aware navbar) |
| 2 | CRITICAL | enrollment.service.ts:49 | `getUserEnrollments` filters only `active` — completed courses disappear | Remove status filter OR return all non-paused, show completed separately |
| 3 | HIGH | lesson/page.tsx:208 | `BookOpen` uses `text-blue-500` | Change to `text-indigo-600` |
| 4 | HIGH | dashboard/page.tsx:119 | Progress bar `bg-blue-500` | Change to `bg-indigo-600` |
| 5 | HIGH | learn/page.tsx | `group-hover:text-blue-600` not migrated to indigo | Find+replace in learn/page.tsx |
| 6 | HIGH | — | No dashboard link from /learn page | Add "My Learning →" CTA for logged-in users |
| 7 | MEDIUM | enrollment.service.ts:196 | N+1 in getContinueLearningLesson | Batch-fetch all lesson progress, find first incomplete in JS |
| 8 | MEDIUM | lesson/page.tsx:399 | ProjectLesson `onComplete={() => {}}` — verify it handles refresh internally | Check project-lesson.tsx; if not, add router.refresh() |
| 9 | MEDIUM | — | No post-completion celebration | Add confetti/toast on 100% progress |
| 10 | LOW | — | Dashboard "Continue" buttons lack course-name context for screen readers | Add `aria-label="Continue [course title]"` |
| 11 | LOW | — | No certificate of completion | Future phase |
| 12 | LOW | — | No next-course recommendation | Future phase |

**Immediate fixes (no new pages, pure fixes):**
- Issues 2, 3, 4, 5 — can be done in one pass across 3 files
- Issue 1 requires auth-aware navbar (bigger change, needs user session in layout)
- Issue 8 requires reading project-lesson.tsx
