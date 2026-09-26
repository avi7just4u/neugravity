export const revalidate = 300

import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Clock, ChevronRight } from "lucide-react"
import { ContentService } from "@/lib/services/content.service"
import { formatDate, formatRelativeDate } from "@/lib/utils"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = await ContentService.getArticleBySlug(slug)
  if (!article) return {}
  return {
    title: article.seo_title ?? article.title,
    description: article.seo_description ?? article.excerpt ?? undefined,
  }
}

export function generateStaticParams() { return [] }

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await ContentService.getArticleBySlug(slug)
  if (!article) notFound()

  // Fire-and-forget view count — do not await
  ContentService.incrementViewCount("article", article.id)

  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex items-center gap-1.5 text-sm text-zinc-400 mb-8" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/articles" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Articles</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-zinc-600 dark:text-zinc-300 truncate max-w-xs">{article.title}</span>
      </nav>

      <div className="grid lg:grid-cols-4 gap-10">
        <article className="lg:col-span-3">
          <header className="mb-8">
            {article.featured && <Badge variant="brand" className="mb-3">Featured</Badge>}
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white leading-tight mb-4">{article.title}</h1>
            {article.subtitle && (
              <p className="text-xl text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">{article.subtitle}</p>
            )}
            {article.excerpt && !article.subtitle && (
              <p className="text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">{article.excerpt}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-zinc-400 pb-6 border-b border-zinc-200 dark:border-zinc-800 flex-wrap">
              {article.reading_time_minutes && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {article.reading_time_minutes} min read
                </span>
              )}
              {article.published_at && (
                <span title={formatDate(article.published_at)}>
                  {formatRelativeDate(article.published_at)}
                </span>
              )}
              {typeof article.view_count === "number" && article.view_count > 0 && (
                <span>{article.view_count.toLocaleString()} views</span>
              )}
            </div>
          </header>

          {article.body ? (
            <div className="space-y-4">
              {article.body.split("\n\n").filter(Boolean).map((para, i) => {
                if (para.startsWith("## ")) {
                  return (
                    <h2 key={i} className="text-xl font-semibold text-zinc-900 dark:text-white mt-8 mb-3">
                      {para.slice(3)}
                    </h2>
                  )
                }
                if (para.startsWith("### ")) {
                  return (
                    <h3 key={i} className="text-lg font-semibold text-zinc-900 dark:text-white mt-6 mb-2">
                      {para.slice(4)}
                    </h3>
                  )
                }
                return (
                  <p key={i} className="text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                    {para}
                  </p>
                )
              })}
            </div>
          ) : (
            <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
              <p className="text-zinc-500 dark:text-zinc-400">Full article coming soon.</p>
            </div>
          )}
        </article>

        <aside className="space-y-5">
          <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <h3 className="font-semibold text-sm text-zinc-900 dark:text-white mb-3">Related Articles</h3>
            <p className="text-xs text-zinc-400">More articles on this topic coming soon.</p>
          </div>
          <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <h3 className="font-semibold text-sm text-zinc-900 dark:text-white mb-3">Related Courses</h3>
            <p className="text-xs text-zinc-400">Courses covering these topics coming soon.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
