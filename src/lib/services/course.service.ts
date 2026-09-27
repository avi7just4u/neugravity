import { createAnonClient, createAdminClient } from "@/lib/supabase/server"
import type {
  Course,
  CourseModule,
  Lesson,
  LearningPath,
  LearningPathCourse,
  CourseEntity,
  PaginatedResponse,
} from "@/types"

export const CourseService = {
  async getCourses(opts: {
    page?: number
    perPage?: number
    category?: string
    difficulty?: string
    featured?: boolean
  } = {}): Promise<PaginatedResponse<Course>> {
    const { page = 1, perPage = 20, category, difficulty, featured } = opts
    const from = (page - 1) * perPage
    const to = from + perPage - 1

    try {
      const db = createAnonClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q: any = db
        .from("courses")
        .select("*", { count: "exact" })
        .eq("status", "published")
        .eq("is_demo", false)
        .order("enrollment_count", { ascending: false })
        .range(from, to)

      if (category) q = q.eq("category_id", category)
      if (difficulty) q = q.eq("difficulty", difficulty)
      if (featured !== undefined) q = q.eq("featured", featured)

      const { data, count, error } = await q
      if (error) return { data: [], total: 0, page, per_page: perPage, total_pages: 0 }

      return {
        data: (data ?? []) as Course[],
        total: count ?? 0,
        page,
        per_page: perPage,
        total_pages: Math.ceil((count ?? 0) / perPage),
      }
    } catch {
      return { data: [], total: 0, page, per_page: perPage, total_pages: 0 }
    }
  },

  async getCourseBySlug(slug: string): Promise<Course | null> {
    try {
      const db = createAnonClient()
      const { data, error } = await db
        .from("courses")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .eq("is_demo", false)
        .single()

      if (error || !data) return null
      return data as Course
    } catch {
      return null
    }
  },

  async getCourseWithCurriculum(slug: string): Promise<(Course & { modules: (CourseModule & { lessons: Lesson[] })[] }) | null> {
    try {
      const db = createAnonClient()
      const { data: course, error } = await db
        .from("courses")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .eq("is_demo", false)
        .single()

      if (error || !course) return null

      const { data: modules } = await db
        .from("course_modules")
        .select("*")
        .eq("course_id", course.id)
        .order("sort_order")

      const moduleList = (modules ?? []) as CourseModule[]

      const modulesWithLessons = await Promise.all(
        moduleList.map(async (mod) => {
          const { data: lessons } = await db
            .from("lessons")
            .select("id,title,description,lesson_type,video_duration_seconds,sort_order,is_preview,status,learning_outcomes")
            .eq("module_id", mod.id)
            .eq("status", "published")
            .order("sort_order")

          return { ...mod, lessons: (lessons ?? []) as Lesson[] }
        })
      )

      return { ...(course as Course), modules: modulesWithLessons }
    } catch {
      return null
    }
  },

  async getCourseEntities(courseId: string): Promise<CourseEntity[]> {
    try {
      const db = createAnonClient()
      const { data } = await db
        .from("course_entities")
        .select("*")
        .eq("course_id", courseId)
        .order("sort_order")

      return (data ?? []) as CourseEntity[]
    } catch {
      return []
    }
  },

  async getFeaturedCourses(limit = 6): Promise<Course[]> {
    try {
      const db = createAnonClient()
      const { data, error } = await db
        .from("courses")
        .select("id,slug,title,subtitle,short_description,description,difficulty,estimated_hours,thumbnail_url,hero_image_url,featured,enrollment_count,price,price_currency,status,is_demo")
        .eq("status", "published")
        .eq("is_demo", false)
        .eq("featured", true)
        .order("enrollment_count", { ascending: false })
        .limit(limit)

      if (error || !data) return []
      return data as Course[]
    } catch {
      return []
    }
  },

  async getLearningPaths(opts: { featured?: boolean; limit?: number } = {}): Promise<LearningPath[]> {
    try {
      const db = createAnonClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q: any = db
        .from("learning_paths")
        .select("*")
        .eq("status", "published")
        .eq("is_demo", false)
        .order("title")

      if (opts.featured !== undefined) q = q.eq("featured", opts.featured)
      if (opts.limit) q = q.limit(opts.limit)

      const { data, error } = await q
      if (error || !data) return []
      return data as LearningPath[]
    } catch {
      return []
    }
  },

  async getLearningPathBySlug(slug: string): Promise<(LearningPath & { steps: (LearningPathCourse & { course: Course | null })[] }) | null> {
    try {
      const db = createAnonClient()
      const { data: path, error } = await db
        .from("learning_paths")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .eq("is_demo", false)
        .single()

      if (error || !path) return null

      const { data: steps } = await db
        .from("learning_path_courses")
        .select("*")
        .eq("learning_path_id", path.id)
        .order("sort_order")

      const stepList = (steps ?? []) as LearningPathCourse[]

      const courseIds = stepList.map((s) => s.course_id)
      const courses: Record<string, Course> = {}

      if (courseIds.length > 0) {
        const { data: courseData } = await db
          .from("courses")
          .select("id,slug,title,subtitle,short_description,description,difficulty,estimated_hours,thumbnail_url,status,is_demo,enrollment_count")
          .in("id", courseIds)
          .eq("status", "published")
          .eq("is_demo", false)

        for (const c of (courseData ?? [])) {
          courses[(c as Course).id] = c as Course
        }
      }

      const enrichedSteps = stepList.map((s) => ({
        ...s,
        course: courses[s.course_id] ?? null,
      }))

      return { ...(path as LearningPath), steps: enrichedSteps }
    } catch {
      return null
    }
  },

  async getCoursesForTechnology(technologyId: string, limit = 4): Promise<Course[]> {
    try {
      const db = createAnonClient()
      const { data: entities } = await db
        .from("course_entities")
        .select("course_id")
        .eq("entity_type", "technology")
        .eq("entity_id", technologyId)
        .in("relationship_type", ["TEACHES", "COVERS"])
        .limit(limit)

      const ids = ((entities ?? []) as { course_id: string }[]).map((e) => e.course_id)
      if (!ids.length) return []

      const { data } = await db
        .from("courses")
        .select("id,slug,title,subtitle,short_description,difficulty,estimated_hours,thumbnail_url,status,is_demo,enrollment_count,price,price_currency")
        .in("id", ids)
        .eq("status", "published")
        .eq("is_demo", false)

      return (data ?? []) as Course[]
    } catch {
      return []
    }
  },

  async getLearningPathsForTechnology(technologyId: string, limit = 2): Promise<LearningPath[]> {
    try {
      const db = createAnonClient()
      // Find courses that teach this technology
      const { data: entities } = await db
        .from("course_entities")
        .select("course_id")
        .eq("entity_type", "technology")
        .eq("entity_id", technologyId)
        .in("relationship_type", ["TEACHES", "COVERS"])

      const courseIds = ((entities ?? []) as { course_id: string }[]).map((e) => e.course_id)
      if (!courseIds.length) return []

      // Find paths that include any of those courses
      const { data: steps } = await db
        .from("learning_path_courses")
        .select("learning_path_id")
        .in("course_id", courseIds)

      const pathIds = [...new Set(((steps ?? []) as { learning_path_id: string }[]).map((s) => s.learning_path_id))]
      if (!pathIds.length) return []

      const { data } = await db
        .from("learning_paths")
        .select("id,slug,title,short_description,difficulty,estimated_hours,status,is_demo,featured")
        .in("id", pathIds)
        .eq("status", "published")
        .eq("is_demo", false)
        .limit(limit)

      return (data ?? []) as LearningPath[]
    } catch {
      return []
    }
  },

  // Admin methods — use createAdminClient (bypasses RLS)
  async adminGetCourses(opts: { page?: number; perPage?: number; status?: string } = {}): Promise<PaginatedResponse<Course>> {
    const { page = 1, perPage = 50, status } = opts
    const from = (page - 1) * perPage
    const to = from + perPage - 1

    try {
      const db = createAdminClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q: any = db
        .from("courses")
        .select("*", { count: "exact" })
        .order("updated_at", { ascending: false })
        .range(from, to)

      if (status) q = q.eq("status", status)

      const { data, count, error } = await q
      if (error) return { data: [], total: 0, page, per_page: perPage, total_pages: 0 }

      return {
        data: (data ?? []) as Course[],
        total: count ?? 0,
        page,
        per_page: perPage,
        total_pages: Math.ceil((count ?? 0) / perPage),
      }
    } catch {
      return { data: [], total: 0, page, per_page: perPage, total_pages: 0 }
    }
  },

  async adminGetCourseById(id: string): Promise<(Course & { modules: (CourseModule & { lessons: Lesson[] })[] }) | null> {
    try {
      const db = createAdminClient()
      const { data: course, error } = await db
        .from("courses")
        .select("*")
        .eq("id", id)
        .single()

      if (error || !course) return null

      const { data: modules } = await db
        .from("course_modules")
        .select("*")
        .eq("course_id", id)
        .order("sort_order")

      const moduleList = (modules ?? []) as CourseModule[]

      const modulesWithLessons = await Promise.all(
        moduleList.map(async (mod) => {
          const { data: lessons } = await db
            .from("lessons")
            .select("*")
            .eq("module_id", mod.id)
            .order("sort_order")

          return { ...mod, lessons: (lessons ?? []) as Lesson[] }
        })
      )

      return { ...(course as Course), modules: modulesWithLessons }
    } catch {
      return null
    }
  },

  async adminGetLearningPaths(opts: { status?: string } = {}): Promise<LearningPath[]> {
    try {
      const db = createAdminClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q: any = db
        .from("learning_paths")
        .select("*")
        .order("updated_at", { ascending: false })

      if (opts.status) q = q.eq("status", opts.status)

      const { data, error } = await q
      if (error || !data) return []
      return data as LearningPath[]
    } catch {
      return []
    }
  },

  async adminGetLearningPathWithSteps(id: string): Promise<(LearningPath & { steps: (LearningPathCourse & { course: Course | null })[] }) | null> {
    try {
      const db = createAdminClient()
      const { data: path, error } = await db
        .from("learning_paths")
        .select("*")
        .eq("id", id)
        .single()

      if (error || !path) return null

      const { data: steps } = await db
        .from("learning_path_courses")
        .select("*")
        .eq("learning_path_id", id)
        .order("sort_order")

      const stepList = (steps ?? []) as LearningPathCourse[]
      const courseIds = stepList.map((s) => s.course_id)
      const courses: Record<string, Course> = {}

      if (courseIds.length > 0) {
        const { data: courseData } = await db
          .from("courses")
          .select("id,slug,title,subtitle,difficulty,status,is_demo")
          .in("id", courseIds)

        for (const c of (courseData ?? [])) {
          courses[(c as Course).id] = c as Course
        }
      }

      return {
        ...(path as LearningPath),
        steps: stepList.map((s) => ({ ...s, course: courses[s.course_id] ?? null })),
      }
    } catch {
      return null
    }
  },
}
