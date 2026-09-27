import { describe, it, expect, vi, beforeEach } from "vitest"

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeMockDb(overrides?: Record<string, unknown>) {
  const base: Record<string, unknown> = {
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    ...overrides,
  }
  const chain: Record<string, unknown> = {}
  for (const method of ["from", "select", "eq", "neq", "in", "not", "order", "limit", "gte", "lte"]) {
    chain[method] = vi.fn().mockReturnValue(chain)
  }
  return { ...chain, ...base }
}

// ─── Course publication quality gate ────────────────────────────────────────

describe("course publication quality gate (unit)", () => {
  function validateCourseForPublish(course: {
    title?: string | null
    description?: string | null
    difficulty?: string | null
    learning_outcomes?: string[] | null
  }, publishedLessonCount: number): string | null {
    if (!course.title || String(course.title).trim() === "") return "Title is required"
    if (!course.description || String(course.description).trim().length < 50) return "Description must be at least 50 characters"
    if (!course.difficulty) return "Difficulty level is required"
    if (!course.learning_outcomes || course.learning_outcomes.length === 0) return "At least one learning outcome is required"
    if (publishedLessonCount < 1) return "At least one published lesson is required before publishing a course"
    return null
  }

  it("rejects course with no title", () => {
    expect(validateCourseForPublish({ title: "", description: "x".repeat(50), difficulty: "beginner", learning_outcomes: ["a"] }, 1)).toBeTruthy()
  })

  it("rejects course with short description", () => {
    expect(validateCourseForPublish({ title: "T", description: "short", difficulty: "beginner", learning_outcomes: ["a"] }, 1)).toBeTruthy()
  })

  it("rejects course with no difficulty", () => {
    expect(validateCourseForPublish({ title: "T", description: "x".repeat(50), difficulty: null, learning_outcomes: ["a"] }, 1)).toBeTruthy()
  })

  it("rejects course with no learning outcomes", () => {
    expect(validateCourseForPublish({ title: "T", description: "x".repeat(50), difficulty: "beginner", learning_outcomes: [] }, 1)).toBeTruthy()
  })

  it("rejects course with zero published lessons", () => {
    expect(validateCourseForPublish({ title: "T", description: "x".repeat(50), difficulty: "beginner", learning_outcomes: ["a"] }, 0)).toBeTruthy()
  })

  it("accepts a valid course", () => {
    expect(validateCourseForPublish({ title: "T", description: "x".repeat(50), difficulty: "beginner", learning_outcomes: ["a"] }, 1)).toBeNull()
  })
})

// ─── Lesson publication quality gate ────────────────────────────────────────

describe("lesson publication quality gate (unit)", () => {
  function validateLessonForPublish(lesson: {
    lesson_type: string
    content?: string | null
    video_url?: string | null
  }, quizQuestionCount: number): string | null {
    if (lesson.lesson_type === "article") {
      if (!lesson.content || lesson.content.trim().length < 10) return "Article lessons require content"
    }
    if (lesson.lesson_type === "video") {
      if (!lesson.video_url || !lesson.video_url.trim()) return "Video lessons require a video URL"
    }
    if (lesson.lesson_type === "quiz") {
      if (quizQuestionCount < 1) return "Quiz lessons require at least one question"
    }
    if (lesson.lesson_type === "project" || lesson.lesson_type === "assignment") {
      if (!lesson.content || lesson.content.trim().length < 10) return "Project/assignment lessons require instructions"
    }
    return null
  }

  it("rejects article with no content", () => {
    expect(validateLessonForPublish({ lesson_type: "article", content: null }, 0)).toBeTruthy()
  })

  it("rejects article with short content", () => {
    expect(validateLessonForPublish({ lesson_type: "article", content: "short" }, 0)).toBeTruthy()
  })

  it("accepts article with content", () => {
    expect(validateLessonForPublish({ lesson_type: "article", content: "x".repeat(50) }, 0)).toBeNull()
  })

  it("rejects video with no URL", () => {
    expect(validateLessonForPublish({ lesson_type: "video", video_url: null }, 0)).toBeTruthy()
  })

  it("accepts video with URL", () => {
    expect(validateLessonForPublish({ lesson_type: "video", video_url: "https://example.com/v" }, 0)).toBeNull()
  })

  it("rejects quiz with no questions", () => {
    expect(validateLessonForPublish({ lesson_type: "quiz" }, 0)).toBeTruthy()
  })

  it("accepts quiz with questions", () => {
    expect(validateLessonForPublish({ lesson_type: "quiz" }, 2)).toBeNull()
  })

  it("rejects project with no instructions", () => {
    expect(validateLessonForPublish({ lesson_type: "project", content: "" }, 0)).toBeTruthy()
  })
})

// ─── Enrollment auth (route-layer simulation) ────────────────────────────────

describe("enrollment auth guard (unit)", () => {
  function enrollmentAuthCheck(userId: string | null, courseId: string | null): { error: string; status: number } | null {
    if (!userId) return { error: "Authentication required", status: 401 }
    if (!courseId || courseId.trim() === "") return { error: "courseId is required", status: 400 }
    return null
  }

  it("rejects unauthenticated user", () => {
    const result = enrollmentAuthCheck(null, "course-123")
    expect(result?.status).toBe(401)
  })

  it("rejects missing courseId", () => {
    const result = enrollmentAuthCheck("user-123", "")
    expect(result?.status).toBe(400)
  })

  it("allows authenticated user with valid courseId", () => {
    expect(enrollmentAuthCheck("user-123", "course-abc")).toBeNull()
  })
})

// ─── Progress auth (route-layer simulation) ──────────────────────────────────

describe("progress auth guard (unit)", () => {
  function progressAuthCheck(userId: string | null, lessonId: string | null): { error: string; status: number } | null {
    if (!userId) return { error: "Authentication required", status: 401 }
    if (!lessonId || lessonId.trim() === "") return { error: "lessonId is required", status: 400 }
    return null
  }

  it("rejects unauthenticated user", () => {
    expect(progressAuthCheck(null, "lesson-1")?.status).toBe(401)
  })

  it("rejects missing lessonId", () => {
    expect(progressAuthCheck("user-1", "")?.status).toBe(400)
  })

  it("allows valid session + lessonId", () => {
    expect(progressAuthCheck("user-1", "lesson-1")).toBeNull()
  })
})

// ─── Course progress calculation ─────────────────────────────────────────────

describe("course progress calculation (unit)", () => {
  function calcProgress(totalLessons: number, completedLessons: number) {
    if (totalLessons === 0) return { total_lessons: 0, completed_lessons: 0, percent: 0 }
    return {
      total_lessons: totalLessons,
      completed_lessons: completedLessons,
      percent: Math.round((completedLessons / totalLessons) * 100),
    }
  }

  it("returns 0% for empty course", () => {
    expect(calcProgress(0, 0).percent).toBe(0)
  })

  it("returns 50% for half-complete course", () => {
    expect(calcProgress(10, 5).percent).toBe(50)
  })

  it("returns 100% for complete course", () => {
    expect(calcProgress(4, 4).percent).toBe(100)
  })

  it("rounds percent correctly", () => {
    expect(calcProgress(3, 1).percent).toBe(33)
  })
})

// ─── Path progress calculation ───────────────────────────────────────────────

describe("path progress calculation (unit)", () => {
  function calcPathProgress(requiredCourseIds: string[], completedCourseIds: string[]) {
    if (!requiredCourseIds.length) return { total_required: 0, completed_required: 0, percent: 0 }
    const completed = requiredCourseIds.filter((id) => completedCourseIds.includes(id)).length
    return {
      total_required: requiredCourseIds.length,
      completed_required: completed,
      percent: Math.round((completed / requiredCourseIds.length) * 100),
    }
  }

  it("returns 0 for path with no required courses", () => {
    expect(calcPathProgress([], []).percent).toBe(0)
  })

  it("returns 0% when none completed", () => {
    expect(calcPathProgress(["c1", "c2", "c3"], []).percent).toBe(0)
  })

  it("returns 100% when all required courses completed", () => {
    expect(calcPathProgress(["c1", "c2"], ["c1", "c2"]).percent).toBe(100)
  })

  it("ignores optional course completions not in required list", () => {
    expect(calcPathProgress(["c1", "c2"], ["c3"]).percent).toBe(0)
  })
})

// ─── Demo content isolation ──────────────────────────────────────────────────

describe("demo content isolation (unit)", () => {
  interface MockCourse { status: string; is_demo: boolean; title: string }

  function filterPublicCourses(courses: MockCourse[]) {
    return courses.filter((c) => c.status === "published" && !c.is_demo)
  }

  const courses: MockCourse[] = [
    { status: "published", is_demo: false, title: "Real Published" },
    { status: "published", is_demo: true, title: "Demo Published" },
    { status: "draft", is_demo: false, title: "Draft Real" },
    { status: "approved", is_demo: false, title: "Approved Not Yet Published" },
  ]

  it("only returns published non-demo courses", () => {
    const result = filterPublicCourses(courses)
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe("Real Published")
  })

  it("excludes demo courses even if published", () => {
    const demoCourse: MockCourse = { status: "published", is_demo: true, title: "Demo" }
    expect(filterPublicCourses([demoCourse])).toHaveLength(0)
  })

  it("excludes non-published real courses", () => {
    const draftCourse: MockCourse = { status: "draft", is_demo: false, title: "Draft" }
    expect(filterPublicCourses([draftCourse])).toHaveLength(0)
  })
})

// ─── Status transitions (allowed lifecycle) ──────────────────────────────────

describe("content status lifecycle (unit)", () => {
  const ALLOWED: Record<string, string[]> = {
    draft: ["review"],
    review: ["approved", "draft"],
    approved: ["published", "review"],
    published: ["archived"],
    archived: ["draft"],
  }

  function canTransition(from: string, to: string) {
    return (ALLOWED[from] ?? []).includes(to)
  }

  it("draft → review is allowed", () => expect(canTransition("draft", "review")).toBe(true))
  it("draft → published is NOT allowed", () => expect(canTransition("draft", "published")).toBe(false))
  it("review → approved is allowed", () => expect(canTransition("review", "approved")).toBe(true))
  it("review → draft is allowed (reject back to draft)", () => expect(canTransition("review", "draft")).toBe(true))
  it("approved → published is allowed", () => expect(canTransition("approved", "published")).toBe(true))
  it("published → draft is NOT allowed", () => expect(canTransition("published", "draft")).toBe(false))
  it("published → archived is allowed", () => expect(canTransition("published", "archived")).toBe(true))
  it("archived → draft is allowed (recycle)", () => expect(canTransition("archived", "draft")).toBe(true))
})
