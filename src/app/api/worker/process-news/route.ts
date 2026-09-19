import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { JobService } from "@/lib/services/job.service"

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
    .replace(/^-|-$/g, "")
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-worker-secret")
  if (secret !== process.env.WORKER_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { source_item_id, enrichment } = await request.json()
  if (!source_item_id) {
    return NextResponse.json({ error: "source_item_id required" }, { status: 400 })
  }

  const db = createAdminClient()

  const { data: item } = await db
    .from("source_items")
    .select("id, title, description, content, canonical_url, author, source_published_at, source_id, metadata")
    .eq("id", source_item_id)
    .single()

  if (!item) {
    return NextResponse.json({ error: "Source item not found" }, { status: 404 })
  }

  const meta = (enrichment ?? item.metadata ?? {}) as Record<string, unknown>
  const title = (item.title ?? "Untitled") as string
  const slug = slugify(title)

  // Check if news item already exists for this source item
  const { data: existing } = await db
    .from("news_items")
    .select("id")
    .eq("source_item_id", source_item_id)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ skipped: true, news_item_id: existing.id })
  }

  // Create news_item in draft — humans approve before publishing
  const { data: newsItem, error } = await db
    .from("news_items")
    .insert({
      title,
      slug: `${slug}-${Date.now()}`,
      summary: (meta.summary as string) ?? item.description ?? "",
      content: item.content ?? item.description ?? "",
      source_url: item.canonical_url ?? null,
      source_id: item.source_id,
      source_item_id: source_item_id,
      author: item.author ?? null,
      published_at: item.source_published_at ?? null,
      status: "draft",
      tags: (meta.tags as string[]) ?? [],
      category: (meta.category as string) ?? null,
      metadata: meta,
    })
    .select("id")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Enqueue search indexing — will run after editorial approval, not now
  // Enqueue notification job
  await JobService.enqueue({
    queue_name: "notifications",
    job_type: "NOTIFY_EDITORIAL_QUEUE",
    payload: { news_item_id: newsItem.id, title },
    priority: 3,
    idempotency_key: `notify-editorial:${newsItem.id}`,
  })

  return NextResponse.json({ created: true, news_item_id: newsItem.id, status: "draft" })
}
