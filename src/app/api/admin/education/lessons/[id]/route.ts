import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { requireAdminAuth } from "@/lib/auth/admin-auth"

const EDUCATION_ROLES = ["admin", "super_admin", "course_manager", "editor"]

// PATCH /api/admin/education/lessons/[id] — update lesson fields or status
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminAuth(EDUCATION_ROLES)
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const body = await req.json()

  const allowed_fields = [
    "title", "description", "content", "lesson_type",
    "video_url", "video_duration_seconds", "is_preview",
    "sort_order", "status", "learning_outcomes",
  ]

  const updates: Record<string, unknown> = {}
  for (const field of allowed_fields) {
    if (field in body) updates[field] = body[field]
  }

  // Server-side lesson publication quality gate
  if (updates.status === "published") {
    const db = createAdminClient()
    const { data: existing } = await db.from("lessons").select("*").eq("id", id).single()
    if (!existing) return NextResponse.json({ error: "Lesson not found" }, { status: 404 })

    // Merge updates with existing values for validation
    const merged = { ...existing, ...updates }
    const type = String(merged.lesson_type ?? "")

    if (type === "article" || type === "interactive") {
      if (!merged.content || String(merged.content).trim() === "") {
        return NextResponse.json({ error: "Article lessons require content before publishing" }, { status: 400 })
      }
    } else if (type === "video") {
      if (!merged.video_url || String(merged.video_url).trim() === "") {
        return NextResponse.json({ error: "Video lessons require a video URL before publishing" }, { status: 400 })
      }
    } else if (type === "quiz") {
      // Verify at least one quiz question exists for this lesson
      const { data: quiz } = await db
        .from("quizzes")
        .select("id")
        .eq("lesson_id", id)
        .maybeSingle()

      if (!quiz) {
        return NextResponse.json({ error: "Quiz lessons require a quiz with at least one question before publishing" }, { status: 400 })
      }

      const { count: questionCount } = await db
        .from("quiz_questions")
        .select("id", { count: "exact", head: true })
        .eq("quiz_id", quiz.id)

      if (!questionCount || questionCount === 0) {
        return NextResponse.json({ error: "Quiz lessons require at least one question before publishing" }, { status: 400 })
      }
    } else if (type === "assignment" || type === "project") {
      if (!merged.content || String(merged.content).trim() === "") {
        return NextResponse.json({ error: "Assignment/project lessons require instructions (content) before publishing" }, { status: 400 })
      }
    }

    updates.published_at = new Date().toISOString()
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
  }

  const db = createAdminClient()
  const { data, error } = await db
    .from("lessons")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
