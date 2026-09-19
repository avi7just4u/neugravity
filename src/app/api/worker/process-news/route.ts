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
  const headline = (item.title ?? "Untitled") as string
  const slug = `${slugify(headline)}-${Date.now()}`

  // Idempotency: check if a news_item already references this canonical_url
  if (item.canonical_url) {
    const { data: existing } = await db
      .from("news_items")
      .select("id")
      .eq("canonical_url", item.canonical_url)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ skipped: true, news_item_id: existing.id })
    }
  }

  // Create news_item in draft — humans approve before publishing
  // Uses actual news_items schema: headline, summary, body, canonical_url, source_published_at
  const { data: newsItem, error } = await db
    .from("news_items")
    .insert({
      headline,
      slug,
      summary: (meta.summary as string) ?? item.description ?? null,
      body: item.content ?? item.description ?? null,
      canonical_url: item.canonical_url ?? null,
      source_published_at: item.source_published_at ?? null,
      status: "draft",
      importance: 5,
      discovered_at: new Date().toISOString(),
      needs_verification: true,
    })
    .select("id")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Record source provenance in news_sources
  if (item.source_id && item.canonical_url) {
    await db.from("news_sources").insert({
      news_item_id: newsItem.id,
      source_id: item.source_id,
      source_url: item.canonical_url,
      published_at: item.source_published_at ?? null,
    }).select().maybeSingle()
  }

  // Notify editorial queue
  await JobService.enqueue({
    queue_name: "notifications",
    job_type: "NOTIFY_EDITORIAL_QUEUE",
    payload: { news_item_id: newsItem.id, headline },
    priority: 3,
    idempotency_key: `notify-editorial:${newsItem.id}`,
  })

  return NextResponse.json({ created: true, news_item_id: newsItem.id, status: "draft" })
}
