import type { Metadata } from "next"
import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Plus, Globe, Clock, AlertCircle, CheckCircle, XCircle, Rss, ShieldCheck } from "lucide-react"
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

const TRUST_BADGE: Record<string, { label: string; className: string }> = {
  primary:              { label: "Primary",    className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  official:             { label: "Official",   className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  reputable_secondary:  { label: "Reputable",  className: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300" },
  community:            { label: "Community",  className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
}

const CATEGORIES = ["all", "ai", "cloud", "security", "developer", "infrastructure", "databases", "open-source", "general"]

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

function formatInterval(seconds: number | null): string {
  if (!seconds) return "—"
  if (seconds < 3600) return `Every ${Math.round(seconds / 60)}m`
  if (seconds < 86400) return `Every ${Math.round(seconds / 3600)}h`
  return `Every ${Math.round(seconds / 86400)}d`
}

async function getSources(health?: string, category?: string) {
  try {
    const db = createAdminClient()
    let q = db
      .from("sources")
      .select("*")
      .order("source_priority", { ascending: false, nullsFirst: false })
      .order("name")

    if (health && health !== "all") q = (q as any).eq("health_status", health)
    if (category && category !== "all") q = (q as any).eq("category", category)
    const { data } = await q
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? []) as any[]
  } catch {
    return []
  }
}

export default async function SourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ health?: string; category?: string }>
}) {
  const { health, category } = await searchParams
  const sources = await getSources(health, category)

  const healthFilters = ["all", "healthy", "warning", "failed", "disabled", "unknown"]
  const activeCount = sources.filter((s) => s.active).length
  const unverifiedCount = sources.filter((s) => s.health_status === "unknown" && !s.active).length

  function buildHref(params: { health?: string; category?: string }) {
    const q = new URLSearchParams()
    if (params.health && params.health !== "all") q.set("health", params.health)
    if (params.category && params.category !== "all") q.set("category", params.category)
    const qs = q.toString()
    return `/admin/sources${qs ? `?${qs}` : ""}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Sources</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {activeCount} active · {sources.length} total
            {unverifiedCount > 0 && (
              <span className="ml-2 text-amber-600 dark:text-amber-400">· {unverifiedCount} pending verification</span>
            )}
          </p>
        </div>
        <Link
          href="/admin/sources/new"
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-lg hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Source
        </Link>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => {
          const isActive = (!category && cat === "all") || category === cat
          return (
            <Link
              key={cat}
              href={buildHref({ health, category: cat })}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors capitalize ${
                isActive
                  ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white"
                  : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400"
              }`}
            >
              {cat}
            </Link>
          )
        })}
      </div>

      {/* Health filter */}
      <div className="flex gap-2 flex-wrap">
        {healthFilters.map((f) => {
          const isActive = (!health && f === "all") || health === f
          return (
            <Link
              key={f}
              href={buildHref({ health: f, category })}
              className={`px-2.5 py-1 text-xs rounded-full border transition-colors capitalize ${
                isActive
                  ? "bg-zinc-700 text-white border-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 dark:border-zinc-200"
                  : "border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-500 hover:border-zinc-400"
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
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Category / Trust</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Health</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Last Poll</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Interval</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Priority</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {sources.map((source) => {
                const healthKey = (source.health_status as string) ?? "unknown"
                const badge = HEALTH_BADGE[healthKey] ?? HEALTH_BADGE.unknown
                const trustKey = (source.trust_level_label as string) ?? "reputable_secondary"
                const trustBadge = TRUST_BADGE[trustKey] ?? TRUST_BADGE.reputable_secondary
                const isUnverified = healthKey === "unknown" && !source.active
                return (
                  <tr key={source.id as string} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-zinc-400 shrink-0" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-zinc-900 dark:text-white">{source.name as string}</span>
                            {source.active && (
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" title="Active" />
                            )}
                          </div>
                          <div className="text-xs text-zinc-400 truncate max-w-[220px]">
                            {(source.feed_url ?? source.api_url ?? source.base_url ?? source.website_url) as string | null ?? "—"}
                          </div>
                          {Boolean(source.last_error) && (
                            <div className="text-xs text-red-500 truncate max-w-[220px] mt-0.5">{source.last_error as string}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        {source.category && (
                          <Badge variant="secondary" className="text-xs capitalize">{source.category as string}</Badge>
                        )}
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${trustBadge.className}`}>
                          <ShieldCheck className="h-3 w-3" />
                          {trustBadge.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
                        {healthKey === "healthy" && <CheckCircle className="h-3 w-3" />}
                        {healthKey === "failed" && <XCircle className="h-3 w-3" />}
                        {healthKey === "warning" && <AlertCircle className="h-3 w-3" />}
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
                        {formatInterval(source.poll_interval_seconds as number | null)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-zinc-400">
                        P{(source.source_priority as number) ?? 5}
                        <span className="ml-1 text-zinc-300 dark:text-zinc-600">T{source.trust_level as number}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <SourceActions
                        id={source.id as string}
                        active={source.active as boolean}
                        showVerify={isUnverified}
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
