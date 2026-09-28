export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Globe, ChevronRight, GitBranch, BookOpen, AlertCircle, Star, ArrowRight } from "lucide-react"
import { ToolService } from "@/lib/services/tool.service"
import type { Tool } from "@/types"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://neugravity.vercel.app"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const tool = await ToolService.getToolBySlug(slug)
  if (!tool) return { title: "Not Found" }
  const title = tool.seo_title ?? `${tool.name} — NeuGravity`
  const description = (tool.seo_description ?? tool.tagline ?? tool.description) || undefined
  const url = `${siteUrl}/tools/${slug}`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: "NeuGravity",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  }
}

export function generateStaticParams() {
  return []
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

function AlternativeCard({ tool }: { tool: Tool }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="card-base card-interactive group flex items-center gap-3 p-3"
    >
      <div className="flex items-center justify-center h-8 w-8 rounded-md bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-500 shrink-0">
        {tool.icon_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={tool.icon_url} alt={tool.name} className="h-full w-full object-contain rounded-md" />
        ) : (
          tool.name.charAt(0)
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
          {tool.name}
        </p>
        {tool.tagline && <p className="text-xs text-zinc-400 truncate">{tool.tagline}</p>}
      </div>
      <ArrowRight className="h-3.5 w-3.5 text-zinc-300 group-hover:text-indigo-400 shrink-0" />
    </Link>
  )
}

function buildToolJsonLd(tool: Tool, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    url,
    description: tool.description ?? tool.tagline ?? undefined,
    applicationCategory: tool.tool_type ?? "WebApplication",
    ...(tool.website_url ? { sameAs: tool.website_url } : {}),
    ...(tool.pricing_model === "free" || tool.pricing_model === "open_source" || tool.has_free_tier
      ? { offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } }
      : {}),
    // aggregateRating omitted: current rating data is seed data, not user-collected reviews
  }
}

export default async function ToolDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const tool = await ToolService.getToolBySlug(slug)
  if (!tool) notFound()

  const alternatives = await ToolService.getAlternativeTools(tool.id, 6)

  const details: { label: string; value: string | null | undefined }[] = [
    { label: "Type", value: tool.tool_type?.replace("_", " ") },
    { label: "Pricing Model", value: tool.pricing_model?.replace("_", " ") },
    { label: "Platforms", value: tool.platforms?.length > 0 ? tool.platforms.join(", ") : null },
    { label: "Status", value: tool.status },
    { label: "Free Tier", value: tool.has_free_tier ? "Yes" : "No" },
    { label: "API Available", value: tool.has_api ? "Yes" : "No" },
    { label: "Enterprise", value: tool.enterprise_available ? "Yes" : "No" },
  ].filter((d) => d.value != null && d.value !== "")

  const toolUrl = `${siteUrl}/tools/${slug}`
  const toolJsonLd = buildToolJsonLd(tool, toolUrl)

  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolJsonLd) }}
      />
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-zinc-400 mb-8" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/tools" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Tools</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-zinc-600 dark:text-zinc-300">{tool.name}</span>
      </nav>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Hero */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xl font-bold text-zinc-600 dark:text-zinc-300 overflow-hidden shrink-0">
                {tool.icon_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={tool.icon_url} alt={tool.name} className="h-full w-full object-contain" />
                ) : (
                  tool.name.charAt(0)
                )}
              </div>
              <div>
                <h1 className="text-headline text-zinc-900 dark:text-white">{tool.name}</h1>
                {tool.tagline && <p className="text-zinc-500 dark:text-zinc-400">{tool.tagline}</p>}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {tool.tool_type && (
                <Badge variant="secondary" className="capitalize">{tool.tool_type.replace("_", " ")}</Badge>
              )}
              {tool.has_free_tier && <Badge variant="success">Free Tier</Badge>}
              {tool.pricing_model && (
                <Badge variant={pricingVariant[tool.pricing_model] ?? "secondary"} className="capitalize">
                  {tool.pricing_model.replace("_", " ")}
                </Badge>
              )}
              {tool.featured && <Badge variant="outline">Featured</Badge>}
            </div>

            {(tool.website_url || tool.github_url || tool.docs_url) && (
              <div className="flex flex-wrap gap-2">
                {tool.website_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={tool.website_url} target="_blank" rel="noopener noreferrer" className="gap-1.5">
                      <Globe className="h-3.5 w-3.5" /> Website
                    </a>
                  </Button>
                )}
                {tool.github_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={tool.github_url} target="_blank" rel="noopener noreferrer" className="gap-1.5">
                      <GitBranch className="h-3.5 w-3.5" /> GitHub
                    </a>
                  </Button>
                )}
                {tool.docs_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={tool.docs_url} target="_blank" rel="noopener noreferrer" className="gap-1.5">
                      <BookOpen className="h-3.5 w-3.5" /> Docs
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Overview */}
          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">Overview</h2>
            <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {tool.description ?? tool.tagline ?? `${tool.name} details are being compiled. Check back soon.`}
            </p>
            {tool.long_description && tool.long_description !== tool.description && (
              <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mt-3">{tool.long_description}</p>
            )}
          </section>

          {/* Key features — verified data only; structured feature list coming with real data */}
          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">Key Features</h2>
            <div className="card-raised p-5 text-sm text-zinc-500 dark:text-zinc-400">
              Detailed feature breakdown for {tool.name} is being compiled from official sources.{" "}
              {tool.website_url && (
                <a href={tool.website_url} target="_blank" rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline">
                  View official documentation →
                </a>
              )}
            </div>
          </section>

          {/* Pricing */}
          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">Pricing</h2>
            <div className="p-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 flex items-start gap-2 text-sm mb-4">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-amber-800 dark:text-amber-300">
                Pricing is sourced from official sources and verified periodically. Always confirm on the official website.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Structured pricing tiers coming soon.</p>
              {tool.website_url && (
                <a
                  href={`${tool.website_url}/pricing`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mt-2 block"
                >
                  View pricing on official website →
                </a>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          {details.length > 0 && (
            <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-4 text-sm">Details</h3>
              <dl className="space-y-3 text-sm">
                {details.map(({ label, value }) => (
                  <div key={label}>
                    <dt className="text-xs text-zinc-400 uppercase tracking-wide">{label}</dt>
                    <dd className="text-zinc-900 dark:text-white font-medium capitalize">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {(tool.rating_average != null && tool.rating_count > 0) && (
            <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-3 text-sm">Rating</h3>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {tool.rating_average.toFixed(1)}
                </span>
                <span className="text-sm text-zinc-400">/ 5 ({tool.rating_count} ratings)</span>
              </div>
            </div>
          )}

          {alternatives.length > 0 && (
            <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-3 text-sm">Alternatives</h3>
              <div className="space-y-2">
                {alternatives.map((alt) => (
                  <AlternativeCard key={alt.id} tool={alt} />
                ))}
              </div>
            </div>
          )}

          {alternatives.length === 0 && (
            <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-3 text-sm">Alternatives</h3>
              <p className="text-xs text-zinc-400">Alternative tools coming soon.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
