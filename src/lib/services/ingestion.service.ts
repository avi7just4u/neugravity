import { createAdminClient } from "@/lib/supabase/server"
import { getConnector } from "@/lib/connectors"
import type { NormalizedItem } from "@/lib/connectors"
import { SourceService } from "./source.service"
import { JobService } from "./job.service"

export const IngestionService = {
  async processSource(source_id: string): Promise<{
    discovered: number
    duplicates: number
    queued: number
    errors: string[]
  }> {
    const errors: string[] = []
    const source = await SourceService.getSourceById(source_id)
    if (!source) return { discovered: 0, duplicates: 0, queued: 0, errors: ["Source not found"] }

    const connector = getConnector(source.parser_key)
    let items: NormalizedItem[] = []

    try {
      items = await connector.discover(source)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      await SourceService.recordFailure(source_id, msg)
      return { discovered: 0, duplicates: 0, queued: 0, errors: [msg] }
    }

    let duplicates = 0
    let queued = 0

    for (const item of items) {
      try {
        const editorial_priority = source.trust_level >= 9 ? 'high'
          : source.trust_level <= 5 ? 'low'
          : 'medium'

        const { isDuplicate, item: saved } = await SourceService.upsertSourceItem({
          source_id,
          external_id: item.external_id,
          canonical_url: item.canonical_url,
          title: item.title,
          description: item.description ?? null,
          content: item.content ?? null,
          author: item.author ?? null,
          source_published_at: item.source_published_at?.toISOString() ?? null,
          content_type: item.content_type,
          raw_payload: item.raw_payload,
          metadata: item.metadata ?? null,
          editorial_priority,
        })

        if (isDuplicate) {
          duplicates++
        } else {
          await this.enqueueEnrichment(saved.id)
          queued++
        }
      } catch (err) {
        errors.push(err instanceof Error ? err.message : String(err))
      }
    }

    await SourceService.recordSuccess(source_id, items.length - duplicates)
    return { discovered: items.length, duplicates, queued, errors }
  },

  async checkDuplicate(
    item: NormalizedItem,
    source_id: string
  ): Promise<{ isDuplicate: boolean; existingId?: string }> {
    const db = createAdminClient()

    if (item.canonical_url) {
      const { data } = await db
        .from("source_items")
        .select("id")
        .eq("canonical_url", item.canonical_url)
        .neq("source_id", source_id)
        .limit(1)
        .maybeSingle()
      if (data) return { isDuplicate: true, existingId: data.id }
    }

    if (item.external_id) {
      const { data } = await db
        .from("source_items")
        .select("id")
        .eq("source_id", source_id)
        .eq("external_id", item.external_id)
        .limit(1)
        .maybeSingle()
      if (data) return { isDuplicate: true, existingId: data.id }
    }

    return { isDuplicate: false }
  },

  async enqueueEnrichment(source_item_id: string): Promise<void> {
    await JobService.enqueue({
      queue_name: "content-enrichment",
      job_type: "ENRICH_SOURCE_ITEM",
      payload: { source_item_id },
      priority: 5,
      idempotency_key: `enrich:${source_item_id}`,
    })
  },
}
