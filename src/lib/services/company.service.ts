import { createAnonClient } from "@/lib/supabase/server"
import { ENV } from "@/lib/config/environment"
import type { Company, PaginatedResponse } from "@/types"

export const CompanyService = {
  async getCompanies(opts: {
    page?: number
    perPage?: number
    featured?: boolean
    search?: string
  } = {}): Promise<PaginatedResponse<Company>> {
    const { page = 1, perPage = 20, featured, search } = opts
    const from = (page - 1) * perPage
    const to = from + perPage - 1

    try {
      const supabase = createAnonClient()
      let query = supabase
        .from("companies")
        .select("*", { count: "exact" })
        .eq("published", true)
        .order("name", { ascending: true })
        .range(from, to)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (ENV.filterDemoData) query = (query as any).eq("is_demo", false)
      if (featured !== undefined) query = query.eq("featured", featured)
      if (search) query = query.ilike("name", `%${search}%`)

      const { data, count, error } = await query
      if (error) return { data: [], total: 0, page, per_page: perPage, total_pages: 0 }

      return {
        data: (data ?? []) as Company[],
        total: count ?? 0,
        page,
        per_page: perPage,
        total_pages: Math.ceil((count ?? 0) / perPage),
      }
    } catch {
      return { data: [], total: 0, page, per_page: perPage, total_pages: 0 }
    }
  },

  async getCompanyBySlug(slug: string): Promise<Company | null> {
    try {
      const supabase = createAnonClient()
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .single()

      if (error || !data) return null
      return data as Company
    } catch {
      return null
    }
  },

  async getFeaturedCompanies(limit = 8): Promise<Company[]> {
    try {
      const supabase = createAnonClient()
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("published", true)
        .eq("featured", true)
        .order("name", { ascending: true })
        .limit(limit)

      if (error || !data) return []
      return data as Company[]
    } catch {
      return []
    }
  },
}
