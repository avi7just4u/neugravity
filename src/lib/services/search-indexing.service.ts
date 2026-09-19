import { createAdminClient } from "@/lib/supabase/server"
import { JobService } from "./job.service"

const ENTITY_TABLE_MAP: Record<string, string> = {
  news: "news_articles",
  tool: "tools",
  technology: "technologies",
  company: "companies",
}

export const SearchIndexingService = {
  async enqueueIndex(entity_type: string, entity_id: string, priority = 5): Promise<void> {
    await JobService.enqueue({
      queue_name: "search-indexing",
      job_type: "INDEX_CONTENT",
      payload: { entity_type, entity_id },
      priority,
      idempotency_key: `index:${entity_type}:${entity_id}`,
    })
  },

  async markIndexed(entity_type: string, entity_id: string): Promise<void> {
    const db = createAdminClient()
    const table = ENTITY_TABLE_MAP[entity_type]
    if (!table) return
    await db
      .from(table)
      .update({ updated_at: new Date().toISOString() })
      .eq("id", entity_id)
  },

  async getRecentlyIndexed(limit = 50): Promise<{ entity_type: string; entity_id: string; indexed_at: string }[]> {
    const db = createAdminClient()
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data } = await db
      .from("jobs")
      .select("payload, completed_at")
      .eq("queue_name", "search-indexing")
      .eq("status", "completed")
      .gte("completed_at", since)
      .order("completed_at", { ascending: false })
      .limit(limit)

    return (data ?? []).map((row) => ({
      entity_type: (row.payload as Record<string, string>).entity_type ?? "",
      entity_id: (row.payload as Record<string, string>).entity_id ?? "",
      indexed_at: row.completed_at ?? "",
    }))
  },

  async scheduleFullReindex(): Promise<{ queued: number }> {
    const db = createAdminClient()
    let queued = 0

    for (const [entity_type, table] of Object.entries(ENTITY_TABLE_MAP)) {
      const { data } = await db
        .from(table)
        .select("id")
        .eq("published", true)
        .limit(500)

      for (const row of data ?? []) {
        await this.enqueueIndex(entity_type, row.id, 3)
        queued++
      }
    }

    return { queued }
  },

  async onContentPublished(entity_type: string, entity_id: string): Promise<void> {
    await this.enqueueIndex(entity_type, entity_id, 8)
  },

  async onContentUpdated(entity_type: string, entity_id: string): Promise<void> {
    await this.enqueueIndex(entity_type, entity_id, 6)
  },

  async onContentUnpublished(entity_type: string, entity_id: string): Promise<void> {
    await this.enqueueIndex(entity_type, entity_id, 7)
  },
}
