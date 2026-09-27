import type { Metadata } from "next"
import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/server"
import { OpportunityService } from "@/lib/services/opportunity.service"
import { PageHeader, StatCard } from "@/components/admin"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { requireAdminAuth } from "@/lib/auth/admin-auth"
import { redirect } from "next/navigation"
import {
  Lightbulb,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  RefreshCw,
  Plus,
  Video,
  FileText,
  Cpu,
  Wrench,
  BarChart3,
  BookOpen,
  Newspaper,
} from "lucide-react"
import { OpportunityGenerateButton } from "./generate-button"
import type { ContentOpportunity, OpportunityStatus } from "@/types"

export const metadata: Metadata = { title: "Content Opportunities" }
export const dynamic = "force-dynamic"

const STATUS_TABS: { key: OpportunityStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "review", label: "Review" },
  { key: "approved", label: "Approved" },
  { key: "assigned", label: "Assigned" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "dismissed", label: "Dismissed" },
]

const CONTENT_TYPE_ICON: Record<string, React.ReactNode> = {
  youtube_video: <Video className="h-3.5 w-3.5" />,
  short: <Video className="h-3.5 w-3.5" />,
  article: <FileText className="h-3.5 w-3.5" />,
  newsletter: <Newspaper className="h-3.5 w-3.5" />,
  technology_page: <Cpu className="h-3.5 w-3.5" />,
  tool_page: <Wrench className="h-3.5 w-3.5" />,
  comparison: <BarChart3 className="h-3.5 w-3.5" />,
  course: <BookOpen className="h-3.5 w-3.5" />,
  learning_path: <BookOpen className="h-3.5 w-3.5" />,
  interview: <FileText className="h-3.5 w-3.5" />,
  update_existing_content: <RefreshCw className="h-3.5 w-3.5" />,
}

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  low: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
}

const GAP_COLORS: Record<string, string> = {
  missing: "destructive",
  weak: "secondary",
  stale: "outline",
  disconnected: "info",
  underdeveloped: "secondary",
  duplicate_candidate: "outline",
}

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

function OpportunityCard({ opportunity }: { opportunity: ContentOpportunity }) {
  return (
    <Link
      href={`/admin/content-opportunities/${opportunity.id}`}
      className="group block p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`px-1.5 py-0.5 text-xs rounded font-medium ${PRIORITY_COLORS[opportunity.priority]}`}>
            {opportunity.priority.toUpperCase()}
          </span>
          <span className="flex items-center gap-1 text-xs text-zinc-400">
            {CONTENT_TYPE_ICON[opportunity.content_type]}
            <span className="capitalize">{opportunity.content_type.replace(/_/g, " ")}</span>
          </span>
        </div>
        <ArrowRight className="h-4 w-4 text-zinc-300 group-hover:text-zinc-500 shrink-0 mt-0.5" />
      </div>

      <h3 className="font-medium text-zinc-900 dark:text-white text-sm mb-1 truncate">
        {opportunity.title_suggestion ?? opportunity.topic}
      </h3>

      {opportunity.reason && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-2">{opportunity.reason}</p>
      )}

      <div className="flex flex-wrap items-center gap-2 mt-2">
        {opportunity.gap_type && (
          <Badge variant={(GAP_COLORS[opportunity.gap_type] ?? "outline") as "destructive" | "secondary" | "outline" | "success" | "info"} className="text-xs capitalize">
            {opportunity.gap_type.replace(/_/g, " ")}
          </Badge>
        )}
        {opportunity.source && (
          <span className="text-xs text-zinc-400 capitalize">
            {opportunity.source.replace(/_/g, " ")}
          </span>
        )}
        <span className="text-xs text-zinc-300 dark:text-zinc-600 ml-auto">{formatRelative(opportunity.created_at)}</span>
      </div>
    </Link>
  )
}

async function getOpportunities(status: string | undefined, page: number) {
  const filters = status && status !== "all"
    ? { status: status as OpportunityStatus, page, perPage: 20 }
    : { page, perPage: 20 }
  return OpportunityService.list(filters)
}

async function getSearchSignalPreview() {
  try {
    const db = createAdminClient()
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const { count } = await db
      .from("search_query_log")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since)
    return count ?? 0
  } catch {
    return 0
  }
}

export default async function ContentOpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string; priority?: string }>
}) {
  const authResult = await requireAdminAuth(["admin", "super_admin", "editor", "analyst", "author", "reviewer"])
  if (authResult instanceof Response) redirect("/login?redirect=/admin/content-opportunities")

  const { status, page: pageStr } = await searchParams
  const page = parseInt(pageStr ?? "1")

  const [counts, { data: opportunities, total }, searchCount] = await Promise.all([
    OpportunityService.getSummaryCounts(),
    getOpportunities(status, page),
    getSearchSignalPreview(),
  ])

  const activeTab = status ?? "all"
  const totalActive = counts.new + counts.review + counts.approved + counts.assigned + counts.in_progress

  return (
    <div>
      <PageHeader
        title="Content Opportunities"
        description="What should NeuGravity create? Why? For whom?"
        breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Content Opportunities" }]}
        actions={
          <div className="flex items-center gap-2">
            <OpportunityGenerateButton />
            <Button size="sm" asChild>
              <Link href="/admin/content-opportunities/new">
                <Plus className="h-4 w-4 mr-1" /> New
              </Link>
            </Button>
          </div>
        }
      />

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Active"
          value={totalActive}
          icon={<Lightbulb className="h-4 w-4" />}
        />
        <StatCard
          label="High Priority"
          value={counts.new + counts.review}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          label="Search Queries (30d)"
          value={searchCount}
          icon={<Clock className="h-4 w-4" />}
        />
        <StatCard
          label="Completed"
          value={counts.completed}
          icon={<CheckCircle className="h-4 w-4" />}
        />
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-1 mb-6 flex-wrap border-b border-zinc-200 dark:border-zinc-800 pb-px">
        {STATUS_TABS.map((tab) => {
          const count =
            tab.key === "all"
              ? Object.values(counts).reduce((s, n) => s + n, 0)
              : counts[tab.key as OpportunityStatus] ?? 0
          const isActive = activeTab === tab.key
          return (
            <Link
              key={tab.key}
              href={tab.key === "all" ? "/admin/content-opportunities" : `/admin/content-opportunities?status=${tab.key}`}
              className={`px-3 py-2 text-sm rounded-t-md border-b-2 -mb-px transition-colors ${
                isActive
                  ? "border-zinc-900 text-zinc-900 font-medium dark:border-white dark:text-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${isActive ? "bg-zinc-100 dark:bg-zinc-800" : "bg-zinc-50 dark:bg-zinc-900"}`}>
                {count}
              </span>
            </Link>
          )
        })}
      </div>

      {/* Opportunity list */}
      {opportunities.length === 0 ? (
        <div className="py-20 text-center">
          <Lightbulb className="h-10 w-10 mx-auto mb-3 text-zinc-300" />
          <p className="text-zinc-500 text-sm">No opportunities in this category.</p>
          <p className="text-zinc-400 text-xs mt-1">
            Run analysis to detect gaps, or create one manually.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-6">
            {opportunities.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
          </div>

          {/* Pagination */}
          {total > 20 && (
            <div className="flex items-center justify-between text-sm text-zinc-500">
              <span>Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}</span>
              <div className="flex gap-2">
                {page > 1 && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`?${status ? `status=${status}&` : ""}page=${page - 1}`}>Previous</Link>
                  </Button>
                )}
                {page * 20 < total && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`?${status ? `status=${status}&` : ""}page=${page + 1}`}>Next</Link>
                  </Button>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Data transparency notice */}
      <p className="text-xs text-zinc-400 mt-8 border-t border-zinc-100 dark:border-zinc-800 pt-4">
        Search counts reflect NeuGravity internal search activity only. No external SEO or traffic data is used.
        Priorities are internal editorial signals, not objective popularity rankings.
      </p>
    </div>
  )
}
