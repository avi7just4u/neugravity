import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Rss, Globe, CheckCircle, XCircle, Clock } from "lucide-react"

export const metadata: Metadata = { title: "Sources" }

async function getSources() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("sources")
      .select("*")
      .order("created_at", { ascending: false })
    return data ?? []
  } catch {
    return []
  }
}

export default async function SourcesPage() {
  const sources = await getSources()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Sources</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage content ingestion sources
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Source
        </Button>
      </div>

      {sources.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-12 text-center">
          <Rss className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
          <h3 className="font-medium text-zinc-900 dark:text-white mb-1">No sources configured</h3>
          <p className="text-sm text-zinc-400 mb-4">
            Add RSS feeds, official blogs, and APIs to start ingesting content.
          </p>
          <Button variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Add your first source
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Source</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Trust</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Last Fetched</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {sources.map((source: Record<string, unknown>) => (
                <tr key={source.id as string} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-zinc-400 shrink-0" />
                      <div>
                        <div className="font-medium text-zinc-900 dark:text-white">{source.name as string}</div>
                        <div className="text-xs text-zinc-400">{source.domain as string}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className="text-xs">{source.source_type as string}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 w-1.5 rounded-full ${i < Math.floor((source.trust_level as number) / 2) ? "bg-green-500" : "bg-zinc-200 dark:bg-zinc-700"}`}
                        />
                      ))}
                      <span className="text-xs text-zinc-400 ml-1">{source.trust_level as number}/10</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-zinc-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {source.last_fetched_at ? new Date(source.last_fetched_at as string).toLocaleDateString() : "Never"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {source.active ? (
                      <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-zinc-400">
                        <XCircle className="h-3.5 w-3.5" />
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="ghost">Edit</Button>
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
