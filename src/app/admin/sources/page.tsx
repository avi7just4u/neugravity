import type { Metadata } from "next"
import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Plus, Globe, Clock, AlertCircle, CheckCircle, XCircle, Rss } from "lucide-react"
import { SourceActions } from "./source-actions"

export const metadata: Metadata = { title: "Sources" }
export const dynamic = "force-dynamic"

const HEALTH_BADGE: Record<string, { label: string; className: string }> = {
  healthy:  { label: "Healthy",  className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  warning:  { label: "Warning",  className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  failed:   { label: "Failed",   className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  disabled: { label: "Disabled", className: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400" },
  unknown:  { label: "Unknown",  className: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400" },
}

function formatRelative(iso: string | null): string {
  if (!iso) return "Never"
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return "Just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

async function getSources(health?: string) {
  try {
    const db = createAdminClient()
    let q = db.from("sources").select("*").order("name")
    if (health && health !== "all") q = q.eq("health_status", health)
    const { data } = await q
    return (data ?? []) as Record<string, unknown>[]
  } catch {
    return []
  }
}

export default async function SourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ health?: string }>
}) {
  const { health } = await searchParams
  const sources = await getSources(health)

  const filters = ["all", "healthy", "warning", "failed", "disabled", "unknown"]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Sources</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Manage content ingestion sources and connectors</p>
        </div>
        <Link
          href="/admin/sources/new"
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-lg hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Source
        </Link>
      </div>

      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => {
          const isActive = (!health && f === "all") || health === f
          return (
            <Link
              key={f}
              href={f === "all" ? "/admin/sources" : `/admin/sources?health=${f}`}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors capitalize ${
                isActive
                  ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white"
                  : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400"
              }`}
            >
              {f}
            </Link>
          )
        })}
      </div>

      {sources.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-12 text-center">
          <Rss className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
          <h3 className="font-medium text-zinc-900 dark:text-white mb-1">No sources found</h3>
          <p className="text-sm text-zinc-400 mb-4">Add RSS feeds, APIs and status pages to start ingesting content.</p>
          <Link
            href="/admin/sources/new"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add your first source
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Source</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Health</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Last Poll</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Next Poll</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Failures</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {sources.map((source) => {
                const health = (source.health_status as string) ?? "unknown"
                const badge = HEALTH_BADGE[health] ?? HEALTH_BADGE.unknown
                return (
                  <tr key={source.id as string} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-zinc-400 shrink-0" />
                        <div>
                          <div className="font-medium text-zinc-900 dark:text-white">{source.name as string}</div>
                          <div className="text-xs text-zinc-400">{source.domain as string}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="text-xs capitalize">{source.source_type as string}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
                        {health === "healthy" && <CheckCircle className="h-3 w-3" />}
                        {health === "failed" && <XCircle className="h-3 w-3" />}
                        {health === "warning" && <AlertCircle className="h-3 w-3" />}
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-xs text-zinc-400">
                        <Clock className="h-3 w-3" />
                        {formatRelative(source.last_polled_at as string | null)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-zinc-400">
                        {formatRelative(source.next_poll_at as string | null)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${(source.failure_count as number) > 0 ? "text-red-600 dark:text-red-400" : "text-zinc-400"}`}>
                        {source.failure_count as number}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <SourceActions
                        id={source.id as string}
                        active={source.active as boolean}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
