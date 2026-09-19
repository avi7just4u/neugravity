import type { Metadata } from "next"
import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/server"
import { Clock, ExternalLink, CheckCircle, XCircle, Eye } from "lucide-react"
import { EditorialActions } from "./editorial-actions"

export const metadata: Metadata = { title: "Editorial Queue" }
export const dynamic = "force-dynamic"

function formatRelative(iso: string | null): string {
  if (!iso) return "—"
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return "Just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const STATUS_TABS = [
  { key: "ready_for_review", label: "Ready for Review" },
  { key: "enriched", label: "Enriched" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "duplicate", label: "Duplicate" },
]

const CONTENT_TYPE_LABELS: Record<string, string> = {
  news: "News",
  article: "Article",
  tool_update: "Tool Update",
  status: "Status",
  course: "Course",
}

async function getQueueItems(status: string) {
  try {
    const db = createAdminClient()
    const { data } = await db
      .from("source_items")
      .select("id, title, url, content_type, processing_status, discovered_at, source_published_at, description, author, source_id")
      .eq("processing_status", status)
      .order("discovered_at", { ascending: false })
      .limit(50)
    return (data ?? []) as Record<string, unknown>[]
  } catch {
    return []
  }
}

export default async function EditorialPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status = "ready_for_review" } = await searchParams
  const items = await getQueueItems(status)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Editorial Queue</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Review and approve discovered content before publishing</p>
      </div>

      <div className="flex gap-1 border-b border-zinc-200 dark:border-zinc-800">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/editorial?status=${tab.key}`}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              status === tab.key
                ? "border-zinc-900 dark:border-white text-zinc-900 dark:text-white"
                : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-12 text-center">
          <Eye className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
          <h3 className="font-medium text-zinc-900 dark:text-white mb-1">Queue is empty</h3>
          <p className="text-sm text-zinc-400">No items with status "{status}"</p>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-800">
          {items.map((item) => (
            <div key={item.id as string} className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-full">
                      {CONTENT_TYPE_LABELS[item.content_type as string] ?? (item.content_type as string)}
                    </span>
                    {Boolean(item.author) && (
                      <span className="text-xs text-zinc-400">{String(item.author)}</span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-zinc-400 ml-auto">
                      <Clock className="h-3 w-3" />
                      {formatRelative(item.discovered_at as string | null)}
                    </span>
                  </div>
                  <a
                    href={item.url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 group"
                  >
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors line-clamp-2">
                      {(item.title as string) || "(no title)"}
                    </h3>
                    <ExternalLink className="h-3 w-3 text-zinc-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                  {Boolean(item.description) && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                      {String(item.description)}
                    </p>
                  )}
                </div>
                {status === "ready_for_review" || status === "enriched" ? (
                  <EditorialActions id={item.id as string} />
                ) : (
                  <div className="flex items-center gap-1 shrink-0">
                    {status === "approved" && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {status === "rejected" && <XCircle className="h-4 w-4 text-red-500" />}
                    {status === "duplicate" && <span className="text-xs text-zinc-400 italic">dup</span>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
