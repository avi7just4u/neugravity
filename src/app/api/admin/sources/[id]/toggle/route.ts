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

    const { data: current, error: fetchError } = await db
      .from("sources")
      .select("active")
      .eq("id", id)
      .single()

    if (fetchError || !current) {
      return NextResponse.json({ error: "Source not found" }, { status: 404 })
    }

    const newActive = !(current as { active: boolean }).active
    const { error } = await db
      .from("sources")
      .update({
        active: newActive,
        health_status: newActive ? "unknown" : "disabled",
      })
      .eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await AuditService.log({
      actor_id: userId,
      actor_email: email,
      action: "toggle_source",
      entity_type: "source",
      entity_id: id,
      summary: `Source ${id} ${newActive ? "enabled" : "disabled"}`,
      metadata: { active: newActive },
    })

    return NextResponse.json({ active: newActive })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
