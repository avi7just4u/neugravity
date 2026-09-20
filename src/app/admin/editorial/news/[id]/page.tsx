import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/server"
import { ArrowLeft, ExternalLink, Clock, Building2, Cpu, User, Sparkles, AlertTriangle, ShieldCheck } from "lucide-react"
import { DraftEditor } from "@/components/admin/draft-editor"
import { QualityGateService } from "@/lib/services/quality-gate.service"

export const metadata: Metadata = { title: "Review News Item" }
export const dynamic = "force-dynamic"

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

const STATUS_COLORS: Record<string, string> = {
  ready_for_review: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  enriched: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  duplicate: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
}

export default async function NewsEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = createAdminClient()

  const { data: item } = await db
    .from("source_items")
    .select("id, title, description, content, canonical_url, author, source_published_at, content_type, processing_status, discovered_at, metadata, source_id")
    .eq("id", id)
    .single()

  if (!item) notFound()

  // Fetch source details
  const { data: source } = await db
    .from("sources")
    .select("id, name, domain, website_url, trust_level, source_priority, category")
    .eq("id", item.source_id)
    .maybeSingle()

  const { data: newsItem } = await db
    .from("news_items")
    .select("id, headline, slug, status, summary, body, canonical_url, published_at, source_item_id")
    .eq("source_item_id", id)
    .maybeSingle()

  const meta = (item.metadata ?? {}) as Record<string, unknown>
  const entities = (meta.entities ?? {}) as { companies?: string[]; technologies?: string[]; people?: string[] }
  const tags = (meta.tags ?? []) as string[]
  const summary = (meta.summary as string) ?? item.description ?? ""
  const category = (meta.category as string) ?? "technology"
  const promptVersion = (meta.prompt_version as string) ?? null
  const editorOverride = Boolean(meta.editor_override)
  const keyClaims = (meta.key_claims as string[]) ?? []

  const statusColor = STATUS_COLORS[item.processing_status ?? ""] ?? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"

  const qualityGate = QualityGateService.check({
    headline: newsItem?.headline ?? item.title,
    summary: newsItem?.summary ?? summary,
    body: newsItem?.body ?? item.content,
    category,
    tags,
  })

  return (
    <div className="space-y-4 h-full">
      {/* Top bar */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/editorial"
          className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to queue
        </Link>
        <span className="text-zinc-300 dark:text-zinc-700">/</span>
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColor}`}>
          {item.processing_status}
        </span>
        {item.content_type && (
          <span className="text-xs text-zinc-400">{item.content_type}</span>
        )}
      </div>

      {/* 3-column layout */}
      <div className="grid grid-cols-[30%_1fr_25%] gap-4 items-start min-h-[calc(100vh-200px)]">

        {/* LEFT: Source Panel */}
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Source</div>

            {source ? (
              <div className="space-y-2">
                <div className="font-medium text-sm text-zinc-900 dark:text-white">{source.name}</div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {source.category && (
                    <span className="px-1.5 py-0.5 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded">
                      {source.category}
                    </span>
                  )}
                  {source.trust_level != null && (
                    <span className="px-1.5 py-0.5 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded">
                      trust: {source.trust_level}/10
                    </span>
                  )}
                </div>
                {source.domain && (
                  <div className="text-xs text-zinc-400">{source.domain}</div>
                )}
              </div>
            ) : (
              <div className="text-xs text-zinc-400 italic">Source not found</div>
            )}

            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 space-y-2 text-xs">
              {item.canonical_url && (
                <div className="flex items-start gap-2">
                  <ExternalLink className="h-3 w-3 text-zinc-400 mt-0.5 shrink-0" />
                  <a
                    href={item.canonical_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline break-all line-clamp-2"
                  >
                    {item.canonical_url}
                  </a>
                </div>
              )}
              {item.source_published_at && (
                <div className="flex items-center gap-2 text-zinc-500">
                  <Clock className="h-3 w-3 shrink-0" />
                  <span>Published {formatDate(item.source_published_at)}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-zinc-400">
                <Clock className="h-3 w-3 shrink-0" />
                <span>Discovered {formatDate(item.discovered_at as string | null)}</span>
              </div>
              {item.author && (
                <div className="flex items-center gap-2 text-zinc-500">
                  <User className="h-3 w-3 shrink-0" />
                  <span>{item.author}</span>
                </div>
              )}
            </div>
          </div>

          {/* Raw content */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Original</div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed max-h-64 overflow-y-auto">
              {item.description ?? item.content ?? <em className="text-zinc-400">No content</em>}
            </div>
          </div>

          {/* AI Key Claims */}
          {keyClaims.length > 0 && (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                <Sparkles className="h-3 w-3" />
                Key Claims
              </div>
              <ul className="space-y-1.5">
                {keyClaims.map((claim, i) => (
                  <li key={i} className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed pl-2 border-l-2 border-zinc-200 dark:border-zinc-700">
                    {claim}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* CENTER: Draft Editor */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4">
            Draft Editor
            {editorOverride && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded normal-case font-normal">
                manually edited
              </span>
            )}
          </div>
          <DraftEditor
            sourceItemId={id}
            newsItemId={newsItem?.id ?? null}
            initialHeadline={newsItem?.headline ?? item.title ?? ""}
            initialSummary={newsItem?.summary ?? summary}
            initialCategory={category}
            initialTags={tags}
            currentStatus={item.processing_status ?? "pending"}
            newsItemStatus={newsItem?.status ?? null}
          />
        </div>

        {/* RIGHT: Metadata Panel */}
        <div className="space-y-4">
          {/* AI Enrichment Status */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              <Sparkles className="h-3 w-3" />
              AI Enrichment
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Summary</span>
                <span className={summary ? "text-green-600 dark:text-green-400" : "text-zinc-400"}>
                  {summary ? "✓" : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Category</span>
                <span className="text-zinc-700 dark:text-zinc-300">{category || "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Tags</span>
                <span className={tags.length > 0 ? "text-green-600 dark:text-green-400" : "text-zinc-400"}>
                  {tags.length > 0 ? `${tags.length} tags` : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Entities</span>
                <span className={Object.values(entities).some((a) => (a as string[]).length > 0) ? "text-green-600 dark:text-green-400" : "text-zinc-400"}>
                  {Object.values(entities).flat().length > 0 ? "✓" : "—"}
                </span>
              </div>
              {promptVersion && (
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Prompt</span>
                  <span className="font-mono text-zinc-400">{promptVersion}</span>
                </div>
              )}
            </div>
          </div>

          {/* Entities */}
          {(entities.companies?.length || entities.technologies?.length || entities.people?.length) ? (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Entities</div>

              {entities.companies && entities.companies.length > 0 && (
                <div>
                  <div className="flex items-center gap-1 text-xs text-zinc-400 mb-1.5">
                    <Building2 className="h-3 w-3" /> Companies
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {entities.companies.map((c) => (
                      <span key={c} className="px-1.5 py-0.5 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded">{c}</span>
                    ))}
                  </div>
                </div>
              )}

              {entities.technologies && entities.technologies.length > 0 && (
                <div>
                  <div className="flex items-center gap-1 text-xs text-zinc-400 mb-1.5">
                    <Cpu className="h-3 w-3" /> Technologies
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {entities.technologies.map((t) => (
                      <span key={t} className="px-1.5 py-0.5 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {entities.people && entities.people.length > 0 && (
                <div>
                  <div className="flex items-center gap-1 text-xs text-zinc-400 mb-1.5">
                    <User className="h-3 w-3" /> People
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {entities.people.map((p) => (
                      <span key={p} className="px-1.5 py-0.5 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded">{p}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Source Attribution */}
          {newsItem && (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">News Item</div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Status</span>
                  <span className={`px-1.5 py-0.5 rounded font-medium ${
                    newsItem.status === "published" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                    newsItem.status === "approved" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                    "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                  }`}>
                    {newsItem.status}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-zinc-500 shrink-0">Slug</span>
                  <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1 rounded text-zinc-600 dark:text-zinc-400 break-all text-right">
                    {newsItem.slug}
                  </code>
                </div>
                {newsItem.published_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Published</span>
                    <span className="text-zinc-700 dark:text-zinc-300">{formatDate(newsItem.published_at)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quality Gate */}
          <div className={`rounded-xl border p-4 space-y-2 ${
            qualityGate.passed
              ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10"
              : "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10"
          }`}>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className={`h-3.5 w-3.5 ${qualityGate.passed ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`} />
              <span className={`text-xs font-semibold ${qualityGate.passed ? "text-green-700 dark:text-green-300" : "text-amber-700 dark:text-amber-300"}`}>
                Quality Gate: {qualityGate.passed ? "Pass" : "Fail"}
              </span>
            </div>
            {qualityGate.missing.length > 0 && (
              <div className="text-xs text-amber-700 dark:text-amber-300">
                Missing: {qualityGate.missing.join(", ")}
              </div>
            )}
            {qualityGate.warnings.length > 0 && (
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                Warnings: {qualityGate.warnings.join(", ")}
              </div>
            )}
          </div>

          {/* Needs attention */}
          {!summary && (
            <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-700 dark:text-amber-300">
                  No AI summary. Add one manually in the editor before approving.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
