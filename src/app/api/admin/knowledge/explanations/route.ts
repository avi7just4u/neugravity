import { NextRequest, NextResponse } from "next/server"
import { requireAdminAuth } from "@/lib/auth/admin-auth"
import { ExplanationService } from "@/lib/services/explanation.service"
import { AuditService } from "@/lib/services/audit.service"
import type { ExplanationType } from "@/types"

const VALID_TYPES: ExplanationType[] = ["quick", "simple", "beginner", "technical", "architect"]

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth(["admin", "editor", "author"])
  if (auth instanceof NextResponse) return auth

  try {
    const body = await req.json()
    const { technology_id, explanation_type, title, content } = body

    if (!technology_id || typeof technology_id !== "string") {
      return NextResponse.json({ error: "technology_id required" }, { status: 400 })
    }
    if (!explanation_type || !VALID_TYPES.includes(explanation_type)) {
      return NextResponse.json({ error: "Invalid explanation_type" }, { status: 400 })
    }
    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json({ error: "content required" }, { status: 400 })
    }

    const explanation = await ExplanationService.createDraft({
      technology_id,
      explanation_type,
      ...(typeof title === "string" && title.trim() ? { title: title.trim() } : {}),
      content: content.trim(),
      generated_by: "editor",
    })

    await AuditService.log({
      actor_id: auth.userId,
      actor_email: auth.email,
      action: "knowledge.explanation.create",
      entity_type: "technology_explanation",
      entity_id: explanation.id,
      summary: `Created ${explanation_type} explanation for technology ${technology_id}`,
    })

    return NextResponse.json(explanation, { status: 201 })
  } catch (err) {
    console.error("[explanations POST]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
