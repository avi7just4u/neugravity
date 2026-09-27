"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface CourseEditorActionsProps {
  courseId: string
  transitions: string[]
}

const TRANSITION_LABELS: Record<string, { label: string; color: string }> = {
  review: { label: "Submit for Review", color: "bg-blue-600 hover:bg-blue-700 text-white" },
  approved: { label: "Approve", color: "bg-emerald-600 hover:bg-emerald-700 text-white" },
  published: { label: "Publish", color: "bg-emerald-700 hover:bg-emerald-800 text-white" },
  draft: { label: "Return to Draft", color: "bg-zinc-200 hover:bg-zinc-300 text-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:text-zinc-200" },
  archived: { label: "Archive", color: "bg-zinc-200 hover:bg-zinc-300 text-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:text-zinc-200" },
}

export function CourseEditorActions({ courseId, transitions }: CourseEditorActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function transition(status: string) {
    setLoading(status)
    setError(null)
    try {
      const res = await fetch(`/api/admin/education/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const body = await res.json()
        setError(body.error ?? "Failed to update status")
      } else {
        router.refresh()
      }
    } catch {
      setError("Network error")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">Status Transitions</h3>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 mb-3">{error}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {transitions.map((status) => {
          const def = TRANSITION_LABELS[status]
          if (!def) return null
          return (
            <button
              key={status}
              onClick={() => transition(status)}
              disabled={loading !== null}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${def.color}`}
            >
              {loading === status ? "Saving…" : def.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
