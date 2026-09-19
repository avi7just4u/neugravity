import type { Metadata } from "next"
import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/server"
import {
  Inbox, Eye, Send, AlertTriangle, XCircle, Clock, Rss, TrendingUp, Search,
} from "lucide-react"

export const metadata: Metadata = { title: "Dashboard" }
export const dynamic = "force-dynamic"

async function getDashboardStats() {
  try {
    const db = createAdminClient()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayIso = today.toISOString()

    const [
      newDiscoveries,
      needsReview,
      publishedNewsToday,
      publishedArticlesToday,
      activeIncidents,
      failedJobs,
      queueBacklog,
      failedSources,
      opportunities,
    ] = await Promise.all([
      db.from("source_items").select("id", { count: "exact" }).eq("processing_status", "ready_for_review").gte("discovered_at", todayIso).limit(0),
      db.from("source_items").select("id", { count: "exact" }).eq("processing_status", "ready_for_review").limit(0),
      db.from("news_items").select("id", { count: "exact" }).eq("status", "published").gte("published_at", todayIso).limit(0),
      db.from("articles").select("id", { count: "exact" }).eq("status", "published").gte("published_at", todayIso).limit(0),
      db.from("status_incidents").select("id", { count: "exact" }).is("resolved_at", null).limit(0),
      db.from("jobs").select("id", { count: "exact" }).in("status", ["failed", "dead_lettered"]).limit(0),
      db.from("jobs").select("id", { count: "exact" }).in("status", ["queued", "retrying"]).limit(0),
      db.from("sources").select("id", { count: "exact" }).eq("health_status", "failed").limit(0),
      db.from("analytics_events")
        .select("metadata")
        .eq("event_type", "search")
        .limit(200),
    ])

    // Compute zero-result searches from raw analytics
    const zeroResultQueries: Record<string, number> = {}
    for (const row of (opportunities.data ?? []) as { metadata: Record<string, unknown> }[]) {
      const meta = row.metadata ?? {}
      if (String(meta.result_count) === "0" && typeof meta.query === "string" && meta.query.trim()) {
        const q = (meta.query as string).trim().toLowerCase()
        zeroResultQueries[q] = (zeroResultQueries[q] ?? 0) + 1
      }
    }
    const topOpportunities = Object.entries(zeroResultQueries)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([query, count]) => ({ query, count }))

    return {
      newDiscoveries: newDiscoveries.count ?? 0,
      needsReview: needsReview.count ?? 0,
      publishedToday: (publishedNewsToday.count ?? 0) + (publishedArticlesToday.count ?? 0),
      activeIncidents: activeIncidents.count ?? 0,
      failedJobs: failedJobs.count ?? 0,
      queueBacklog: queueBacklog.count ?? 0,
      failedSources: failedSources.count ?? 0,
      topOpportunities,
    }
  } catch {
    return {
      newDiscoveries: 0, needsReview: 0, publishedToday: 0, activeIncidents: 0,
      failedJobs: 0, queueBacklog: 0, failedSources: 0, topOpportunities: [],
    }
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  const cards = [
    { label: "New Discoveries", value: stats.newDiscoveries, icon: Inbox, href: "/admin/editorial?status=ready_for_review", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950" },
    { label: "Needs Review", value: stats.needsReview, icon: Eye, href: "/admin/editorial", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950" },
    { label: "Published Today", value: stats.publishedToday, icon: Send, href: "/admin/content/news", color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950" },
    { label: "Active Incidents", value: stats.activeIncidents, icon: AlertTriangle, href: "/admin/system/incidents", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950" },
    { label: "Failed Jobs", value: stats.failedJobs, icon: XCircle, href: "/admin/system/jobs?status=failed", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950" },
    { label: "Queue Backlog", value: stats.queueBacklog, icon: Clock, href: "/admin/system/jobs?status=queued", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950" },
    { label: "Failed Sources", value: stats.failedSources, icon: Rss, href: "/admin/sources?health=failed", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Content operating system overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.label}
              href={card.href}
              className="flex flex-col gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
            >
              <div className={`flex items-center justify-center h-9 w-9 rounded-lg ${card.bg} ${card.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold text-zinc-900 dark:text-white">{card.value}</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">{card.label}</div>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">Content Pipeline</h2>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-800">
            {[
              { label: "Awaiting discovery", href: "/admin/sources", value: "→ Sources" },
              { label: "Ready for review", href: "/admin/editorial", value: stats.needsReview },
              { label: "Active incidents", href: "/admin/system/incidents", value: stats.activeIncidents },
              { label: "Jobs in queue", href: "/admin/system/jobs", value: stats.queueBacklog },
            ].map((row) => (
              <Link key={row.label} href={row.href} className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">{row.label}</span>
                <span className="text-sm font-semibold text-zinc-900 dark:text-white">{row.value}</span>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-zinc-400" />
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Content Opportunities</h2>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
            {stats.topOpportunities.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Search className="h-8 w-8 text-zinc-200 dark:text-zinc-700 mx-auto mb-2" />
                <p className="text-sm text-zinc-400">No search gaps detected yet</p>
                <p className="text-xs text-zinc-300 dark:text-zinc-600 mt-1">Zero-result searches will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {stats.topOpportunities.map(({ query, count }) => (
                  <div key={query} className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300 font-mono">{query}</span>
                    <span className="text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">{count}×</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
