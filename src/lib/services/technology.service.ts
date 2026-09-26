import { createAnonClient } from "@/lib/supabase/server"
import { ENV } from "@/lib/config/environment"
import type {
  Technology,
  PaginatedResponse,
  TechnologyWithRelations,
  TechnologyExplanation,
  ExplanationType,
  NewsItem,
  Tool,
  Company,
  Comparison,
} from "@/types"

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
      const supabase = createAnonClient()
      let query = supabase
        .from("technologies")
        .select("id,slug,name,tagline,description,type,icon_url,logo_url,status,difficulty,popularity_score,trending_score,featured,verified,created_at,updated_at", { count: "exact" })
        .eq("published", true)
        .order("popularity_score", { ascending: false })
        .range(from, to)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (ENV.filterDemoData) query = (query as any).eq("is_demo", false)
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
      const supabase = createAnonClient()
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
      const supabase = createAnonClient()
      // Single join query — avoids two round-trips (N+1 pattern)
      const { data, error } = await supabase
        .from("technology_relationships")
        .select("technologies!to_technology_id(id,slug,name,tagline,type,icon_url,popularity_score,trending_score,featured,published)")
        .eq("from_technology_id", technologyId)
        .limit(limit)

      if (error || !data) return []

      return data
        .map((r: Record<string, unknown>) => r.technologies)
        .filter((t): t is Technology => !!t && (t as Technology).published === true)
    } catch (e) {
      console.error("[TechnologyService.getRelatedTechnologies]", e)
      return []
    }
  },

  async getTrendingTechnologies(limit = 6): Promise<Technology[]> {
    try {
      const supabase = createAnonClient()
      const { data, error } = await supabase
        .from("technologies")
        .select("id,slug,name,tagline,description,type,icon_url,logo_url,status,difficulty,popularity_score,trending_score,featured,verified,created_at,updated_at")
        .eq("published", true)
        .order("trending_score", { ascending: false })
        .limit(limit)

      if (error || !data) {
        console.error("[TechnologyService.getTrendingTechnologies]", error?.message)
        return []
      }
      return data as Technology[]
    } catch (e) {
      console.error("[TechnologyService.getTrendingTechnologies]", e)
      return []
    }
  },

  async getTechnologyWithRelations(slug: string): Promise<TechnologyWithRelations | null> {
    try {
      const supabase = createAnonClient()
      const { data: tech, error } = await supabase
        .from("technologies")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .single()

      if (error || !tech) return null

      const t = tech as Technology & { id: string }

      // Parallel fetch all related data
      const [explanationsResult, prereqRels, nextRels, toolRels, companyRels, newsEntities, comparisonEntities, relatedTechRels] =
        await Promise.all([
          // All published explanations
          supabase
            .from("technology_explanations")
            .select("*")
            .eq("technology_id", t.id)
            .eq("status", "published"),

          // Prerequisites: technology DEPENDS_ON → technology
          supabase
            .from("entity_relationships")
            .select("target_entity_id")
            .eq("source_entity_type", "technology")
            .eq("source_entity_id", t.id)
            .eq("target_entity_type", "technology")
            .eq("relationship_type", "DEPENDS_ON")
            .eq("verified", true),

          // Next concepts: technologies that DEPEND_ON this one
          supabase
            .from("entity_relationships")
            .select("source_entity_id")
            .eq("source_entity_type", "technology")
            .eq("target_entity_type", "technology")
            .eq("target_entity_id", t.id)
            .eq("relationship_type", "DEPENDS_ON")
            .eq("verified", true)
            .limit(4),

          // Related tools
          supabase
            .from("entity_relationships")
            .select("target_entity_id")
            .eq("source_entity_type", "technology")
            .eq("source_entity_id", t.id)
            .eq("target_entity_type", "tool")
            .in("relationship_type", ["USES", "INTEGRATES_WITH", "RELATED_TO"])
            .eq("verified", true)
            .limit(8),

          // Related companies
          supabase
            .from("entity_relationships")
            .select("target_entity_id")
            .eq("source_entity_type", "technology")
            .eq("source_entity_id", t.id)
            .eq("target_entity_type", "company")
            .in("relationship_type", ["BUILT_BY", "MAINTAINED_BY", "CREATED_BY"])
            .eq("verified", true)
            .limit(6),

          // Related news via news_entities
          supabase
            .from("news_entities")
            .select("news_item_id")
            .eq("entity_type", "technology")
            .eq("entity_id", t.id)
            .limit(5),

          // Related comparisons via comparison_entities
          supabase
            .from("comparison_entities")
            .select("comparison_id")
            .eq("entity_type", "technology")
            .eq("entity_id", t.id)
            .limit(4),

          // Related technologies (generic RELATED_TO)
          supabase
            .from("entity_relationships")
            .select("target_entity_id")
            .eq("source_entity_type", "technology")
            .eq("source_entity_id", t.id)
            .eq("target_entity_type", "technology")
            .in("relationship_type", ["RELATED_TO", "COMPETES_WITH", "ALTERNATIVE_TO"])
            .eq("verified", true)
            .limit(6),
        ])

      // Map explanations
      const explanationMap: Partial<Record<ExplanationType, TechnologyExplanation>> = {}
      for (const row of (explanationsResult.data ?? [])) {
        const exp = row as TechnologyExplanation
        explanationMap[exp.explanation_type] = exp
      }

      // Fetch prerequisite technologies
      const prereqIds = (prereqRels.data ?? []).map((r: Record<string, string>) => r.target_entity_id)
      const prerequisites: Technology[] = prereqIds.length
        ? await supabase.from("technologies").select("id,slug,name,tagline,type,icon_url,difficulty,status,published").in("id", prereqIds).eq("published", true)
            .then(({ data }) => (data ?? []) as Technology[])
        : []

      // Fetch next-concept technologies
      const nextIds = (nextRels.data ?? []).map((r: Record<string, string>) => r.source_entity_id)
      const next_concepts: Technology[] = nextIds.length
        ? await supabase.from("technologies").select("id,slug,name,tagline,type,icon_url,difficulty,status,published").in("id", nextIds).eq("published", true)
            .then(({ data }) => (data ?? []) as Technology[])
        : []

      // Fetch tools
      const toolIds = (toolRels.data ?? []).map((r: Record<string, string>) => r.target_entity_id)
      const related_tools: Tool[] = toolIds.length
        ? await supabase.from("tools").select("id,slug,name,tagline,icon_url,tool_type,pricing_model,has_free_tier,published").in("id", toolIds).eq("published", true)
            .then(({ data }) => (data ?? []) as Tool[])
        : []

      // Fetch companies
      const companyIds = (companyRels.data ?? []).map((r: Record<string, string>) => r.target_entity_id)
      const related_companies: Company[] = companyIds.length
        ? await supabase.from("companies").select("id,slug,name,description,logo_url,company_type,published").in("id", companyIds).eq("published", true)
            .then(({ data }) => (data ?? []) as Company[])
        : []

      // Fetch news
      const newsIds = (newsEntities.data ?? []).map((r: Record<string, string>) => r.news_item_id)
      const related_news: NewsItem[] = newsIds.length
        ? await supabase.from("news_items").select("id,slug,headline,summary,published_at,hero_image_url").in("id", newsIds).eq("status", "published").order("published_at", { ascending: false }).limit(5)
            .then(({ data }) => (data ?? []) as NewsItem[])
        : []

      // Fetch comparisons
      const compIds = (comparisonEntities.data ?? []).map((r: Record<string, string>) => r.comparison_id)
      const related_comparisons: Comparison[] = compIds.length
        ? await supabase.from("comparisons").select("id,slug,title,description,status").in("id", compIds).eq("status", "published")
            .then(({ data }) => (data ?? []) as Comparison[])
        : []

      // Fetch related technologies
      const relTechIds = (relatedTechRels.data ?? []).map((r: Record<string, string>) => r.target_entity_id)
        .filter((id: string) => !prereqIds.includes(id))

      const relatedFromGraph: Technology[] = relTechIds.length
        ? await supabase.from("technologies").select("id,slug,name,tagline,type,icon_url,difficulty,status,published").in("id", relTechIds).eq("published", true)
            .then(({ data }) => (data ?? []) as Technology[])
        : []

      return {
        ...t,
        explanations: explanationMap,
        prerequisites,
        next_concepts,
        related_tools,
        related_companies,
        related_news,
        related_comparisons,
        related_technologies: relatedFromGraph,
      } as TechnologyWithRelations
    } catch (e) {
      console.error("[TechnologyService.getTechnologyWithRelations]", e)
      return null
    }
  },

  async getRelatedNews(technologyId: string, limit = 5): Promise<NewsItem[]> {
    try {
      const supabase = createAnonClient()
      const { data: entities } = await supabase
        .from("news_entities")
        .select("news_item_id")
        .eq("entity_type", "technology")
        .eq("entity_id", technologyId)
        .limit(limit)

      const ids = (entities ?? []).map((r: Record<string, string>) => r.news_item_id)
      if (!ids.length) return []

      const { data } = await supabase
        .from("news_items")
        .select("id,slug,headline,summary,published_at,hero_image_url")
        .in("id", ids)
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(limit)

      return (data ?? []) as NewsItem[]
    } catch {
      return []
    }
  },

  async getRelatedTools(technologyId: string, limit = 8): Promise<Tool[]> {
    try {
      const supabase = createAnonClient()
      const { data: rels } = await supabase
        .from("entity_relationships")
        .select("target_entity_id")
        .eq("source_entity_type", "technology")
        .eq("source_entity_id", technologyId)
        .eq("target_entity_type", "tool")
        .in("relationship_type", ["USES", "INTEGRATES_WITH", "RELATED_TO"])
        .eq("verified", true)
        .limit(limit)

      const ids = (rels ?? []).map((r: Record<string, string>) => r.target_entity_id)
      if (!ids.length) return []

      const { data } = await supabase
        .from("tools")
        .select("id,slug,name,tagline,icon_url,tool_type,pricing_model,has_free_tier,published")
        .in("id", ids)
        .eq("published", true)

      return (data ?? []) as Tool[]
    } catch {
      return []
    }
  },

  async getRelatedCompanies(technologyId: string, limit = 6): Promise<Company[]> {
    try {
      const supabase = createAnonClient()
      const { data: rels } = await supabase
        .from("entity_relationships")
        .select("target_entity_id")
        .eq("source_entity_type", "technology")
        .eq("source_entity_id", technologyId)
        .eq("target_entity_type", "company")
        .in("relationship_type", ["BUILT_BY", "MAINTAINED_BY", "CREATED_BY"])
        .eq("verified", true)
        .limit(limit)

      const ids = (rels ?? []).map((r: Record<string, string>) => r.target_entity_id)
      if (!ids.length) return []

      const { data } = await supabase
        .from("companies")
        .select("id,slug,name,description,logo_url,company_type,published")
        .in("id", ids)
        .eq("published", true)

      return (data ?? []) as Company[]
    } catch {
      return []
    }
  },

  async getPrerequisites(technologyId: string): Promise<Technology[]> {
    try {
      const supabase = createAnonClient()
      const { data: rels } = await supabase
        .from("entity_relationships")
        .select("target_entity_id")
        .eq("source_entity_type", "technology")
        .eq("source_entity_id", technologyId)
        .eq("target_entity_type", "technology")
        .eq("relationship_type", "DEPENDS_ON")
        .eq("verified", true)

      const ids = (rels ?? []).map((r: Record<string, string>) => r.target_entity_id)
      if (!ids.length) return []

      const { data } = await supabase
        .from("technologies")
        .select("id,slug,name,tagline,type,icon_url,difficulty,status,published")
        .in("id", ids)
        .eq("published", true)

      return (data ?? []) as Technology[]
    } catch {
      return []
    }
  },

  async getNextConcepts(technologyId: string): Promise<Technology[]> {
    try {
      const supabase = createAnonClient()
      const { data: rels } = await supabase
        .from("entity_relationships")
        .select("source_entity_id")
        .eq("source_entity_type", "technology")
        .eq("target_entity_type", "technology")
        .eq("target_entity_id", technologyId)
        .eq("relationship_type", "DEPENDS_ON")
        .eq("verified", true)
        .limit(4)

      const ids = (rels ?? []).map((r: Record<string, string>) => r.source_entity_id)
      if (!ids.length) return []

      const { data } = await supabase
        .from("technologies")
        .select("id,slug,name,tagline,type,icon_url,difficulty,status,published")
        .in("id", ids)
        .eq("published", true)

      return (data ?? []) as Technology[]
    } catch {
      return []
    }
  },

  async getRelatedComparisons(technologyId: string, limit = 4): Promise<Comparison[]> {
    try {
      const supabase = createAnonClient()
      const { data: entities } = await supabase
        .from("comparison_entities")
        .select("comparison_id")
        .eq("entity_type", "technology")
        .eq("entity_id", technologyId)
        .limit(limit)

      const ids = (entities ?? []).map((r: Record<string, string>) => r.comparison_id)
      if (!ids.length) return []

      const { data } = await supabase
        .from("comparisons")
        .select("id,slug,title,description,status")
        .in("id", ids)
        .eq("status", "published")

      return (data ?? []) as Comparison[]
    } catch {
      return []
    }
  },

  async getFeaturedTechnologies(limit = 6): Promise<Technology[]> {
    try {
      const supabase = createAnonClient()
      const { data, error } = await supabase
        .from("technologies")
        .select("id,slug,name,tagline,description,type,icon_url,logo_url,status,difficulty,popularity_score,trending_score,featured,verified,created_at,updated_at")
        .eq("published", true)
        .eq("featured", true)
        .order("popularity_score", { ascending: false })
        .limit(limit)

      if (error || !data) {
        console.error("[TechnologyService.getFeaturedTechnologies]", error?.message)
        return []
      }
      return data as Technology[]
    } catch (e) {
      console.error("[TechnologyService.getFeaturedTechnologies]", e)
      return []
    }
  },
}
