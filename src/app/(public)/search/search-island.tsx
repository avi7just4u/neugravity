"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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

const SUGGESTIONS = ["Kubernetes", "ChatGPT vs Claude", "AI Strategy", "Python", "RAG", "TypeScript"]

export function SearchIsland({ initialQuery }: { initialQuery: string }) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-2xl mx-auto mb-10">
        <form onSubmit={handleSubmit} role="search" className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <Search className="h-5 w-5 text-zinc-400 shrink-0 ml-1" />
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you want to understand?"
            className="flex-1 bg-transparent text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none text-base"
          />
          <button
            type="submit"
            className="px-4 py-1.5 text-sm font-medium bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-lg hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {!initialQuery ? (
        <div className="max-w-2xl mx-auto text-center py-16">
          <Search className="h-10 w-10 text-zinc-200 dark:text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-400">Search for technologies, tools, companies, articles, courses, and more.</p>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {SUGGESTIONS.map((s) => (
              <Link
                key={s}
                href={`/search?q=${encodeURIComponent(s)}`}
                className="px-3 py-1.5 text-sm rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
            Showing results for <strong className="text-zinc-900 dark:text-white">&ldquo;{initialQuery}&rdquo;</strong>
          </p>
          <div className="space-y-3">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
              Browse by category while full-text search is being set up:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Technologies", href: `/tech`, icon: <Cpu className="h-4 w-4" /> },
                { label: "Tools", href: `/tools`, icon: <Wrench className="h-4 w-4" /> },
                { label: "Companies", href: `/companies`, icon: <Building2 className="h-4 w-4" /> },
                { label: "News", href: `/news`, icon: <Newspaper className="h-4 w-4" /> },
                { label: "Courses", href: `/courses`, icon: <BookOpen className="h-4 w-4" /> },
                { label: "Articles", href: `/articles`, icon: <Code2 className="h-4 w-4" /> },
              ].map(({ label, href, icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-700 dark:text-zinc-300 hover:border-indigo-300 hover:text-indigo-600 dark:hover:border-indigo-700 dark:hover:text-indigo-400 transition-colors"
                >
                  <span className="text-zinc-400">{icon}</span>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
