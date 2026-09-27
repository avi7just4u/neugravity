import type { Metadata } from "next"
import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/server"
import { SourceService } from "@/lib/services/source.service"
import type { Source } from "@/types"
import {
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  Rss,
  Newspaper,
  Wrench,
  Activity,
  XCircle,
} from "lucide-react"

export const metadata: Metadata = { title: "Automation" }
export const dynamic = "force-dynamic"

function formatRelative(iso: string | null | undefined): string {
  if (!iso) return "Never"
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return "Just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function StatusDot({ ok }: { ok: boolean }) {
  return ok ? (
    <CheckCircle className="h-4 w-4 text-green-500" />
  ) : (
    <XCircle className="h-4 w-4 text-red-500" />
  )
}

interface QueueStat {
  queued: number
  running: number
  failed: number
  dead_lettered: number
  completed: number
}

async function getAutomationData() {
  const db = createAdminClient()

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const [sourcesResult, jobStats, pendingNewsResult, stuckResult, toolRefreshResult] = await Promise.allSettled([
    SourceService.getSources({ perPage: 100 }),

    // Queue stats by type in last 24h
    db
      .from("jobs")
      .select("queue_name, status, created_at, completed_at, failed_at, last_error, job_type")
      .gte("created_at", since24h)
      .order("created_at", { ascending: false })
      .limit(500),

    // News items awaiting review
    db
      .from("news_items")
      .select("id", { count: "exact", head: true })
      .in("status", ["ready_for_review", "pending"]),

    // Jobs running > 10 min (stuck)
    db
      .from("jobs")
      .select("id, queue_name, job_type, started_at")
      .eq("status", "running")
      .lt("started_at", new Date(Date.now() - 10 * 60 * 1000).toISOString()),

    // Latest tool-refresh job
    db
      .from("jobs")
      .select("id, status, created_at, completed_at, failed_at")
      .eq("job_type", "tool_refresh")
      .order("created_at", { ascending: false })
      .limit(1),
  ])

  return { sourcesResult, jobStats, pendingNewsResult, stuckResult, toolRefreshResult }
}

export default async function AutomationPage() {
  const { sourcesResult, jobStats, pendingNewsResult, stuckResult, toolRefreshResult } =
    await getAutomationData()

  const sources: Source[] = sourcesResult.status === "fulfilled" ? (sourcesResult.value.data ?? []) : []
  const jobs = jobStats.status === "fulfilled" ? (jobStats.value.data ?? []) : []
  const pendingCount =
    pendingNewsResult.status === "fulfilled" ? (pendingNewsResult.value.count ?? 0) : 0
  const stuckJobs = stuckResult.status === "fulfilled" ? (stuckResult.value.data ?? []) : []
  const latestToolRefresh =
    toolRefreshResult.status === "fulfilled"
      ? ((toolRefreshResult.value.data ?? []) as Record<string, unknown>[])[0] ?? null
      : null

  // Compute per-queue stats from jobs array
  const queueMap: Record<string, QueueStat> = {}
  for (const job of jobs as Record<string, unknown>[]) {
    const q = (job.queue_name as string) ?? "unknown"
    if (!queueMap[q]) queueMap[q] = { queued: 0, running: 0, failed: 0, dead_lettered: 0, completed: 0 }
    const s = job.status as string
    if (s === "queued") queueMap[q].queued++
    else if (s === "running") queueMap[q].running++
    else if (s === "failed" || s === "retrying") queueMap[q].failed++
    else if (s === "dead_lettered") queueMap[q].dead_lettered++
    else if (s === "completed") queueMap[q].completed++
  }

  const totalDeadLettered = Object.values(queueMap).reduce((s, q) => s + q.dead_lettered, 0)
  const totalFailed = Object.values(queueMap).reduce((s, q) => s + q.failed, 0)
  const isHealthy = totalDeadLettered <= 5 && stuckJobs.length === 0

  const activeSources = sources.filter((s) => s.active)
  const inactiveSources = sources.filter((s) => !s.active)

  const toolRefreshStatus = latestToolRefresh?.status as string | undefined
  const toolRefreshOk = toolRefreshStatus === "completed"

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Automation Center</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Pipeline health, source jobs, and queue status (last 24h)</p>
        </div>
        <Link
          href="/admin/system/health"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Full health dashboard →
        </Link>
      </div>

      {/* Overall health banner */}
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
          isHealthy
            ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900/40"
            : "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900/40"
        }`}
      >
        <StatusDot ok={isHealthy} />
        <div>
          <p className={`text-sm font-medium ${isHealthy ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
            {isHealthy ? "All systems operating normally" : "Action required — see issues below"}
          </p>
          <p className="text-xs text-zinc-500 mt-0.5">
            {totalDeadLettered} dead-lettered · {totalFailed} failed · {stuckJobs.length} stuck
          </p>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Pending Review",
            value: pendingCount,
            icon: <Newspaper className="h-4 w-4 text-amber-500" />,
            href: "/admin/editorial",
            warn: pendingCount > 20,
          },
          {
            label: "Dead Letters",
            value: totalDeadLettered,
            icon: <AlertCircle className="h-4 w-4 text-red-500" />,
            href: "/admin/system/jobs?status=dead_lettered",
            warn: totalDeadLettered > 0,
          },
          {
            label: "Active Sources",
            value: activeSources.length,
            icon: <Rss className="h-4 w-4 text-blue-500" />,
            href: "/admin/sources",
            warn: false,
          },
          {
            label: "Stuck Jobs",
            value: stuckJobs.length,
            icon: <Activity className="h-4 w-4 text-orange-500" />,
            href: "/admin/system/jobs?status=running",
            warn: stuckJobs.length > 0,
          },
        ].map((m) => (
          <Link
            key={m.label}
            href={m.href}
            className="group p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              {m.icon}
              <span className="text-xs text-zinc-500 dark:text-zinc-400">{m.label}</span>
            </div>
            <p className={`text-2xl font-semibold ${m.warn ? "text-red-600 dark:text-red-400" : "text-zinc-900 dark:text-white"}`}>
              {m.value}
            </p>
          </Link>
        ))}
      </div>

      {/* Pipeline sections */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Source fetch pipeline */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
            <Rss className="h-4 w-4 text-zinc-500" />
            <h2 className="text-sm font-medium text-zinc-900 dark:text-white">Sources ({sources.length})</h2>
            <span className="ml-auto text-xs text-zinc-400">
              {activeSources.length} active · {inactiveSources.length} inactive
            </span>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 max-h-72 overflow-y-auto">
            {activeSources.slice(0, 15).map((src) => (
              <div key={src.id} className="flex items-center gap-3 px-4 py-2.5">
                <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-800 dark:text-zinc-200 truncate">{src.name}</p>
                  <p className="text-xs text-zinc-400">{src.source_type}</p>
                </div>
                <span className="text-xs text-zinc-400 shrink-0">
                  {formatRelative(src.last_fetched_at)}
                </span>
              </div>
            ))}
            {activeSources.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-zinc-400">No active sources</div>
            )}
          </div>
          {activeSources.length > 15 && (
            <div className="px-4 py-2 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-400 text-center">
              +{activeSources.length - 15} more · <Link href="/admin/sources" className="text-blue-600 dark:text-blue-400 hover:underline">View all</Link>
            </div>
          )}
        </div>

        {/* Queue stats */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
            <Activity className="h-4 w-4 text-zinc-500" />
            <h2 className="text-sm font-medium text-zinc-900 dark:text-white">Queue Stats (24h)</h2>
          </div>
          {Object.keys(queueMap).length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-zinc-400">No jobs in last 24h</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                  {["Queue", "Done", "Failed", "Dead"].map((h) => (
                    <th key={h} className="text-left px-4 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {Object.entries(queueMap).map(([name, stat]) => (
                  <tr key={name} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                    <td className="px-4 py-2 font-mono text-xs text-zinc-700 dark:text-zinc-300">{name}</td>
                    <td className="px-4 py-2 text-xs text-green-600 dark:text-green-400">{stat.completed}</td>
                    <td className="px-4 py-2 text-xs text-amber-600 dark:text-amber-400">{stat.failed}</td>
                    <td className="px-4 py-2 text-xs">
                      {stat.dead_lettered > 0 ? (
                        <span className="text-red-600 dark:text-red-400 font-medium">{stat.dead_lettered}</span>
                      ) : (
                        <span className="text-zinc-400">0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Tool refresh + stuck jobs */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Tool refresh status */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 flex items-center gap-4">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800">
            <Wrench className="h-5 w-5 text-zinc-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-zinc-900 dark:text-white">Tool Refresh</p>
            <p className="text-xs text-zinc-400">
              Last run: {latestToolRefresh ? formatRelative(latestToolRefresh.completed_at as string ?? latestToolRefresh.created_at as string) : "Never"}
            </p>
          </div>
          <StatusDot ok={toolRefreshOk} />
        </div>

        {/* Status monitor */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 flex items-center gap-4">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800">
            <RefreshCw className="h-5 w-5 text-zinc-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-zinc-900 dark:text-white">Status Monitor</p>
            <p className="text-xs text-zinc-400">External status pages — see health dashboard</p>
          </div>
          <Link href="/admin/system/health" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
            Details →
          </Link>
        </div>
      </div>

      {/* Stuck jobs warning */}
      {stuckJobs.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/40 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-orange-200 dark:border-orange-900/40 flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-500" />
            <h2 className="text-sm font-medium text-orange-700 dark:text-orange-400">
              Stuck Jobs ({stuckJobs.length}) — running &gt; 10 minutes
            </h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-orange-200 dark:border-orange-900/40 bg-orange-50/50 dark:bg-orange-950/10">
                {["Queue", "Type", "Started"].map((h) => (
                  <th key={h} className="text-left px-4 py-2 text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-100 dark:divide-orange-900/20">
              {(stuckJobs as Record<string, unknown>[]).map((job) => (
                <tr key={job.id as string}>
                  <td className="px-4 py-2 font-mono text-xs text-zinc-700 dark:text-zinc-300">{job.queue_name as string}</td>
                  <td className="px-4 py-2 text-xs text-zinc-500 dark:text-zinc-400">{job.job_type as string}</td>
                  <td className="px-4 py-2 text-xs text-zinc-500 dark:text-zinc-400">{formatRelative(job.started_at as string)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center gap-4 text-xs text-zinc-400 pt-2">
        <Link href="/admin/system/jobs" className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
          View all jobs →
        </Link>
        <Link href="/admin/sources" className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
          Manage sources →
        </Link>
        <Link href="/admin/editorial" className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
          Editorial queue →
        </Link>
      </div>
    </div>
  )
}
