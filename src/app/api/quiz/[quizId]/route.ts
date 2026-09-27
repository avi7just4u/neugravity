import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { EnrollmentService } from "@/lib/services/enrollment.service"

export async function POST(req: NextRequest, { params }: { params: Promise<{ quizId: string }> }) {
  const userId = await EnrollmentService.getCurrentUserId()
  if (!userId) return NextResponse.json({ error: "Authentication required" }, { status: 401 })

  const { quizId } = await params
  const body = await req.json()
  const { lessonId, answers } = body as { lessonId: string; answers: Record<string, string | string[]> }

  if (!lessonId || !answers) {
    return NextResponse.json({ error: "lessonId and answers required" }, { status: 400 })
  }

  const db = createAdminClient()

  const { data: quiz, error: quizErr } = await db
    .from("quizzes")
    .select("id,passing_score")
    .eq("id", quizId)
    .single()

  if (quizErr || !quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 })

  const { data: questions } = await db
    .from("quiz_questions")
    .select("id,correct_answer,explanation,points,question_type")
    .eq("quiz_id", quizId)
    .order("sort_order")

  if (!questions?.length) return NextResponse.json({ error: "No questions found" }, { status: 404 })

  type QRow = {
    id: string
    correct_answer: unknown
    explanation: string | null
    points: number
    question_type: string
  }
  const qRows = questions as QRow[]

  let totalPoints = 0
  let earnedPoints = 0
  const results: Array<{ questionId: string; correct: boolean; explanation: string | null }> = []

  for (const q of qRows) {
    totalPoints += q.points
    const userAnswer = answers[q.id]
    let correct = false

    if (q.question_type === "multiple_choice") {
      const correctArr = Array.isArray(q.correct_answer) ? (q.correct_answer as string[]) : []
      const userArr = Array.isArray(userAnswer) ? userAnswer : []
      correct =
        correctArr.length === userArr.length &&
        correctArr.every((a) => userArr.includes(a))
    } else {
      correct = String(userAnswer ?? "") === String(q.correct_answer ?? "")
    }

    if (correct) earnedPoints += q.points
    results.push({ questionId: q.id, correct, explanation: q.explanation })
  }

  const quizRecord = quiz as { id: string; passing_score: number }
  const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
  const passed = score >= quizRecord.passing_score

  await db.from("quiz_attempts").insert({
    user_id: userId,
    quiz_id: quizId,
    lesson_id: lessonId,
    answers,
    score,
    passed,
    completed_at: new Date().toISOString(),
  })

  return NextResponse.json({ score, passed, results })
}
