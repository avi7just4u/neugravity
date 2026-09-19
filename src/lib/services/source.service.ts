import { createAdminClient } from "@/lib/supabase/server"
import type { Source, SourceItem } from "@/types"

export const SourceService = {
  async getSources(opts: {
    active?: boolean
    source_type?: string
    health_status?: string
    page?: number
    perPage?: number
  } = {}): Promise<{ data: Source[]; total: number }> {
    const db = createAdminClient()
    const limit = opts.perPage ?? 50
    const page = opts.page ?? 1
    const from = (page - 1) * limit
    const to = from + limit - 1

    let q = db
      .from("sources")
      .select("*", { count: "exact" })
      .order("name")
      .range(from, to)

    if (opts.active !== undefined) q = q.eq("active", opts.active)
    if (opts.source_type) q = q.eq("source_type", opts.source_type)
    if (opts.health_status) q = q.eq("health_status", opts.health_status)

    const { data, count, error } = await q
    if (error) return { data: [], total: 0 }
    return { data: (data ?? []) as Source[], total: count ?? 0 }
  },

  async getSourceById(id: string): Promise<Source | null> {
    const db = createAdminClient()
    const { data, error } = await db.from("sources").select("*").eq("id", id).single()
    if (error || !data) return null
    return data as Source
  },

  async createSource(data: Partial<Source>): Promise<Source | null> {
    const db = createAdminClient()
    const { data: created, error } = await db
      .from("sources")
      .insert({
        ...data,
        health_status: "unknown",
        active: data.active ?? false,
        poll_interval_seconds: data.poll_interval_seconds ?? 3600,
        failure_count: 0,
        items_discovered: 0,
      })
      .select("*")
      .single()
    if (error || !created) return null
    return created as Source
  },

  async updateSource(id: string, data: Partial<Source>): Promise<Source | null> {
    const db = createAdminClient()
    const { data: updated, error } = await db
      .from("sources")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single()
    if (error || !updated) return null
    return updated as Source
  },

  async deleteSource(id: string): Promise<void> {
    const db = createAdminClient()
    await db.from("sources").delete().eq("id", id)
  },

  async getDueSources(limit = 20): Promise<Source[]> {
    const db = createAdminClient()
    const { data, error } = await db
      .from("sources")
      .select("*")
      .eq("active", true)
      .or(`next_poll_at.is.null,next_poll_at.lte.${new Date().toISOString()}`)
      .order("next_poll_at", { ascending: true, nullsFirst: true })
      .limit(limit)
    if (error) return []
    return (data ?? []) as Source[]
  },

  async recordSuccess(id: string, itemsDiscovered: number): Promise<void> {
    const db = createAdminClient()
    const { data: src } = await db.from("sources").select("poll_interval_seconds, items_discovered").eq("id", id).single()
    const interval = (src?.poll_interval_seconds ?? 3600) * 1000
    const nextPoll = new Date(Date.now() + interval).toISOString()

    await db.from("sources").update({
      last_polled_at: new Date().toISOString(),
      last_success_at: new Date().toISOString(),
      next_poll_at: nextPoll,
      health_status: "healthy",
      failure_count: 0,
      last_error: null,
      items_discovered: (src?.items_discovered ?? 0) + itemsDiscovered,
    }).eq("id", id)
  },

  async recordFailure(id: string, error: string): Promise<void> {
    const db = createAdminClient()
    const { data: src } = await db.from("sources").select("failure_count, poll_interval_seconds").eq("id", id).single()
    const failures = (src?.failure_count ?? 0) + 1
    const interval = (src?.poll_interval_seconds ?? 3600) * 1000
    const nextPoll = new Date(Date.now() + interval).toISOString()

    await db.from("sources").update({
      last_polled_at: new Date().toISOString(),
      last_error_at: new Date().toISOString(),
      last_error: error,
      failure_count: failures,
      next_poll_at: nextPoll,
      health_status: failures >= 5 ? "failed" : failures >= 3 ? "warning" : "healthy",
    }).eq("id", id)
  },

  async scheduleNow(id: string): Promise<void> {
    const db = createAdminClient()
    await db.from("sources").update({ next_poll_at: new Date().toISOString() }).eq("id", id)
  },

  async getSourceItems(source_id: string, opts: { processing_status?: string; limit?: number } = {}): Promise<SourceItem[]> {
    const db = createAdminClient()
    let q = db
      .from("source_items")
      .select("*")
      .eq("source_id", source_id)
      .order("discovered_at", { ascending: false })
      .limit(opts.limit ?? 50)

    if (opts.processing_status) q = q.eq("processing_status", opts.processing_status)

    const { data, error } = await q
    if (error) return []
    return (data ?? []) as SourceItem[]
  },

  async upsertSourceItem(item: Partial<SourceItem>): Promise<{ item: SourceItem; isDuplicate: boolean }> {
    const db = createAdminClient()

    // Check for duplicate by canonical_url
    if (item.canonical_url) {
      const { data: existing } = await db
        .from("source_items")
        .select("id, processing_status")
        .eq("canonical_url", item.canonical_url)
        .neq("source_id", item.source_id ?? "")
        .limit(1)
        .single()

      if (existing) {
        const { data: dup } = await db
          .from("source_items")
          .insert({
            ...item,
            processing_status: "duplicate",
            duplicate_of: existing.id,
            discovered_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select("*")
          .single()
        return { item: (dup ?? item) as SourceItem, isDuplicate: true }
      }
    }

    // Check for duplicate by external_id within same source
    if (item.external_id && item.source_id) {
      const { data: existing } = await db
        .from("source_items")
        .select("id")
        .eq("source_id", item.source_id)
        .eq("external_id", item.external_id)
        .limit(1)
        .single()

      if (existing) {
        return { item: existing as SourceItem, isDuplicate: true }
      }
    }

    const { data: created, error } = await db
      .from("source_items")
      .insert({
        ...item,
        processing_status: item.processing_status ?? "discovered",
        discovered_at: item.discovered_at ?? new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single()

    if (error || !created) return { item: item as SourceItem, isDuplicate: false }
    return { item: created as SourceItem, isDuplicate: false }
  },
}
