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
    const wantType = (t: string) => !opts?.types || opts.types.includes(t)

    // Run all entity queries in parallel; use FTS search_vector where available,
    // fall back to trigram ilike for short queries that websearch_to_tsquery rejects.
    const ftsQuery = cleaned
    const likeQuery = `%${cleaned}%`
    const useFts = cleaned.length >= 3

    const [techResult, toolResult, companyResult, articleResult, newsResult, courseResult] =
      await Promise.all([
        wantType("technology")
          ? supabase
              .from("technologies")
              .select("id, name, slug, description, type, icon_url")
              .eq("published", true)
              .order("popularity_score", { ascending: false })
              .limit(5)
              [useFts ? "textSearch" : "ilike"](
                useFts ? "search_vector" : "name",
                useFts ? ftsQuery : likeQuery,
                useFts ? { type: "websearch", config: "english" } : undefined
              )
          : Promise.resolve({ data: null }),

        wantType("tool")
          ? supabase
              .from("tools")
              .select("id, name, slug, tagline, description, icon_url")
              .eq("published", true)
              .order("popularity_score", { ascending: false })
              .limit(5)
              [useFts ? "textSearch" : "ilike"](
                useFts ? "search_vector" : "name",
                useFts ? ftsQuery : likeQuery,
                useFts ? { type: "websearch", config: "english" } : undefined
              )
          : Promise.resolve({ data: null }),

        wantType("company")
          ? supabase
              .from("companies")
              .select("id, name, slug, description, logo_url")
              .eq("published", true)
              .limit(3)
              [useFts ? "textSearch" : "ilike"](
                useFts ? "search_vector" : "name",
                useFts ? ftsQuery : likeQuery,
                useFts ? { type: "websearch", config: "english" } : undefined
              )
          : Promise.resolve({ data: null }),

        wantType("article")
          ? supabase
              .from("articles")
              .select("id, title, slug, excerpt")
              .eq("status", "published")
              .order("published_at", { ascending: false })
              .limit(5)
              [useFts ? "textSearch" : "ilike"](
                useFts ? "search_vector" : "title",
                useFts ? ftsQuery : likeQuery,
                useFts ? { type: "websearch", config: "english" } : undefined
              )
          : Promise.resolve({ data: null }),

        wantType("news")
          ? supabase
              .from("news_items")
              .select("id, headline, slug, summary")
              .eq("status", "published")
              .order("published_at", { ascending: false })
              .limit(5)
              [useFts ? "textSearch" : "ilike"](
                useFts ? "search_vector" : "headline",
                useFts ? ftsQuery : likeQuery,
                useFts ? { type: "websearch", config: "english" } : undefined
              )
          : Promise.resolve({ data: null }),

        wantType("course")
          ? supabase
              .from("courses")
              .select("id, title, slug, description")
              .eq("status", "published")
              .limit(3)
              .ilike("title", likeQuery)
          : Promise.resolve({ data: null }),
      ])

    const results: SearchResult[] = []

    if (techResult.data) {
      results.push(
        ...techResult.data.map((t: Record<string, unknown>) => ({
          id: t.id as string,
          type: "technology" as const,
          title: t.name as string,
          description: (t.description as string) ?? null,
          slug: t.slug as string,
          url: `/tech/${t.slug}`,
          icon_url: (t.icon_url as string) ?? null,
          metadata: { tech_type: t.type },
        }))
      )
    }

    if (toolResult.data) {
      results.push(
        ...toolResult.data.map((t: Record<string, unknown>) => ({
          id: t.id as string,
          type: "tool" as const,
          title: t.name as string,
          description: ((t.tagline ?? t.description) as string) ?? null,
          slug: t.slug as string,
          url: `/tools/${t.slug}`,
          icon_url: (t.icon_url as string) ?? null,
        }))
      )
    }

    if (companyResult.data) {
      results.push(
        ...companyResult.data.map((c: Record<string, unknown>) => ({
          id: c.id as string,
          type: "company" as const,
          title: c.name as string,
          description: (c.description as string) ?? null,
          slug: c.slug as string,
          url: `/companies/${c.slug}`,
          icon_url: (c.logo_url as string) ?? null,
        }))
      )
    }

    if (articleResult.data) {
      results.push(
        ...articleResult.data.map((a: Record<string, unknown>) => ({
          id: a.id as string,
          type: "article" as const,
          title: a.title as string,
          description: (a.excerpt as string) ?? null,
          slug: a.slug as string,
          url: `/articles/${a.slug}`,
        }))
      )
    }

    if (newsResult.data) {
      results.push(
        ...newsResult.data.map((n: Record<string, unknown>) => ({
          id: n.id as string,
          type: "news" as const,
          title: n.headline as string,
          description: (n.summary as string) ?? null,
          slug: n.slug as string,
          url: `/news/${n.slug}`,
        }))
      )
    }

    if (courseResult.data) {
      results.push(
        ...courseResult.data.map((c: Record<string, unknown>) => ({
          id: c.id as string,
          type: "course" as const,
          title: c.title as string,
          description: (c.description as string) ?? null,
          slug: c.slug as string,
          url: `/courses/${c.slug}`,
        }))
      )
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
