import { createServiceClient } from "@/lib/supabase/server"
import type { Article, NewsItem, PaginatedResponse } from "@/types"

export const ContentService = {
  async getPublishedArticles(opts: {
    page?: number
    perPage?: number
    category?: string
    tag?: string
    featured?: boolean
  } = {}): Promise<PaginatedResponse<Article>> {
    const { page = 1, perPage = 20, category, featured } = opts
    const from = (page - 1) * perPage
    const to = from + perPage - 1

    try {
      const supabase = await createServiceClient()
      let query = supabase
        .from("articles")
        .select("id,slug,title,subtitle,excerpt,hero_image_url,author_id,category_id,status,published_at,reading_time_minutes,featured,view_count,share_count,created_at,updated_at", { count: "exact" })
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .range(from, to)

      if (category) query = query.eq("category_id", category)
      if (featured !== undefined) query = query.eq("featured", featured)

      const { data, count, error } = await query
      if (error) {
        console.error("[ContentService.getPublishedArticles]", error.message)
        return { data: [], total: 0, page, per_page: perPage, total_pages: 0 }
      }

      return {
        data: (data ?? []) as Article[],
        total: count ?? 0,
        page,
        per_page: perPage,
        total_pages: Math.ceil((count ?? 0) / perPage),
      }
    } catch (e) {
      console.error("[ContentService.getPublishedArticles]", e)
      return { data: [], total: 0, page, per_page: perPage, total_pages: 0 }
    }
  },

  async getArticleBySlug(slug: string): Promise<Article | null> {
    try {
      const supabase = await createServiceClient()
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single()

      if (error || !data) return null
      return data as Article
    } catch {
      return null
    }
  },

  async getPublishedNews(opts: {
    page?: number
    perPage?: number
    category?: string
    importance?: number
    featured?: boolean
  } = {}): Promise<PaginatedResponse<NewsItem>> {
    const { page = 1, perPage = 20, category, importance, featured } = opts
    const from = (page - 1) * perPage
    const to = from + perPage - 1

    try {
      const supabase = await createServiceClient()
      let query = supabase
        .from("news_items")
        .select("id,slug,headline,summary,hero_image_url,author_id,cluster_id,category_id,status,importance,published_at,view_count,featured,created_at,updated_at", { count: "exact" })
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .range(from, to)

      if (category) query = query.eq("category_id", category)
      if (importance !== undefined) query = query.gte("importance", importance)
      if (featured !== undefined) query = query.eq("featured", featured)

      const { data, count, error } = await query
      if (error) return { data: [], total: 0, page, per_page: perPage, total_pages: 0 }

      return {
        data: (data ?? []) as NewsItem[],
        total: count ?? 0,
        page,
        per_page: perPage,
        total_pages: Math.ceil((count ?? 0) / perPage),
      }
    } catch {
      return { data: [], total: 0, page, per_page: perPage, total_pages: 0 }
    }
  },

  async getNewsBySlug(slug: string): Promise<NewsItem | null> {
    try {
      const supabase = await createServiceClient()
      const { data, error } = await supabase
        .from("news_items")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single()

      if (error || !data) return null
      return data as NewsItem
    } catch {
      return null
    }
  },

  async getFeaturedContent(): Promise<{ articles: Article[]; news: NewsItem[] }> {
    try {
      const supabase = await createServiceClient()
      const [articlesResult, newsResult] = await Promise.all([
        supabase
          .from("articles")
          .select("id,slug,title,excerpt,hero_image_url,author_id,category_id,published_at,reading_time_minutes,featured,view_count")
          .eq("status", "published")
          .eq("featured", true)
          .order("published_at", { ascending: false })
          .limit(6),
        supabase
          .from("news_items")
          .select("id,slug,headline,summary,hero_image_url,author_id,category_id,published_at,importance,featured,view_count")
          .eq("status", "published")
          .eq("featured", true)
          .order("published_at", { ascending: false })
          .limit(6),
      ])

      return {
        articles: (articlesResult.data ?? []) as Article[],
        news: (newsResult.data ?? []) as NewsItem[],
      }
    } catch {
      return { articles: [], news: [] }
    }
  },

  async incrementViewCount(
    type: "article" | "news_item" | "tool" | "comparison" | "course",
    id: string
  ): Promise<void> {
    const tableMap: Record<string, string> = {
      article: "articles",
      news_item: "news_items",
      tool: "tools",
      comparison: "comparisons",
      course: "courses",
    }
    const table = tableMap[type]
    if (!table) return

    try {
      const supabase = await createServiceClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).rpc("increment_view_count", { table_name: table, row_id: id })
    } catch {
      // Fire-and-forget — never surface view count errors
    }
  },
}
