export const revalidate = 300

import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, ArrowRight } from "lucide-react"
import { ContentService } from "@/lib/services/content.service"
import { formatRelativeDate } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Articles",
  description: "In-depth technology articles, explainers, and analysis.",
}

export default async function ArticlesPage() {
  const { data: articles } = await ContentService.getPublishedArticles({ page: 1, perPage: 20 })

  const featured = articles.find((a) => a.featured)
  const rest = articles.filter((a) => !a.featured)

  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-4 w-4 text-zinc-400" />
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">Articles</span>
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Articles</h1>
        <p className="text-zinc-500 dark:text-zinc-400">In-depth technology explainers, analysis, and guides.</p>
      </div>

      {articles.length === 0 ? (
        <div className="py-20 text-center">
          <BookOpen className="h-10 w-10 text-zinc-200 dark:text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-400">No articles published yet. Check back soon.</p>
        </div>
      ) : (
        <>
          {featured && (
            <Link href={`/articles/${featured.slug}`} className="group block mb-10 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md transition-all">
              <Badge variant="brand" className="mb-3 text-xs">Featured</Badge>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2">{featured.title}</h2>
              {featured.excerpt && <p className="text-zinc-500 dark:text-zinc-400 mb-4">{featured.excerpt}</p>}
              <div className="flex items-center gap-4 text-xs text-zinc-400">
                {featured.reading_time_minutes && (
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{featured.reading_time_minutes} min read</span>
                )}
                {featured.published_at && <span>{formatRelativeDate(featured.published_at)}</span>}
                <span className="ml-auto flex items-center gap-1 group-hover:text-indigo-500 transition-colors">Read article <ArrowRight className="h-3 w-3" /></span>
              </div>
            </Link>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rest.map((a) => (
              <Link key={a.id} href={`/articles/${a.slug}`} className="group flex flex-col gap-3 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all">
                <div>
                  <h2 className="font-semibold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">{a.title}</h2>
                  {a.excerpt && <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">{a.excerpt}</p>}
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-400 mt-auto">
                  {a.reading_time_minutes && (
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{a.reading_time_minutes} min</span>
                  )}
                  {a.published_at && <span>{formatRelativeDate(a.published_at)}</span>}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
