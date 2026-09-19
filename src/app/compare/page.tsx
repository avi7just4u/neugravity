import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { BarChart3, ArrowRight, Clock } from "lucide-react"

export const metadata: Metadata = {
  title: "Compare",
  description: "Compare technology tools, platforms, and products side by side.",
}

const demoComparisons = [
  { title: "ChatGPT vs Claude", slug: "chatgpt-vs-claude", entities: 2, category: "AI", views: "12.4k", lastUpdated: "1 week ago" },
  { title: "AWS vs Azure vs Google Cloud", slug: "aws-vs-azure-vs-gcp", entities: 3, category: "Cloud", views: "8.2k", lastUpdated: "2 weeks ago" },
  { title: "React vs Next.js", slug: "react-vs-nextjs", entities: 2, category: "Framework", views: "6.7k", lastUpdated: "3 weeks ago" },
  { title: "Postgres vs MongoDB", slug: "postgres-vs-mongodb", entities: 2, category: "Database", views: "5.1k", lastUpdated: "1 month ago" },
  { title: "Vercel vs Netlify", slug: "vercel-vs-netlify", entities: 2, category: "Platform", views: "4.3k", lastUpdated: "1 month ago" },
  { title: "Cursor vs GitHub Copilot", slug: "cursor-vs-github-copilot", entities: 2, category: "AI", views: "3.8k", lastUpdated: "2 weeks ago" },
  { title: "Supabase vs Firebase", slug: "supabase-vs-firebase", entities: 2, category: "Database", views: "3.2k", lastUpdated: "3 weeks ago" },
  { title: "Docker vs Podman", slug: "docker-vs-podman", entities: 2, category: "Platform", views: "2.1k", lastUpdated: "1 month ago" },
]

export default function ComparePage() {
  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-4 w-4 text-zinc-400" />
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">Compare</span>
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Comparisons</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Side-by-side comparisons of tools, platforms, and technologies — sourced and verified.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {demoComparisons.map((c) => (
          <Link
            key={c.slug}
            href={`/compare/${c.slug}`}
            className="group flex flex-col gap-3 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">{c.category}</Badge>
              <span className="text-xs text-zinc-400">{c.entities} products</span>
            </div>
            <h2 className="font-semibold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{c.title}</h2>
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{c.lastUpdated}</span>
              <span className="flex items-center gap-1 group-hover:text-blue-500 transition-colors">{c.views} views <ArrowRight className="h-3 w-3" /></span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
