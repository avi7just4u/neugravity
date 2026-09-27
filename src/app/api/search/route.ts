import { NextRequest, NextResponse } from "next/server"
import { SearchService } from "@/lib/search/search.service"
import { createAdminClient } from "@/lib/supabase/server"

async function logSearchQuery(
  query: string,
  resultsCount: number,
  sessionId: string | null
): Promise<void> {
  try {
    const normalized = query.toLowerCase().replace(/[^a-z0-9]/g, "")
    if (!normalized) return
    const db = createAdminClient()
    await db.from("search_query_log").insert({
      query: query.slice(0, 200),
      normalized: normalized.slice(0, 200),
      results_count: resultsCount,
      session_id: sessionId,
    })
  } catch {
    // Fire-and-forget — never fail the search response
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")?.trim()
  const types = searchParams.get("types")?.split(",").filter(Boolean)
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50)
  const sessionId = searchParams.get("session") ?? request.headers.get("x-session-id")

  if (!query) {
    return NextResponse.json(
      { results: [], total: 0, query: "", took_ms: 0, grouped: {} },
      { status: 200 }
    )
  }

  if (query.length < 2) {
    return NextResponse.json(
      { error: "Query must be at least 2 characters" },
      { status: 400 }
    )
  }

  try {
    const results = await SearchService.search(query, { types, limit })

    // Track search query asynchronously — never awaited in the hot path
    logSearchQuery(query, results.total, sessionId)

    return NextResponse.json(results, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    })
  } catch (error) {
    console.error("[search] Error:", error)
    return NextResponse.json(
      { error: "Search failed", results: [], total: 0, query, took_ms: 0 },
      { status: 500 }
    )
  }
}
