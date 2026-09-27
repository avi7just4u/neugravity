export const revalidate = 3600

import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Wrench, ArrowRight, Star } from "lucide-react"
import { ToolService } from "@/lib/services/tool.service"
import { ENV } from "@/lib/config/environment"
import type { Tool, PricingModel } from "@/types"

export const metadata: Metadata = {
  title: "Tools",
  description: "Discover and compare developer tools, SaaS products, and software.",
  robots: ENV.filterDemoData ? undefined : { index: false, follow: true },
}

const pricingVariant: Record<string, "success" | "info" | "secondary" | "outline"> = {
  free: "success",
  open_source: "success",
  freemium: "info",
  subscription: "secondary",
  usage_based: "outline",
  paid: "secondary",
  enterprise: "secondary",
  one_time: "outline",
}

const filters: { label: string; value: PricingModel | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Free", value: "free" },
  { label: "Open Source", value: "open_source" },
  { label: "Freemium", value: "freemium" },
  { label: "Subscription", value: "subscription" },
  { label: "Enterprise", value: "enterprise" },
]

function ToolCard({ tool }: { tool: Tool }) {
  const initial = tool.name.charAt(0).toUpperCase()
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex flex-col gap-3 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm font-bold text-zinc-600 dark:text-zinc-400 shrink-0 overflow-hidden">
          {tool.icon_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={tool.icon_url} alt={tool.name} className="h-full w-full object-contain" />
          ) : (
            initial
          )}
        </div>
        {tool.pricing_model && (
          <Badge variant={pricingVariant[tool.pricing_model] ?? "secondary"} className="text-xs capitalize">
            {tool.pricing_model.replace("_", " ")}
          </Badge>
        )}
      </div>
      <div>
        <h2 className="font-semibold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {tool.name}
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
          {tool.tagline ?? tool.description ?? ""}
        </p>
      </div>
      <div className="flex items-center justify-between">
        {tool.rating_average != null && tool.rating_count > 0 ? (
          <span className="text-xs text-zinc-400 flex items-center gap-1">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {tool.rating_average.toFixed(1)} ({tool.rating_count})
          </span>
        ) : (
          <span className="text-xs text-zinc-400 capitalize">{tool.tool_type?.replace("_", " ") ?? ""}</span>
        )}
        <span className="text-xs text-zinc-400 flex items-center gap-1 group-hover:text-blue-500 transition-colors">
          View <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  )
}

export default async function ToolsPage({
  searchParams,
}: {
  searchParams: Promise<{ pricing?: string }>
}) {
  const { pricing } = await searchParams
  const activePricing = (pricing as PricingModel | undefined) ?? undefined

  const { data: tools } = await ToolService.getTools({
    pricingModel: activePricing,
    perPage: 24,
  })

  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <Wrench className="h-4 w-4 text-zinc-400" />
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">Tools</span>
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Tool Explorer</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Discover, evaluate, and compare developer tools and software.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {filters.map((f) => {
          const isActive = (f.value === "all" && !activePricing) || f.value === activePricing
          return (
            <Link
              key={f.value}
              href={f.value === "all" ? "/tools" : `/tools?pricing=${f.value}`}
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

      {tools.length === 0 ? (
        <div className="py-24 text-center text-zinc-400">
          <Wrench className="h-10 w-10 mx-auto mb-4 opacity-30" />
          <p>No tools found yet. Check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}
    </div>
  )
}
