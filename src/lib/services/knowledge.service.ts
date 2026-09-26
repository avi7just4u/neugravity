import { createAdminClient, createAnonClient } from "@/lib/supabase/server"
import type {
  EntityRelationship,
  EntitySearchResult,
  RelationshipType,
  Technology,
  Tool,
  Company,
} from "@/types"

export interface CreateRelationshipInput {
  source_entity_type: string
  source_entity_id: string
  target_entity_type: string
  target_entity_id: string
  relationship_type: RelationshipType
  weight?: number
  confidence?: number
  source?: string
  source_url?: string
  notes?: string
  created_by?: string
  created_by_type?: 'editor' | 'system' | 'ai'
}

export const KnowledgeService = {
  async getRelationships(opts: {
    entityType: string
    entityId: string
    verified?: boolean
    limit?: number
  }): Promise<EntityRelationship[]> {
    try {
      const db = createAnonClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q: any = db
        .from("entity_relationships")
        .select("*")
        .eq("source_entity_type", opts.entityType)
        .eq("source_entity_id", opts.entityId)
        .order("weight", { ascending: false })
        .limit(opts.limit ?? 50)

      if (opts.verified !== undefined) q = q.eq("verified", opts.verified)
      const { data } = await q
      return (data ?? []) as EntityRelationship[]
    } catch {
      return []
    }
  },

  async getRelationshipsTo(opts: {
    targetType: string
    targetId: string
    relationshipType?: string
    verified?: boolean
  }): Promise<EntityRelationship[]> {
    try {
      const db = createAnonClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q: any = db
        .from("entity_relationships")
        .select("*")
        .eq("target_entity_type", opts.targetType)
        .eq("target_entity_id", opts.targetId)
        .order("weight", { ascending: false })

      if (opts.relationshipType) q = q.eq("relationship_type", opts.relationshipType)
      if (opts.verified !== undefined) q = q.eq("verified", opts.verified)
      const { data } = await q
      return (data ?? []) as EntityRelationship[]
    } catch {
      return []
    }
  },

  async addRelationship(rel: CreateRelationshipInput): Promise<EntityRelationship | null> {
    try {
      const db = createAdminClient()
      const { data, error } = await db
        .from("entity_relationships")
        .insert({
          source_entity_type: rel.source_entity_type,
          source_entity_id:   rel.source_entity_id,
          target_entity_type: rel.target_entity_type,
          target_entity_id:   rel.target_entity_id,
          relationship_type:  rel.relationship_type,
          weight:             rel.weight ?? 1.0,
          confidence:         rel.confidence ?? 1.0,
          source:             rel.source ?? null,
          source_url:         rel.source_url ?? null,
          notes:              rel.notes ?? null,
          created_by:         rel.created_by ?? null,
          created_by_type:    rel.created_by_type ?? 'editor',
          verified:           rel.created_by_type === 'ai' ? false : true,
        })
        .select()
        .single()

      if (error) return null
      return data as EntityRelationship
    } catch {
      return null
    }
  },

  async removeRelationship(id: string): Promise<void> {
    try {
      const db = createAdminClient()
      await db.from("entity_relationships").delete().eq("id", id)
    } catch {
      // non-critical
    }
  },

  async approveRelationship(id: string): Promise<void> {
    try {
      const db = createAdminClient()
      await db
        .from("entity_relationships")
        .update({ verified: true })
        .eq("id", id)
    } catch {
      // non-critical
    }
  },

  async rejectRelationship(id: string): Promise<void> {
    try {
      const db = createAdminClient()
      await db.from("entity_relationships").delete().eq("id", id)
    } catch {
      // non-critical
    }
  },

  async getPendingAISuggestions(limit = 50): Promise<EntityRelationship[]> {
    try {
      const db = createAdminClient()
      const { data } = await db
        .from("entity_relationships")
        .select("*")
        .eq("created_by_type", "ai")
        .eq("verified", false)
        .order("created_at", { ascending: false })
        .limit(limit)

      return (data ?? []) as EntityRelationship[]
    } catch {
      return []
    }
  },

  async resolveAlias(
    alias: string,
    entityType?: string
  ): Promise<{ entity_type: string; entity_id: string } | null> {
    try {
      const normalized = alias.trim().toLowerCase()
      const db = createAnonClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q: any = db
        .from("entity_aliases")
        .select("entity_type, entity_id")
        .eq("normalized_alias", normalized)
        .limit(1)

      if (entityType) q = q.eq("entity_type", entityType)
      const { data } = await q
      if (!data || data.length === 0) return null
      return { entity_type: data[0].entity_type as string, entity_id: data[0].entity_id as string }
    } catch {
      return null
    }
  },

  async getAliases(entityType: string, entityId: string): Promise<string[]> {
    try {
      const db = createAnonClient()
      const { data } = await db
        .from("entity_aliases")
        .select("alias")
        .eq("entity_type", entityType)
        .eq("entity_id", entityId)

      return (data ?? []).map((r: { alias: string }) => r.alias)
    } catch {
      return []
    }
  },

  async addAlias(entityType: string, entityId: string, alias: string): Promise<void> {
    try {
      const db = createAdminClient()
      await db.from("entity_aliases").insert({
        entity_type:      entityType,
        entity_id:        entityId,
        alias,
        normalized_alias: alias.trim().toLowerCase(),
      })
    } catch {
      // Duplicate alias — ignore
    }
  },

  async getPrerequisites(technologyId: string): Promise<Technology[]> {
    try {
      const db = createAnonClient()
      const { data: rels } = await db
        .from("entity_relationships")
        .select("target_entity_id")
        .eq("source_entity_type", "technology")
        .eq("source_entity_id", technologyId)
        .eq("target_entity_type", "technology")
        .eq("relationship_type", "DEPENDS_ON")
        .eq("verified", true)

      if (!rels || rels.length === 0) return []
      const ids = rels.map((r: { target_entity_id: string }) => r.target_entity_id)

      const { data } = await db
        .from("technologies")
        .select("id,slug,name,tagline,type,icon_url,difficulty,status,published")
        .in("id", ids)
        .eq("published", true)

      return (data ?? []) as Technology[]
    } catch {
      return []
    }
  },

  async getRelatedTools(technologyId: string, limit = 8): Promise<Tool[]> {
    try {
      const db = createAnonClient()
      const { data: rels } = await db
        .from("entity_relationships")
        .select("target_entity_id")
        .eq("source_entity_type", "technology")
        .eq("source_entity_id", technologyId)
        .eq("target_entity_type", "tool")
        .in("relationship_type", ["USES", "INTEGRATES_WITH", "RELATED_TO"])
        .eq("verified", true)
        .limit(limit)

      if (!rels || rels.length === 0) return []
      const ids = rels.map((r: { target_entity_id: string }) => r.target_entity_id)

      const { data } = await db
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
      const db = createAnonClient()
      const { data: rels } = await db
        .from("entity_relationships")
        .select("target_entity_id")
        .eq("source_entity_type", "technology")
        .eq("source_entity_id", technologyId)
        .eq("target_entity_type", "company")
        .in("relationship_type", ["BUILT_BY", "MAINTAINED_BY", "CREATED_BY"])
        .eq("verified", true)
        .limit(limit)

      if (!rels || rels.length === 0) return []
      const ids = rels.map((r: { target_entity_id: string }) => r.target_entity_id)

      const { data } = await db
        .from("companies")
        .select("id,slug,name,description,logo_url,company_type,published")
        .in("id", ids)
        .eq("published", true)

      return (data ?? []) as Company[]
    } catch {
      return []
    }
  },

  async searchEntities(query: string, types?: string[]): Promise<EntitySearchResult[]> {
    if (!query.trim()) return []
    try {
      const db = createAnonClient()
      const likeQuery = `%${query}%`
      const results: EntitySearchResult[] = []

      const wantType = (t: string) => !types || types.includes(t)

      const [techData, toolData, companyData] = await Promise.all([
        wantType("technology")
          ? db.from("technologies").select("id,slug,name,tagline,description").eq("published", true).ilike("name", likeQuery).limit(5)
          : Promise.resolve({ data: null }),
        wantType("tool")
          ? db.from("tools").select("id,slug,name,tagline").eq("published", true).ilike("name", likeQuery).limit(5)
          : Promise.resolve({ data: null }),
        wantType("company")
          ? db.from("companies").select("id,slug,name,description").eq("published", true).ilike("name", likeQuery).limit(3)
          : Promise.resolve({ data: null }),
      ])

      for (const t of (techData.data ?? [])) {
        const row = t as Record<string, unknown>
        results.push({
          id: row.id as string,
          entity_type: "technology",
          name: row.name as string,
          slug: row.slug as string,
          description: (row.tagline ?? row.description) as string | null,
          url: `/tech/${row.slug}`,
        })
      }
      for (const t of (toolData.data ?? [])) {
        const row = t as Record<string, unknown>
        results.push({
          id: row.id as string,
          entity_type: "tool",
          name: row.name as string,
          slug: row.slug as string,
          description: (row.tagline) as string | null,
          url: `/tools/${row.slug}`,
        })
      }
      for (const c of (companyData.data ?? [])) {
        const row = c as Record<string, unknown>
        results.push({
          id: row.id as string,
          entity_type: "company",
          name: row.name as string,
          slug: row.slug as string,
          description: row.description as string | null,
          url: `/companies/${row.slug}`,
        })
      }
      return results
    } catch {
      return []
    }
  },

  async listRelationships(opts: {
    page?: number
    perPage?: number
    verified?: boolean
    pendingAI?: boolean
  } = {}): Promise<{ data: EntityRelationship[]; total: number }> {
    try {
      const { page = 1, perPage = 50, verified, pendingAI } = opts
      const from = (page - 1) * perPage
      const to = from + perPage - 1

      const db = createAdminClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q: any = db
        .from("entity_relationships")
        .select("*", { count: "exact" })
        .order("verified", { ascending: true })
        .order("created_at", { ascending: false })
        .range(from, to)

      if (verified !== undefined) q = q.eq("verified", verified)
      if (pendingAI) {
        q = q.eq("created_by_type", "ai").eq("verified", false)
      }

      const { data, count } = await q
      return { data: (data ?? []) as EntityRelationship[], total: count ?? 0 }
    } catch {
      return { data: [], total: 0 }
    }
  },
}
