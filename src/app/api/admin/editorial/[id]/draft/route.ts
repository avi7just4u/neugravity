import { NextRequest, NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await createClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

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

  return NextResponse.json({ saved: true })
}
