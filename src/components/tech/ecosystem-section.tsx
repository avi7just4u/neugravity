import Link from "next/link"
import { ExternalLink } from "lucide-react"
import type { Tool, Company } from "@/types"

interface Props {
  tools?: Tool[]
  companies?: Company[]
}

export function EcosystemSection({ tools = [], companies = [] }: Props) {
  if (tools.length === 0 && companies.length === 0) return null

  return (
    <div className="space-y-6">
      {companies.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
            Key Organizations
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {companies.map((company) => (
              <Link
                key={company.id}
                href={`/companies/${company.slug}`}
                className="group flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-sm transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                    {company.name}
                  </div>
                  {company.description && (
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                      {company.description}
                    </div>
                  )}
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-zinc-300 dark:text-zinc-600 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {tools.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
            Tools & Frameworks
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {tools.map((tool) => (
              <Link
                key={tool.id}
                href={`/tools/${tool.slug}`}
                className="group flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-sm transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                    {tool.name}
                  </div>
                  {tool.description && (
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                      {tool.description}
                    </div>
                  )}
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-zinc-300 dark:text-zinc-600 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
