import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = createAdminClient()

    const { error } = await db
      .from("jobs")
      .update({
        status: "queued",
        error: null,
        scheduled_for: new Date().toISOString(),
      })
      .eq("id", id)
      .in("status", ["failed", "dead_lettered"])

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ status: "queued" })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
