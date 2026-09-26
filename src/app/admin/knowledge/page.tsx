import type { Metadata } from "next"
import { createAdminClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/admin"
import { Network, CheckCircle, Clock } from "lucide-react"
import { KnowledgeRelationshipTable } from "./knowledge-relationship-table"

export const metadata: Metadata = { title: "Knowledge Graph" }
export const dynamic = "force-dynamic"

const RELATIONSHIP_COLORS: Record<string, string> = {
  DEPENDS_ON:     "text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400",
  USES:           "text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400",
  BUILT_BY:       "text-purple-600 bg-purple-50 dark:bg-purple-950/30 dark:text-purple-400",
  MAINTAINED_BY:  "text-purple-600 bg-purple-50 dark:bg-purple-950/30 dark:text-purple-400",
  CREATED_BY:     "text-purple-600 bg-purple-50 dark:bg-purple-950/30 dark:text-purple-400",
  RELATED_TO:     "text-zinc-600 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300",
  INTEGRATES_WITH:"text-green-600 bg-green-50 dark:bg-green-950/30 dark:text-green-400",
  ALTERNATIVE_TO: "text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400",
  COMPETES_WITH:  "text-orange-600 bg-orange-50 dark:bg-orange-950/30 dark:text-orange-400",
}

async function getStats() {
  try {
    const db = createAdminClient()
    const [total, verified, pending] = await Promise.all([
      db.from("entity_relationships").select("id", { count: "exact", head: true }),
      db.from("entity_relationships").select("id", { count: "exact", head: true }).eq("verified", true),
      db.from("entity_relationships").select("id", { count: "exact", head: true }).eq("verified", false).eq("created_by_type", "ai"),
    ])
    return {
      total: total.count ?? 0,
      verified: verified.count ?? 0,
      pending: pending.count ?? 0,
    }
  } catch {
    return { total: 0, verified: 0, pending: 0 }
  }
}

async function getRelationships(filter: string) {
  try {
    const db = createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q: any = db
      .from("entity_relationships")
      .select("*")
      .order("verified", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(100)

    if (filter === "verified") q = q.eq("verified", true)
    if (filter === "pending") q = q.eq("verified", false).eq("created_by_type", "ai")

    const { data } = await q
    return (data ?? []) as Record<string, unknown>[]
  } catch {
    return []
  }
}

export default async function KnowledgePage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const { filter = "all" } = await searchParams
  const [stats, relationships] = await Promise.all([getStats(), getRelationships(filter)])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Knowledge Graph"
        description="Entity relationships powering the NeuGravity intelligence layer"
        actions={
          <div className="flex items-center gap-2 text-sm">
            <Network className="h-4 w-4 text-zinc-400" />
            <span className="text-zinc-500">{stats.total} relationships</span>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Network className="h-4 w-4 text-zinc-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wide font-semibold">Total</span>
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">{stats.total}</div>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-xs text-zinc-500 uppercase tracking-wide font-semibold">Verified</span>
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.verified}</div>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-amber-500" />
            <span className="text-xs text-zinc-500 uppercase tracking-wide font-semibold">Pending AI Review</span>
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { key: "all", label: "All" },
          { key: "verified", label: "Verified" },
          { key: "pending", label: "Pending AI Review" },
        ].map((f) => (
          <a
            key={f.key}
            href={`/admin/knowledge${f.key !== "all" ? `?filter=${f.key}` : ""}`}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              filter === f.key || (f.key === "all" && !filter)
                ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white"
                : "border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400"
            }`}
          >
            {f.label}
          </a>
        ))}
      </div>

      {/* Table */}
      <KnowledgeRelationshipTable
        relationships={relationships}
        relationshipColors={RELATIONSHIP_COLORS}
      />
    </div>
  )
}
