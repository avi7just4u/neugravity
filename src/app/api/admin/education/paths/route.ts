import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { requireAdminAuth } from "@/lib/auth/admin-auth"

const EDUCATION_ROLES = ["admin", "super_admin", "course_manager", "editor"]

// GET /api/admin/education/paths — list all paths
export async function GET() {
  const auth = await requireAdminAuth(EDUCATION_ROLES)
  if (auth instanceof NextResponse) return auth

  const db = createAdminClient()
  const { data, error } = await db
    .from("learning_paths")
    .select("*")
    .order("updated_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// POST /api/admin/education/paths — create a new path
export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth(EDUCATION_ROLES)
  if (auth instanceof NextResponse) return auth

  const body = await req.json()
  const { title, slug, description, short_description, outcome, difficulty, estimated_hours } = body

  if (!title || !slug) {
    return NextResponse.json({ error: "title and slug are required" }, { status: 400 })
  }

  const db = createAdminClient()
  const { data, error } = await db
    .from("learning_paths")
    .insert({
      title,
      slug,
      description: description ?? null,
      short_description: short_description ?? null,
      outcome: outcome ?? null,
      difficulty: difficulty ?? "beginner",
      estimated_hours: estimated_hours ?? null,
      status: "draft",
      published: false,
      is_demo: false,
      featured: false,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
