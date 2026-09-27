import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { QualityGateService } from "@/lib/services/quality-gate.service"

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-worker-secret")
  if (secret !== process.env.WORKER_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { news_item_id, published_by } = await request.json()
  if (!news_item_id) {
    return NextResponse.json({ error: "news_item_id required" }, { status: 400 })
  }

  const db = createAdminClient()

  const { data: item } = await db
    .from("news_items")
    .select("id, headline, slug, status, body, summary, category, tags")
    .eq("id", news_item_id)
    .single()

  if (!item) {
    return NextResponse.json({ error: "News item not found" }, { status: 404 })
  }

  if (item.status === "published") {
    return NextResponse.json({ skipped: true, reason: "already_published" })
  }

  if (item.status !== "approved") {
    return NextResponse.json({ error: "Item must be approved before publishing" }, { status: 422 })
  }

  const gate = QualityGateService.check({
    headline: item.headline,
    summary: item.summary,
    body: item.body,
    category: item.category,
    tags: item.tags,
  })

  if (!gate.passed) {
    return NextResponse.json(
      { error: "quality_gate_failed", missing: gate.missing, warnings: gate.warnings },
      { status: 422 }
    )
  }

  const now = new Date().toISOString()

  // Save revision before publishing — use correct content_revisions schema (snapshot jsonb)
  await db.from("content_revisions").insert({
    content_type: "news_item",
    content_id: news_item_id,
    version: 1,
    snapshot: {
      headline: item.headline,
      summary: item.summary,
      body: item.body,
      status_before: item.status,
    },
    change_summary: "Published",
    created_by: published_by ?? null,
  })

  const { error } = await db
    .from("news_items")
    .update({
      status: "published",
      published_at: now,
    })
    .eq("id", news_item_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  revalidatePath("/news")
  revalidatePath(`/news/${item.slug}`)
  revalidatePath("/")
  // Revalidate adjacent indexes that display news on homepage/feeds
  revalidatePath("/tech")
  revalidatePath("/tools")
  revalidatePath("/companies")

  return NextResponse.json({ published: true, slug: item.slug })
}
