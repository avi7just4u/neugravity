import { NextRequest, NextResponse } from "next/server"
import { SearchService } from "@/lib/search/search.service"
import { createAdminClient } from "@/lib/supabase/server"

// In-process dedup: prevents logging the same (session, query) within 60s
// Works per Vercel instance; cross-instance duplicates within the window are acceptable.
const recentLogKeys = new Map<string, number>()
const LOG_DEDUP_TTL_MS = 60_000

async function logSearchQuery(
  query: string,
  resultsCount: number,
  sessionId: string | null
): Promise<void> {
  try {
    const normalized = query.toLowerCase().replace(/[^a-z0-9]/g, "")
    if (!normalized || normalized.length < 2) return

    // Sanitize session_id — opaque token only, max 128 chars, no spaces
    const safeSession = sessionId
      ? sessionId.replace(/[^a-zA-Z0-9_\-]/g, "").slice(0, 128) || null
      : null

    // Dedup: skip if same (session, query) logged within TTL window
    if (safeSession) {
      const key = `${safeSession}:${normalized}`
      const lastTs = recentLogKeys.get(key)
      if (lastTs && Date.now() - lastTs < LOG_DEDUP_TTL_MS) return
      recentLogKeys.set(key, Date.now())

      // Periodic cleanup to bound Map size
      if (recentLogKeys.size > 2000) {
        const cutoff = Date.now() - LOG_DEDUP_TTL_MS
        for (const [k, ts] of recentLogKeys.entries()) {
          if (ts < cutoff) recentLogKeys.delete(k)
        }
      }
    }

    const db = createAdminClient()
    await db.from("search_query_log").insert({
      query: query.slice(0, 500),
      normalized: normalized.slice(0, 200),
      results_count: Math.max(0, resultsCount), // server-derived, never negative
      session_id: safeSession,
      // user_id intentionally omitted — search is public, do not log identity
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
