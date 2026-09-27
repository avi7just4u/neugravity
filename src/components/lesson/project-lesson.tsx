"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, ExternalLink } from "lucide-react"

interface ProjectLessonProps {
  projectId: string
  courseId: string
  lessonId: string
  title: string
  instructions: string | null
  submissionType: "text" | "url" | "github" | "file"
  existingSubmission?: { content: string | null; url: string | null } | null
  onComplete: () => void
}

export function ProjectLesson({
  projectId,
  courseId,
  lessonId,
  title,
  instructions,
  submissionType,
  existingSubmission,
  onComplete,
}: ProjectLessonProps) {
  const [value, setValue] = useState(existingSubmission?.content ?? existingSubmission?.url ?? "")
  const [submitted, setSubmitted] = useState(Boolean(existingSubmission))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    if (!value.trim()) return
    setLoading(true)
    setError(null)
    try {
      const body = submissionType === "text" ? { content: value } : { url: value }
      const res = await fetch(`/api/project/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, ...body }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setError((d as { error?: string }).error ?? "Submission failed")
        return
      }
      setSubmitted(true)
      await fetch(`/api/progress/${lessonId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed", progress_percent: 100 }),
      }).catch(() => {})
      onComplete()
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const placeholder =
    submissionType === "text"
      ? "Write your submission here…"
      : submissionType === "github"
      ? "https://github.com/your-username/repo"
      : "https://"

  return (
    <div className="space-y-6">
      {title && (
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{title}</h3>
      )}
      {instructions && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-5">
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">Instructions</h4>
          <div className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
            {instructions}
          </div>
        </div>
      )}

      {submitted ? (
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 p-5">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium mb-2">
            <CheckCircle className="h-4 w-4" />
            Submitted
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400 break-all">{value}</div>
          {(submissionType === "url" || submissionType === "github") && value && (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              View submission <ExternalLink className="h-3 w-3" />
            </a>
          )}
          <Button variant="outline" size="sm" className="mt-3" onClick={() => setSubmitted(false)}>
            Edit submission
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {submissionType === "text" ? (
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              rows={8}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <input
              type="url"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          <Button onClick={submit} disabled={!value.trim() || loading} className="w-full">
            {loading ? "Submitting…" : "Submit Project"}
          </Button>
        </div>
      )}
    </div>
  )
}
