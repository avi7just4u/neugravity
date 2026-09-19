export interface StatusConnectorResult {
  provider_id: string
  checked_at: string
  status: "operational" | "degraded" | "partial_outage" | "major_outage" | "unknown"
  raw_status: string
  incidents: StatusConnectorIncident[]
}

export interface StatusConnectorIncident {
  external_id: string
  title: string
  status: "investigating" | "identified" | "monitoring" | "resolved" | "postmortem"
  impact: "none" | "minor" | "major" | "critical" | "maintenance"
  started_at: string
  resolved_at?: string
  official_url?: string
  updates: StatusConnectorUpdate[]
}

export interface StatusConnectorUpdate {
  external_id: string
  status: string
  message: string
  published_at: string
}

export interface StatusConnector {
  fetchCurrentStatus(): Promise<StatusConnectorResult>
  normalizeStatus(raw: string): StatusConnectorResult["status"]
}
