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
      .from("source_items")
      .update({ processing_status: "rejected" })
      .eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ status: "rejected" })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
