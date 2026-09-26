import Link from "next/link"
import type { NewsItem } from "@/types"

interface Props {
  news: NewsItem[]
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return ""
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

export function RelatedNewsSection({ news }: Props) {
  if (news.length === 0) return null

  return (
    <ul className="space-y-3">
      {news.map((item) => (
        <li key={item.id}>
          <Link
            href={`/news/${item.slug}`}
            className="group block p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-sm transition-all"
          >
            <div className="text-sm font-medium text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
              {item.headline}
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs text-zinc-400">
                {timeAgo(item.source_published_at ?? item.published_at ?? item.discovered_at)}
              </span>
              {item.importance >= 8 && (
                <>
                  <span className="text-zinc-300 dark:text-zinc-700 text-xs">·</span>
                  <span className="text-xs text-amber-500 font-medium">High Impact</span>
                </>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
