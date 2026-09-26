import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { requireAdminAuth } from "@/lib/auth/admin-auth"
import { AuditService } from "@/lib/services/audit.service"

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminAuth(["admin", "super_admin", "editor"])
  if (authResult instanceof NextResponse) return authResult
  const { userId, email } = authResult

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

    await AuditService.log({
      actor_id: userId,
      actor_email: email,
      action: "run_source",
      entity_type: "source",
      entity_id: id,
      summary: `Manually triggered fetch for source ${id}`,
    })

    return NextResponse.json({ queued: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
