import { createServiceClient } from "@/lib/supabase/server"
import { ENV } from "@/lib/config/environment"
import type { Comparison, PaginatedResponse } from "@/types"

export const ComparisonService = {
  async getComparisons(opts: {
    page?: number
    perPage?: number
    featured?: boolean
  } = {}): Promise<PaginatedResponse<Comparison>> {
    const { page = 1, perPage = 20, featured } = opts
    const from = (page - 1) * perPage
    const to = from + perPage - 1

    try {
      const supabase = await createServiceClient()
      let query = supabase
        .from("comparisons")
        .select("*", { count: "exact" })
        .eq("status", "published")
        .order("view_count", { ascending: false })
        .range(from, to)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (ENV.filterDemoData) query = (query as any).eq("is_demo", false)
      if (featured !== undefined) query = query.eq("featured", featured)

      const { data, count, error } = await query
      if (error) return { data: [], total: 0, page, per_page: perPage, total_pages: 0 }

      return {
        data: (data ?? []) as Comparison[],
        total: count ?? 0,
        page,
        per_page: perPage,
        total_pages: Math.ceil((count ?? 0) / perPage),
      }
    } catch {
      return { data: [], total: 0, page, per_page: perPage, total_pages: 0 }
    }
  },

  async getComparisonBySlug(slug: string): Promise<Comparison | null> {
    try {
      const supabase = await createServiceClient()
      const { data, error } = await supabase
        .from("comparisons")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single()

      if (error || !data) return null
      return data as Comparison
    } catch {
      return null
    }
  },

  async getPopularComparisons(limit = 5): Promise<Comparison[]> {
    try {
      const supabase = await createServiceClient()
      let q = supabase
        .from("comparisons")
        .select("*")
        .eq("status", "published")
        .order("view_count", { ascending: false })
        .limit(limit)
      if (ENV.filterDemoData) q = (q as any).eq("is_demo", false)
      const { data, error } = await q
      if (error || !data) return []
      return data as Comparison[]
    } catch {
      return []
    }
  },
}
