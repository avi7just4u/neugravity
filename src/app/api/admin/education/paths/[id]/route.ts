import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { requireAdminAuth } from "@/lib/auth/admin-auth"

const EDUCATION_ROLES = ["admin", "super_admin", "course_manager", "editor"]
const PUBLISH_ROLES = ["admin", "super_admin", "course_manager"]

// PATCH /api/admin/education/paths/[id] — update path fields or status
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminAuth(EDUCATION_ROLES)
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const body = await req.json()

  const allowed_fields = [
    "title", "slug", "description", "short_description", "outcome",
    "difficulty", "estimated_hours", "featured", "status", "is_demo",
    "hero_image_url", "thumbnail_url",
  ]

  const updates: Record<string, unknown> = {}
  for (const field of allowed_fields) {
    if (field in body) updates[field] = body[field]
  }

  // Gate: only managers/admins can publish
  if (updates.status === "published" && !PUBLISH_ROLES.includes(auth.role)) {
    return NextResponse.json({ error: "Publishing requires course_manager or admin role" }, { status: 403 })
  }

  // Sync published boolean from status
  if ("status" in updates) {
    updates.published = updates.status === "published"
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
  }

  const db = createAdminClient()
  const { data, error } = await db
    .from("learning_paths")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// DELETE /api/admin/education/paths/[id] — admin/super_admin only
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminAuth(["admin", "super_admin"])
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const db = createAdminClient()
  const { error } = await db.from("learning_paths").delete().eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
