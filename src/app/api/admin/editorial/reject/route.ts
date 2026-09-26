import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { requireAdminAuth } from "@/lib/auth/admin-auth"
import { AuditService } from "@/lib/services/audit.service"

export async function POST(request: NextRequest) {
  const authResult = await requireAdminAuth(["admin", "super_admin", "editor", "reviewer"])
  if (authResult instanceof NextResponse) return authResult
  const { userId, email } = authResult

  const { source_item_id, reason } = await request.json()
  if (!source_item_id) return NextResponse.json({ error: "source_item_id required" }, { status: 400 })

  const db = createAdminClient()

  await db.from("source_items").update({
    processing_status: "rejected",
    metadata: reason ? { reject_reason: reason } : undefined,
  }).eq("id", source_item_id)

  await db.from("news_items").update({ status: "rejected" }).eq("source_item_id", source_item_id)

  await AuditService.log({
    actor_id: userId,
    actor_email: email,
    action: "reject",
    entity_type: "source_item",
    entity_id: source_item_id,
    summary: reason
      ? `Rejected source item ${source_item_id}: ${reason}`
      : `Rejected source item ${source_item_id}`,
    metadata: reason ? { reason } : undefined,
  })

  return NextResponse.json({ rejected: true })
}
