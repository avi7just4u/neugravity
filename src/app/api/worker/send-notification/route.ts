import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { NotificationService } from "@/lib/services/notification.service"

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-worker-secret")
  if (secret !== process.env.WORKER_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let notification_id: string
  try {
    const body = await request.json()
    notification_id = body.notification_id
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  if (!notification_id) {
    return NextResponse.json({ error: "notification_id is required" }, { status: 400 })
  }

  const db = createAdminClient()
  const { data: notification, error } = await db
    .from("notifications")
    .select("*")
    .eq("id", notification_id)
    .single()

  if (error || !notification) {
    return NextResponse.json({ error: "Notification not found" }, { status: 404 })
  }

  // event_type stores the channel in our mapping
  const channel = (notification.event_type as string) ?? "admin"
  const metadata = {} as Record<string, unknown>

  try {
    if (channel === "webhook" && metadata.webhook_url) {
      await fetch(metadata.webhook_url as string, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: channel,
          entity_type: notification.entity_type,
          entity_id: notification.entity_id,
          subject: notification.title,
          body: notification.body,
          timestamp: new Date().toISOString(),
        }),
      })
    } else if (channel === "slack" && metadata.webhook_url) {
      await fetch(metadata.webhook_url as string, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `*${notification.title}*\n${notification.body ?? ""}` }),
      })
    }
    // email and admin channels: mark as sent (no external call)

    await NotificationService.markSent(notification_id)
    return NextResponse.json({ notification_id, channel, success: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await NotificationService.markFailed(notification_id, msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
