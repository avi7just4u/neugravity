import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { requireAdminAuth } from "@/lib/auth/admin-auth"
import { AuditService } from "@/lib/services/audit.service"

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminAuth(["admin", "super_admin", "editor", "reviewer"])
  if (authResult instanceof NextResponse) return authResult
  const { userId, email } = authResult

  try {
    const { id } = await params
    const db = createAdminClient()

    const { error } = await db
      .from("source_items")
      .update({ processing_status: "approved" })
      .eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await AuditService.log({
      actor_id: userId,
      actor_email: email,
      action: "approve",
      entity_type: "source_item",
      entity_id: id,
      summary: `Approved source item ${id}`,
    })

    return NextResponse.json({ status: "approved" })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
