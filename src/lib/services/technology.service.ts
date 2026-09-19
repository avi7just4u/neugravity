import { createServiceClient } from "@/lib/supabase/server"
import type { Technology, PaginatedResponse } from "@/types"

export const TechnologyService = {
  async getTechnologies(opts: {
    page?: number
    perPage?: number
    type?: string
    featured?: boolean
    search?: string
  } = {}): Promise<PaginatedResponse<Technology>> {
    const { page = 1, perPage = 20, type, featured, search } = opts
    const from = (page - 1) * perPage
    const to = from + perPage - 1

    try {
      const supabase = await createServiceClient()
      let query = supabase
        .from("technologies")
        .select("*", { count: "exact" })
        .eq("published", true)
        .order("popularity_score", { ascending: false })
        .range(from, to)

      if (type) query = query.eq("type", type)
      if (featured !== undefined) query = query.eq("featured", featured)
      if (search) query = query.ilike("name", `%${search}%`)

      const { data, count, error } = await query
      if (error) return { data: [], total: 0, page, per_page: perPage, total_pages: 0 }

      return {
        data: (data ?? []) as Technology[],
        total: count ?? 0,
        page,
        per_page: perPage,
        total_pages: Math.ceil((count ?? 0) / perPage),
      }
    } catch {
      return { data: [], total: 0, page, per_page: perPage, total_pages: 0 }
    }
  },

  async getTechnologyBySlug(slug: string): Promise<Technology | null> {
    try {
      const supabase = await createServiceClient()
      const { data, error } = await supabase
        .from("technologies")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .single()

      if (error || !data) return null
      return data as Technology
    } catch {
      return null
    }
  },

  async getRelatedTechnologies(technologyId: string, limit = 6): Promise<Technology[]> {
    try {
      const supabase = await createServiceClient()
      const { data: rels } = await supabase
        .from("technology_relationships")
        .select("to_technology_id")
        .eq("from_technology_id", technologyId)
        .limit(limit)

      if (!rels || rels.length === 0) return []

      const ids = rels.map((r) => r.to_technology_id)
      const { data, error } = await supabase
        .from("technologies")
        .select("*")
        .in("id", ids)
        .eq("published", true)

      if (error || !data) return []
      return data as Technology[]
    } catch {
      return []
    }
  },

  async getTrendingTechnologies(limit = 6): Promise<Technology[]> {
    try {
      const supabase = await createServiceClient()
      const { data, error } = await supabase
        .from("technologies")
        .select("*")
        .eq("published", true)
        .order("trending_score", { ascending: false })
        .limit(limit)

      if (error || !data) return []
      return data as Technology[]
    } catch {
      return []
    }
  },

  async getFeaturedTechnologies(limit = 6): Promise<Technology[]> {
    try {
      const supabase = await createServiceClient()
      const { data, error } = await supabase
        .from("technologies")
        .select("*")
        .eq("published", true)
        .eq("featured", true)
        .order("popularity_score", { ascending: false })
        .limit(limit)

      if (error || !data) return []
      return data as Technology[]
    } catch {
      return []
    }
  },
}
