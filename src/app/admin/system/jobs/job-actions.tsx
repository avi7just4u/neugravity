"use client"

import { useState } from "react"
import { RefreshCw, Loader2, X } from "lucide-react"

interface JobActionsProps {
  id: string
  status: string
}

export function JobActions({ id, status }: JobActionsProps) {
  const [loading, setLoading] = useState<"retry" | "cancel" | null>(null)
  const [done, setDone] = useState<"queued" | "cancelled" | null>(null)

  const canRetry = status === "failed" || status === "dead_lettered"
  const canCancel = status === "queued" || status === "retrying"

  async function retry() {
    setLoading("retry")
    try {
      await fetch(`/api/admin/jobs/${id}/retry`, { method: "POST" })
      setDone("queued")
    } finally {
      setLoading(null)
    }
  }

  async function cancel() {
    setLoading("cancel")
    try {
      await fetch(`/api/admin/jobs/${id}/cancel`, { method: "POST" })
      setDone("cancelled")
    } finally {
      setLoading(null)
    }
  }

  if (done) {
    return <span className="text-xs text-zinc-400">{done}</span>
  }

  return (
    <div className="flex items-center gap-1">
      {canRetry && (
        <button
          onClick={retry}
          disabled={loading !== null}
          title="Retry job"
          className="flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors"
        >
          {loading === "retry" ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
          Retry
        </button>
      )}
      {canCancel && (
        <button
          onClick={cancel}
          disabled={loading !== null}
          title="Cancel job"
          className="flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-40 transition-colors"
        >
          {loading === "cancel" ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
          Cancel
        </button>
      )}
    </div>
  )
}
