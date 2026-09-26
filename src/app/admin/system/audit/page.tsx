import Link from "next/link"
import { AuditService } from "@/lib/services/audit.service"

export const metadata = { title: "Audit Log | Admin" }
export const dynamic = "force-dynamic"

function actionBadge(action: string) {
  const greenActions = ["approve", "publish"]
  const redActions = ["reject", "delete"]
  const amberActions = ["retry_job"]

  let cls = "inline-block rounded px-2 py-0.5 text-xs font-medium font-mono"
  if (greenActions.includes(action)) {
    cls += " bg-green-100 text-green-800"
  } else if (redActions.includes(action)) {
    cls += " bg-red-100 text-red-800"
  } else if (amberActions.includes(action)) {
    cls += " bg-amber-100 text-amber-800"
  } else {
    cls += " bg-zinc-100 text-zinc-700"
  }
  return cls
}

function formatTs(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

function truncate(s: string | null | undefined, max: number): string {
  if (!s) return "—"
  return s.length > max ? s.slice(0, max) + "…" : s
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; action?: string }>
}) {
  const { page: pageStr, action } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? "1", 10))
  const perPage = 50

  const { data: logs, total } = await AuditService.getLogs({
    page,
    perPage,
    action: action || undefined,
  })

  const totalPages = Math.ceil(total / perPage)

  function pageUrl(p: number, currentAction?: string) {
    const params = new URLSearchParams()
    if (p > 1) params.set("page", String(p))
    if (currentAction) params.set("action", currentAction)
    const qs = params.toString()
    return `/admin/system/audit${qs ? `?${qs}` : ""}`
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-900">Audit Log</h1>
        <p className="mt-1 text-sm text-zinc-500">
          All admin actions are recorded here. {total > 0 && `${total.toLocaleString()} events total.`}
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-12 text-center">
          <p className="text-sm text-zinc-500">
            No audit events yet. Events are recorded when admins take actions.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-zinc-200">
            <table className="min-w-full divide-y divide-zinc-200 text-sm">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600 whitespace-nowrap">
                    Timestamp
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600">Actor</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600">Action</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600">Entity</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600">Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 bg-white">
                {logs.map((log) => {
                  const entityId = log.entity_id_text ?? log.entity_id ?? null
                  return (
                    <tr key={log.id} className="hover:bg-zinc-50">
                      <td className="px-4 py-3 whitespace-nowrap text-zinc-500">
                        <span title={log.created_at}>{formatTs(log.created_at)}</span>
                      </td>
                      <td className="px-4 py-3 text-zinc-700">
                        {truncate(log.actor_email, 30)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={actionBadge(log.action)}>{log.action}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-zinc-600">
                          {log.entity_type}
                          {entityId ? ` #${truncate(entityId, 8)}` : ""}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-600">
                        {truncate(log.summary, 80)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-zinc-500">
              <span>
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link
                    href={pageUrl(page - 1, action)}
                    className="rounded border border-zinc-200 px-3 py-1 hover:bg-zinc-50"
                  >
                    Previous
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={pageUrl(page + 1, action)}
                    className="rounded border border-zinc-200 px-3 py-1 hover:bg-zinc-50"
                  >
                    Next
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
