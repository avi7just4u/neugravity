"use client"

import { useState } from "react"
import { RefreshCw, Loader2 } from "lucide-react"

interface JobActionsProps {
  id: string
}

export function JobActions({ id }: JobActionsProps) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function retry() {
    setLoading(true)
    try {
      await fetch(`/api/admin/jobs/${id}/retry`, { method: "POST" })
      setDone(true)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return <span className="text-xs text-zinc-400">queued</span>
  }

  return (
    <button
      onClick={retry}
      disabled={loading}
      title="Retry job"
      className="flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors"
    >
      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
      Retry
    </button>
  )
}
