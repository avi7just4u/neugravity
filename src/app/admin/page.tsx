import type { Metadata } from "next"
import { createAdminClient } from "@/lib/supabase/server"
import {
  Clock, AlertCircle, AlertTriangle, CheckCircle, Rss,
  BrainCircuit, ListChecks, Radar, Loader, TrendingUp, Search,
  Wrench, GitPullRequest, Activity,
} from "lucide-react"
import { PageHeader, StatCard, EmptyState } from "@/components/admin"

export const metadata: Metadata = { title: "Dashboard" }
export const dynamic = "force-dynamic"

async function getDashboardStats() {
  try {
    const db = createAdminClient()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayIso = today.toISOString()
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()

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
      stuckItems,
      activeSources,
      toolsVerifiedToday,
      toolChangesReview,
      incidentUpdatesToday,
    ] = await Promise.all([
      db.from("source_items").select("id", { count: "exact", head: true }).eq("processing_status", "ready_for_review").gte("discovered_at", todayIso),
      db.from("source_items").select("id", { count: "exact", head: true }).eq("processing_status", "ready_for_review"),
      db.from("news_items").select("id", { count: "exact", head: true }).eq("status", "published").gte("published_at", todayIso),
      db.from("articles").select("id", { count: "exact", head: true }).eq("status", "published").gte("published_at", todayIso),
      db.from("status_incidents").select("id", { count: "exact", head: true }).is("resolved_at", null),
      db.from("jobs").select("id", { count: "exact", head: true }).in("status", ["failed", "dead_lettered"]),
      db.from("jobs").select("id", { count: "exact", head: true }).in("status", ["queued", "retrying"]),
      db.from("sources").select("id", { count: "exact", head: true }).eq("health_status", "failed"),
      db.from("analytics_events")
        .select("metadata")
        .eq("event_type", "search")
        .limit(200),
      db.from("source_items").select("id", { count: "exact", head: true }).eq("processing_status", "enriching").lte("updated_at", thirtyMinsAgo),
      db.from("sources").select("id", { count: "exact", head: true }).eq("active", true),
      db.from("tools").select("id", { count: "exact", head: true }).eq("is_demo", false).gte("last_verified_at", todayIso),
      db.from("tool_change_events").select("id", { count: "exact", head: true }).eq("verification_status", "pending"),
      db.from("status_updates").select("id", { count: "exact", head: true }).gte("created_at", todayIso),
    ])

    // ai_generations may not exist — try separately
    let aiFailed = 0
    try {
      const { count } = await db
        .from("ai_generations")
        .select("id", { count: "exact", head: true })
        .eq("status", "failed")
        .gte("created_at", last24h)
      aiFailed = count ?? 0
    } catch {
      aiFailed = 0
    }

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
      stuckItems: stuckItems.count ?? 0,
      activeSources: activeSources.count ?? 0,
      toolsVerifiedToday: toolsVerifiedToday.count ?? 0,
      toolChangesReview: toolChangesReview.count ?? 0,
      incidentUpdatesToday: incidentUpdatesToday.count ?? 0,
      aiFailed,
      topOpportunities,
    }
  } catch {
    return {
      newDiscoveries: 0, needsReview: 0, publishedToday: 0, activeIncidents: 0,
      failedJobs: 0, queueBacklog: 0, failedSources: 0, stuckItems: 0,
      activeSources: 0, toolsVerifiedToday: 0, toolChangesReview: 0,
      incidentUpdatesToday: 0, aiFailed: 0, topOpportunities: [],
    }
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  const attentionItems = [
    stats.needsReview > 0 && { key: "needsReview", label: "Awaiting Review", value: stats.needsReview, icon: <Clock className="h-5 w-5" />, color: "warning" as const, href: "/admin/editorial" },
    stats.failedJobs > 0 && { key: "failedJobs", label: "Failed Jobs", value: stats.failedJobs, icon: <AlertCircle className="h-5 w-5" />, color: "danger" as const, href: "/admin/system/jobs" },
    stats.failedSources > 0 && { key: "failedSources", label: "Source Failures", value: stats.failedSources, icon: <Rss className="h-5 w-5" />, color: "danger" as const, href: "/admin/sources" },
    stats.activeIncidents > 0 && { key: "activeIncidents", label: "Active Incidents", value: stats.activeIncidents, icon: <AlertTriangle className="h-5 w-5" />, color: "warning" as const, href: "/admin/system/health" },
    stats.aiFailed > 0 && { key: "aiFailed", label: "AI Failures", value: stats.aiFailed, icon: <BrainCircuit className="h-5 w-5" />, color: "danger" as const, href: "/admin/system/ai" },
    stats.stuckItems > 0 && { key: "stuckItems", label: "Stuck Items", value: stats.stuckItems, icon: <Loader className="h-5 w-5" />, color: "warning" as const, href: "/admin/system/jobs" },
  ].filter(Boolean) as { key: string; label: string; value: number; icon: React.ReactNode; color: 'warning' | 'danger'; href: string }[]

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Operations overview and system status"
      />

      {/* Section 1: Attention Required */}
      <section>
        <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
          Attention Required
        </h2>
        {attentionItems.length === 0 ? (
          <EmptyState
            icon={<CheckCircle className="h-5 w-5" />}
            title="All Systems Operational"
            description="No items need your attention right now."
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {attentionItems.map((item) => (
              <StatCard
                key={item.key}
                label={item.label}
                value={item.value}
                icon={item.icon}
                color={item.color}
                href={item.href}
                attention
              />
            ))}
          </div>
        )}
      </section>

      {/* Section 2: Live Operations */}
      <section>
        <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
          Live Operations
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <StatCard
            label="Discovered Today"
            value={stats.newDiscoveries}
            icon={<Radar className="h-5 w-5" />}
            color="info"
          />
          <StatCard
            label="Published Today"
            value={stats.publishedToday}
            icon={<CheckCircle className="h-5 w-5" />}
            color="success"
          />
          <StatCard
            label="Queue Backlog"
            value={stats.queueBacklog}
            icon={<ListChecks className="h-5 w-5" />}
            color="default"
          />
          <StatCard
            label="Active Sources"
            value={stats.activeSources}
            icon={<Rss className="h-5 w-5" />}
            color="default"
            href="/admin/sources"
          />
          <StatCard
            label="Tools Verified Today"
            value={stats.toolsVerifiedToday}
            icon={<Wrench className="h-5 w-5" />}
            color="success"
            href="/admin/content/tools"
          />
          <StatCard
            label="Tool Changes Pending"
            value={stats.toolChangesReview}
            icon={<GitPullRequest className="h-5 w-5" />}
            color={stats.toolChangesReview > 0 ? "warning" : "default"}
            attention={stats.toolChangesReview > 0}
            href="/admin/content/tools/changes"
          />
          <StatCard
            label="Incident Updates Today"
            value={stats.incidentUpdatesToday}
            icon={<Activity className="h-5 w-5" />}
            color="info"
            href="/admin/system/health"
          />
        </div>
      </section>

      {/* Section 3: Content Opportunities */}
      {stats.topOpportunities.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-zinc-400" />
            <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Content Opportunities
            </h2>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden max-w-md">
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {stats.topOpportunities.map(({ query, count }) => (
                <div key={query} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-zinc-700 dark:text-zinc-300 font-mono">{query}</span>
                  <span className="text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">{count}×</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Zero-result placeholder when no opportunities yet */}
      {stats.topOpportunities.length === 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-zinc-400" />
            <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Content Opportunities
            </h2>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 max-w-md">
            <div className="px-4 py-8 text-center">
              <Search className="h-8 w-8 text-zinc-200 dark:text-zinc-700 mx-auto mb-2" />
              <p className="text-sm text-zinc-400">No search gaps detected yet</p>
              <p className="text-xs text-zinc-300 dark:text-zinc-600 mt-1">Zero-result searches will appear here</p>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
