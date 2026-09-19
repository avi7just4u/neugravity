import { createAdminClient } from "@/lib/supabase/server"

// analytics_events: anon INSERT allowed via RLS policy added in migration 003.
// We still use admin client here so analytics works even if user has no active session.

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
      const supabase = createAdminClient()
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
