export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Clock, ChevronRight } from "lucide-react"
import { ContentService } from "@/lib/services/content.service"
import { formatDate, formatRelativeDate } from "@/lib/utils"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://neugravity.com"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const item = await ContentService.getNewsBySlug(slug)
  if (!item) return {}
  const title = item.seo_title ?? item.headline
  const description = (item.seo_description ?? item.summary) || undefined
  const url = `${siteUrl}/news/${slug}`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      publishedTime: item.published_at ?? undefined,
      siteName: "NeuGravity",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  }
}

export function generateStaticParams() { return [] }

function importanceBadge(importance: number) {
  if (importance >= 9) return <Badge variant="brand">Breaking</Badge>
  if (importance >= 7) return <Badge variant="warning">Major</Badge>
  return null
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const item = await ContentService.getNewsBySlug(slug)
  if (!item) notFound()

  // Fire-and-forget view count — do not await
  ContentService.incrementViewCount("news_item", item.id)

  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex items-center gap-1.5 text-sm text-zinc-400 mb-8" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/news" className="hover:text-zinc-900 dark:hover:text-white transition-colors">News</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-zinc-600 dark:text-zinc-300 truncate max-w-xs">{item.headline}</span>
      </nav>

      <div className="grid lg:grid-cols-3 gap-10">
        <article className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-3">
              {importanceBadge(item.importance)}
              {item.published_at && (
                <span className="text-xs text-zinc-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatRelativeDate(item.published_at)}
                  {" · "}
                  {formatDate(item.published_at)}
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white leading-tight mb-3">
              {item.headline}
            </h1>
            {item.summary && (
              <p className="text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed border-l-2 border-zinc-200 dark:border-zinc-700 pl-4">
                {item.summary}
              </p>
            )}
          </div>

          {item.body ? (
            <div className="space-y-4">
              {item.body.split("\n\n").filter(Boolean).map((para, i) => (
                <p key={i} className="text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                  {para}
                </p>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
              <p className="text-zinc-500 dark:text-zinc-400">Full article details coming soon.</p>
            </div>
          )}
        </article>

        <aside className="space-y-5">
          <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <h3 className="font-semibold text-sm text-zinc-900 dark:text-white mb-3">Related News</h3>
            <p className="text-xs text-zinc-400">Related stories coming soon.</p>
          </div>
          <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <h3 className="font-semibold text-sm text-zinc-900 dark:text-white mb-3">Related Technologies</h3>
            <p className="text-xs text-zinc-400">Technologies mentioned in this story will appear here.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
