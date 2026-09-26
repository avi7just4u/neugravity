import { NextResponse, type NextRequest } from "next/server"
import { ToolRefreshService } from "@/lib/services/tool-refresh.service"
import { requireAdminAuth } from "@/lib/auth/admin-auth"
import { AuditService } from "@/lib/services/audit.service"

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminAuth(["admin", "super_admin", "editor"])
  if (authResult instanceof NextResponse) return authResult
  const { userId, email } = authResult

  const { id } = await params
  await ToolRefreshService.approveChange(id, userId)

  await AuditService.log({
    actor_id: userId,
    actor_email: email,
    action: "approve",
    entity_type: "tool_change",
    entity_id: id,
    summary: `Approved tool change ${id}`,
  })

  return NextResponse.json({ ok: true })
}
