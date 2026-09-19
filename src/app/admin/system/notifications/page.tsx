import { NotificationService } from "@/lib/services/notification.service"
import { createAdminClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export default async function NotificationsPage() {
  const db = createAdminClient()

  const [all, pending] = await Promise.all([
    NotificationService.getHistory(200),
    NotificationService.getPending(200),
  ])

  const { count: sentCount } = await db
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .not("read_at", "is", null)

  const pendingCount = pending.length
  const totalCount = all.length
  const failedCount = 0 // no failed status in schema

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">Notifications</h1>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending", value: pendingCount, color: "text-amber-600" },
          { label: "Sent", value: sentCount ?? 0, color: "text-green-600" },
          { label: "Failed", value: failedCount, color: "text-red-600" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4"
          >
            <div className="text-sm text-zinc-500 dark:text-zinc-400">{stat.label}</div>
            <div className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Recent Notifications ({totalCount})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                {["Channel", "Subject", "Status", "Created"].map((h) => (
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
              {all.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-zinc-400">
                    No notifications yet
                  </td>
                </tr>
              )}
              {all.map((n) => {
                const sent = !!n.read_at
                return (
                  <tr key={n.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                    <td className="px-4 py-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {n.event_type}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-zinc-700 dark:text-zinc-300 truncate max-w-xs">
                      {n.title}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          sent
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        }`}
                      >
                        {sent ? "Sent" : "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-zinc-500 dark:text-zinc-400 text-xs">
                      {new Date(n.created_at).toLocaleString()}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
