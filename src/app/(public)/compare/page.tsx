export const revalidate = 3600

import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { BarChart3, ArrowRight, Eye } from "lucide-react"
import { ComparisonService } from "@/lib/services/comparison.service"
import { ENV } from "@/lib/config/environment"
import { formatDate } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Compare",
  description: "Compare technology tools, platforms, and products side by side.",
  robots: ENV.filterDemoData ? undefined : { index: false, follow: true },
}

export default async function ComparePage() {
  const { data: comparisons } = await ComparisonService.getComparisons({ perPage: 24 })

  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-4 w-4 text-zinc-400" />
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">Compare</span>
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Comparisons</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Side-by-side comparisons of tools, platforms, and technologies — sourced and verified.
        </p>
      </div>

      {comparisons.length === 0 ? (
        <div className="py-24 text-center text-zinc-400">
          <BarChart3 className="h-10 w-10 mx-auto mb-4 opacity-30" />
          <p>No comparisons published yet. Check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {comparisons.map((c) => (
            <Link
              key={c.id}
              href={`/compare/${c.slug}`}
              className="group flex flex-col gap-3 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                {c.featured && <Badge variant="brand" className="text-xs">Featured</Badge>}
                <span className="text-xs text-zinc-400 ml-auto flex items-center gap-1">
                  <Eye className="h-3 w-3" />{c.view_count.toLocaleString()}
                </span>
              </div>
              <h2 className="font-semibold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {c.title}
              </h2>
              {c.description && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">{c.description}</p>
              )}
              <div className="flex items-center justify-between text-xs text-zinc-400">
                {c.last_verified_at && <span>Updated {formatDate(c.last_verified_at)}</span>}
                <span className="flex items-center gap-1 group-hover:text-blue-500 transition-colors ml-auto">
                  Compare <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
