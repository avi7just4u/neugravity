import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { OpportunityService } from "@/lib/services/opportunity.service"
import { requireAdminAuth } from "@/lib/auth/admin-auth"
import { PageHeader } from "@/components/admin"
import { Badge } from "@/components/ui/badge"
import { createAdminClient } from "@/lib/supabase/server"
import {
  RefreshCw,
  Video,
  FileText,
  Cpu,
  Wrench,
  BarChart3,
  BookOpen,
  Newspaper,
  Link2,
} from "lucide-react"
import { OpportunityActions } from "./opportunity-actions"
import type { ContentOpportunity } from "@/types"

export const metadata: Metadata = { title: "Content Opportunity" }
export const dynamic = "force-dynamic"

const CONTENT_TYPE_ICON: Record<string, React.ReactNode> = {
  youtube_video: <Video className="h-4 w-4" />,
  short: <Video className="h-4 w-4" />,
  article: <FileText className="h-4 w-4" />,
  newsletter: <Newspaper className="h-4 w-4" />,
  technology_page: <Cpu className="h-4 w-4" />,
  tool_page: <Wrench className="h-4 w-4" />,
  comparison: <BarChart3 className="h-4 w-4" />,
  course: <BookOpen className="h-4 w-4" />,
  learning_path: <BookOpen className="h-4 w-4" />,
  interview: <FileText className="h-4 w-4" />,
  update_existing_content: <RefreshCw className="h-4 w-4" />,
}

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  low: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700",
}

async function getContentEcosystem(opportunity: ContentOpportunity): Promise<Record<string, boolean>> {
  if (!opportunity.related_entity_id || !opportunity.related_entity_type) return {}

  try {
    const db = createAdminClient()
    const entityId = opportunity.related_entity_id
    const entityType = opportunity.related_entity_type

    const { data: relationships } = await db
      .from("entity_relationships")
      .select("target_entity_type, relationship_type")
      .eq("source_entity_type", entityType)
      .eq("source_entity_id", entityId)
      .limit(50)

    const coverage: Record<string, boolean> = {
      technology: entityType === "technology",
      tools: false,
      comparison: false,
      course: false,
      learning_path: false,
      interview: false,
      article: false,
      news: false,
    }

    for (const r of relationships ?? []) {
      if (r.target_entity_type === "tool") coverage.tools = true
      if (r.target_entity_type === "comparison") coverage.comparison = true
      if (r.target_entity_type === "course") coverage.course = true
      if (r.target_entity_type === "interview") coverage.interview = true
      if (r.target_entity_type === "article") coverage.article = true
      if (r.target_entity_type === "news") coverage.news = true
    }

    // Check if learning path exists with this entity
    const { count: pathCount } = await db
      .from("entity_relationships")
      .select("id", { count: "exact", head: true })
      .eq("source_entity_type", entityType)
      .eq("source_entity_id", entityId)
      .eq("target_entity_type", "course")

    if ((pathCount ?? 0) > 0) coverage.learning_path = true

    return coverage
  } catch {
    return {}
  }
}

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const authResult = await requireAdminAuth(["admin", "super_admin", "editor", "analyst", "author", "reviewer"])
  if (authResult instanceof Response) redirect("/login")

  const { id } = await params
  const opportunity = await OpportunityService.getById(id)
  if (!opportunity) notFound()

  const ecosystem = await getContentEcosystem(opportunity)
  const hasBrief = opportunity.brief && Object.keys(opportunity.brief).length > 0

  const ecosystemEntries = [
    { label: "Technology", key: "technology" },
    { label: "News", key: "news" },
    { label: "Tools", key: "tools" },
    { label: "Comparison", key: "comparison" },
    { label: "Course", key: "course" },
    { label: "Learning Path", key: "learning_path" },
    { label: "Interview", key: "interview" },
    { label: "Article", key: "article" },
  ]

  return (
    <div>
      <PageHeader
        title={opportunity.title_suggestion ?? opportunity.topic}
        breadcrumb={[
          { label: "Admin", href: "/admin" },
          { label: "Content Opportunities", href: "/admin/content-opportunities" },
          { label: opportunity.topic },
        ]}
        actions={
          <OpportunityActions
            id={opportunity.id}
            status={opportunity.status}
            contentType={opportunity.content_type}
            hasBrief={hasBrief}
          />
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-5">
          {/* Meta */}
          <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border ${PRIORITY_COLORS[opportunity.priority]}`}>
                {opportunity.priority.toUpperCase()} PRIORITY
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400">
                {CONTENT_TYPE_ICON[opportunity.content_type] ?? null}
                <span className="capitalize">{opportunity.content_type.replace(/_/g, " ")}</span>
              </span>
              {opportunity.gap_type && (
                <Badge variant="secondary" className="capitalize text-xs">
                  {opportunity.gap_type.replace(/_/g, " ")}
                </Badge>
              )}
              <Badge variant="outline" className="capitalize text-xs">{opportunity.status.replace(/_/g, " ")}</Badge>
            </div>

            {opportunity.reason && (
              <div className="mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">Why this</h3>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">{opportunity.reason}</p>
              </div>
            )}

            {opportunity.why_now && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">Why now</h3>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">{opportunity.why_now}</p>
              </div>
            )}
          </div>

          {/* Brief */}
          {hasBrief && (
            <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">Content Brief</h3>
              <pre className="text-xs text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap overflow-auto max-h-96 font-mono">
                {JSON.stringify(opportunity.brief, null, 2)}
              </pre>
              <p className="text-xs text-zinc-400 mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                This brief is a starting point. Editors must verify all content before publishing.
              </p>
            </div>
          )}

          {/* Signal metadata */}
          {opportunity.metadata && Object.keys(opportunity.metadata).length > 0 && (
            <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Signal Data</h3>
              <dl className="space-y-1.5">
                {Object.entries(opportunity.metadata).map(([k, v]) => (
                  <div key={k} className="flex items-start gap-2 text-xs">
                    <dt className="text-zinc-400 min-w-[140px] capitalize">{k.replace(/_/g, " ")}</dt>
                    <dd className="text-zinc-700 dark:text-zinc-300 font-mono">{String(v)}</dd>
                  </div>
                ))}
              </dl>
              {Boolean((opportunity.metadata as Record<string, unknown>).labeled_as) && (
                <p className="text-xs text-zinc-400 mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 italic">
                  Source: {String((opportunity.metadata as Record<string, unknown>).labeled_as)}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Details */}
          <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">Details</h3>
            <dl className="space-y-2.5 text-sm">
              <div>
                <dt className="text-xs text-zinc-400 uppercase tracking-wide mb-0.5">Audience</dt>
                <dd className="text-zinc-700 dark:text-zinc-300">{opportunity.audience ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-zinc-400 uppercase tracking-wide mb-0.5">Source Signal</dt>
                <dd className="text-zinc-700 dark:text-zinc-300 capitalize">{opportunity.source?.replace(/_/g, " ") ?? "manual"}</dd>
              </div>
              {opportunity.related_entity_name && (
                <div>
                  <dt className="text-xs text-zinc-400 uppercase tracking-wide mb-0.5">Related Entity</dt>
                  <dd className="flex items-center gap-1 text-zinc-700 dark:text-zinc-300">
                    <Link2 className="h-3 w-3 text-zinc-400" />
                    {opportunity.related_entity_type} / {opportunity.related_entity_name}
                  </dd>
                </div>
              )}
              {opportunity.target_publish_date && (
                <div>
                  <dt className="text-xs text-zinc-400 uppercase tracking-wide mb-0.5">Target Date</dt>
                  <dd className="text-zinc-700 dark:text-zinc-300">{opportunity.target_publish_date}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-zinc-400 uppercase tracking-wide mb-0.5">Enterprise Signal</dt>
                <dd className="text-zinc-700 dark:text-zinc-300 capitalize">{opportunity.enterprise_relevance}</dd>
              </div>
              <div>
                <dt className="text-xs text-zinc-400 uppercase tracking-wide mb-0.5">Created</dt>
                <dd className="text-zinc-700 dark:text-zinc-300 text-xs">{new Date(opportunity.created_at).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="text-xs text-zinc-400 uppercase tracking-wide mb-0.5">By</dt>
                <dd className="text-zinc-700 dark:text-zinc-300 capitalize text-xs">{opportunity.created_by_type ?? "editor"}</dd>
              </div>
            </dl>
          </div>

          {/* Content ecosystem */}
          {Object.keys(ecosystem).length > 0 && (
            <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">
                Content Ecosystem
              </h3>
              <p className="text-xs text-zinc-400 mb-3">
                Existing NeuGravity coverage for {opportunity.related_entity_name ?? opportunity.topic}
              </p>
              <ul className="space-y-1.5">
                {ecosystemEntries.map(({ label, key }) => (
                  <li key={key} className="flex items-center gap-2 text-sm">
                    <span className={ecosystem[key] ? "text-green-500" : "text-zinc-300 dark:text-zinc-600"}>
                      {ecosystem[key] ? "✅" : "❌"}
                    </span>
                    <span className={ecosystem[key] ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-400"}>
                      {label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
