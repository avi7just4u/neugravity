"use client"

import { useState } from "react"
import { Check, X, Loader2 } from "lucide-react"

interface EditorialActionsProps {
  id: string
}

export function EditorialActions({ id }: EditorialActionsProps) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null)
  const [done, setDone] = useState<"approved" | "rejected" | null>(null)

  async function act(action: "approve" | "reject") {
    setLoading(action)
    try {
      await fetch(`/api/admin/editorial/${id}/${action}`, { method: "POST" })
      setDone(action === "approve" ? "approved" : "rejected")
    } finally {
      setLoading(null)
    }
  }

  if (done) {
    return (
      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
        done === "approved"
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      }`}>
        {done}
      </span>
    )
  }

  return (
    <div className="flex items-center gap-1 shrink-0">
      <button
        onClick={() => act("approve")}
        disabled={loading !== null}
        title="Approve"
        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-green-200 text-green-700 dark:border-green-800 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 disabled:opacity-40 transition-colors"
      >
        {loading === "approve" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
        Approve
      </button>
      <button
        onClick={() => act("reject")}
        disabled={loading !== null}
        title="Reject"
        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors"
      >
        {loading === "reject" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
        Reject
      </button>
    </div>
  )
}
