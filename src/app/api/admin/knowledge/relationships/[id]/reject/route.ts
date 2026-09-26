import { NextRequest, NextResponse } from "next/server"
import { requireAdminAuth } from "@/lib/auth/admin-auth"
import { KnowledgeService } from "@/lib/services/knowledge.service"
import { AuditService } from "@/lib/services/audit.service"

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth(["admin", "editor"])
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  await KnowledgeService.rejectRelationship(id)

  await AuditService.log({
    actor_id: auth.userId,
    actor_email: auth.email,
    action: "knowledge.relationship.reject",
    entity_type: "entity_relationship",
    entity_id: id,
    summary: `Rejected relationship ${id}`,
  })

  return NextResponse.json({ success: true })
}
