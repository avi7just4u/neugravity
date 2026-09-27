import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { requireAdminAuth } from "@/lib/auth/admin-auth"

const EDUCATION_ROLES = ["admin", "super_admin", "course_manager", "editor"]

// GET /api/admin/education/courses — list all courses
export async function GET() {
  const auth = await requireAdminAuth(EDUCATION_ROLES)
  if (auth instanceof NextResponse) return auth

  const db = createAdminClient()
  const { data, error } = await db
    .from("courses")
    .select("*")
    .order("updated_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// POST /api/admin/education/courses — create a new course
export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth(EDUCATION_ROLES)
  if (auth instanceof NextResponse) return auth

  const body = await req.json()
  const { title, slug, description, subtitle, short_description, difficulty, estimated_hours, learning_outcomes, audience } = body

  if (!title || !slug) {
    return NextResponse.json({ error: "title and slug are required" }, { status: 400 })
  }

  const db = createAdminClient()
  const { data, error } = await db
    .from("courses")
    .insert({
      title,
      slug,
      subtitle: subtitle ?? null,
      description: description ?? null,
      short_description: short_description ?? null,
      difficulty: difficulty ?? "beginner",
      estimated_hours: estimated_hours ?? null,
      learning_outcomes: learning_outcomes ?? [],
      audience: audience ?? null,
      status: "draft",
      is_demo: false,
      featured: false,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
