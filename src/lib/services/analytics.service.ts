import { createServiceClient } from "@/lib/supabase/server"

export const AnalyticsService = {
  async track(event: {
    type: string
    sessionId?: string
    userId?: string
    pagePath?: string
    entityType?: string
    entityId?: string
    properties?: Record<string, unknown>
  }): Promise<void> {
    // Fire-and-forget — never propagate errors to callers
    try {
      const supabase = await createServiceClient()
      await supabase.from("analytics_events").insert({
        event_type: event.type,
        session_id: event.sessionId ?? null,
        user_id: event.userId ?? null,
        page_path: event.pagePath ?? null,
        entity_type: event.entityType ?? null,
        entity_id: event.entityId ?? null,
        properties: event.properties ?? {},
      })
    } catch {
      // Intentionally swallowed
    }
  },
}
