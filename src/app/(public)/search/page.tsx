"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Suspense, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Search, Cpu, Wrench, Building2, BookOpen, Newspaper, Code2 } from "lucide-react"

const typeIcon: Record<string, React.ReactNode> = {
  technology: <Cpu className="h-4 w-4" />,
  tool: <Wrench className="h-4 w-4" />,
  company: <Building2 className="h-4 w-4" />,
  article: <Code2 className="h-4 w-4" />,
  news: <Newspaper className="h-4 w-4" />,
  course: <BookOpen className="h-4 w-4" />,
}

const typeLabel: Record<string, string> = {
  technology: "Technology",
  tool: "Tool",
  company: "Company",
  article: "Article",
  news: "News",
  course: "Course",
}

function SearchResults() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const q = searchParams.get("q") ?? ""
  const [query, setQuery] = useState(q)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-2xl mx-auto mb-10">
        <form onSubmit={handleSubmit} className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <Search className="h-5 w-5 text-zinc-400 shrink-0 ml-1" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you want to understand?"
            className="flex-1 bg-transparent text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none text-base"
          />
          <button type="submit" className="px-4 py-1.5 text-sm font-medium bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-lg hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors">
            Search
          </button>
        </form>
      </div>

      {!q ? (
        <div className="max-w-2xl mx-auto text-center py-16">
          <Search className="h-10 w-10 text-zinc-200 dark:text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-400">Search for technologies, tools, companies, articles, courses, and more.</p>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {["Kubernetes", "ChatGPT vs Claude", "AI Strategy", "Python", "RAG", "TypeScript"].map((s) => (
              <Link key={s} href={`/search?q=${encodeURIComponent(s)}`} className="px-3 py-1.5 text-sm rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                {s}
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Showing results for <strong className="text-zinc-900 dark:text-white">&ldquo;{q}&rdquo;</strong></p>

          {/* Placeholder results — will be wired to search API in Phase 2 */}
          <div className="space-y-2">
            {[
              { type: "technology", title: q, description: `Technology: ${q}`, url: `/tech/${q.toLowerCase().replace(/\s+/g, "-")}` },
              { type: "tool", title: q, description: `Tool: ${q}`, url: `/tools/${q.toLowerCase().replace(/\s+/g, "-")}` },
            ].map((r) => (
              <Link key={r.url} href={r.url} className="group flex items-start gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all">
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 shrink-0">
                  {typeIcon[r.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-sm text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{r.title}</span>
                    <Badge variant="secondary" className="text-xs">{typeLabel[r.type]}</Badge>
                  </div>
                  <p className="text-xs text-zinc-400 truncate">{r.description}</p>
                </div>
              </Link>
            ))}
            <div className="p-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 text-center">
              <p className="text-sm text-zinc-400">Full search powered by the database will be available once Supabase is connected.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-zinc-400">Loading search...</div>}>
      <SearchResults />
    </Suspense>
  )
}
