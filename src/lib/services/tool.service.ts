import { createServiceClient } from "@/lib/supabase/server"
import type { Tool, PaginatedResponse } from "@/types"

export const ToolService = {
  async getTools(opts: {
    page?: number
    perPage?: number
    category?: string
    pricingModel?: string
    featured?: boolean
    search?: string
  } = {}): Promise<PaginatedResponse<Tool>> {
    const { page = 1, perPage = 20, category, pricingModel, featured, search } = opts
    const from = (page - 1) * perPage
    const to = from + perPage - 1

    try {
      const supabase = await createServiceClient()
      let query = supabase
        .from("tools")
        .select("*", { count: "exact" })
        .eq("published", true)
        .order("popularity_score", { ascending: false })
        .range(from, to)

      if (category) query = query.eq("category_id", category)
      if (pricingModel) query = query.eq("pricing_model", pricingModel)
      if (featured !== undefined) query = query.eq("featured", featured)
      if (search) query = query.ilike("name", `%${search}%`)

      const { data, count, error } = await query
      if (error) return { data: [], total: 0, page, per_page: perPage, total_pages: 0 }

      return {
        data: (data ?? []) as Tool[],
        total: count ?? 0,
        page,
        per_page: perPage,
        total_pages: Math.ceil((count ?? 0) / perPage),
      }
    } catch {
      return { data: [], total: 0, page, per_page: perPage, total_pages: 0 }
    }
  },

  async getToolBySlug(slug: string): Promise<Tool | null> {
    try {
      const supabase = await createServiceClient()
      const { data, error } = await supabase
        .from("tools")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .single()

      if (error || !data) return null
      return data as Tool
    } catch {
      return null
    }
  },

  async getAlternativeTools(toolId: string, limit = 6): Promise<Tool[]> {
    try {
      const supabase = await createServiceClient()

      // Get category of current tool
      const { data: tool } = await supabase
        .from("tools")
        .select("category_id")
        .eq("id", toolId)
        .single()

      if (!tool?.category_id) return []

      const { data, error } = await supabase
        .from("tools")
        .select("*")
        .eq("published", true)
        .eq("category_id", tool.category_id)
        .neq("id", toolId)
        .order("popularity_score", { ascending: false })
        .limit(limit)

      if (error || !data) return []
      return data as Tool[]
    } catch {
      return []
    }
  },

  async getFeaturedTools(limit = 6): Promise<Tool[]> {
    try {
      const supabase = await createServiceClient()
      const { data, error } = await supabase
        .from("tools")
        .select("*")
        .eq("published", true)
        .eq("featured", true)
        .order("popularity_score", { ascending: false })
        .limit(limit)

      if (error || !data) return []
      return data as Tool[]
    } catch {
      return []
    }
  },
}
