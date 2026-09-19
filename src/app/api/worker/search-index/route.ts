import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { SearchIndexingService } from "@/lib/services/search-indexing.service"

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-worker-secret")
  if (secret !== process.env.WORKER_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let entity_type: string
  let entity_id: string

  try {
    const body = await request.json()
    entity_type = body.entity_type
    entity_id = body.entity_id
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  if (!entity_type || !entity_id) {
    return NextResponse.json({ error: "entity_type and entity_id are required" }, { status: 400 })
  }

  try {
    const db = createAdminClient()
    const tableMap: Record<string, string> = {
      news: "news_articles",
      tool: "tools",
      technology: "technologies",
      company: "companies",
    }

    const table = tableMap[entity_type]
    if (table) {
      const { data } = await db.from(table).select("id, metadata").eq("id", entity_id).maybeSingle()
      if (data) {
        const metadata = (data.metadata as Record<string, unknown>) ?? {}
        await db
          .from(table)
          .update({
            metadata: { ...metadata, indexed_at: new Date().toISOString() },
            updated_at: new Date().toISOString(),
          })
          .eq("id", entity_id)
      }
    }

    await SearchIndexingService.markIndexed(entity_type, entity_id)

    return NextResponse.json({ entity_type, entity_id, success: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
