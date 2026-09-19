import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = createAdminClient()

    const { error } = await db.from("jobs").insert({
      type: "FETCH_SOURCE",
      payload: { source_id: id, trigger: "manual" },
      status: "queued",
      priority: 10,
      max_attempts: 3,
      attempt_count: 0,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ queued: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
