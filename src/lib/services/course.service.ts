import { createServiceClient } from "@/lib/supabase/server"
import type { Course, PaginatedResponse } from "@/types"

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
      const supabase = await createServiceClient()
      let query = supabase
        .from("courses")
        .select("*", { count: "exact" })
        .eq("status", "published")
        .order("enrollment_count", { ascending: false })
        .range(from, to)

      if (category) query = query.eq("category_id", category)
      if (difficulty) query = query.eq("difficulty", difficulty)
      if (featured !== undefined) query = query.eq("featured", featured)

      const { data, count, error } = await query
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
      const supabase = await createServiceClient()
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single()

      if (error || !data) return null
      return data as Course
    } catch {
      return null
    }
  },

  async getFeaturedCourses(limit = 6): Promise<Course[]> {
    try {
      const supabase = await createServiceClient()
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("status", "published")
        .eq("featured", true)
        .order("enrollment_count", { ascending: false })
        .limit(limit)

      if (error || !data) return []
      return data as Course[]
    } catch {
      return []
    }
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getLearningPaths(opts: { featured?: boolean } = {}): Promise<any[]> {
    try {
      const supabase = await createServiceClient()
      let query = supabase
        .from("learning_paths")
        .select("*")
        .eq("published", true)
        .order("title", { ascending: true })

      if (opts.featured !== undefined) query = query.eq("featured", opts.featured)

      const { data, error } = await query
      if (error || !data) return []
      return data
    } catch {
      return []
    }
  },
}
