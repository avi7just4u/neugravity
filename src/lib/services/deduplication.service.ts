import { createAdminClient } from "@/lib/supabase/server"
import crypto from "crypto"

export function hashContent(title: string, content?: string | null): string {
  const text = [title, content].filter(Boolean).join("\n").toLowerCase().trim()
  return crypto.createHash("sha256").update(text).digest("hex")
}

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url)
    u.hash = ""
    u.searchParams.delete("utm_source")
    u.searchParams.delete("utm_medium")
    u.searchParams.delete("utm_campaign")
    u.searchParams.delete("utm_term")
    u.searchParams.delete("utm_content")
    return u.toString().replace(/\/$/, "")
  } catch {
    return url.toLowerCase().trim()
  }
}

function titleSimilarity(a: string, b: string): number {
  const tokenize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((t) => t.length > 3)
  const ta = new Set(tokenize(a))
  const tb = new Set(tokenize(b))
  const intersection = [...ta].filter((t) => tb.has(t)).length
  const union = new Set([...ta, ...tb]).size
  return union === 0 ? 0 : intersection / union
}

export const DeduplicationService = {
  async check(opts: {
    canonical_url?: string | null
    external_id?: string | null
    source_id: string
    source_item_id?: string  // exclude self
    title: string
    content?: string | null
    content_hash?: string | null
  }): Promise<{ isDuplicate: boolean; existingId?: string; strategy?: string }> {
    const db = createAdminClient()
    const selfId = opts.source_item_id

    // Strategy 1: exact URL match across all sources (exclude self)
    if (opts.canonical_url) {
      const normalized = normalizeUrl(opts.canonical_url)
      let q = db.from("source_items").select("id").eq("canonical_url", normalized).limit(1)
      if (selfId) q = q.neq("id", selfId)
      const { data } = await q.maybeSingle()
      if (data) return { isDuplicate: true, existingId: data.id, strategy: "url" }
    }

    // Strategy 2: external_id within same source (exclude self)
    if (opts.external_id) {
      let q = db.from("source_items").select("id").eq("source_id", opts.source_id).eq("external_id", opts.external_id).limit(1)
      if (selfId) q = q.neq("id", selfId)
      const { data } = await q.maybeSingle()
      if (data) return { isDuplicate: true, existingId: data.id, strategy: "external_id" }
    }

    // Strategy 3: content hash (exclude self)
    const hash = opts.content_hash ?? hashContent(opts.title, opts.content)
    if (hash) {
      let q = db.from("source_items").select("id").eq("content_hash", hash).limit(1)
      if (selfId) q = q.neq("id", selfId)
      const { data: hashMatch } = await q.maybeSingle()
      if (hashMatch) return { isDuplicate: true, existingId: hashMatch.id, strategy: "content_hash" }
    }

    // Strategy 4: title similarity (fuzzy, recent items, exclude self)
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    let recentQ = db.from("source_items").select("id, title").gte("created_at", since).limit(200)
    if (selfId) recentQ = recentQ.neq("id", selfId)
    const { data: recent } = await recentQ

    for (const row of recent ?? []) {
      if (row.title && titleSimilarity(opts.title, row.title) >= 0.8) {
        return { isDuplicate: true, existingId: row.id, strategy: "title_similarity" }
      }
    }

    return { isDuplicate: false }
  },

  async clusterStories(sourceItemIds: string[]): Promise<Map<string, string[]>> {
    if (sourceItemIds.length === 0) return new Map()
    const db = createAdminClient()

    const { data: items } = await db
      .from("source_items")
      .select("id, title")
      .in("id", sourceItemIds)

    const clusters = new Map<string, string[]>()
    const assigned = new Set<string>()

    for (const item of items ?? []) {
      if (assigned.has(item.id)) continue
      const cluster: string[] = [item.id]
      assigned.add(item.id)

      for (const other of items ?? []) {
        if (assigned.has(other.id)) continue
        if (item.title && other.title && titleSimilarity(item.title, other.title) >= 0.6) {
          cluster.push(other.id)
          assigned.add(other.id)
        }
      }

      clusters.set(item.id, cluster)
    }

    return clusters
  },
}
