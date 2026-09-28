import { createAdminClient } from "@/lib/supabase/server"
import { createClient } from "@/lib/supabase/server"
import type { CourseEnrollment, LessonProgress, CourseProgress } from "@/types"

export const EnrollmentService = {
  async getEnrollment(userId: string, courseId: string): Promise<CourseEnrollment | null> {
    try {
      const db = createAdminClient()
      const { data, error } = await db
        .from("course_enrollments")
        .select("*")
        .eq("user_id", userId)
        .eq("course_id", courseId)
        .single()

      if (error || !data) return null
      return data as CourseEnrollment
    } catch {
      return null
    }
  },

  async enroll(userId: string, courseId: string): Promise<CourseEnrollment | null> {
    try {
      const db = createAdminClient()
      const { data, error } = await db
        .from("course_enrollments")
        .upsert(
          { user_id: userId, course_id: courseId, status: "active" },
          { onConflict: "user_id,course_id" }
        )
        .select()
        .single()

      if (error || !data) return null
      return data as CourseEnrollment
    } catch {
      return null
    }
  },

  async getUserEnrollments(userId: string): Promise<CourseEnrollment[]> {
    try {
      const db = createAdminClient()
      const { data } = await db
        .from("course_enrollments")
        .select("*")
        .eq("user_id", userId)
        .in("status", ["active", "completed"])
        .order("enrolled_at", { ascending: false })

      return (data ?? []) as CourseEnrollment[]
    } catch {
      return []
    }
  },

  async getLessonProgress(userId: string, lessonId: string): Promise<LessonProgress | null> {
    try {
      const db = createAdminClient()
      const { data } = await db
        .from("lesson_progress")
        .select("*")
        .eq("user_id", userId)
        .eq("lesson_id", lessonId)
        .single()

      return data ? (data as LessonProgress) : null
    } catch {
      return null
    }
  },

  async updateLessonProgress(userId: string, lessonId: string, updates: {
    status?: "not_started" | "in_progress" | "completed"
    progress_percent?: number
    video_position_seconds?: number
  }): Promise<LessonProgress | null> {
    try {
      const db = createAdminClient()
      const now = new Date().toISOString()
      const payload: Record<string, unknown> = {
        user_id: userId,
        lesson_id: lessonId,
        ...updates,
        ...(updates.status === "completed" ? { completed_at: now } : {}),
      }

      const { data, error } = await db
        .from("lesson_progress")
        .upsert(payload, { onConflict: "user_id,lesson_id" })
        .select()
        .single()

      if (error || !data) return null
      return data as LessonProgress
    } catch {
      return null
    }
  },

  async getCourseProgress(userId: string, courseId: string): Promise<CourseProgress> {
    try {
      const db = createAdminClient()

      // Get all published lesson IDs in this course
      const { data: moduleData } = await db
        .from("course_modules")
        .select("id")
        .eq("course_id", courseId)

      const moduleIds = ((moduleData ?? []) as { id: string }[]).map((m) => m.id)
      if (!moduleIds.length) return { course_id: courseId, total_lessons: 0, completed_lessons: 0, percent: 0, last_lesson_id: null }

      const { data: lessonData } = await db
        .from("lessons")
        .select("id")
        .in("module_id", moduleIds)
        .eq("status", "published")

      const lessonIds = ((lessonData ?? []) as { id: string }[]).map((l) => l.id)
      if (!lessonIds.length) return { course_id: courseId, total_lessons: 0, completed_lessons: 0, percent: 0, last_lesson_id: null }

      // Get user's progress on those lessons
      const { data: progressData } = await db
        .from("lesson_progress")
        .select("lesson_id,status,updated_at")
        .eq("user_id", userId)
        .in("lesson_id", lessonIds)
        .order("updated_at", { ascending: false })

      const progress = (progressData ?? []) as { lesson_id: string; status: string; updated_at: string }[]
      const completed = progress.filter((p) => p.status === "completed").length
      const lastLesson = progress[0]?.lesson_id ?? null

      return {
        course_id: courseId,
        total_lessons: lessonIds.length,
        completed_lessons: completed,
        percent: lessonIds.length > 0 ? Math.round((completed / lessonIds.length) * 100) : 0,
        last_lesson_id: lastLesson,
      }
    } catch {
      return { course_id: courseId, total_lessons: 0, completed_lessons: 0, percent: 0, last_lesson_id: null }
    }
  },

  async getPathProgress(userId: string, pathId: string): Promise<{ total_required: number; completed_required: number; percent: number }> {
    try {
      const db = createAdminClient()
      const { data: steps } = await db
        .from("learning_path_courses")
        .select("course_id,is_required")
        .eq("learning_path_id", pathId)
        .eq("is_required", true)

      const requiredCourseIds = ((steps ?? []) as { course_id: string }[]).map((s) => s.course_id)
      if (!requiredCourseIds.length) return { total_required: 0, completed_required: 0, percent: 0 }

      // A course is "completed" if enrollment exists and status=completed
      const { data: enrollments } = await db
        .from("course_enrollments")
        .select("course_id,status")
        .eq("user_id", userId)
        .in("course_id", requiredCourseIds)

      const completed = ((enrollments ?? []) as { status: string }[])
        .filter((e) => e.status === "completed").length

      return {
        total_required: requiredCourseIds.length,
        completed_required: completed,
        percent: Math.round((completed / requiredCourseIds.length) * 100),
      }
    } catch {
      return { total_required: 0, completed_required: 0, percent: 0 }
    }
  },

  async getContinueLearningLesson(userId: string, courseId: string): Promise<{
    lessonId: string | null
    moduleTitle: string | null
    lessonTitle: string | null
  }> {
    try {
      const db = createAdminClient()
      const { data: moduleData } = await db
        .from("course_modules")
        .select("id,title,sort_order")
        .eq("course_id", courseId)
        .order("sort_order")

      const modules = (moduleData ?? []) as { id: string; title: string; sort_order: number }[]
      if (!modules.length) return { lessonId: null, moduleTitle: null, lessonTitle: null }

      const moduleIds = modules.map((m) => m.id)
      const { data: lessonData } = await db
        .from("lessons")
        .select("id,title,sort_order,module_id")
        .in("module_id", moduleIds)
        .eq("status", "published")
        .order("sort_order")

      const lessons = (lessonData ?? []) as { id: string; title: string; sort_order: number; module_id: string }[]
      if (!lessons.length) return { lessonId: null, moduleTitle: null, lessonTitle: null }

      const { data: progressData } = await db
        .from("lesson_progress")
        .select("lesson_id,status")
        .eq("user_id", userId)
        .in("lesson_id", lessons.map((l) => l.id))

      const completedIds = new Set(
        ((progressData ?? []) as { lesson_id: string; status: string }[])
          .filter((p) => p.status === "completed")
          .map((p) => p.lesson_id)
      )

      const moduleOrder = new Map(modules.map((m, i) => [m.id, i]))
      const sorted = [...lessons].sort((a, b) => {
        const modDiff = (moduleOrder.get(a.module_id) ?? 0) - (moduleOrder.get(b.module_id) ?? 0)
        return modDiff !== 0 ? modDiff : a.sort_order - b.sort_order
      })

      for (const lesson of sorted) {
        if (!completedIds.has(lesson.id)) {
          const mod = modules.find((m) => m.id === lesson.module_id)
          return { lessonId: lesson.id, moduleTitle: mod?.title ?? null, lessonTitle: lesson.title }
        }
      }
      return { lessonId: null, moduleTitle: null, lessonTitle: null }
    } catch {
      return { lessonId: null, moduleTitle: null, lessonTitle: null }
    }
  },

  async updateEnrollmentStatus(userId: string, courseId: string, status: "active" | "completed" | "paused"): Promise<void> {
    try {
      const db = createAdminClient()
      const updates: Record<string, unknown> = { status }
      if (status === "completed") updates.completed_at = new Date().toISOString()
      await db
        .from("course_enrollments")
        .update(updates)
        .eq("user_id", userId)
        .eq("course_id", courseId)
    } catch {
      // non-fatal
    }
  },

  // Server-side: get current user ID from session
  async getCurrentUserId(): Promise<string | null> {
    try {
      const client = await createClient()
      const { data: { user } } = await client.auth.getUser()
      return user?.id ?? null
    } catch {
      return null
    }
  },
}
