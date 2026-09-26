import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { requireAdminAuth } from "@/lib/auth/admin-auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminAuth()
  if (authResult instanceof NextResponse) return authResult

  const { id } = await params
  const db = createAdminClient()

  const { data: item } = await db
    .from("source_items")
    .select("id, title, canonical_url, source_id, external_id, content_hash, discovered_at, source_published_at, metadata")
    .eq("id", id)
    .single()

  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { data: source } = await db
    .from("sources")
    .select("id, name, domain, website_url, trust_level, trust_level_label, source_priority")
    .eq("id", item.source_id)
    .maybeSingle()

  const { data: newsItem } = await db
    .from("news_items")
    .select("id, headline, slug, status, published_at")
    .eq("source_item_id", id)
    .maybeSingle()

  const meta = (item.metadata ?? {}) as Record<string, unknown>

  return NextResponse.json({
    source_item: {
      id: item.id,
      title: item.title,
      canonical_url: item.canonical_url,
      external_id: item.external_id,
      content_hash: item.content_hash,
      discovered_at: item.discovered_at,
      source_published_at: item.source_published_at,
    },
    source: source ?? null,
    news_item: newsItem ?? null,
    enrichment: {
      prompt_version: (meta.prompt_version as string) ?? null,
      editor_override: Boolean(meta.editor_override),
      category: (meta.category as string) ?? null,
      tags: (meta.tags as string[]) ?? [],
    },
  })
}
