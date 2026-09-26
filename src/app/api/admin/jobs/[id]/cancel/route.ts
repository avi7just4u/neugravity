import { NextRequest, NextResponse } from "next/server"
import { JobService } from "@/lib/services/job.service"
import { requireAdminAuth } from "@/lib/auth/admin-auth"
import { AuditService } from "@/lib/services/audit.service"

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminAuth(["admin", "super_admin", "editor"])
  if (authResult instanceof NextResponse) return authResult
  const { userId, email } = authResult

  const { id } = await params
  await JobService.cancel(id)

  await AuditService.log({
    actor_id: userId,
    actor_email: email,
    action: "cancel_job",
    entity_type: "job",
    entity_id: id,
    summary: `Cancelled job ${id}`,
  })

  return NextResponse.json({ success: true })
}
