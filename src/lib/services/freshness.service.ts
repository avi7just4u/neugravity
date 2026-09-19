import { createAdminClient } from "@/lib/supabase/server"
import type { RefreshPolicy } from "@/types"
import { JobService } from "./job.service"

const ENTITY_TABLES: Record<string, { table: string; name_col: string; slug_col: string }> = {
  tool: { table: "tools", name_col: "name", slug_col: "slug" },
  technology: { table: "technologies", name_col: "name", slug_col: "slug" },
  company: { table: "companies", name_col: "name", slug_col: "slug" },
  news: { table: "news_items", name_col: "headline", slug_col: "slug" },
}

export const FreshnessService = {
  async getPolicies(): Promise<RefreshPolicy[]> {
    const db = createAdminClient()
    const { data } = await db
      .from("refresh_policies")
      .select("*")
      .eq("enabled", true)
      .order("entity_type")
    return (data ?? []) as RefreshPolicy[]
  },

  async getOverdueContent(): Promise<{
    entity_type: string
    field_group: string
    overdue_count: number
    refresh_interval_seconds: number
  }[]> {
    const db = createAdminClient()
    const policies = await this.getPolicies()
    const results: { entity_type: string; field_group: string; overdue_count: number; refresh_interval_seconds: number }[] = []

    for (const policy of policies) {
      const meta = ENTITY_TABLES[policy.entity_type]
      if (!meta) continue

      const cutoff = new Date(Date.now() - policy.refresh_interval_seconds * 1000).toISOString()

      const { count } = await db
        .from(meta.table)
        .select("id", { count: "exact", head: true })
        .lt("updated_at", cutoff)

      results.push({
        entity_type: policy.entity_type,
        field_group: policy.field_group,
        overdue_count: count ?? 0,
        refresh_interval_seconds: policy.refresh_interval_seconds,
      })
    }

    return results.filter((r) => r.overdue_count > 0)
  },

  async getStaleItems(
    entity_type: string,
    limit = 50
  ): Promise<{ id: string; name: string; slug: string; last_updated: string; overdue_by_seconds: number }[]> {
    const db = createAdminClient()
    const meta = ENTITY_TABLES[entity_type]
    if (!meta) return []

    const { data: policy } = await db
      .from("refresh_policies")
      .select("refresh_interval_seconds")
      .eq("entity_type", entity_type)
      .eq("enabled", true)
      .order("priority", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!policy) return []

    const cutoff = new Date(Date.now() - policy.refresh_interval_seconds * 1000).toISOString()

    const { data } = await db
      .from(meta.table)
      .select(`id, ${meta.name_col}, ${meta.slug_col}, updated_at`)
      .lt("updated_at", cutoff)
      .order("updated_at", { ascending: true })
      .limit(limit)

    const now = Date.now()
    return (data ?? []).map((row: any) => ({
      id: row.id,
      name: row[meta.name_col] ?? "",
      slug: row[meta.slug_col] ?? "",
      last_updated: row.updated_at,
      overdue_by_seconds: Math.floor((now - new Date(row.updated_at).getTime()) / 1000) - policy.refresh_interval_seconds,
    }))
  },

  async scheduleOverdueRefreshes(): Promise<{ queued: number }> {
    const db = createAdminClient()
    const policies = await this.getPolicies()
    let queued = 0

    for (const policy of policies) {
      const meta = ENTITY_TABLES[policy.entity_type]
      if (!meta) continue

      const cutoff = new Date(Date.now() - policy.refresh_interval_seconds * 1000).toISOString()

      const { data } = await db
        .from(meta.table)
        .select("id")
        .lt("updated_at", cutoff)
        .limit(100)

      for (const row of data ?? []) {
        const queueName = policy.entity_type === "tool" ? "tool-refresh" : "source-fetch"
        const jobType = policy.entity_type === "tool" ? "REFRESH_TOOL" : "REFRESH_ENTITY"
        const today = new Date().toISOString().slice(0, 10)

        const result = await JobService.enqueue({
          queue_name: queueName,
          job_type: jobType,
          payload: { entity_type: policy.entity_type, entity_id: row.id, field_group: policy.field_group },
          priority: 2,
          idempotency_key: `freshness:${policy.entity_type}:${row.id}:${policy.field_group}:${today}`,
        })
        if (result) queued++
      }
    }

    return { queued }
  },

  async getFreshnessSummary(): Promise<{
    expired: number
    due_soon: number
    healthy: number
    unknown: number
  }> {
    const db = createAdminClient()
    const policies = await this.getPolicies()

    let expired = 0
    let due_soon = 0
    let healthy = 0

    const now = Date.now()
    const soonWindow = 24 * 60 * 60 * 1000 // 24h

    for (const policy of policies) {
      const meta = ENTITY_TABLES[policy.entity_type]
      if (!meta) continue

      const cutoffExpired = new Date(now - policy.refresh_interval_seconds * 1000).toISOString()
      const cutoffSoon = new Date(now - (policy.refresh_interval_seconds * 1000 - soonWindow)).toISOString()

      const [expiredRes, soonRes, totalRes] = await Promise.all([
        db.from(meta.table).select("id", { count: "exact", head: true }).lt("updated_at", cutoffExpired),
        db.from(meta.table).select("id", { count: "exact", head: true }).lt("updated_at", cutoffSoon).gte("updated_at", cutoffExpired),
        db.from(meta.table).select("id", { count: "exact", head: true }),
      ])

      expired += expiredRes.count ?? 0
      due_soon += soonRes.count ?? 0
      healthy += Math.max(0, (totalRes.count ?? 0) - (expiredRes.count ?? 0) - (soonRes.count ?? 0))
    }

    return { expired, due_soon, healthy, unknown: 0 }
  },
}
