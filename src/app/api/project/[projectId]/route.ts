import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { EnrollmentService } from "@/lib/services/enrollment.service"

export async function POST(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const userId = await EnrollmentService.getCurrentUserId()
  if (!userId) return NextResponse.json({ error: "Authentication required" }, { status: 401 })

  const { projectId } = await params
  const body = await req.json()
  const { courseId, content, url } = body as { courseId: string; content?: string; url?: string }

  if (!courseId) return NextResponse.json({ error: "courseId required" }, { status: 400 })
  if (!content && !url) return NextResponse.json({ error: "content or url required" }, { status: 400 })

  const db = createAdminClient()

  const { data: project } = await db
    .from("course_projects")
    .select("id,submission_type")
    .eq("id", projectId)
    .single()

  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 })

  const proj = project as { id: string; submission_type: string }

  const { data, error } = await db
    .from("project_submissions")
    .upsert(
      {
        user_id: userId,
        project_id: projectId,
        course_id: courseId,
        submission_type: proj.submission_type,
        content: content ?? null,
        url: url ?? null,
        submitted_at: new Date().toISOString(),
      },
      { onConflict: "user_id,project_id" }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: "Submission failed" }, { status: 500 })

  return NextResponse.json({ data })
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const userId = await EnrollmentService.getCurrentUserId()
  if (!userId) return NextResponse.json({ error: "Authentication required" }, { status: 401 })

  const { projectId } = await params
  const db = createAdminClient()

  const { data } = await db
    .from("project_submissions")
    .select("*")
    .eq("user_id", userId)
    .eq("project_id", projectId)
    .single()

  return NextResponse.json({ data: data ?? null })
}
