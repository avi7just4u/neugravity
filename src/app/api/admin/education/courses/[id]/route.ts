import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { requireAdminAuth } from "@/lib/auth/admin-auth"

const EDUCATION_ROLES = ["admin", "super_admin", "course_manager", "editor"]
const PUBLISH_ROLES = ["admin", "super_admin", "course_manager"]

// GET /api/admin/education/courses/[id] — full course with modules and lessons
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminAuth(EDUCATION_ROLES)
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const db = createAdminClient()
  const { data: course, error } = await db.from("courses").select("*").eq("id", id).single()
  if (error || !course) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { data: modules } = await db
    .from("course_modules")
    .select("*")
    .eq("course_id", id)
    .order("sort_order")

  const moduleList = modules ?? []
  const modulesWithLessons = await Promise.all(
    moduleList.map(async (mod: Record<string, unknown>) => {
      const { data: lessons } = await db
        .from("lessons")
        .select("*")
        .eq("module_id", mod.id)
        .order("sort_order")
      return { ...mod, lessons: lessons ?? [] }
    })
  )

  return NextResponse.json({ data: { ...course, modules: modulesWithLessons } })
}

// PATCH /api/admin/education/courses/[id] — update course fields or status
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminAuth(EDUCATION_ROLES)
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const body = await req.json()

  const allowed_fields = [
    "title", "slug", "subtitle", "description", "short_description",
    "difficulty", "estimated_hours", "featured", "status", "is_demo",
    "learning_outcomes", "audience", "hero_image_url", "thumbnail_url",
  ]

  const updates: Record<string, unknown> = {}
  for (const field of allowed_fields) {
    if (field in body) updates[field] = body[field]
  }

  // Gate: only managers/admins can publish
  if (updates.status === "published" && !PUBLISH_ROLES.includes(auth.role)) {
    return NextResponse.json({ error: "Publishing requires course_manager or admin role" }, { status: 403 })
  }

  // Server-side publication quality gate
  if (updates.status === "published") {
    const db = createAdminClient()
    const { data: existing } = await db.from("courses").select("*").eq("id", id).single()
    if (!existing) return NextResponse.json({ error: "Course not found" }, { status: 404 })

    // Merge updates with existing values for validation
    const merged = { ...existing, ...updates }

    if (!merged.title || String(merged.title).trim() === "") {
      return NextResponse.json({ error: "Publication requires a title" }, { status: 400 })
    }
    if (!merged.description || String(merged.description).trim() === "") {
      return NextResponse.json({ error: "Publication requires a description" }, { status: 400 })
    }
    if (!merged.difficulty) {
      return NextResponse.json({ error: "Publication requires difficulty to be set" }, { status: 400 })
    }
    const outcomes = merged.learning_outcomes as string[] | null
    if (!outcomes || outcomes.length === 0) {
      return NextResponse.json({ error: "Publication requires at least one learning outcome" }, { status: 400 })
    }

    // Check at least one published lesson in the curriculum
    const { data: modules } = await db
      .from("course_modules")
      .select("id")
      .eq("course_id", id)

    const moduleIds = (modules ?? []).map((m: { id: string }) => m.id)
    if (moduleIds.length === 0) {
      return NextResponse.json({ error: "Publication requires at least one module with a published lesson" }, { status: 400 })
    }

    const { count: publishedLessons } = await db
      .from("lessons")
      .select("id", { count: "exact", head: true })
      .in("module_id", moduleIds)
      .eq("status", "published")

    if (!publishedLessons || publishedLessons === 0) {
      return NextResponse.json({ error: "Publication requires at least one published lesson" }, { status: 400 })
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
  }

  const db = createAdminClient()
  const { data, error } = await db
    .from("courses")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// DELETE /api/admin/education/courses/[id] — admin/super_admin only
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminAuth(["admin", "super_admin"])
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const db = createAdminClient()
  const { error } = await db.from("courses").delete().eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
