import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { Technology } from "@/types"

interface Props {
  technology: Technology
  label?: "prerequisite" | "next"
}

export function PrerequisiteCard({ technology, label = "prerequisite" }: Props) {
  return (
    <Link
      href={`/tech/${technology.slug}`}
      className="group flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-sm transition-all"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded uppercase tracking-wide ${
            label === "next"
              ? "bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400"
              : "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
          }`}>
            {label === "next" ? "Learn next" : "Required"}
          </span>
        </div>
        <div className="text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
          {technology.name}
        </div>
        {technology.tagline && (
          <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
            {technology.tagline}
          </div>
        )}
      </div>
      <ArrowRight className="h-4 w-4 text-zinc-300 dark:text-zinc-600 group-hover:text-blue-500 transition-colors flex-shrink-0" />
    </Link>
  )
}
