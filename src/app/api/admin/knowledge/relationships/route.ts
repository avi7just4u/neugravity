import { NextRequest, NextResponse } from "next/server"
import { requireAdminAuth } from "@/lib/auth/admin-auth"
import { KnowledgeService } from "@/lib/services/knowledge.service"
import { AuditService } from "@/lib/services/audit.service"
import type { RelationshipType } from "@/types"

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth()
  if (auth instanceof NextResponse) return auth

  const { searchParams } = new URL(req.url)
  const verified = searchParams.get("verified")
  const pendingAI = searchParams.get("pending_ai") === "true"
  const page = parseInt(searchParams.get("page") ?? "1")

  const result = await KnowledgeService.listRelationships({
    page,
    perPage: 50,
    verified: verified === "true" ? true : verified === "false" ? false : undefined,
    pendingAI,
  })

  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth(["admin", "editor", "author"])
  if (auth instanceof NextResponse) return auth

  const body = await req.json()
  const {
    source_entity_type, source_entity_id,
    target_entity_type, target_entity_id,
    relationship_type, weight, confidence, source, source_url, notes,
  } = body

  if (!source_entity_type || !source_entity_id || !target_entity_type || !target_entity_id || !relationship_type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const rel = await KnowledgeService.addRelationship({
    source_entity_type,
    source_entity_id,
    target_entity_type,
    target_entity_id,
    relationship_type: relationship_type as RelationshipType,
    weight: weight ?? 1.0,
    confidence: confidence ?? 1.0,
    source: source ?? "admin",
    source_url: source_url ?? null,
    notes: notes ?? null,
    created_by: auth.userId,
    created_by_type: "editor",
  })

  if (!rel) {
    return NextResponse.json({ error: "Failed to create relationship" }, { status: 500 })
  }

  await AuditService.log({
    actor_id: auth.userId,
    actor_email: auth.email,
    action: "knowledge.relationship.create",
    entity_type: "entity_relationship",
    entity_id: rel.id,
    summary: `${source_entity_type}:${source_entity_id} ${relationship_type} ${target_entity_type}:${target_entity_id}`,
  })

  return NextResponse.json(rel, { status: 201 })
}
