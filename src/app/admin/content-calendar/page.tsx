import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/server"
import { requireAdminAuth } from "@/lib/auth/admin-auth"
import { PageHeader } from "@/components/admin"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Video,
  FileText,
  Cpu,
  Wrench,
  BarChart3,
  BookOpen,
  Newspaper,
  RefreshCw,
  ArrowRight,
} from "lucide-react"
import type { ContentOpportunity } from "@/types"

export const metadata: Metadata = { title: "Content Calendar" }
export const dynamic = "force-dynamic"

const CONTENT_TYPE_ICON: Record<string, React.ReactNode> = {
  youtube_video: <Video className="h-3 w-3" />,
  short: <Video className="h-3 w-3" />,
  article: <FileText className="h-3 w-3" />,
  newsletter: <Newspaper className="h-3 w-3" />,
  technology_page: <Cpu className="h-3 w-3" />,
  tool_page: <Wrench className="h-3 w-3" />,
  comparison: <BarChart3 className="h-3 w-3" />,
  course: <BookOpen className="h-3 w-3" />,
  learning_path: <BookOpen className="h-3 w-3" />,
  interview: <FileText className="h-3 w-3" />,
  update_existing_content: <RefreshCw className="h-3 w-3" />,
}

const STATUS_COLORS: Record<string, string> = {
  new: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  review: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  assigned: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  in_progress: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  dismissed: "bg-zinc-50 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600",
}

async function getScheduledOpportunities(): Promise<{
  scheduled: ContentOpportunity[]
  unscheduled: ContentOpportunity[]
}> {
  try {
    const db = createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (db as any)
      .from("content_opportunities")
      .select("*")
      .not("status", "in", '("dismissed","completed")')
      .order("target_publish_date", { ascending: true, nullsFirst: false })
      .limit(100)

    const all = (data ?? []) as ContentOpportunity[]
    return {
      scheduled: all.filter((o) => o.target_publish_date),
      unscheduled: all.filter((o) => !o.target_publish_date),
    }
  } catch {
    return { scheduled: [], unscheduled: [] }
  }
}

function groupByMonth(opportunities: ContentOpportunity[]): Map<string, ContentOpportunity[]> {
  const map = new Map<string, ContentOpportunity[]>()
  for (const opp of opportunities) {
    if (!opp.target_publish_date) continue
    const month = opp.target_publish_date.slice(0, 7) // YYYY-MM
    if (!map.has(month)) map.set(month, [])
    map.get(month)!.push(opp)
  }
  return map
}

function formatMonth(ym: string): string {
  const [year, month] = ym.split("-")
  return new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })
}

function CalendarItem({ opportunity }: { opportunity: ContentOpportunity }) {
  return (
    <Link
      href={`/admin/content-opportunities/${opportunity.id}`}
      className="group flex items-start gap-2 p-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors text-sm"
    >
      <span className="flex items-center justify-center h-5 w-5 rounded-sm text-zinc-400 mt-0.5 shrink-0">
        {CONTENT_TYPE_ICON[opportunity.content_type]}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-zinc-900 dark:text-white font-medium truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-xs">
          {opportunity.title_suggestion ?? opportunity.topic}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`text-xs px-1 py-0.5 rounded ${STATUS_COLORS[opportunity.status]}`}>
            {opportunity.status.replace(/_/g, " ")}
          </span>
          {opportunity.target_publish_date && (
            <span className="text-xs text-zinc-400">
              {new Date(opportunity.target_publish_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          )}
        </div>
      </div>
      <ArrowRight className="h-3 w-3 text-zinc-300 group-hover:text-zinc-500 mt-1 shrink-0" />
    </Link>
  )
}

export default async function ContentCalendarPage() {
  const authResult = await requireAdminAuth(["admin", "super_admin", "editor", "analyst", "author", "reviewer"])
  if (authResult instanceof Response) redirect("/login?redirect=/admin/content-calendar")

  const { scheduled, unscheduled } = await getScheduledOpportunities()
  const byMonth = groupByMonth(scheduled)
  const sortedMonths = Array.from(byMonth.keys()).sort()

  return (
    <div>
      <PageHeader
        title="Content Calendar"
        description="Scheduled and unscheduled content opportunities"
        breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Content Calendar" }]}
        actions={
          <Link
            href="/admin/content-opportunities"
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            ← All opportunities
          </Link>
        }
      />

      {scheduled.length === 0 && unscheduled.length === 0 ? (
        <div className="py-20 text-center">
          <Calendar className="h-10 w-10 mx-auto mb-3 text-zinc-300" />
          <p className="text-zinc-500 text-sm">No opportunities yet.</p>
          <Link href="/admin/content-opportunities" className="text-sm text-blue-600 hover:underline mt-1 inline-block">
            View all opportunities →
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Scheduled by month */}
          {sortedMonths.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Scheduled
              </h2>
              <div className="space-y-6">
                {sortedMonths.map((month) => (
                  <div key={month}>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                      {formatMonth(month)}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                      {byMonth.get(month)!.map((opp) => (
                        <CalendarItem key={opp.id} opportunity={opp} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unscheduled active opportunities */}
          {unscheduled.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">
                Unscheduled ({unscheduled.length})
              </h2>
              <p className="text-xs text-zinc-400 mb-3">
                Set a target date on each opportunity to add it to the calendar.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                {unscheduled.slice(0, 30).map((opp) => (
                  <CalendarItem key={opp.id} opportunity={opp} />
                ))}
              </div>
              {unscheduled.length > 30 && (
                <p className="text-xs text-zinc-400 mt-2">
                  Showing 30 of {unscheduled.length} unscheduled.{" "}
                  <Link href="/admin/content-opportunities" className="text-blue-600 hover:underline">View all</Link>
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
