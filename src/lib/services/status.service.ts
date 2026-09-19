import { createAdminClient } from "@/lib/supabase/server"
import { getStatusConnector } from "@/lib/connectors/status"
import type { StatusProvider, StatusIncident, StatusUpdate } from "@/types"

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

    // Use real connector if available
    const slug = (provider.slug ?? provider.name ?? "").toLowerCase()
    const connector = getStatusConnector(slug)

    if (!connector) {
      // Mark as unconfigured — do not invent status
      await db.from("status_providers").update({
        last_error: "No connector configured for this provider",
      }).eq("id", provider_id)
      return { incidents_created: 0, updates_added: 0, errors: ["No connector configured"] }
    }

    try {
      const result = await connector.fetchCurrentStatus()

      // Update provider with real status
      await db.from("status_providers").update({
        last_checked_at: result.checked_at,
        last_success_at: result.checked_at,
        last_error: null,
      }).eq("id", provider_id)

      for (const incident of result.incidents) {
        try {
          const { incident_id, is_new } = await this.upsertIncident(provider_id, {
            external_incident_id: incident.external_id,
            title: incident.title,
            status: incident.status,
            impact: incident.impact !== "maintenance" ? incident.impact : "minor",
            started_at: incident.started_at,
            resolved_at: incident.resolved_at,
            official_url: incident.official_url,
          })

          if (is_new) incidents_created++

          for (const update of incident.updates) {
            await this.addStatusUpdate(incident_id, {
              external_update_id: update.external_id,
              status: update.status,
              message: update.message,
              published_at: update.published_at,
              raw_payload: { source: slug },
            })
            updates_added++
          }
        } catch (err) {
          errors.push(err instanceof Error ? err.message : String(err))
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      await db.from("status_providers").update({
        last_error: msg,
      }).eq("id", provider_id)
      errors.push(msg)
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
      resolved_at?: string
      official_url?: string
    }
  ): Promise<{ incident_id: string; is_new: boolean }> {
    const db = createAdminClient()

    // Deduplicate by external_incident_id (the correct approach)
    if (data.external_incident_id) {
      const { data: existing } = await db
        .from("status_incidents")
        .select("id")
        .eq("provider_id", provider_id)
        .eq("external_incident_id", data.external_incident_id)
        .maybeSingle()

      if (existing) {
        // Update status if changed
        await db.from("status_incidents").update({
          status: data.status,
          resolved_at: data.resolved_at ?? null,
          last_updated_at: new Date().toISOString(),
          checked_at: new Date().toISOString(),
        }).eq("id", existing.id)
        return { incident_id: existing.id, is_new: false }
      }
    }

    const { data: inserted, error } = await db
      .from("status_incidents")
      .insert({
        provider_id,
        external_incident_id: data.external_incident_id ?? null,
        title: data.title,
        status: data.status,
        severity: data.impact ?? null,
        impact: data.impact ?? null,
        started_at: data.started_at,
        resolved_at: data.resolved_at ?? null,
        source_url: data.official_url ?? null,
        checked_at: new Date().toISOString(),
        last_updated_at: new Date().toISOString(),
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
