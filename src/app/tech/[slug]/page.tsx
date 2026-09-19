export const revalidate = 300

import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Globe, ChevronRight, GitBranch, BookOpen, ArrowRight } from "lucide-react"
import { TechnologyService } from "@/lib/services/technology.service"
import type { Technology } from "@/types"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const tech = await TechnologyService.getTechnologyBySlug(slug)
  if (!tech) return { title: "Not Found" }
  return {
    title: tech.seo_title ?? `${tech.name} — NeuGravity`,
    description: tech.seo_description ?? tech.tagline ?? tech.description ?? undefined,
  }
}

export function generateStaticParams() {
  return []
}

const statusVariant: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  active: "success",
  experimental: "warning",
  deprecated: "destructive",
  archived: "secondary",
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
}

function RelatedCard({ tech }: { tech: Technology }) {
  return (
    <Link
      href={`/tech/${tech.slug}`}
      className="group flex items-center gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
          {tech.name}
        </p>
        <p className="text-xs text-zinc-400 truncate">{tech.tagline ?? tech.type}</p>
      </div>
      <ArrowRight className="h-3.5 w-3.5 text-zinc-300 group-hover:text-blue-400 shrink-0" />
    </Link>
  )
}

export default async function TechDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const tech = await TechnologyService.getTechnologyBySlug(slug)
  if (!tech) notFound()

  const related = await TechnologyService.getRelatedTechnologies(tech.id, 6)

  const facts: { label: string; value: string | number | null | undefined }[] = [
    { label: "Type", value: tech.type },
    { label: "Created", value: tech.created_year },
    { label: "Creator", value: tech.creator },
    { label: "License", value: tech.license },
    { label: "Open Source", value: tech.open_source === true ? "Yes" : tech.open_source === false ? "No" : null },
    { label: "Difficulty", value: tech.difficulty },
    { label: "Status", value: tech.status },
  ].filter((f) => f.value != null && f.value !== "")

  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-zinc-400 mb-8" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/tech" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Tech</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-zinc-600 dark:text-zinc-300">{tech.name}</span>
      </nav>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-10">
          {/* Hero */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant={typeVariant[tech.type] ?? "secondary"} className="capitalize">{tech.type}</Badge>
              <Badge variant={statusVariant[tech.status] ?? "secondary"} className="capitalize">{tech.status}</Badge>
              {tech.open_source && <Badge variant="success">Open Source</Badge>}
              {tech.featured && <Badge variant="outline">Featured</Badge>}
            </div>
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">{tech.name}</h1>
            {tech.tagline && (
              <p className="text-lg text-zinc-500 dark:text-zinc-400">{tech.tagline}</p>
            )}
            {tech.description && (
              <p className="text-zinc-600 dark:text-zinc-300 mt-4 leading-relaxed">{tech.description}</p>
            )}
            {tech.long_description && tech.long_description !== tech.description && (
              <p className="text-zinc-600 dark:text-zinc-300 mt-3 leading-relaxed">{tech.long_description}</p>
            )}

            {/* Action links */}
            {(tech.website_url || tech.github_url || tech.docs_url) && (
              <div className="flex flex-wrap items-center gap-2 mt-5">
                {tech.website_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={tech.website_url} target="_blank" rel="noopener noreferrer" className="gap-1.5">
                      <Globe className="h-3.5 w-3.5" /> Website
                    </a>
                  </Button>
                )}
                {tech.github_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={tech.github_url} target="_blank" rel="noopener noreferrer" className="gap-1.5">
                      <GitBranch className="h-3.5 w-3.5" /> GitHub
                    </a>
                  </Button>
                )}
                {tech.docs_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={tech.docs_url} target="_blank" rel="noopener noreferrer" className="gap-1.5">
                      <BookOpen className="h-3.5 w-3.5" /> Docs
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* 60-second explanation */}
          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">60-Second Explanation</h2>
            <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                A concise explanation of {tech.name} is being curated. Check back soon.
              </p>
            </div>
          </section>

          {/* How it works */}
          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">How It Works</h2>
            <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">Technical architecture and working principles coming soon.</p>
            </div>
          </section>

          {/* Related technologies */}
          {related.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">Related Technologies</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {related.map((r) => (
                  <RelatedCard key={r.id} tech={r} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {facts.length > 0 && (
            <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">Key Facts</h3>
              <dl className="space-y-3 text-sm">
                {facts.map(({ label, value }) => (
                  <div key={label}>
                    <dt className="text-zinc-400 text-xs uppercase tracking-wide">{label}</dt>
                    <dd className="text-zinc-900 dark:text-white font-medium capitalize">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {(tech.popularity_score > 0 || tech.trending_score > 0) && (
            <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-4 text-sm">Popularity</h3>
              <dl className="space-y-3 text-sm">
                {tech.popularity_score > 0 && (
                  <div>
                    <dt className="text-xs text-zinc-400 uppercase tracking-wide">Popularity Score</dt>
                    <dd className="text-zinc-900 dark:text-white font-medium">{tech.popularity_score.toLocaleString()}</dd>
                  </div>
                )}
                {tech.trending_score > 0 && (
                  <div>
                    <dt className="text-xs text-zinc-400 uppercase tracking-wide">Trending Score</dt>
                    <dd className="text-zinc-900 dark:text-white font-medium">{tech.trending_score.toLocaleString()}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-3 text-sm">Latest News</h3>
            <p className="text-xs text-zinc-400">News about {tech.name} coming soon.</p>
          </div>

          <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-3 text-sm">Courses</h3>
            <p className="text-xs text-zinc-400">Courses covering {tech.name} coming soon.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
