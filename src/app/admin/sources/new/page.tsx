"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Loader2 } from "lucide-react"

const SOURCE_TYPES = ["rss", "api", "status", "youtube", "manual"]
const PARSER_DEFAULTS: Record<string, string> = {
  rss: "rss-generic",
  status: "rss-status",
  api: "api-generic",
  youtube: "youtube",
  manual: "manual",
}

export default function NewSourcePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: "",
    domain: "",
    source_type: "rss",
    base_url: "",
    feed_url: "",
    api_url: "",
    parser_key: "rss-generic",
    poll_interval_seconds: 3600,
    trust_level: 5,
    notes: "",
  })

  function set(field: string, value: string | number) {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === "source_type") {
        next.parser_key = PARSER_DEFAULTS[value as string] ?? "rss-generic"
      }
      return next
    })
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? "Failed to create source")
      }
      router.push("/admin/sources")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setSaving(false)
    }
  }

  const showFeedUrl = form.source_type === "rss" || form.source_type === "status"
  const showApiUrl = form.source_type === "api"

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href="/admin/sources" className="flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 mb-4 transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Back to Sources
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Add Source</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Configure a new content ingestion source</p>
      </div>

      <form onSubmit={submit} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-5">
        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Name *</label>
            <input
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Hacker News"
              className="w-full h-9 px-3 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-400"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Domain *</label>
            <input
              required
              value={form.domain}
              onChange={(e) => set("domain", e.target.value)}
              placeholder="e.g. news.ycombinator.com"
              className="w-full h-9 px-3 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-400"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Source Type *</label>
          <select
            value={form.source_type}
            onChange={(e) => set("source_type", e.target.value)}
            className="w-full h-9 px-3 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-400"
          >
            {SOURCE_TYPES.map((t) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Base URL</label>
          <input
            value={form.base_url}
            onChange={(e) => set("base_url", e.target.value)}
            placeholder="https://example.com"
            className="w-full h-9 px-3 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </div>

        {showFeedUrl && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Feed URL (RSS)</label>
            <input
              value={form.feed_url}
              onChange={(e) => set("feed_url", e.target.value)}
              placeholder="https://example.com/rss"
              className="w-full h-9 px-3 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-400"
            />
          </div>
        )}

        {showApiUrl && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">API URL</label>
            <input
              value={form.api_url}
              onChange={(e) => set("api_url", e.target.value)}
              placeholder="https://api.example.com/v1/posts"
              className="w-full h-9 px-3 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-400"
            />
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Parser Key</label>
            <input
              value={form.parser_key}
              onChange={(e) => set("parser_key", e.target.value)}
              className="w-full h-9 px-3 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-400"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Poll Interval (s)</label>
            <input
              type="number"
              min={60}
              value={form.poll_interval_seconds}
              onChange={(e) => set("poll_interval_seconds", Number(e.target.value))}
              className="w-full h-9 px-3 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-400"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Trust Level (1–10)</label>
            <input
              type="number"
              min={1}
              max={10}
              value={form.trust_level}
              onChange={(e) => set("trust_level", Number(e.target.value))}
              className="w-full h-9 px-3 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-400"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={2}
            className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-400 resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/admin/sources" className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-lg hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Saving…" : "Add Source"}
          </button>
        </div>
      </form>
    </div>
  )
}
