import { NextRequest, NextResponse } from "next/server"
import { EnrollmentService } from "@/lib/services/enrollment.service"

export async function POST(_req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const userId = await EnrollmentService.getCurrentUserId()
  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  const { courseId } = await params
  const enrollment = await EnrollmentService.enroll(userId, courseId)

  if (!enrollment) {
    return NextResponse.json({ error: "Enrollment failed" }, { status: 500 })
  }

  return NextResponse.json({ data: enrollment }, { status: 201 })
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const userId = await EnrollmentService.getCurrentUserId()
  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  const { courseId } = await params
  const enrollment = await EnrollmentService.getEnrollment(userId, courseId)

  return NextResponse.json({ data: enrollment })
}
