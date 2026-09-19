import { createAdminClient } from "@/lib/supabase/server"
import type { StatusProvider, StatusIncident, StatusUpdate } from "@/types"

const STATUS_KEYWORDS: Record<string, string> = {
  investigating: "investigating",
  identified: "identified",
  monitoring: "monitoring",
  resolved: "resolved",
  postmortem: "postmortem",
}

function detectStatus(text: string): string {
  const lower = text.toLowerCase()
  for (const [keyword, status] of Object.entries(STATUS_KEYWORDS)) {
    if (lower.includes(keyword)) return status
  }
  return "investigating"
}

function detectSeverity(text: string): "minor" | "major" | "critical" | null {
  const lower = text.toLowerCase()
  if (lower.includes("critical") || lower.includes("complete outage") || lower.includes("major outage")) return "critical"
  if (lower.includes("major") || lower.includes("significant") || lower.includes("degraded")) return "major"
  if (lower.includes("minor") || lower.includes("partial") || lower.includes("some users")) return "minor"
  return null
}

function extractTag(xml: string, tag: string): string {
  const patterns = [
    new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, "i"),
    new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"),
  ]
  for (const re of patterns) {
    const m = xml.match(re)
    if (m?.[1]) return m[1].trim()
  }
  return ""
}

function parseRSSItems(xml: string): Array<{
  title: string
  link: string
  description: string
  pubDate: string
  guid: string
}> {
  const isAtom = xml.includes("<feed") && xml.includes("<entry")
  const itemTag = isAtom ? "entry" : "item"
  const itemRe = new RegExp(`<${itemTag}[\\s>][\\s\\S]*?</${itemTag}>`, "gi")
  const rawItems = xml.match(itemRe) ?? []

  return rawItems.slice(0, 20).map((raw) => ({
    title: extractTag(raw, "title"),
    link: extractTag(raw, isAtom ? "id" : "link") || extractTag(raw, "link"),
    description: extractTag(raw, isAtom ? "summary" : "description") || extractTag(raw, "content"),
    pubDate: extractTag(raw, isAtom ? "published" : "pubDate") || extractTag(raw, "updated"),
    guid: extractTag(raw, "guid") || extractTag(raw, "id"),
  }))
}

export const StatusService = {
  async getActiveProviders(): Promise<StatusProvider[]> {
    const db = createAdminClient()
    const { data } = await db
      .from("status_providers")
      .select("*")
      .eq("active", true)
      .order("name")
    return (data ?? []) as StatusProvider[]
  },

  async pollProvider(provider_id: string): Promise<{
    incidents_created: number
    updates_added: number
    errors: string[]
  }> {
    const db = createAdminClient()
    const errors: string[] = []
    let incidents_created = 0
    let updates_added = 0

    const { data: provider } = await db
      .from("status_providers")
      .select("*")
      .eq("id", provider_id)
      .single()

    if (!provider) return { incidents_created: 0, updates_added: 0, errors: ["Provider not found"] }

    const feedUrl = provider.feed_url ?? (provider.official_status_url
      ? provider.official_status_url.replace(/\/?$/, "") + "/history.rss"
      : null)

    if (!feedUrl) return { incidents_created: 0, updates_added: 0, errors: ["No feed URL"] }

    let xml: string
    try {
      const res = await fetch(feedUrl, {
        signal: AbortSignal.timeout(10000),
        headers: { "User-Agent": "NeuGravity-Bot/1.0", Accept: "application/rss+xml, application/atom+xml, text/xml" },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      xml = await res.text()
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err))
      return { incidents_created, updates_added, errors }
    }

    const items = parseRSSItems(xml)

    for (const item of items) {
      if (!item.title) continue

      const status = detectStatus(item.title + " " + item.description)
      const severity = detectSeverity(item.title + " " + item.description)

      try {
        const { incident_id, is_new } = await this.upsertIncident(provider_id, {
          external_incident_id: item.guid || undefined,
          title: item.title,
          status,
          impact: severity ?? undefined,
          started_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          official_url: item.link || undefined,
        })

        if (is_new) incidents_created++

        if (item.description) {
          await this.addStatusUpdate(incident_id, {
            external_update_id: item.guid ? `${item.guid}:initial` : undefined,
            status,
            message: item.description.replace(/<[^>]+>/g, "").trim(),
            published_at: item.pubDate ? new Date(item.pubDate).toISOString() : undefined,
            raw_payload: item as unknown as Record<string, unknown>,
          })
          updates_added++
        }
      } catch (err) {
        errors.push(err instanceof Error ? err.message : String(err))
      }
    }

    return { incidents_created, updates_added, errors }
  },

  async upsertIncident(
    provider_id: string,
    data: {
      external_incident_id?: string
      title: string
      status: string
      impact?: string
      started_at: string
      official_url?: string
    }
  ): Promise<{ incident_id: string; is_new: boolean }> {
    const db = createAdminClient()

    if (data.external_incident_id) {
      const { data: existing } = await db
        .from("status_incidents")
        .select("id")
        .eq("provider_id", provider_id)
        .eq("source_url", data.official_url ?? "")
        .maybeSingle()

      if (existing) {
        await db
          .from("status_incidents")
          .update({ status: data.status, checked_at: new Date().toISOString() })
          .eq("id", existing.id)
        return { incident_id: existing.id, is_new: false }
      }
    }

    const { data: inserted, error } = await db
      .from("status_incidents")
      .insert({
        provider_id,
        title: data.title,
        status: data.status,
        severity: data.impact ?? null,
        started_at: data.started_at,
        source_url: data.official_url ?? null,
        checked_at: new Date().toISOString(),
      })
      .select("id")
      .single()

    if (error || !inserted) throw new Error(error?.message ?? "Insert failed")
    return { incident_id: inserted.id, is_new: true }
  },

  async addStatusUpdate(
    incident_id: string,
    data: {
      external_update_id?: string
      status: string
      message: string
      published_at?: string
      raw_payload?: Record<string, unknown>
    }
  ): Promise<void> {
    const db = createAdminClient()

    if (data.external_update_id) {
      const { data: existing } = await db
        .from("status_updates")
        .select("id")
        .eq("incident_id", incident_id)
        .eq("external_update_id", data.external_update_id)
        .maybeSingle()
      if (existing) return
    }

    await db.from("status_updates").insert({
      incident_id,
      external_update_id: data.external_update_id ?? null,
      status: data.status,
      message: data.message,
      published_at: data.published_at ?? null,
      raw_payload: data.raw_payload ?? null,
    })
  },

  async getActiveIncidents(): Promise<(StatusIncident & { updates: StatusUpdate[]; provider: StatusProvider })[]> {
    const db = createAdminClient()
    const { data } = await db
      .from("status_incidents")
      .select("*, status_updates(*), status_providers(*)")
      .neq("status", "resolved")
      .neq("status", "postmortem")
      .order("started_at", { ascending: false })
      .limit(20)

    return (data ?? []).map((row: any) => ({
      ...row,
      updates: row.status_updates ?? [],
      provider: row.status_providers,
    })) as any
  },

  async getIncidentWithTimeline(
    incident_id: string
  ): Promise<(StatusIncident & { updates: StatusUpdate[] }) | null> {
    const db = createAdminClient()
    const { data } = await db
      .from("status_incidents")
      .select("*, status_updates(*)")
      .eq("id", incident_id)
      .single()

    if (!data) return null
    return {
      ...data,
      updates: (data as any).status_updates ?? [],
    } as any
  },
}
