import { NextRequest, NextResponse } from "next/server"
import { requireAdminAuth } from "@/lib/auth/admin-auth"
import { OpportunityService } from "@/lib/services/opportunity.service"

export const dynamic = "force-dynamic"

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminAuth(["admin", "super_admin", "editor"])
  if (authResult instanceof NextResponse) return authResult
  const { userId, email } = authResult

  const { id } = await params
  const ok = await OpportunityService.updateStatus(id, "dismissed", { id: userId, email })

  if (!ok) return NextResponse.json({ error: "Dismiss failed" }, { status: 500 })
  return NextResponse.json({ ok: true, status: "dismissed" })
}
