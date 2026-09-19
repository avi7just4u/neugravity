import type { StatusConnector, StatusConnectorResult, StatusConnectorIncident, StatusConnectorUpdate } from "./types"

interface StatuspageConfig {
  provider_id: string
  base_url: string
  name: string
}

interface StatuspageComponent {
  id: string
  name: string
  status: string
}

interface StatuspageIncidentUpdate {
  id: string
  status: string
  body: string
  created_at: string
}

interface StatuspageIncident {
  id: string
  name: string
  status: string
  impact: string
  created_at: string
  resolved_at: string | null
  shortlink: string
  incident_updates: StatuspageIncidentUpdate[]
  components?: StatuspageComponent[]
}

interface StatuspageSummary {
  status: { indicator: string; description: string }
  incidents: StatuspageIncident[]
  scheduled_maintenances: StatuspageIncident[]
}

export class StatuspageConnector implements StatusConnector {
  constructor(private config: StatuspageConfig) {}

  normalizeStatus(raw: string): StatusConnectorResult["status"] {
    switch (raw) {
      case "none": return "operational"
      case "minor": return "degraded"
      case "major": return "partial_outage"
      case "critical": return "major_outage"
      case "maintenance": return "degraded"
      default: return "unknown"
    }
  }

  private normalizeImpact(impact: string): StatusConnectorIncident["impact"] {
    switch (impact) {
      case "none": return "none"
      case "minor": return "minor"
      case "major": return "major"
      case "critical": return "critical"
      case "maintenance": return "maintenance"
      default: return "none"
    }
  }

  private normalizeIncidentStatus(status: string): StatusConnectorIncident["status"] {
    switch (status) {
      case "investigating": return "investigating"
      case "identified": return "identified"
      case "monitoring": return "monitoring"
      case "resolved": return "resolved"
      case "postmortem": return "postmortem"
      default: return "investigating"
    }
  }

  async fetchCurrentStatus(): Promise<StatusConnectorResult> {
    const checked_at = new Date().toISOString()

    try {
      const res = await fetch(`${this.config.base_url}/api/v2/summary.json`, {
        signal: AbortSignal.timeout(10000),
        headers: { "User-Agent": "NeuGravity-StatusBot/1.0", Accept: "application/json" },
        next: { revalidate: 0 },
      })

      if (!res.ok) {
        return { provider_id: this.config.provider_id, checked_at, status: "unknown", raw_status: `HTTP ${res.status}`, incidents: [] }
      }

      const data: StatuspageSummary = await res.json()
      const indicator = data.status?.indicator ?? "unknown"
      const status = this.normalizeStatus(indicator)

      const activeIncidents = [...(data.incidents ?? []), ...(data.scheduled_maintenances ?? [])]

      const incidents: StatusConnectorIncident[] = activeIncidents.map((inc) => {
        const updates: StatusConnectorUpdate[] = (inc.incident_updates ?? []).map((u) => ({
          external_id: u.id,
          status: u.status,
          message: u.body,
          published_at: u.created_at,
        }))

        return {
          external_id: inc.id,
          title: inc.name,
          status: this.normalizeIncidentStatus(inc.status),
          impact: this.normalizeImpact(inc.impact),
          started_at: inc.created_at,
          resolved_at: inc.resolved_at ?? undefined,
          official_url: inc.shortlink ?? undefined,
          updates,
        }
      })

      return { provider_id: this.config.provider_id, checked_at, status, raw_status: indicator, incidents }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      return { provider_id: this.config.provider_id, checked_at, status: "unknown", raw_status: msg, incidents: [] }
    }
  }
}
