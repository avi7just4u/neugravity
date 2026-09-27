import { NextRequest, NextResponse } from "next/server"
import { EnrollmentService } from "@/lib/services/enrollment.service"
import { createAdminClient } from "@/lib/supabase/server"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
  const userId = await EnrollmentService.getCurrentUserId()
  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  const { lessonId } = await params
  const progress = await EnrollmentService.getLessonProgress(userId, lessonId)

  return NextResponse.json({ data: progress })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
  const userId = await EnrollmentService.getCurrentUserId()
  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  const { lessonId } = await params
  const body = await req.json()

  const { status, progress_percent, video_position_seconds } = body
  const validStatuses = ["not_started", "in_progress", "completed"] as const
  type ProgressStatus = typeof validStatuses[number]

  if (status !== undefined && !validStatuses.includes(status as ProgressStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  const updated = await EnrollmentService.updateLessonProgress(userId, lessonId, {
    status: status as ProgressStatus | undefined,
    progress_percent: typeof progress_percent === "number" ? progress_percent : undefined,
    video_position_seconds: typeof video_position_seconds === "number" ? video_position_seconds : undefined,
  })

  if (!updated) {
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 })
  }

  // When a lesson is completed, check if the entire course is done
  if (status === "completed") {
    const db = createAdminClient()
    const { data: lesson } = await db
      .from("lessons")
      .select("module_id")
      .eq("id", lessonId)
      .single()
    if (lesson) {
      const { data: module } = await db
        .from("course_modules")
        .select("course_id")
        .eq("id", (lesson as { module_id: string }).module_id)
        .single()
      if (module) {
        const courseId = (module as { course_id: string }).course_id
        const progress = await EnrollmentService.getCourseProgress(userId, courseId)
        if (progress.percent === 100 && progress.total_lessons > 0) {
          await EnrollmentService.updateEnrollmentStatus(userId, courseId, "completed")
        }
      }
    }
  }

  return NextResponse.json({ data: updated })
}
