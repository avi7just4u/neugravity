"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"
import type { QuizQuestion, Quiz } from "@/types"

interface QuizLessonProps {
  quiz: Quiz
  questions: QuizQuestion[]
  lessonId: string
  onComplete: () => void
}

interface QuizResult {
  score: number
  passed: boolean
  results: Array<{
    questionId: string
    correct: boolean
    explanation: string | null
  }>
}

export function QuizLesson({ quiz, questions, lessonId, onComplete }: QuizLessonProps) {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<QuizResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const allAnswered = questions.every((q) => {
    const a = answers[q.id]
    return Array.isArray(a) ? a.length > 0 : Boolean(a)
  })

  async function submit() {
    if (!allAnswered) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/quiz/${quiz.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, answers }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setError((d as { error?: string }).error ?? "Failed to submit quiz")
        return
      }
      const data: QuizResult = await res.json()
      setResult(data)
      setSubmitted(true)
      if (data.passed) {
        await fetch(`/api/progress/${lessonId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "completed", progress_percent: 100 }),
        }).catch(() => {})
        onComplete()
        router.refresh()
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (submitted && result) {
    return (
      <div className="space-y-6">
        <div className={`rounded-xl border p-6 text-center ${
          result.passed
            ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
            : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
        }`}>
          {result.passed
            ? <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
            : <XCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          }
          <div className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">{result.score}%</div>
          <div className={`text-sm font-medium ${result.passed ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}>
            {result.passed ? "Quiz passed!" : `You need ${quiz.passing_score}% to pass. Try again.`}
          </div>
        </div>

        <div className="space-y-4">
          {questions.map((q) => {
            const qResult = result.results.find((r) => r.questionId === q.id)
            return (
              <div key={q.id} className={`rounded-xl border p-4 ${
                qResult?.correct
                  ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/10"
                  : "border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-950/10"
              }`}>
                <div className="flex items-start gap-2 mb-2">
                  {qResult?.correct
                    ? <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    : <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  }
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">{q.question_text}</p>
                </div>
                {qResult?.explanation && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 ml-6 mt-1">{qResult.explanation}</p>
                )}
              </div>
            )
          })}
        </div>

        {!result.passed && (
          <Button
            onClick={() => { setSubmitted(false); setResult(null); setAnswers({}) }}
            variant="outline"
            className="w-full"
          >
            Retry Quiz
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-sm text-zinc-500 dark:text-zinc-400">
        {questions.length} question{questions.length !== 1 ? "s" : ""} · Pass at {quiz.passing_score}%
      </div>

      {questions.map((q, qi) => {
        const opts = q.options ?? []
        const isMultiple = q.question_type === "multiple_choice"
        const selected = answers[q.id]

        return (
          <div key={q.id} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5">
            <p className="font-medium text-zinc-900 dark:text-white mb-4">
              <span className="text-zinc-400 mr-2">{qi + 1}.</span>
              {q.question_text}
            </p>
            <div className="space-y-2">
              {opts.map((opt) => {
                const optId = opt.id
                const isSelected = isMultiple
                  ? Array.isArray(selected) && selected.includes(optId)
                  : selected === optId

                return (
                  <button
                    key={optId}
                    onClick={() => {
                      if (isMultiple) {
                        const prev = Array.isArray(selected) ? selected : []
                        setAnswers({
                          ...answers,
                          [q.id]: isSelected ? prev.filter((x) => x !== optId) : [...prev, optId],
                        })
                      } else {
                        setAnswers({ ...answers, [q.id]: optId })
                      }
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-colors ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300"
                        : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {opt.text}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <Button onClick={submit} disabled={!allAnswered || loading} className="w-full">
        {loading ? "Submitting…" : "Submit Quiz"}
      </Button>
    </div>
  )
}
