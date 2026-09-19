import { NextRequest, NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { JobService } from "@/lib/services/job.service"

export async function POST(request: NextRequest) {
  const auth = await createClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { source_item_id } = await request.json()
  if (!source_item_id) return NextResponse.json({ error: "source_item_id required" }, { status: 400 })

  const db = createAdminClient()

  await db.from("source_items").update({ processing_status: "approved" }).eq("id", source_item_id)

  // Enqueue news processing if not already done
  await JobService.enqueue({
    queue_name: "news-processing",
    job_type: "PROCESS_NEWS_ITEM",
    payload: { source_item_id },
    priority: 8,
    idempotency_key: `news:${source_item_id}`,
  })

  // Also approve associated news_item
  await db.from("news_items").update({ status: "approved" }).eq("source_item_id", source_item_id)

  return NextResponse.json({ approved: true })
}
