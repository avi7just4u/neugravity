import { createAdminClient } from "@/lib/supabase/server"

export interface AuditEntry {
  actor_id?: string
  actor_email?: string
  action: string
  entity_type: string
  /** UUID entity ID — pass null for non-UUID or unknown */
  entity_id?: string | null
  /** Human-readable summary of the action */
  summary?: string
  /** Arbitrary structured data */
  metadata?: Record<string, unknown>
}

export interface AuditLog extends AuditEntry {
  id: string
  created_at: string
  entity_id_text?: string | null
  old_values?: Record<string, unknown> | null
  new_values?: Record<string, unknown> | null
}

export const AuditService = {
  /**
   * Write an audit log entry. Never throws — failures are swallowed so they
   * never break the calling operation.
   */
  async log(entry: AuditEntry): Promise<void> {
    try {
      const svc = createAdminClient()

      // entity_id must be a valid UUID or null (DB column type is uuid)
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      const entityIdUuid =
        entry.entity_id && uuidRegex.test(entry.entity_id)
          ? entry.entity_id
          : null

      await svc.from("audit_logs").insert({
        user_id: entry.actor_id ?? null,
        actor_email: entry.actor_email ?? null,
        action: entry.action,
        entity_type: entry.entity_type,
        entity_id: entityIdUuid,
        entity_id_text: entry.entity_id ?? null,
        summary: entry.summary ?? null,
        metadata: entry.metadata ?? null,
        new_values: null,
        old_values: null,
      })
    } catch {
      // Never throw from audit logging — fail silently
    }
  },

  async getLogs(
    opts: {
      page?: number
      perPage?: number
      action?: string
      entity_type?: string
      actor_id?: string
    } = {}
  ): Promise<{ data: AuditLog[]; total: number }> {
    const { page = 1, perPage = 50, action, entity_type, actor_id } = opts
    const from = (page - 1) * perPage
    const to = from + perPage - 1

    const svc = createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: any = svc
      .from("audit_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to)

    if (action) query = query.eq("action", action)
    if (entity_type) query = query.eq("entity_type", entity_type)
    if (actor_id) query = query.eq("user_id", actor_id)

    const { data, count, error } = await query

    if (error) {
      // Table not ready or RLS issue — return empty rather than throwing
      return { data: [], total: 0 }
    }

    return { data: (data ?? []) as AuditLog[], total: count ?? 0 }
  },
}
