import { createServiceClient } from "@/lib/supabase/server"
import { parseSearchQuery } from "@/lib/utils"
import type { SearchResult, SearchResponse } from "@/types"

export interface ISearchService {
  search(query: string, opts?: { types?: string[]; limit?: number; page?: number }): Promise<SearchResponse>
  autocomplete(query: string, limit?: number): Promise<SearchResult[]>
}

class PostgresSearchService implements ISearchService {
  async search(
    query: string,
    opts?: { types?: string[]; limit?: number; page?: number }
  ): Promise<SearchResponse> {
    const start = Date.now()
    const cleaned = parseSearchQuery(query)
    if (!cleaned) return { results: [], total: 0, query, took_ms: 0, grouped: {} }

    const supabase = await createServiceClient()
    const limit = opts?.limit ?? 20
    const results: SearchResult[] = []

    const wantType = (t: string) => !opts?.types || opts.types.includes(t)

    if (wantType("technology")) {
      const { data } = await supabase
        .from("technologies")
        .select("id, name, slug, description, type, icon_url")
        .eq("published", true)
        .ilike("name", `%${cleaned}%`)
        .limit(5)

      if (data) {
        results.push(
          ...data.map((t) => ({
            id: t.id,
            type: "technology" as const,
            title: t.name,
            description: t.description,
            slug: t.slug,
            url: `/tech/${t.slug}`,
            icon_url: t.icon_url,
            metadata: { tech_type: t.type },
          }))
        )
      }
    }

    if (wantType("tool")) {
      const { data } = await supabase
        .from("tools")
        .select("id, name, slug, description, tagline, icon_url")
        .eq("published", true)
        .ilike("name", `%${cleaned}%`)
        .limit(5)

      if (data) {
        results.push(
          ...data.map((t) => ({
            id: t.id,
            type: "tool" as const,
            title: t.name,
            description: t.tagline ?? t.description,
            slug: t.slug,
            url: `/tools/${t.slug}`,
            icon_url: t.icon_url,
          }))
        )
      }
    }

    if (wantType("company")) {
      const { data } = await supabase
        .from("companies")
        .select("id, name, slug, description, logo_url")
        .eq("published", true)
        .ilike("name", `%${cleaned}%`)
        .limit(3)

      if (data) {
        results.push(
          ...data.map((c) => ({
            id: c.id,
            type: "company" as const,
            title: c.name,
            description: c.description,
            slug: c.slug,
            url: `/companies/${c.slug}`,
            icon_url: c.logo_url,
          }))
        )
      }
    }

    if (wantType("article")) {
      const { data } = await supabase
        .from("articles")
        .select("id, title, slug, excerpt")
        .eq("status", "published")
        .ilike("title", `%${cleaned}%`)
        .limit(5)

      if (data) {
        results.push(
          ...data.map((a) => ({
            id: a.id,
            type: "article" as const,
            title: a.title,
            description: a.excerpt,
            slug: a.slug,
            url: `/articles/${a.slug}`,
          }))
        )
      }
    }

    if (wantType("news")) {
      const { data } = await supabase
        .from("news_items")
        .select("id, headline, slug, summary")
        .eq("status", "published")
        .ilike("headline", `%${cleaned}%`)
        .limit(5)

      if (data) {
        results.push(
          ...data.map((n) => ({
            id: n.id,
            type: "news" as const,
            title: n.headline,
            description: n.summary,
            slug: n.slug,
            url: `/news/${n.slug}`,
          }))
        )
      }
    }

    if (wantType("course")) {
      const { data } = await supabase
        .from("courses")
        .select("id, title, slug, description")
        .eq("status", "published")
        .ilike("title", `%${cleaned}%`)
        .limit(3)

      if (data) {
        results.push(
          ...data.map((c) => ({
            id: c.id,
            type: "course" as const,
            title: c.title,
            description: c.description,
            slug: c.slug,
            url: `/courses/${c.slug}`,
          }))
        )
      }
    }

    const grouped: Record<string, SearchResult[]> = {}
    for (const r of results) {
      if (!grouped[r.type]) grouped[r.type] = []
      grouped[r.type].push(r)
    }

    return {
      results: results.slice(0, limit),
      total: results.length,
      query,
      took_ms: Date.now() - start,
      grouped,
    }
  }

  async autocomplete(query: string, limit = 8): Promise<SearchResult[]> {
    const { results } = await this.search(query, { limit })
    return results
  }
}

export const SearchService: ISearchService = new PostgresSearchService()
