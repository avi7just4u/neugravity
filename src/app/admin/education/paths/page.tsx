import type { Metadata } from "next"
import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/server"
import { PageHeader, StatusBadge } from "@/components/admin"
import { Map, Clock } from "lucide-react"

export const metadata: Metadata = { title: "Learning Paths" }
export const dynamic = "force-dynamic"

const STATUS_FILTERS = ["all", "draft", "review", "approved", "published", "archived"]

async function getPaths(status?: string) {
  try {
    const db = createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q: any = db
      .from("learning_paths")
      .select("id,title,slug,description,short_description,difficulty,estimated_hours,status,is_demo,featured,updated_at")
      .order("updated_at", { ascending: false })

    if (status && status !== "all") q = q.eq("status", status)

    const { data } = await q
    return (data ?? []) as {
      id: string
      title: string
      slug: string
      description: string
      short_description: string | null
      difficulty: string
      estimated_hours: number | null
      status: string
      is_demo: boolean
      featured: boolean
      updated_at: string
    }[]
  } catch {
    return []
  }
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30",
  intermediate: "text-blue-600 bg-blue-50 dark:bg-blue-950/30",
  advanced: "text-purple-600 bg-purple-50 dark:bg-purple-950/30",
  expert: "text-red-600 bg-red-50 dark:bg-red-950/30",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export default async function EducationPathsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status = "all" } = await searchParams
  const paths = await getPaths(status === "all" ? undefined : status)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Learning Paths"
        description={`${paths.length} path${paths.length !== 1 ? "s" : ""} total`}
        actions={
          <Link
            href="/admin/education"
            className="text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          >
            ← Education
          </Link>
        }
      />

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <a
            key={f}
            href={`/admin/education/paths${f !== "all" ? `?status=${f}` : ""}`}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              status === f || (f === "all" && status === "all")
                ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white"
                : "border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </a>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-950">
        {paths.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Map className="h-10 w-10 text-zinc-300 dark:text-zinc-700 mb-3" />
            <p className="text-sm font-medium text-zinc-500">No learning paths</p>
            <p className="text-xs text-zinc-400 mt-1">
              {status !== "all" ? `No paths with status "${status}"` : "Create learning paths to get started"}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">Title</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-zinc-500 hidden md:table-cell">Difficulty</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-zinc-500 hidden md:table-cell">Hours</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">Status</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-zinc-500 hidden lg:table-cell">Updated</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paths.map((path) => (
                <tr key={path.id} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20">
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2">
                      <div>
                        <div className="font-medium text-zinc-900 dark:text-white">{path.title}</div>
                        {path.short_description && (
                          <div className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{path.short_description}</div>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          {path.is_demo && (
                            <span className="text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">demo</span>
                          )}
                          {path.featured && (
                            <span className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded">featured</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[path.difficulty] ?? ""}`}>
                      {path.difficulty}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {path.estimated_hours ? (
                      <span className="flex items-center gap-1 text-zinc-500">
                        <Clock className="h-3 w-3" />
                        {path.estimated_hours}h
                      </span>
                    ) : (
                      <span className="text-zinc-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={path.status} />
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-zinc-400 text-xs">
                    {formatDate(path.updated_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/education/paths/${path.id}`}
                      className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 font-medium transition-colors"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
