import { createAdminClient } from "@/lib/supabase/server"
import { AI_CONFIG } from "@/lib/config/ai.config"

async function getAIStats() {
  const db = createAdminClient()
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: rows } = await db
    .from("ai_generations")
    .select("task, status, latency_ms, token_usage, model, prompt_version, created_at, error")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(500)

  const all = rows ?? []
  const completed = all.filter((r) => r.status === "completed")
  const failed = all.filter((r) => r.status === "failed")

  const totalInputTokens = completed.reduce((acc, r) => {
    const u = r.token_usage as { input?: number; output?: number } | null
    return acc + (u?.input ?? 0)
  }, 0)
  const totalOutputTokens = completed.reduce((acc, r) => {
    const u = r.token_usage as { input?: number; output?: number } | null
    return acc + (u?.output ?? 0)
  }, 0)

  const avgLatency =
    completed.length > 0
      ? Math.round(completed.reduce((acc, r) => acc + (r.latency_ms ?? 0), 0) / completed.length)
      : 0

  const byTask = completed.reduce<Record<string, number>>((acc, r) => {
    acc[r.task] = (acc[r.task] ?? 0) + 1
    return acc
  }, {})

  const byModel = completed.reduce<Record<string, number>>((acc, r) => {
    acc[r.model] = (acc[r.model] ?? 0) + 1
    return acc
  }, {})

  const recentErrors = failed.slice(0, 10)

  return {
    totalGenerations: all.length,
    completed: completed.length,
    failed: failed.length,
    totalInputTokens,
    totalOutputTokens,
    avgLatency,
    byTask,
    byModel,
    recentErrors,
    recent: all.slice(0, 20),
    promptVersion: rows?.[0]?.prompt_version ?? "—",
  }
}

export default async function AIUsagePage() {
  const stats = await getAIStats()
  const provider = AI_CONFIG.resolvedProvider()
  const configured = AI_CONFIG.isConfigured()

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI Usage</h1>
        <p className="text-sm text-muted-foreground mt-1">Last 7 days of AI generation activity</p>
      </div>

      {/* Provider status */}
      <div className="rounded-lg border p-4 flex items-center gap-3">
        <div className={`h-2.5 w-2.5 rounded-full ${configured ? "bg-green-500" : "bg-red-500"}`} />
        <div>
          <p className="text-sm font-medium">
            {configured ? `Provider: ${provider}` : "No AI provider configured"}
          </p>
          <p className="text-xs text-muted-foreground">
            {configured
              ? `Prompt version: ${stats.promptVersion}`
              : "Set ANTHROPIC_API_KEY or OPENROUTER_API_KEY to enable enrichment"}
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Generations", value: stats.totalGenerations.toLocaleString() },
          { label: "Completed", value: stats.completed.toLocaleString() },
          { label: "Failed", value: stats.failed.toLocaleString() },
          { label: "Avg Latency", value: `${stats.avgLatency}ms` },
        ].map((card) => (
          <div key={card.label} className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">{card.label}</p>
            <p className="text-2xl font-semibold mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Token usage */}
      <div className="rounded-lg border p-4 space-y-2">
        <h2 className="text-sm font-medium">Token Usage (7d)</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Input tokens</p>
            <p className="text-lg font-semibold">{stats.totalInputTokens.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Output tokens</p>
            <p className="text-lg font-semibold">{stats.totalOutputTokens.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* By task */}
      {Object.keys(stats.byTask).length > 0 && (
        <div className="rounded-lg border p-4 space-y-2">
          <h2 className="text-sm font-medium">Completions by Task</h2>
          <div className="divide-y">
            {Object.entries(stats.byTask)
              .sort(([, a], [, b]) => b - a)
              .map(([task, count]) => (
                <div key={task} className="flex items-center justify-between py-2 text-sm">
                  <span className="font-mono text-xs text-muted-foreground">{task}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* By model */}
      {Object.keys(stats.byModel).length > 0 && (
        <div className="rounded-lg border p-4 space-y-2">
          <h2 className="text-sm font-medium">Completions by Model</h2>
          <div className="divide-y">
            {Object.entries(stats.byModel)
              .sort(([, a], [, b]) => b - a)
              .map(([model, count]) => (
                <div key={model} className="flex items-center justify-between py-2 text-sm">
                  <span className="font-mono text-xs text-muted-foreground">{model}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Recent failures */}
      {stats.recentErrors.length > 0 && (
        <div className="rounded-lg border border-destructive/30 p-4 space-y-2">
          <h2 className="text-sm font-medium text-destructive">Recent Failures</h2>
          <div className="divide-y divide-destructive/10">
            {stats.recentErrors.map((row, i) => (
              <div key={i} className="py-2 text-xs space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-muted-foreground">{row.task}</span>
                  <span className="text-muted-foreground">
                    {new Date(row.created_at).toLocaleString()}
                  </span>
                </div>
                {row.error && (
                  <p className="text-destructive/80 truncate">{row.error}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent generations table */}
      <div className="rounded-lg border overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-sm font-medium">Recent Generations</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr>
                {["Task", "Status", "Model", "Latency", "Tokens", "Time"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left font-medium text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {stats.recent.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                    No AI generations in the last 7 days
                  </td>
                </tr>
              ) : (
                stats.recent.map((row, i) => {
                  const u = row.token_usage as { input?: number; output?: number } | null
                  const tokens = u ? `${u.input ?? 0}→${u.output ?? 0}` : "—"
                  return (
                    <tr key={i} className="hover:bg-muted/30">
                      <td className="px-3 py-2 font-mono">{row.task}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium ${
                            row.status === "completed"
                              ? "bg-green-50 text-green-700"
                              : row.status === "failed"
                              ? "bg-red-50 text-red-700"
                              : "bg-yellow-50 text-yellow-700"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-mono text-muted-foreground">{row.model}</td>
                      <td className="px-3 py-2 text-muted-foreground">{row.latency_ms}ms</td>
                      <td className="px-3 py-2 text-muted-foreground">{tokens}</td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {new Date(row.created_at).toLocaleString()}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
