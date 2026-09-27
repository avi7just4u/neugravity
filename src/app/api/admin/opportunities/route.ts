import { NextRequest, NextResponse } from "next/server"
import { requireAdminAuth } from "@/lib/auth/admin-auth"
import { OpportunityService } from "@/lib/services/opportunity.service"
import type { OpportunityContentType, OpportunityStatus, OpportunityPriority, OpportunitySource, GapType } from "@/types"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const authResult = await requireAdminAuth(["admin", "super_admin", "editor", "analyst", "author", "reviewer"])
  if (authResult instanceof NextResponse) return authResult

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") ?? "1")
  const perPage = Math.min(parseInt(searchParams.get("per_page") ?? "25"), 100)
  const status = searchParams.get("status") as OpportunityStatus | null
  const priority = searchParams.get("priority") as OpportunityPriority | null
  const content_type = searchParams.get("content_type") as OpportunityContentType | null
  const source = searchParams.get("source") as OpportunitySource | null
  const gap_type = searchParams.get("gap_type") as GapType | null
  const assigned_to = searchParams.get("assigned_to")

  const result = await OpportunityService.list({
    status: status ?? undefined,
    priority: priority ?? undefined,
    content_type: content_type ?? undefined,
    source: source ?? undefined,
    gap_type: gap_type ?? undefined,
    assigned_to: assigned_to ?? undefined,
    page,
    perPage,
  })

  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdminAuth(["admin", "super_admin", "editor"])
  if (authResult instanceof NextResponse) return authResult
  const { userId, email } = authResult

  try {
    const body = await request.json()
    if (!body.topic || !body.content_type) {
      return NextResponse.json({ error: "topic and content_type are required" }, { status: 400 })
    }

    const opportunity = await OpportunityService.create(
      {
        topic: body.topic,
        title_suggestion: body.title_suggestion,
        content_type: body.content_type,
        audience: body.audience,
        reason: body.reason,
        why_now: body.why_now,
        gap_type: body.gap_type,
        priority: body.priority ?? "medium",
        source: body.source ?? "manual",
        related_entity_type: body.related_entity_type,
        related_entity_id: body.related_entity_id,
        related_entity_name: body.related_entity_name,
        enterprise_relevance: body.enterprise_relevance ?? "low",
        target_publish_date: body.target_publish_date,
        brief: body.brief,
        metadata: body.metadata,
        created_by: userId,
        created_by_type: "editor",
      },
      { id: userId, email }
    )

    if (!opportunity) {
      return NextResponse.json(
        { error: "Duplicate opportunity or creation failed" },
        { status: 409 }
      )
    }

    return NextResponse.json(opportunity, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
