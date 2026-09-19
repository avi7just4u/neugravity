import type { Metadata } from "next"
import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/server"
import { Clock, RefreshCw, AlertCircle, CheckCircle, Loader, SkipForward } from "lucide-react"
import { JobActions } from "./job-actions"

export const metadata: Metadata = { title: "Job Monitor" }
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

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  queued:        { label: "Queued",       className: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",    icon: Clock },
  running:       { label: "Running",      className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: Loader },
  completed:     { label: "Completed",    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle },
  failed:        { label: "Failed",       className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",     icon: AlertCircle },
  retrying:      { label: "Retrying",     className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: RefreshCw },
  dead_lettered: { label: "Dead Letter",  className: "bg-red-200 text-red-800 dark:bg-red-950 dark:text-red-300",        icon: AlertCircle },
  skipped:       { label: "Skipped",      className: "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500",    icon: SkipForward },
}

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "queued", label: "Queued" },
  { key: "running", label: "Running" },
  { key: "failed", label: "Failed" },
  { key: "dead_lettered", label: "Dead Letter" },
  { key: "completed", label: "Completed" },
]

async function getJobs(status: string) {
  try {
    const db = createAdminClient()
    let q = db
      .from("jobs")
      .select("id, type, status, priority, attempt_count, max_attempts, payload, error, created_at, scheduled_for, started_at, completed_at")
      .order("created_at", { ascending: false })
      .limit(100)
    if (status !== "all") q = q.eq("status", status)
    const { data } = await q
    return (data ?? []) as Record<string, unknown>[]
  } catch {
    return []
  }
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status = "all" } = await searchParams
  const jobs = await getJobs(status)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Job Monitor</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Background job queue status and history</p>
      </div>

      <div className="flex gap-1 border-b border-zinc-200 dark:border-zinc-800">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.key}
            href={tab.key === "all" ? "/admin/system/jobs" : `/admin/system/jobs?status=${tab.key}`}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px capitalize ${
              status === tab.key
                ? "border-zinc-900 dark:border-white text-zinc-900 dark:text-white"
                : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {jobs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-12 text-center">
          <Clock className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
          <h3 className="font-medium text-zinc-900 dark:text-white mb-1">No jobs found</h3>
          <p className="text-sm text-zinc-400">Job queue is empty for this status.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Job</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Attempts</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Created</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Error</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {jobs.map((job) => {
                const s = (job.status as string) ?? "queued"
                const cfg = STATUS_CONFIG[s] ?? STATUS_CONFIG.queued
                const Icon = cfg.icon
                const canRetry = s === "failed" || s === "dead_lettered"
                return (
                  <tr key={job.id as string} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs text-zinc-900 dark:text-white">{job.type as string}</div>
                      <div className="text-xs text-zinc-400 font-mono mt-0.5 truncate max-w-[180px]">
                        {job.id as string}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
                        <Icon className="h-3 w-3" />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-zinc-500">{job.priority as number}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${(job.attempt_count as number) >= (job.max_attempts as number) ? "text-red-600 dark:text-red-400" : "text-zinc-500"}`}>
                        {job.attempt_count as number}/{job.max_attempts as number}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-xs text-zinc-400">
                        <Clock className="h-3 w-3" />
                        {formatRelative(job.created_at as string | null)}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      {job.error ? (
                        <span className="text-xs text-red-600 dark:text-red-400 line-clamp-2 font-mono">
                          {job.error as string}
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-300 dark:text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {canRetry && <JobActions id={job.id as string} />}
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
