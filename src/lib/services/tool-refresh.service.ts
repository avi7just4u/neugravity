import { createAdminClient } from "@/lib/supabase/server"
import type { Tool, ToolChangeEvent, RefreshPolicy } from "@/types"
import { JobService } from "./job.service"

export const ToolRefreshService = {
  async getDueTools(field_group: "pricing" | "metadata" | "features" | "availability"): Promise<Tool[]> {
    const db = createAdminClient()

    const { data: policy } = await db
      .from("refresh_policies")
      .select("refresh_interval_seconds")
      .eq("entity_type", "tool")
      .eq("field_group", field_group)
      .eq("enabled", true)
      .maybeSingle()

    if (!policy) return []

    const cutoff = new Date(Date.now() - policy.refresh_interval_seconds * 1000).toISOString()

    const { data } = await db
      .from("tools")
      .select("*")
      .eq("published", true)
      .lt("updated_at", cutoff)
      .order("updated_at", { ascending: true })
      .limit(50)

    return (data ?? []) as Tool[]
  },

  async recordVerified(tool_id: string, _field_group: string): Promise<void> {
    const db = createAdminClient()
    await db
      .from("tools")
      .update({ last_verified_at: new Date().toISOString() })
      .eq("id", tool_id)
  },

  async detectChanges(
    tool_id: string,
    field_group: string,
    old_data: Record<string, unknown>,
    new_data: Record<string, unknown>,
    source_id?: string
  ): Promise<number> {
    const db = createAdminClient()
    let count = 0

    for (const [key, newVal] of Object.entries(new_data)) {
      const oldVal = old_data[key]
      const newStr = newVal != null ? String(newVal) : null
      const oldStr = oldVal != null ? String(oldVal) : null

      if (newStr !== oldStr) {
        await db.from("tool_change_events").insert({
          tool_id,
          field_name: key,
          old_value: oldStr,
          new_value: newStr,
          source_id: source_id ?? null,
          detected_at: new Date().toISOString(),
          verification_status: "pending",
          auto_applied: false,
          field_group,
        })
        count++
      }
    }

    return count
  },

  async getPendingChanges(limit = 50): Promise<ToolChangeEvent[]> {
    const db = createAdminClient()
    const { data } = await db
      .from("tool_change_events")
      .select("*, tools(name, slug)")
      .eq("verification_status", "pending")
      .order("detected_at", { ascending: false })
      .limit(limit)
    return (data ?? []) as ToolChangeEvent[]
  },

  async approveChange(change_id: string, user_id: string): Promise<void> {
    const db = createAdminClient()

    const { data: change } = await db
      .from("tool_change_events")
      .select("*")
      .eq("id", change_id)
      .single()

    if (!change || change.verification_status !== "pending") return

    await db
      .from("tool_change_events")
      .update({
        verification_status: "verified",
        verified_at: new Date().toISOString(),
        verified_by: user_id,
      })
      .eq("id", change_id)

    if (change.new_value !== null) {
      await db
        .from("tools")
        .update({ [change.field_name]: change.new_value })
        .eq("id", change.tool_id)
    }
  },

  async rejectChange(change_id: string, user_id: string): Promise<void> {
    const db = createAdminClient()
    await db
      .from("tool_change_events")
      .update({
        verification_status: "rejected",
        verified_at: new Date().toISOString(),
        verified_by: user_id,
      })
      .eq("id", change_id)
  },

  async getChangeHistory(tool_id: string, field_name?: string): Promise<ToolChangeEvent[]> {
    const db = createAdminClient()
    let q = db
      .from("tool_change_events")
      .select("*")
      .eq("tool_id", tool_id)
      .order("detected_at", { ascending: false })
      .limit(100)

    if (field_name) q = q.eq("field_name", field_name)

    const { data } = await q
    return (data ?? []) as ToolChangeEvent[]
  },

  async scheduleRefreshes(): Promise<{ queued: number }> {
    const fieldGroups: Array<"pricing" | "metadata" | "features" | "availability"> = [
      "pricing",
      "metadata",
      "features",
      "availability",
    ]

    let queued = 0

    for (const fg of fieldGroups) {
      const tools = await this.getDueTools(fg)
      for (const tool of tools) {
        const result = await JobService.enqueue({
          queue_name: "tool-refresh",
          job_type: "REFRESH_TOOL",
          payload: { tool_id: tool.id, field_group: fg },
          priority: 3,
          idempotency_key: `tool-refresh:${tool.id}:${fg}:${new Date().toISOString().slice(0, 10)}`,
        })
        if (result) queued++
      }
    }

    return { queued }
  },
}
