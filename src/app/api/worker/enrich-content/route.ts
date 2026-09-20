import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { DeduplicationService, hashContent } from "@/lib/services/deduplication.service"
import { AIService } from "@/lib/services/ai.service"
import { JobService } from "@/lib/services/job.service"

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-worker-secret")
  if (secret !== process.env.WORKER_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { source_item_id } = await request.json()
  if (!source_item_id) {
    return NextResponse.json({ error: "source_item_id required" }, { status: 400 })
  }

  const db = createAdminClient()

  const { data: item, error: fetchErr } = await db
    .from("source_items")
    .select("id, source_id, title, content, description, canonical_url, external_id, content_type, processing_status")
    .eq("id", source_item_id)
    .single()

  if (fetchErr || !item) {
    return NextResponse.json({ error: "Source item not found" }, { status: 404 })
  }

  if (item.processing_status === "ready_for_review" || item.processing_status === "rejected") {
    return NextResponse.json({ skipped: true, reason: item.processing_status })
  }

  const text = item.content ?? item.description ?? ""
  const contentHash = hashContent(item.title ?? "", text)

  // Deduplication check
  const { isDuplicate, existingId, strategy } = await DeduplicationService.check({
    canonical_url: item.canonical_url,
    external_id: item.external_id,
    source_id: item.source_id,
    source_item_id: source_item_id,
    title: item.title ?? "",
    content: text,
    content_hash: contentHash,
  })

  if (isDuplicate) {
    await db
      .from("source_items")
      .update({ processing_status: "rejected", metadata: { duplicate_of: existingId, strategy } })
      .eq("id", source_item_id)
    return NextResponse.json({ deduplicated: true, existingId, strategy })
  }

  // AI enrichment
  const [summary, classification, entities, tags] = await Promise.all([
    AIService.generateSummary(item.title ?? "", text, source_item_id),
    AIService.classify(item.title ?? "", text, source_item_id),
    AIService.extractEntities(item.title ?? "", text, source_item_id),
    AIService.generateTags(item.title ?? "", text, source_item_id),
  ])

  const enrichment = {
    summary,
    category: classification.category,
    subcategory: classification.subcategory,
    entities,
    tags,
    content_hash: contentHash,
  }

  await db
    .from("source_items")
    .update({
      processing_status: "ready_for_review",
      content_hash: contentHash,
      metadata: enrichment,
    })
    .eq("id", source_item_id)

  // Enqueue for news processing if it's a news-type item
  if (item.content_type === "news" || item.content_type === "article") {
    await JobService.enqueue({
      queue_name: "news-processing",
      job_type: "PROCESS_NEWS_ITEM",
      payload: { source_item_id, enrichment },
      priority: 5,
      idempotency_key: `news:${source_item_id}`,
    })
  }

  return NextResponse.json({ enriched: true, tags, category: classification.category })
}
