import { ToolRefreshService } from "@/lib/services/tool-refresh.service"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

export const dynamic = "force-dynamic"

export default async function ToolChangesPage() {
  const pending = await ToolRefreshService.getPendingChanges(100)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Tool Change Events</h1>
        <p className="text-sm text-zinc-500 mt-1">Review and approve detected changes to tool data.</p>
      </div>

      {pending.length === 0 ? (
        <div className="text-center py-16 text-zinc-400">No pending changes.</div>
      ) : (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900 text-zinc-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Tool</th>
                <th className="text-left px-4 py-3">Field</th>
                <th className="text-left px-4 py-3">Old Value</th>
                <th className="text-left px-4 py-3">New Value</th>
                <th className="text-left px-4 py-3">Detected</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {pending.map((change: any) => (
                <tr key={change.id} className="bg-white dark:bg-zinc-900">
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white">
                    {change.tools?.name ?? change.tool_id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className="font-mono text-xs">{change.field_name}</Badge>
                  </td>
                  <td className="px-4 py-3 text-zinc-400 max-w-[140px] truncate">{change.old_value ?? "—"}</td>
                  <td className="px-4 py-3 text-zinc-900 dark:text-white max-w-[140px] truncate">{change.new_value ?? "—"}</td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">
                    {formatDistanceToNow(new Date(change.detected_at), { addSuffix: true })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <form action={`/api/admin/tools/changes/${change.id}/approve`} method="POST">
                        <button
                          type="submit"
                          className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 transition-colors"
                        >
                          Approve
                        </button>
                      </form>
                      <form action={`/api/admin/tools/changes/${change.id}/reject`} method="POST">
                        <button
                          type="submit"
                          className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors"
                        >
                          Reject
                        </button>
                      </form>
                    </div>
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
