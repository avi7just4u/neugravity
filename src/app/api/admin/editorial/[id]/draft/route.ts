import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { requireAdminAuth } from "@/lib/auth/admin-auth"
import { AuditService } from "@/lib/services/audit.service"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminAuth(["admin", "super_admin", "editor", "author"])
  if (authResult instanceof NextResponse) return authResult
  const { userId, email } = authResult

  const { id } = await params
  const body = await request.json()
  const { headline, summary, category, tags } = body

  const db = createAdminClient()

  // Update source_item metadata with editor overrides
  const { data: item } = await db
    .from("source_items")
    .select("metadata")
    .eq("id", id)
    .single()

  const existingMeta = (item?.metadata ?? {}) as Record<string, unknown>
  await db.from("source_items").update({
    metadata: {
      ...existingMeta,
      ...(summary !== undefined && { summary }),
      ...(category !== undefined && { category }),
      ...(tags !== undefined && { tags }),
      editor_override: true,
    },
    ...(category !== undefined && { processing_status: item ? undefined : "ready_for_review" }),
    updated_at: new Date().toISOString(),
  }).eq("id", id)

  // Also update associated news_item if it exists
  const updateNews: Record<string, unknown> = {}
  if (headline !== undefined) updateNews.headline = headline
  if (summary !== undefined) updateNews.summary = summary

  if (Object.keys(updateNews).length > 0) {
    await db.from("news_items").update(updateNews).eq("source_item_id", id)
  }

  await AuditService.log({
    actor_id: userId,
    actor_email: email,
    action: "edit",
    entity_type: "source_item",
    entity_id: id,
    summary: `Edited draft for source item ${id}`,
    metadata: { fields: Object.keys(body) },
  })

  return NextResponse.json({ saved: true })
}
