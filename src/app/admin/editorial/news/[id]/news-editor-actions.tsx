"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, XCircle, Send, Loader2 } from "lucide-react"

interface Props {
  sourceItemId: string
  newsItemId: string | null
  currentStatus: string
  newsItemStatus: string | null
}

export function NewsEditorActions({ sourceItemId, newsItemId, currentStatus, newsItemStatus }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  async function callAction(url: string, body: Record<string, unknown>) {
    setError(null)
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error ?? `HTTP ${res.status}`)
    }
    return res.json()
  }

  function handle(action: () => Promise<void>) {
    startTransition(async () => {
      try {
        await action()
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      }
    })
  }

  const isReviewable = currentStatus === "ready_for_review" || currentStatus === "enriched"
  const isApproved = currentStatus === "approved"
  const isPublishable = newsItemStatus === "approved"

  return (
    <div className="space-y-2">
      {isReviewable && (
        <>
          <button
            disabled={isPending}
            onClick={() => handle(() => callAction("/api/admin/editorial/approve", { source_item_id: sourceItemId }))}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            Approve
          </button>
          <button
            disabled={isPending}
            onClick={() => handle(() => callAction("/api/admin/editorial/reject", { source_item_id: sourceItemId }))}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
            Reject
          </button>
        </>
      )}

      {newsItemId && isPublishable && (
        <button
          disabled={isPending}
          onClick={() => handle(() => callAction("/api/admin/editorial/publish", { news_item_id: newsItemId }))}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 dark:bg-white hover:bg-zinc-700 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-sm font-medium transition-colors disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Publish
        </button>
      )}

      {!isReviewable && !isPublishable && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-2">
          {currentStatus === "rejected" ? "Rejected — no further actions" : `Status: ${currentStatus}`}
        </p>
      )}

      {error && (
        <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg p-2">
          {error}
        </div>
      )}
    </div>
  )
}
