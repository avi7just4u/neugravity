import type { StatusConnector, StatusConnectorResult, StatusConnectorIncident, StatusConnectorUpdate } from "./types"

interface GCPIncidentUpdate {
  created: string
  modified: string
  when: string
  text: string
  status?: string
}

interface GCPIncident {
  id: string
  number: number
  begin: string
  end: string | null
  severity: "low" | "medium" | "high"
  external_desc: string
  updates: GCPIncidentUpdate[]
  uri?: string
}

export class GoogleCloudConnector implements StatusConnector {
  private readonly API_URL = "https://status.cloud.google.com/incidents.json"

  constructor(private provider_id: string) {}

  normalizeStatus(raw: string): StatusConnectorResult["status"] {
    switch (raw) {
      case "operational": return "operational"
      case "low": return "degraded"
      case "medium": return "partial_outage"
      case "high": return "major_outage"
      default: return "unknown"
    }
  }

  private normalizeSeverity(severity: string): StatusConnectorIncident["impact"] {
    switch (severity) {
      case "low": return "minor"
      case "medium": return "major"
      case "high": return "critical"
      default: return "none"
    }
  }

  private normalizeUpdateStatus(update: GCPIncidentUpdate, isResolved: boolean): string {
    const text = (update.text ?? "").toLowerCase()
    if (isResolved || text.includes("resolved")) return "resolved"
    if (text.includes("monitoring")) return "monitoring"
    if (text.includes("identified")) return "identified"
    return "investigating"
  }

  async fetchCurrentStatus(): Promise<StatusConnectorResult> {
    const checked_at = new Date().toISOString()

    try {
      const res = await fetch(this.API_URL, {
        signal: AbortSignal.timeout(10000),
        headers: { "User-Agent": "NeuGravity-StatusBot/1.0", Accept: "application/json" },
        next: { revalidate: 0 },
      })

      if (!res.ok) {
        return { provider_id: this.provider_id, checked_at, status: "unknown", raw_status: `HTTP ${res.status}`, incidents: [] }
      }

      const data: GCPIncident[] = await res.json()

      // Active = end is null or end is in the future
      const now = new Date()
      const activeIncidents = (data ?? []).filter((inc) => !inc.end || new Date(inc.end) > now)
      // Also include incidents from last 24h even if resolved
      const recentResolved = (data ?? [])
        .filter((inc) => inc.end && new Date(inc.end) > new Date(Date.now() - 24 * 60 * 60 * 1000))
        .slice(0, 5)

      const allIncidents = [...activeIncidents, ...recentResolved.filter((r) => !activeIncidents.find((a) => a.id === r.id))]

      const incidents: StatusConnectorIncident[] = allIncidents.map((inc) => {
        const isResolved = !!inc.end && new Date(inc.end) <= now

        const updates: StatusConnectorUpdate[] = (inc.updates ?? []).map((u, i) => ({
          external_id: `${inc.id}:update:${i}`,
          status: this.normalizeUpdateStatus(u, isResolved),
          message: u.text ?? "",
          published_at: u.when ?? u.created ?? checked_at,
        }))

        return {
          external_id: inc.id ?? String(inc.number),
          title: inc.external_desc ?? `GCP Incident #${inc.number}`,
          status: isResolved ? "resolved" : "investigating",
          impact: this.normalizeSeverity(inc.severity),
          started_at: inc.begin ?? checked_at,
          resolved_at: inc.end ?? undefined,
          official_url: inc.uri ?? `https://status.cloud.google.com/incidents/${inc.id}`,
          updates,
        }
      })

      let status: StatusConnectorResult["status"] = "operational"
      if (activeIncidents.some((i) => i.severity === "high")) status = "major_outage"
      else if (activeIncidents.some((i) => i.severity === "medium")) status = "partial_outage"
      else if (activeIncidents.length > 0) status = "degraded"

      const rawStatus = activeIncidents.length === 0 ? "operational" : activeIncidents[0].severity

      return { provider_id: this.provider_id, checked_at, status, raw_status: rawStatus, incidents }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      return { provider_id: this.provider_id, checked_at, status: "unknown", raw_status: msg, incidents: [] }
    }
  }
}
