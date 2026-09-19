import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/server"
import { ArrowLeft, ExternalLink, Clock, Tag, Building2, Cpu, User } from "lucide-react"
import { NewsEditorActions } from "./news-editor-actions"

export const metadata: Metadata = { title: "Review News Item" }
export const dynamic = "force-dynamic"

function formatDate(iso: string | null): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })
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

  const meta = (item.metadata ?? {}) as Record<string, unknown>
  const entities = (meta.entities ?? {}) as { companies?: string[]; technologies?: string[]; people?: string[] }
  const tags = (meta.tags ?? []) as string[]
  const summary = (meta.summary as string) ?? null

  // Fetch associated news_item if it exists
  const { data: newsItem } = await db
    .from("news_items")
    .select("id, title, slug, status, summary, content, published_at")
    .eq("source_item_id", id)
    .maybeSingle()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/editorial" className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to queue
        </Link>
        <span className="text-zinc-300 dark:text-zinc-700">/</span>
        <span className="text-sm text-zinc-500">News Review</span>
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-6 items-start">
        {/* Main content */}
        <div className="space-y-5">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    item.processing_status === "ready_for_review"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      : item.processing_status === "approved"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : item.processing_status === "rejected"
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                  }`}>
                    {item.processing_status}
                  </span>
                  <span className="text-xs text-zinc-400">{item.content_type}</span>
                </div>
                <h1 className="text-xl font-bold text-zinc-900 dark:text-white leading-tight">{item.title ?? "(no title)"}</h1>
              </div>
              {item.canonical_url && (
                <a
                  href={item.canonical_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors shrink-0"
                >
                  <ExternalLink className="h-4 w-4" />
                  Source
                </a>
              )}
            </div>

            {/* AI-generated summary */}
            {summary && (
              <div className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">AI Summary</div>
                <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">{summary}</p>
              </div>
            )}

            {/* Original description */}
            {item.description && (
              <div className="mb-4">
                <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Original Description</div>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{item.description}</p>
              </div>
            )}

            {/* Full content */}
            {item.content && (
              <div>
                <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Full Content</div>
                <div className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto rounded-lg p-3 bg-zinc-50 dark:bg-zinc-800">
                  {item.content}
                </div>
              </div>
            )}
          </div>

          {/* Published news item status */}
          {newsItem && (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold text-zinc-900 dark:text-white">News Item</div>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  newsItem.status === "published"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : newsItem.status === "approved"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                }`}>
                  {newsItem.status}
                </span>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Slug: <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1 rounded">{newsItem.slug}</code></p>
              {newsItem.published_at && (
                <p className="text-xs text-zinc-400">Published: {formatDate(newsItem.published_at)}</p>
              )}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Actions */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
            <div className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Actions</div>
            <NewsEditorActions
              sourceItemId={id}
              newsItemId={newsItem?.id ?? null}
              currentStatus={item.processing_status ?? "pending"}
              newsItemStatus={newsItem?.status ?? null}
            />
          </div>

          {/* Metadata */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4">
            <div className="text-sm font-semibold text-zinc-900 dark:text-white">Metadata</div>

            <div className="space-y-2.5 text-sm">
              <div className="flex items-start gap-2">
                <Clock className="h-3.5 w-3.5 text-zinc-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs text-zinc-500 mb-0.5">Discovered</div>
                  <div className="text-zinc-700 dark:text-zinc-300">{formatDate(item.discovered_at as string | null)}</div>
                </div>
              </div>
              {item.source_published_at && (
                <div className="flex items-start gap-2">
                  <Clock className="h-3.5 w-3.5 text-zinc-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs text-zinc-500 mb-0.5">Published by source</div>
                    <div className="text-zinc-700 dark:text-zinc-300">{formatDate(item.source_published_at)}</div>
                  </div>
                </div>
              )}
              {item.author && (
                <div className="flex items-start gap-2">
                  <User className="h-3.5 w-3.5 text-zinc-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs text-zinc-500 mb-0.5">Author</div>
                    <div className="text-zinc-700 dark:text-zinc-300">{item.author}</div>
                  </div>
                </div>
              )}
            </div>

            {tags.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-2">
                  <Tag className="h-3 w-3" />
                  Tags
                </div>
                <div className="flex flex-wrap gap-1">
                  {tags.map((tag) => (
                    <span key={tag} className="px-1.5 py-0.5 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {entities.companies && entities.companies.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-2">
                  <Building2 className="h-3 w-3" />
                  Companies
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
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-2">
                  <Cpu className="h-3 w-3" />
                  Technologies
                </div>
                <div className="flex flex-wrap gap-1">
                  {entities.technologies.map((t) => (
                    <span key={t} className="px-1.5 py-0.5 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded">{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
