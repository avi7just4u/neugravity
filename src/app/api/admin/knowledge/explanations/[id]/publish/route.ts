import { NextRequest, NextResponse } from "next/server"
import { requireAdminAuth } from "@/lib/auth/admin-auth"
import { ExplanationService } from "@/lib/services/explanation.service"
import { AuditService } from "@/lib/services/audit.service"

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth(["admin", "editor"])
  if (auth instanceof NextResponse) return auth

  const { id } = await params

  await ExplanationService.approveExplanation(id, auth.userId)
  await ExplanationService.publishExplanation(id)

  await AuditService.log({
    actor_id: auth.userId,
    actor_email: auth.email,
    action: "knowledge.explanation.publish",
    entity_type: "technology_explanation",
    entity_id: id,
    summary: `Published explanation ${id}`,
  })

  return NextResponse.json({ success: true })
}
