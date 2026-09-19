import { JobService } from "@/lib/services/job.service"
import { SourceService } from "@/lib/services/source.service"
import { createAdminClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export default async function HealthPage() {
  const db = createAdminClient()

  const [queueStats, sourcesResult, deadJobs, aiStats] = await Promise.all([
    JobService.getQueueStats(),
    SourceService.getSources({ perPage: 100 }),
    db
      .from("jobs")
      .select("id, queue_name, job_type, last_error, failed_at, created_at")
      .eq("status", "dead_lettered")
      .order("failed_at", { ascending: false })
      .limit(10),
    db
      .from("ai_generations")
      .select("id, latency_ms, token_usage")
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
  ])

  const totalDeadLettered = Object.values(queueStats).reduce(
    (sum, q) => sum + q.dead_lettered,
    0
  )
  const isHealthy = totalDeadLettered <= 5
  const aiRows = aiStats.data ?? []
  const aiCalls = aiRows.length
  const avgLatency =
    aiCalls > 0
      ? Math.round(aiRows.reduce((s, r) => s + (r.latency_ms ?? 0), 0) / aiCalls)
      : 0
  const totalTokens = aiRows.reduce((s, r) => s + (r.token_usage ?? 0), 0)

  const queueEntries = Object.entries(queueStats)

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">System Health</h1>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
            isHealthy
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${isHealthy ? "bg-green-500" : "bg-red-500"}`}
          />
          {isHealthy ? "All Systems Operational" : "Degraded"}
        </span>
      </div>

      {/* AI Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "AI Calls (24h)", value: aiCalls.toLocaleString() },
          { label: "Avg Latency", value: `${avgLatency}ms` },
          { label: "Total Tokens", value: totalTokens.toLocaleString() },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4"
          >
            <div className="text-sm text-zinc-500 dark:text-zinc-400">{s.label}</div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Queue Health */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Queue Health</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
              {["Queue", "Queued", "Running", "Failed", "Dead Letter"].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {queueEntries.map(([name, stats]) => (
              <tr
                key={name}
                className={
                  stats.dead_lettered > 0
                    ? "bg-red-50 dark:bg-red-950/20"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
                }
              >
                <td className="px-4 py-2 font-mono text-xs text-zinc-700 dark:text-zinc-300">
                  {name}
                </td>
                <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">{stats.queued}</td>
                <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">{stats.running}</td>
                <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">{stats.failed}</td>
                <td className="px-4 py-2">
                  {stats.dead_lettered > 0 ? (
                    <span className="text-red-600 dark:text-red-400 font-medium">
                      {stats.dead_lettered}
                    </span>
                  ) : (
                    <span className="text-zinc-400">0</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Source Health */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Source Health ({sourcesResult.total})
          </h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
              {["Name", "Type", "Status", "Last Fetched", "Failures"].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {sourcesResult.data.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-400">
                  No sources configured
                </td>
              </tr>
            )}
            {sourcesResult.data.map((source) => (
              <tr key={source.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                <td className="px-4 py-2 text-zinc-700 dark:text-zinc-300 font-medium">
                  {source.name}
                </td>
                <td className="px-4 py-2 text-zinc-500 dark:text-zinc-400 text-xs">
                  {source.source_type}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                      source.health_status === "healthy"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : source.health_status === "warning"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {source.health_status ?? "unknown"}
                  </span>
                </td>
                <td className="px-4 py-2 text-zinc-500 dark:text-zinc-400 text-xs">
                  {source.last_fetched_at
                    ? new Date(source.last_fetched_at).toLocaleString()
                    : "Never"}
                </td>
                <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                  {source.failure_count ?? 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dead Letter Queue */}
      {(deadJobs.data ?? []).length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900/40 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20">
            <h2 className="text-sm font-medium text-red-700 dark:text-red-400">
              Dead Letter Queue ({(deadJobs.data ?? []).length})
            </h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                {["Queue", "Type", "Error", "Failed At", "Action"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {(deadJobs.data ?? []).map((job) => (
                <tr key={job.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="px-4 py-2 font-mono text-xs text-zinc-700 dark:text-zinc-300">
                    {job.queue_name}
                  </td>
                  <td className="px-4 py-2 text-xs text-zinc-500 dark:text-zinc-400">
                    {job.job_type}
                  </td>
                  <td className="px-4 py-2 text-xs text-red-600 dark:text-red-400 max-w-xs truncate">
                    {job.last_error ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-xs text-zinc-500 dark:text-zinc-400">
                    {job.failed_at ? new Date(job.failed_at).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-2">
                    <form
                      action={`/api/admin/jobs/${job.id}/retry`}
                      method="POST"
                    >
                      <button
                        type="submit"
                        className="text-xs px-2 py-1 rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
                      >
                        Retry
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
