import { NextRequest, NextResponse } from "next/server"
import { requireAdminAuth } from "@/lib/auth/admin-auth"
import { ExplanationService } from "@/lib/services/explanation.service"
import { AuditService } from "@/lib/services/audit.service"
import type { ExplanationType } from "@/types"

const VALID_TYPES: ExplanationType[] = ['quick', 'simple', 'beginner', 'technical', 'architect']

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth(["admin", "editor", "author"])
  if (auth instanceof NextResponse) return auth

  const body = await req.json()
  const { technology_id, explanation_type } = body

  if (!technology_id || !explanation_type) {
    return NextResponse.json({ error: "technology_id and explanation_type required" }, { status: 400 })
  }
  if (!VALID_TYPES.includes(explanation_type as ExplanationType)) {
    return NextResponse.json({ error: "Invalid explanation_type" }, { status: 400 })
  }

  try {
    const draft = await ExplanationService.generateDraft(technology_id, explanation_type as ExplanationType)

    await AuditService.log({
      actor_id: auth.userId,
      actor_email: auth.email,
      action: "knowledge.explanation.generate",
      entity_type: "technology_explanation",
      entity_id: draft.id,
      summary: `AI draft generated for ${technology_id} / ${explanation_type}`,
      metadata: { technology_id, explanation_type, status: "draft" },
    })

    return NextResponse.json(draft, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    if (message === "AI_NOT_CONFIGURED") {
      return NextResponse.json({ error: "AI provider not configured" }, { status: 503 })
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
