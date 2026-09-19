import { NextRequest, NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const auth = await createClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { source_item_id, reason } = await request.json()
  if (!source_item_id) return NextResponse.json({ error: "source_item_id required" }, { status: 400 })

  const db = createAdminClient()

  await db.from("source_items").update({
    processing_status: "rejected",
    metadata: reason ? { reject_reason: reason } : undefined,
  }).eq("id", source_item_id)

  await db.from("news_items").update({ status: "rejected" }).eq("source_item_id", source_item_id)

  return NextResponse.json({ rejected: true })
}
