import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

const XML_CONTENT_TYPES = [
  "application/rss+xml",
  "application/atom+xml",
  "application/xml",
  "text/xml",
]

async function fetchAndValidateFeed(url: string): Promise<{ ok: boolean; error?: string; itemCount?: number }> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "NeuGravity-Verify/1.0" },
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` }

    const contentType = res.headers.get("content-type") ?? ""
    const body = await res.text()

    const looksLikeXml = body.trimStart().startsWith("<")
    const isXmlContentType = XML_CONTENT_TYPES.some((ct) => contentType.includes(ct)) || contentType.includes("text/html")

    if (!looksLikeXml && !isXmlContentType) {
      return { ok: false, error: `Unexpected content-type: ${contentType}` }
    }

    if (!looksLikeXml) {
      return { ok: false, error: "Response body does not look like XML" }
    }

    // Count items to confirm it's a real feed
    const itemCount = (body.match(/<item[\s>]/gi) ?? []).length + (body.match(/<entry[\s>]/gi) ?? []).length

    return { ok: true, itemCount }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = createAdminClient()

    const { data: source, error: fetchError } = await db
      .from("sources")
      .select("id, name, feed_url, health_status")
      .eq("id", id)
      .single()

    if (fetchError || !source) {
      return NextResponse.json({ ok: false, error: "Source not found" }, { status: 404 })
    }

    const feedUrl = (source as { feed_url?: string | null }).feed_url
    if (!feedUrl) {
      return NextResponse.json({ ok: false, error: "No feed_url configured" }, { status: 400 })
    }

    const result = await fetchAndValidateFeed(feedUrl)

    if (result.ok) {
      await db
        .from("sources")
        .update({
          health_status: "healthy",
          active: true,
          last_success_at: new Date().toISOString(),
          last_error: null,
          failure_count: 0,
        })
        .eq("id", id)

      return NextResponse.json({ ok: true, active: true, itemCount: result.itemCount })
    } else {
      await db
        .from("sources")
        .update({
          health_status: "failed",
          last_error: result.error ?? "Verification failed",
          last_error_at: new Date().toISOString(),
        })
        .eq("id", id)

      return NextResponse.json({ ok: false, error: result.error })
    }
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
