export const revalidate = 3600

import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Cpu, ArrowRight } from "lucide-react"
import { TechnologyService } from "@/lib/services/technology.service"
import { ENV } from "@/lib/config/environment"
import type { Technology, TechnologyType } from "@/types"

export const metadata: Metadata = {
  title: "Technology",
  description: "Explore the technologies shaping how we build and work.",
  robots: ENV.filterDemoData ? undefined : { index: false, follow: true },
}

const typeVariant: Record<string, "info" | "success" | "warning" | "secondary" | "outline"> = {
  language: "info",
  framework: "success",
  database: "warning",
  platform: "secondary",
  protocol: "outline",
  cloud: "info",
  ai: "success",
  infrastructure: "warning",
  concept: "outline",
  tool: "secondary",
  other: "outline",
}

const filters: { label: string; value: TechnologyType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "AI", value: "ai" },
  { label: "Languages", value: "language" },
  { label: "Frameworks", value: "framework" },
  { label: "Databases", value: "database" },
  { label: "Cloud", value: "cloud" },
  { label: "Infrastructure", value: "infrastructure" },
]

function TechCard({ tech }: { tech: Technology }) {
  return (
    <Link
      href={`/tech/${tech.slug}`}
      className="group flex flex-col gap-3 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all"
    >
      <div className="flex items-center justify-between">
        <Badge variant={typeVariant[tech.type] ?? "secondary"} className="text-xs capitalize">
          {tech.type}
        </Badge>
        {tech.featured && <Badge variant="outline" className="text-xs">Featured</Badge>}
      </div>
      <div>
        <h2 className="font-semibold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {tech.name}
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
          {tech.tagline ?? tech.description ?? ""}
        </p>
      </div>
      <span className="text-xs text-zinc-400 flex items-center gap-1 group-hover:text-blue-500 transition-colors">
        Learn more <ArrowRight className="h-3 w-3" />
      </span>
    </Link>
  )
}

export default async function TechPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const { type } = await searchParams
  const activeType = (type as TechnologyType | undefined) ?? undefined

  const { data: technologies } = await TechnologyService.getTechnologies({
    type: activeType,
    perPage: 24,
  })

  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <Cpu className="h-4 w-4 text-zinc-400" />
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">Technology</span>
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Technology</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Explore the technologies shaping how we build and work.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {filters.map((f) => {
          const isActive = (f.value === "all" && !activeType) || f.value === activeType
          return (
            <Link
              key={f.value}
              href={f.value === "all" ? "/tech" : `/tech?type=${f.value}`}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                isActive
                  ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white"
                  : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              {f.label}
            </Link>
          )
        })}
      </div>

      {technologies.length === 0 ? (
        <div className="py-24 text-center text-zinc-400">
          <Cpu className="h-10 w-10 mx-auto mb-4 opacity-30" />
          <p>No technologies found yet. Check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {technologies.map((tech) => (
            <TechCard key={tech.id} tech={tech} />
          ))}
        </div>
      )}
    </div>
  )
}
