import { createAdminClient } from "@/lib/supabase/server"
import { JobService } from "./job.service"
import type { Notification, NotificationRule } from "@/types"

export const NotificationService = {
  async getActiveRules(): Promise<NotificationRule[]> {
    const db = createAdminClient()
    const { data } = await db
      .from("notification_rules")
      .select("*")
      .eq("enabled", true)
      .order("created_at")
    return (data ?? []) as NotificationRule[]
  },

  async evaluate(trigger: {
    event_type: string
    entity_type: string
    entity_id: string
    metadata?: Record<string, unknown>
  }): Promise<{ notifications_queued: number }> {
    const db = createAdminClient()
    const { data: rules } = await db
      .from("notification_rules")
      .select("*")
      .eq("event_type", trigger.event_type)
      .eq("enabled", true)

    if (!rules || rules.length === 0) return { notifications_queued: 0 }

    let queued = 0
    for (const rule of rules as NotificationRule[]) {
      const notificationId = await this.createNotification({
        rule_id: rule.id,
        channel: (rule.channels[0] ?? "admin"),
        subject: `[${rule.event_type}] ${trigger.entity_type}:${trigger.entity_id}`,
        body: JSON.stringify({ ...trigger, rule: rule.name }),
        metadata: trigger.metadata,
      })

      await JobService.enqueue({
        queue_name: "notifications",
        job_type: "SEND_NOTIFICATION",
        payload: { notification_id: notificationId },
        priority: 7,
        idempotency_key: `notify:${rule.id}:${trigger.entity_id}:${Date.now()}`,
      })
      queued++
    }

    return { notifications_queued: queued }
  },

  async createNotification(data: {
    rule_id?: string
    channel: string
    recipient?: string
    subject: string
    body: string
    metadata?: Record<string, unknown>
  }): Promise<string> {
    const db = createAdminClient()
    const { data: row, error } = await db
      .from("notifications")
      .insert({
        rule_id: data.rule_id ?? null,
        user_id: null,
        title: data.subject,
        body: data.body,
        event_type: data.channel,
        entity_type: null,
        entity_id: null,
      })
      .select("id")
      .single()

    if (error || !row) throw new Error(`Failed to create notification: ${error?.message}`)
    return row.id as string
  },

  async markSent(notification_id: string): Promise<void> {
    const db = createAdminClient()
    await db
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", notification_id)
  },

  async markFailed(notification_id: string, _error: string): Promise<void> {
    // Notifications table has no status column — just leave read_at null to indicate unprocessed
    void notification_id
  },

  async getPending(limit = 50): Promise<Notification[]> {
    const db = createAdminClient()
    const { data } = await db
      .from("notifications")
      .select("*")
      .is("read_at", null)
      .order("created_at", { ascending: false })
      .limit(limit)
    return (data ?? []) as Notification[]
  },

  async getHistory(limit = 50, channel?: string): Promise<Notification[]> {
    const db = createAdminClient()
    let q = db
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (channel) q = q.eq("event_type", channel)

    const { data } = await q
    return (data ?? []) as Notification[]
  },
}
