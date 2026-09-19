import type { StatusConnector, StatusConnectorResult, StatusConnectorIncident, StatusConnectorUpdate } from "./types"

function extractXmlTag(xml: string, tag: string): string {
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

export class AWSHealthConnector implements StatusConnector {
  private readonly RSS_URL = "https://health.aws.amazon.com/health/rss/us-east-1.rss"

  constructor(private provider_id: string) {}

  normalizeStatus(raw: string): StatusConnectorResult["status"] {
    const lower = raw.toLowerCase()
    if (lower.includes("resolved") || lower === "operational") return "operational"
    if (lower.includes("critical") || lower.includes("complete outage")) return "major_outage"
    if (lower.includes("degraded") || lower.includes("partial")) return "partial_outage"
    if (lower.includes("investigating") || lower.includes("identified") || lower.includes("monitoring")) return "degraded"
    return "unknown"
  }

  async fetchCurrentStatus(): Promise<StatusConnectorResult> {
    const checked_at = new Date().toISOString()

    try {
      const res = await fetch(this.RSS_URL, {
        signal: AbortSignal.timeout(10000),
        headers: { "User-Agent": "NeuGravity-StatusBot/1.0", Accept: "application/rss+xml,text/xml" },
        next: { revalidate: 0 },
      })

      if (!res.ok) {
        return { provider_id: this.provider_id, checked_at, status: "unknown", raw_status: `HTTP ${res.status}`, incidents: [] }
      }

      const xml = await res.text()
      const itemRe = /<item[\s>]([\s\S]*?)<\/item>/gi
      const rawItems: RegExpExecArray[] = []
      let m: RegExpExecArray | null
      while ((m = itemRe.exec(xml)) !== null) rawItems.push(m)

      const now = Date.now()
      const cutoff24h = now - 24 * 60 * 60 * 1000

      const recentItems = rawItems
        .map((match) => {
          const chunk = match[1]
          const title = extractXmlTag(chunk, "title")
          const link = extractXmlTag(chunk, "link")
          const description = extractXmlTag(chunk, "description")
          const pubDate = extractXmlTag(chunk, "pubDate")
          const guid = extractXmlTag(chunk, "guid") || link
          const pubTime = pubDate ? new Date(pubDate).getTime() : 0
          return { title, link, description, pubDate, guid, pubTime }
        })
        .filter((item) => item.title && item.pubTime > cutoff24h)

      const incidents: StatusConnectorIncident[] = recentItems.map((item) => {
        const isResolved = item.title.toLowerCase().includes("resolved") || item.description.toLowerCase().includes("resolved")
        const update: StatusConnectorUpdate = {
          external_id: `${item.guid}:initial`,
          status: isResolved ? "resolved" : "investigating",
          message: item.description.replace(/<[^>]+>/g, "").trim().slice(0, 1000),
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : checked_at,
        }

        return {
          external_id: item.guid,
          title: item.title,
          status: isResolved ? "resolved" : "investigating",
          impact: "minor",
          started_at: item.pubDate ? new Date(item.pubDate).toISOString() : checked_at,
          resolved_at: isResolved ? checked_at : undefined,
          official_url: item.link || undefined,
          updates: [update],
        }
      })

      const activeIncidents = incidents.filter((i) => i.status !== "resolved")
      let status: StatusConnectorResult["status"] = "operational"
      if (activeIncidents.length > 0) status = "degraded"

      return { provider_id: this.provider_id, checked_at, status, raw_status: status, incidents }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      return { provider_id: this.provider_id, checked_at, status: "unknown", raw_status: msg, incidents: [] }
    }
  }
}
