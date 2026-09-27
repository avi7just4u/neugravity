import { NextRequest, NextResponse } from "next/server"
import { requireAdminAuth } from "@/lib/auth/admin-auth"
import { OpportunityService } from "@/lib/services/opportunity.service"

export const dynamic = "force-dynamic"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminAuth(["admin", "super_admin", "editor", "analyst", "author", "reviewer"])
  if (authResult instanceof NextResponse) return authResult

  const { id } = await params
  const opportunity = await OpportunityService.getById(id)
  if (!opportunity) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(opportunity)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminAuth(["admin", "super_admin", "editor"])
  if (authResult instanceof NextResponse) return authResult
  const { userId, email } = authResult

  try {
    const { id } = await params
    const body = await request.json()

    // Status transition
    if (body.status) {
      const ok = await OpportunityService.updateStatus(
        id,
        body.status,
        { id: userId, email },
        { assigned_to: body.assigned_to, target_publish_date: body.target_publish_date }
      )
      if (!ok) return NextResponse.json({ error: "Update failed" }, { status: 500 })
      return NextResponse.json({ ok: true })
    }

    // Field update
    const ok = await OpportunityService.update(
      id,
      {
        topic: body.topic,
        title_suggestion: body.title_suggestion,
        priority: body.priority,
        audience: body.audience,
        reason: body.reason,
        why_now: body.why_now,
        gap_type: body.gap_type,
        enterprise_relevance: body.enterprise_relevance,
        target_publish_date: body.target_publish_date,
        brief: body.brief,
      },
      { id: userId, email }
    )

    if (!ok) return NextResponse.json({ error: "Update failed" }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
