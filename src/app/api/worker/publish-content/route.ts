import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

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
    .select("id, title, slug, status, content, summary, metadata")
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

  const now = new Date().toISOString()

  // Save revision before publishing
  await db.from("content_revisions").insert({
    content_type: "news_item",
    content_id: news_item_id,
    title: item.title,
    content: item.content,
    summary: item.summary,
    metadata: item.metadata,
    created_by: published_by ?? null,
    created_at: now,
  })

  // Publish
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

  // Invalidate ISR caches
  revalidatePath("/news")
  revalidatePath(`/news/${item.slug}`)
  revalidatePath("/")

  return NextResponse.json({ published: true, slug: item.slug })
}
