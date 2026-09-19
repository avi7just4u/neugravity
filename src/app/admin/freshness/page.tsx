import { FreshnessService } from "@/lib/services/freshness.service"
import { RefreshCw, AlertCircle, Clock, CheckCircle, HelpCircle } from "lucide-react"

export const dynamic = "force-dynamic"

function formatInterval(seconds: number) {
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  return `${Math.floor(seconds / 86400)}d`
}

export default async function FreshnessPage() {
  let summary = { expired: 0, due_soon: 0, healthy: 0, unknown: 0 }
  let overdue: Awaited<ReturnType<typeof FreshnessService.getOverdueContent>> = []

  try {
    ;[summary, overdue] = await Promise.all([
      FreshnessService.getFreshnessSummary(),
      FreshnessService.getOverdueContent(),
    ])
  } catch {
    // DB not ready
  }

  const stats = [
    {
      label: "Expired",
      value: summary.expired,
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      color: "text-red-600 dark:text-red-400",
    },
    {
      label: "Due Soon",
      value: summary.due_soon,
      icon: <Clock className="h-5 w-5 text-yellow-500" />,
      color: "text-yellow-600 dark:text-yellow-400",
    },
    {
      label: "Healthy",
      value: summary.healthy,
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      color: "text-green-600 dark:text-green-400",
    },
    {
      label: "Unknown",
      value: summary.unknown,
      icon: <HelpCircle className="h-5 w-5 text-zinc-400" />,
      color: "text-zinc-500",
    },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Content Freshness</h1>
          <p className="text-sm text-zinc-500 mt-1">Track and refresh stale content based on policy intervals.</p>
        </div>
        <form action="/api/admin/freshness/refresh" method="POST">
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh All Overdue
          </button>
        </form>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
            <div className="flex items-center gap-2 mb-2">{stat.icon}<span className="text-xs text-zinc-500 font-medium">{stat.label}</span></div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* Overdue table */}
      {overdue.length === 0 ? (
        <div className="text-center py-16 text-zinc-400">All content is fresh.</div>
      ) : (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900 text-zinc-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Entity Type</th>
                <th className="text-left px-4 py-3">Field Group</th>
                <th className="text-left px-4 py-3">Overdue Count</th>
                <th className="text-left px-4 py-3">Refresh Interval</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {overdue.map((row) => (
                <tr key={`${row.entity_type}:${row.field_group}`} className="bg-white dark:bg-zinc-900">
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white capitalize">{row.entity_type}</td>
                  <td className="px-4 py-3 text-zinc-500">{row.field_group}</td>
                  <td className="px-4 py-3">
                    <span className="text-red-600 dark:text-red-400 font-semibold">{row.overdue_count.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{formatInterval(row.refresh_interval_seconds)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
