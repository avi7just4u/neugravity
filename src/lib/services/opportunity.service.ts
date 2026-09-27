import { createAdminClient } from "@/lib/supabase/server"
import { AuditService } from "./audit.service"
import type {
  ContentOpportunity,
  OpportunityContentType,
  OpportunityStatus,
  OpportunityPriority,
  OpportunitySource,
  GapType,
} from "@/types"

export interface CreateOpportunityInput {
  topic: string
  title_suggestion?: string
  content_type: OpportunityContentType
  audience?: string
  reason?: string
  why_now?: string
  gap_type?: GapType
  priority?: OpportunityPriority
  source?: OpportunitySource
  related_entity_type?: string
  related_entity_id?: string
  related_entity_name?: string
  enterprise_relevance?: "low" | "medium" | "high"
  target_publish_date?: string
  brief?: Record<string, unknown>
  metadata?: Record<string, unknown>
  created_by?: string
  created_by_type?: "editor" | "system" | "ai"
}

export interface OpportunityFilters {
  status?: OpportunityStatus | OpportunityStatus[]
  priority?: OpportunityPriority
  content_type?: OpportunityContentType
  source?: OpportunitySource
  gap_type?: GapType
  assigned_to?: string
  page?: number
  perPage?: number
}

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "")

export const OpportunityService = {
  async list(
    filters: OpportunityFilters = {}
  ): Promise<{ data: ContentOpportunity[]; total: number }> {
    const { page = 1, perPage = 25 } = filters
    const from = (page - 1) * perPage
    const to = from + perPage - 1

    try {
      const db = createAdminClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q: any = db
        .from("content_opportunities")
        .select("*", { count: "exact" })
        .order("priority", { ascending: true })
        .order("created_at", { ascending: false })
        .range(from, to)

      if (filters.status) {
        if (Array.isArray(filters.status)) {
          q = q.in("status", filters.status)
        } else {
          q = q.eq("status", filters.status)
        }
      }
      if (filters.priority) q = q.eq("priority", filters.priority)
      if (filters.content_type) q = q.eq("content_type", filters.content_type)
      if (filters.source) q = q.eq("source", filters.source)
      if (filters.gap_type) q = q.eq("gap_type", filters.gap_type)
      if (filters.assigned_to) q = q.eq("assigned_to", filters.assigned_to)

      const { data, count, error } = await q
      if (error) return { data: [], total: 0 }
      return { data: (data ?? []) as ContentOpportunity[], total: count ?? 0 }
    } catch {
      return { data: [], total: 0 }
    }
  },

  async getById(id: string): Promise<ContentOpportunity | null> {
    try {
      const db = createAdminClient()
      const { data, error } = await db
        .from("content_opportunities")
        .select("*")
        .eq("id", id)
        .single()
      if (error) return null
      return data as ContentOpportunity
    } catch {
      return null
    }
  },

  /** Returns true if a sufficiently similar opportunity already exists. */
  async isDuplicate(
    topic: string,
    content_type: OpportunityContentType,
    related_entity_type?: string,
    related_entity_id?: string
  ): Promise<boolean> {
    try {
      const db = createAdminClient()
      const key =
        normalize(topic) +
        ":" +
        content_type +
        ":" +
        (related_entity_type ?? "") +
        ":" +
        (related_entity_id ?? "")

      const { count } = await db
        .from("content_opportunities")
        .select("id", { count: "exact", head: true })
        .eq("dedup_key", key)
        .not("status", "in", '("dismissed","completed")')

      return (count ?? 0) > 0
    } catch {
      return false
    }
  },

  async create(
    input: CreateOpportunityInput,
    actor?: { id?: string; email?: string }
  ): Promise<ContentOpportunity | null> {
    const isDup = await this.isDuplicate(
      input.topic,
      input.content_type,
      input.related_entity_type,
      input.related_entity_id
    )
    if (isDup) return null

    try {
      const db = createAdminClient()
      const { data, error } = await db
        .from("content_opportunities")
        .insert({
          topic: input.topic,
          title_suggestion: input.title_suggestion ?? null,
          content_type: input.content_type,
          audience: input.audience ?? null,
          reason: input.reason ?? null,
          why_now: input.why_now ?? null,
          gap_type: input.gap_type ?? null,
          priority: input.priority ?? "medium",
          source: input.source ?? "manual",
          related_entity_type: input.related_entity_type ?? null,
          related_entity_id: input.related_entity_id ?? null,
          related_entity_name: input.related_entity_name ?? null,
          enterprise_relevance: input.enterprise_relevance ?? "low",
          target_publish_date: input.target_publish_date ?? null,
          brief: input.brief ?? {},
          metadata: input.metadata ?? {},
          created_by: input.created_by ?? actor?.id ?? null,
          created_by_type: input.created_by_type ?? null,
        })
        .select()
        .single()

      if (error || !data) return null

      await AuditService.log({
        actor_id: actor?.id,
        actor_email: actor?.email,
        action: "opportunity.created",
        entity_type: "content_opportunity",
        entity_id: (data as ContentOpportunity).id,
        summary: `Created opportunity: ${input.topic} [${input.content_type}]`,
        metadata: { source: input.source, priority: input.priority },
      })

      return data as ContentOpportunity
    } catch {
      return null
    }
  },

  async updateStatus(
    id: string,
    status: OpportunityStatus,
    actor?: { id?: string; email?: string },
    opts?: { assigned_to?: string; target_publish_date?: string }
  ): Promise<boolean> {
    try {
      const db = createAdminClient()
      const now = new Date().toISOString()
      const updates: Record<string, unknown> = { status }

      if (status === "completed") updates.completed_at = now
      if (status === "dismissed") updates.dismissed_at = now
      if (status === "review") updates.reviewed_at = now
      if (opts?.assigned_to) {
        updates.assigned_to = opts.assigned_to
        if (status === "new" || status === "review") updates.status = "assigned"
      }
      if (opts?.target_publish_date) updates.target_publish_date = opts.target_publish_date

      const { error } = await db.from("content_opportunities").update(updates).eq("id", id)
      if (error) return false

      await AuditService.log({
        actor_id: actor?.id,
        actor_email: actor?.email,
        action: `opportunity.${status}`,
        entity_type: "content_opportunity",
        entity_id: id,
        summary: `Opportunity status → ${status}`,
      })

      return true
    } catch {
      return false
    }
  },

  async update(
    id: string,
    patch: Partial<
      Pick<ContentOpportunity, "topic" | "title_suggestion" | "priority" | "audience" | "reason" | "why_now" | "gap_type" | "enterprise_relevance" | "target_publish_date" | "brief">
    >,
    actor?: { id?: string; email?: string }
  ): Promise<boolean> {
    try {
      const db = createAdminClient()
      const { error } = await db.from("content_opportunities").update(patch).eq("id", id)
      if (error) return false

      await AuditService.log({
        actor_id: actor?.id,
        actor_email: actor?.email,
        action: "opportunity.edited",
        entity_type: "content_opportunity",
        entity_id: id,
        summary: `Edited opportunity ${id}`,
      })

      return true
    } catch {
      return false
    }
  },

  async updateBrief(
    id: string,
    brief: Record<string, unknown>,
    actor?: { id?: string; email?: string }
  ): Promise<boolean> {
    try {
      const db = createAdminClient()
      const { error } = await db
        .from("content_opportunities")
        .update({ brief, status: "in_progress" })
        .eq("id", id)
      if (error) return false

      await AuditService.log({
        actor_id: actor?.id,
        actor_email: actor?.email,
        action: "opportunity.converted",
        entity_type: "content_opportunity",
        entity_id: id,
        summary: `Generated brief for opportunity ${id}`,
      })

      return true
    } catch {
      return false
    }
  },

  /** Dashboard summary counts grouped by status */
  async getSummaryCounts(): Promise<Record<OpportunityStatus, number>> {
    const defaults: Record<OpportunityStatus, number> = {
      new: 0,
      review: 0,
      approved: 0,
      assigned: 0,
      in_progress: 0,
      completed: 0,
      dismissed: 0,
    }
    try {
      const db = createAdminClient()
      const { data } = await db
        .from("content_opportunities")
        .select("status")
        .not("status", "is", null)

      if (!data) return defaults
      for (const row of data) {
        const s = row.status as OpportunityStatus
        if (s in defaults) defaults[s]++
      }
      return defaults
    } catch {
      return defaults
    }
  },

  /** Top-N high priority active opportunities for the dashboard widget */
  async getHighPriority(limit = 10): Promise<ContentOpportunity[]> {
    try {
      const db = createAdminClient()
      const { data } = await db
        .from("content_opportunities")
        .select("*")
        .eq("priority", "high")
        .not("status", "in", '("completed","dismissed")')
        .order("created_at", { ascending: false })
        .limit(limit)
      return (data ?? []) as ContentOpportunity[]
    } catch {
      return []
    }
  },

  /** Mark stale completed/obsolete opportunities */
  async refreshStale(): Promise<number> {
    try {
      const db = createAdminClient()
      const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
      const { data } = await db
        .from("content_opportunities")
        .update({ status: "dismissed", dismissed_at: new Date().toISOString() })
        .eq("status", "new")
        .lt("created_at", cutoff)
        .select("id")
      return (data ?? []).length
    } catch {
      return 0
    }
  },

  /** Search query stats for signal analysis */
  async getSearchSignals(opts: {
    minCount?: number
    zeroResultsOnly?: boolean
    limit?: number
    since?: Date
  } = {}): Promise<Array<{ normalized: string; count: number; avg_results: number; has_results: boolean }>> {
    try {
      const db = createAdminClient()
      const since = opts.since ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q: any = db
        .from("search_query_log")
        .select("normalized, results_count, has_results")
        .gte("created_at", since.toISOString())

      if (opts.zeroResultsOnly) q = q.eq("has_results", false)

      const { data } = await q
      if (!data) return []

      // Aggregate in JS since Supabase client doesn't support GROUP BY
      const agg = new Map<string, { count: number; total_results: number; has_results: boolean }>()
      for (const row of data) {
        const key = row.normalized as string
        const existing = agg.get(key) ?? { count: 0, total_results: 0, has_results: false }
        existing.count++
        existing.total_results += (row.results_count as number) ?? 0
        existing.has_results = existing.has_results || (row.has_results as boolean)
        agg.set(key, existing)
      }

      const result = Array.from(agg.entries())
        .map(([normalized, v]) => ({
          normalized,
          count: v.count,
          avg_results: v.count > 0 ? Math.round(v.total_results / v.count) : 0,
          has_results: v.has_results,
        }))
        .filter((r) => (opts.minCount ?? 1) <= r.count)
        .sort((a, b) => b.count - a.count)
        .slice(0, opts.limit ?? 50)

      return result
    } catch {
      return []
    }
  },
}
