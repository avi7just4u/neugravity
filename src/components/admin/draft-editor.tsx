"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, XCircle, Send, Save, Loader2 } from "lucide-react"

const CATEGORIES = [
  "ai", "cloud", "security", "developer-tools", "databases",
  "networking", "hardware", "business", "open-source", "infrastructure",
]

interface DraftEditorProps {
  sourceItemId: string
  newsItemId: string | null
  initialHeadline: string
  initialSummary: string
  initialCategory: string
  initialTags: string[]
  currentStatus: string
  newsItemStatus: string | null
}

export function DraftEditor({
  sourceItemId,
  newsItemId,
  initialHeadline,
  initialSummary,
  initialCategory,
  initialTags,
  currentStatus,
  newsItemStatus,
}: DraftEditorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const [headline, setHeadline] = useState(initialHeadline)
  const [summary, setSummary] = useState(initialSummary)
  const [category, setCategory] = useState(initialCategory)
  const [tagInput, setTagInput] = useState(initialTags.join(", "))

  async function apiCall(url: string, method: string, body: Record<string, unknown>) {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error ?? `HTTP ${res.status}`)
    }
    return res.json()
  }

  function run(action: () => Promise<void>) {
    setError(null)
    setSaved(false)
    startTransition(async () => {
      try {
        await action()
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      }
    })
  }

  function handleSaveDraft() {
    const tags = tagInput.split(",").map((t) => t.trim()).filter(Boolean)
    run(async () => {
      await apiCall(`/api/admin/editorial/${sourceItemId}/draft`, "PATCH", {
        headline,
        summary,
        category,
        tags,
      })
      setSaved(true)
    })
  }

  const parsedTags = tagInput.split(",").map((t) => t.trim()).filter(Boolean)
  const isReviewable = currentStatus === "ready_for_review" || currentStatus === "enriched" || currentStatus === "approved"
  const isPublishable = newsItemStatus === "approved"

  return (
    <div className="space-y-4">
      {/* Headline */}
      <div>
        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
          Headline
        </label>
        <textarea
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          rows={2}
          className="w-full text-sm font-semibold text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:ring-offset-1"
        />
      </div>

      {/* Summary */}
      <div>
        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
          Summary (AI-generated, editable)
        </label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={5}
          className="w-full text-sm text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:ring-offset-1"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full text-sm text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          className="w-full text-sm text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
          placeholder="ai, openai, gpt-4..."
        />
        {parsedTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {parsedTags.map((tag) => (
              <span key={tag} className="px-1.5 py-0.5 text-xs bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
        <button
          disabled={isPending}
          onClick={handleSaveDraft}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-medium transition-colors disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Draft
        </button>

        {isReviewable && currentStatus !== "approved" && (
          <>
            <button
              disabled={isPending}
              onClick={() => run(() => apiCall("/api/admin/editorial/approve", "POST", { source_item_id: sourceItemId }))}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Approve
            </button>
            <button
              disabled={isPending}
              onClick={() => run(() => apiCall("/api/admin/editorial/reject", "POST", { source_item_id: sourceItemId }))}
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
            onClick={() => run(() => apiCall("/api/admin/editorial/publish", "POST", { news_item_id: newsItemId }))}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 dark:bg-white hover:bg-zinc-700 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Publish
          </button>
        )}

        {currentStatus === "rejected" && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-1">Rejected — no further actions</p>
        )}

        {saved && !error && (
          <p className="text-xs text-green-600 dark:text-green-400 text-center">Draft saved</p>
        )}
        {error && (
          <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg p-2">{error}</div>
        )}
      </div>
    </div>
  )
}
