import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      name: string
      domain: string
      source_type: string
      base_url?: string
      feed_url?: string
      api_url?: string
      parser_key?: string
      poll_interval_seconds?: number
      trust_level?: number
      notes?: string
    }

    if (!body.name?.trim() || !body.domain?.trim()) {
      return NextResponse.json({ error: "name and domain are required" }, { status: 400 })
    }

    const db = createAdminClient()
    const { data, error } = await db
      .from("sources")
      .insert({
        name: body.name.trim(),
        domain: body.domain.trim(),
        source_type: body.source_type ?? "rss",
        base_url: body.base_url || null,
        feed_url: body.feed_url || null,
        api_url: body.api_url || null,
        parser_key: body.parser_key || null,
        poll_interval_seconds: body.poll_interval_seconds ?? 3600,
        trust_level: body.trust_level ?? 5,
        notes: body.notes || null,
        active: false,
        health_status: "unknown",
        failure_count: 0,
        items_discovered: 0,
      })
      .select("id")
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
