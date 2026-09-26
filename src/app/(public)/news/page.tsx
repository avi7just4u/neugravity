export const revalidate = 60

import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Newspaper, Clock, TrendingUp } from "lucide-react"
import { ContentService } from "@/lib/services/content.service"
import { formatRelativeDate } from "@/lib/utils"
import { ENV } from "@/lib/config/environment"

export const metadata: Metadata = {
  title: "Technology News",
  description: "Curated, sourced, and contextualized technology news.",
  robots: ENV.filterDemoData ? undefined : { index: false, follow: true },
}

const trendingTopics = ["Model Context Protocol", "AI Agents", "Serverless", "Rust", "LLMs", "WebAssembly"]

function importanceBadge(importance: number) {
  if (importance >= 9) return <Badge variant="brand" className="text-xs">Breaking</Badge>
  if (importance >= 7) return <Badge variant="warning" className="text-xs">Major</Badge>
  return null
}

export default async function NewsPage() {
  const { data: news } = await ContentService.getPublishedNews({ page: 1, perPage: 20 })

  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Newspaper className="h-4 w-4 text-zinc-400" />
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">News</span>
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Technology News</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Curated, sourced, and contextualized technology news.</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          {news.length === 0 ? (
            <div className="py-20 text-center">
              <Newspaper className="h-10 w-10 text-zinc-200 dark:text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-400">No news published yet. Check back soon.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {news.map((item, i) => (
                <Link key={item.id} href={`/news/${item.slug}`} className="group flex flex-col gap-2 py-5 first:pt-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {importanceBadge(item.importance)}
                    {(item.source_published_at ?? item.published_at) && (
                      <span className="text-xs text-zinc-400 ml-auto flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatRelativeDate((item.source_published_at ?? item.published_at)!)}
                      </span>
                    )}
                  </div>
                  <h2 className={`font-semibold text-zinc-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ${i === 0 ? "text-xl" : "text-base"}`}>
                    {item.headline}
                  </h2>
                  {i < 3 && item.summary && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">{item.summary}</p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-zinc-400" />
              <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">Trending Topics</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {trendingTopics.map((t) => (
                <Link key={t} href={`/search?q=${encodeURIComponent(t)}`} className="px-2.5 py-1 text-xs rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">{t}</Link>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <h3 className="font-semibold text-sm text-zinc-900 dark:text-white mb-3">Newsletter</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">Get technology news in your inbox weekly.</p>
            <form action="/api/newsletter/subscribe" method="POST" className="space-y-2">
              <input type="email" name="email" placeholder="Your email" required className="w-full h-8 px-3 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400" />
              <button type="submit" className="w-full h-8 text-xs font-medium bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-md hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors">Subscribe</button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  )
}
