import { NextRequest, NextResponse } from "next/server"
import { SearchService } from "@/lib/search/search.service"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")?.trim()
  const types = searchParams.get("types")?.split(",").filter(Boolean)
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50)

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
