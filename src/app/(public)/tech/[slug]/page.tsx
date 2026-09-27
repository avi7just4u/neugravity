export const revalidate = 300

import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Globe, ChevronRight, GitBranch, BookOpen, ArrowRight, Network } from "lucide-react"
import { TechnologyService } from "@/lib/services/technology.service"
import { CourseService } from "@/lib/services/course.service"
import { UnderstandTabs } from "@/components/tech/understand-tabs"
import { ConceptFlow } from "@/components/tech/concept-flow"
import { PrerequisiteCard } from "@/components/tech/prerequisite-card"
import { EcosystemSection } from "@/components/tech/ecosystem-section"
import { RelatedNewsSection } from "@/components/tech/related-news-section"
import { TechPageAnalytics } from "@/components/tech/tech-page-analytics"
import { TECH_FLOWS } from "@/lib/knowledge/tech-flows"
import type { Technology, ExplanationType, TechnologyWithRelations } from "@/types"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://neugravity.com"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const tech = await TechnologyService.getTechnologyBySlug(slug)
  if (!tech) return { title: "Not Found" }

  const description = tech.seo_description ?? tech.short_definition ?? tech.tagline ?? tech.description ?? undefined
  const pageUrl = `${SITE_URL}/tech/${slug}`

  return {
    title: tech.seo_title ?? tech.name,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title: tech.seo_title ?? tech.name,
      description: description ?? undefined,
      type: "article",
      url: pageUrl,
    },
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
  concept: "outline",
}

const EXPLAIN_LABELS: Record<ExplanationType, string> = {
  quick: "30 Sec",
  simple: "Simple",
  beginner: "Beginner",
  technical: "Engineer",
  architect: "Architect",
}

function RelatedTechCard({ tech }: { tech: Technology }) {
  return (
    <Link
      href={`/tech/${tech.slug}`}
      className="group flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
          {tech.name}
        </p>
        <p className="text-xs text-zinc-400 truncate">{tech.tagline ?? tech.type}</p>
      </div>
      <ArrowRight className="h-3.5 w-3.5 text-zinc-300 group-hover:text-blue-400 shrink-0" />
    </Link>
  )
}

function jsonLd(tech: TechnologyWithRelations) {
  const about: Record<string, unknown>[] = []
  const descriptions = Object.values(tech.explanations).filter(Boolean)
  if (descriptions.length > 0) {
    descriptions.forEach((exp) => {
      if (exp) about.push({ "@type": "Thing", description: exp.content })
    })
  }

  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    name: tech.name,
    description: tech.seo_description ?? tech.short_definition ?? tech.tagline ?? tech.description ?? "",
    url: `${SITE_URL}/tech/${tech.slug}`,
    dateModified: tech.updated_at,
    ...(tech.website_url ? { sameAs: tech.website_url } : {}),
    ...(about.length > 0 ? { about } : {}),
  }
}

export default async function TechDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  let tech: TechnologyWithRelations | null = null
  try {
    tech = await TechnologyService.getTechnologyWithRelations(slug)
  } catch {
    const basic = await TechnologyService.getTechnologyBySlug(slug)
    if (basic) {
      tech = {
        ...basic,
        short_definition: basic.short_definition ?? null,
        maturity: basic.maturity ?? null,
        explanations: {},
        prerequisites: [],
        next_concepts: [],
        related_tools: [],
        related_companies: [],
        related_news: [],
        related_comparisons: [],
      }
    }
  }

  if (!tech) notFound()

  const flowNodes = TECH_FLOWS[slug] ?? []

  const [learningCourses, learningPaths] = await Promise.all([
    CourseService.getCoursesForTechnology(tech.id, 3),
    CourseService.getLearningPathsForTechnology(tech.id, 2),
  ])

  // Sort by canonical tab order so "30 Sec" is always the default (DB returns in arbitrary order)
  const EXPLANATION_ORDER: ExplanationType[] = ["quick", "simple", "beginner", "technical", "architect"]
  const publishedExplanations = EXPLANATION_ORDER.filter(
    (type) => tech.explanations[type]?.status === "published"
  )

  const hasExplanations = publishedExplanations.length > 0
  const firstType = publishedExplanations[0] ?? "quick"

  const facts: { label: string; value: string | number | null | undefined }[] = [
    { label: "Type", value: tech.type },
    { label: "Created", value: tech.created_year },
    { label: "Creator", value: tech.creator },
    { label: "License", value: tech.license },
    { label: "Open Source", value: tech.open_source === true ? "Yes" : tech.open_source === false ? "No" : null },
    { label: "Difficulty", value: tech.difficulty },
    { label: "Maturity", value: tech.maturity },
    { label: "Status", value: tech.status },
  ].filter((f) => f.value != null && f.value !== "")

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(tech)) }}
      />

      <TechPageAnalytics
        technologyId={tech.id}
        technologySlug={tech.slug}
        technologyName={tech.name}
      />

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
          {/* ── Main column ── */}
          <div className="lg:col-span-2 space-y-12">
            {/* Hero */}
            <header>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant={typeVariant[tech.type] ?? "secondary"} className="capitalize">{tech.type}</Badge>
                <Badge variant={statusVariant[tech.status] ?? "secondary"} className="capitalize">{tech.status}</Badge>
                {tech.open_source && <Badge variant="success">Open Source</Badge>}
                {tech.featured && <Badge variant="outline">Featured</Badge>}
                {tech.maturity && (
                  <Badge variant="secondary" className="capitalize">{tech.maturity}</Badge>
                )}
              </div>

              <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">{tech.name}</h1>

              {tech.short_definition ? (
                <p className="text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed">{tech.short_definition}</p>
              ) : tech.tagline ? (
                <p className="text-lg text-zinc-500 dark:text-zinc-400">{tech.tagline}</p>
              ) : null}

              {tech.description && tech.description !== tech.short_definition && (
                <p className="text-zinc-600 dark:text-zinc-300 mt-3 leading-relaxed">{tech.description}</p>
              )}

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
            </header>

            {/* Understand */}
            {hasExplanations && (
              <section aria-labelledby="understand-heading">
                <div className="flex items-center gap-2 mb-4">
                  <Network className="h-4 w-4 text-blue-500" />
                  <h2 id="understand-heading" className="text-lg font-semibold text-zinc-900 dark:text-white">
                    Understand {tech.name}
                  </h2>
                </div>

                <UnderstandTabs available={publishedExplanations} defaultTab={firstType} />

                <div className="mt-4">
                  {publishedExplanations.map((type, i) => {
                    const exp = tech.explanations[type]
                    if (!exp) return null
                    return (
                      <div
                        key={type}
                        id={`explanation-panel-${type}`}
                        role="tabpanel"
                        aria-labelledby={`tab-${type}`}
                        style={i > 0 ? { display: "none" } : undefined}
                        className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-5"
                      >
                        {exp.title && (
                          <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-3">{exp.title}</h3>
                        )}
                        <div className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                          {exp.content}
                        </div>
                        <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                          <span className="text-xs text-zinc-400 capitalize">
                            {EXPLAIN_LABELS[type]} explanation
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* How it works (flow diagram) */}
            {flowNodes.length > 0 && (
              <section aria-labelledby="flow-heading">
                <h2 id="flow-heading" className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                  How It Works
                </h2>
                <ConceptFlow nodes={flowNodes} />
              </section>
            )}

            {/* Prerequisites */}
            {tech.prerequisites.length > 0 && (
              <section aria-labelledby="prereqs-heading">
                <h2 id="prereqs-heading" className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                  Learn First
                </h2>
                <div className="grid sm:grid-cols-2 gap-2">
                  {tech.prerequisites.map((prereq) => (
                    <PrerequisiteCard key={prereq.id} technology={prereq} label="prerequisite" />
                  ))}
                </div>
              </section>
            )}

            {/* Ecosystem */}
            {(tech.related_tools.length > 0 || tech.related_companies.length > 0) && (
              <section aria-labelledby="ecosystem-heading">
                <h2 id="ecosystem-heading" className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                  Ecosystem
                </h2>
                <EcosystemSection
                  tools={tech.related_tools}
                  companies={tech.related_companies}
                />
              </section>
            )}

            {/* Fallback for no explanations */}
            {!hasExplanations && (
              <>
                <section>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">
                    What is {tech.name}?
                  </h2>
                  <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                    {tech.long_description ?? tech.description ? (
                      <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed">
                        {tech.long_description ?? tech.description}
                      </p>
                    ) : (
                      <p className="text-zinc-400 text-sm">
                        Curated explanations for {tech.name} are being prepared.
                      </p>
                    )}
                  </div>
                </section>

                {flowNodes.length > 0 && (
                  <section aria-labelledby="flow-heading2">
                    <h2 id="flow-heading2" className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                      How It Works
                    </h2>
                    <ConceptFlow nodes={flowNodes} />
                  </section>
                )}
              </>
            )}

            {/* Next concepts */}
            {tech.next_concepts.length > 0 && (
              <section aria-labelledby="next-heading">
                <h2 id="next-heading" className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                  What to Learn Next
                </h2>
                <div className="grid sm:grid-cols-2 gap-2">
                  {tech.next_concepts.map((next) => (
                    <PrerequisiteCard key={next.id} technology={next} label="next" />
                  ))}
                </div>
              </section>
            )}

            {/* Related technologies (fallback from existing method) */}
            {tech.related_technologies && tech.related_technologies.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                  Related Technologies
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {tech.related_technologies.map((r) => (
                    <RelatedTechCard key={r.id} tech={r} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ── Sidebar ── */}
          <aside className="space-y-6">
            {/* Key facts */}
            {facts.length > 0 && (
              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-4 text-sm">Key Facts</h3>
                <dl className="space-y-3 text-sm">
                  {facts.map(({ label, value }) => (
                    <div key={label}>
                      <dt className="text-zinc-400 text-xs uppercase tracking-wide">{label}</dt>
                      <dd className="text-zinc-900 dark:text-white font-medium capitalize mt-0.5">{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Popularity */}
            {(tech.popularity_score > 0 || tech.trending_score > 0) && (
              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-4 text-sm">Signals</h3>
                <dl className="space-y-3 text-sm">
                  {tech.popularity_score > 0 && (
                    <div>
                      <dt className="text-xs text-zinc-400 uppercase tracking-wide">Popularity</dt>
                      <dd className="text-zinc-900 dark:text-white font-medium">{tech.popularity_score.toLocaleString()}</dd>
                    </div>
                  )}
                  {tech.trending_score > 0 && (
                    <div>
                      <dt className="text-xs text-zinc-400 uppercase tracking-wide">Trending</dt>
                      <dd className="text-zinc-900 dark:text-white font-medium">{tech.trending_score.toLocaleString()}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {/* Latest News */}
            {tech.related_news.length > 0 && (
              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-4 text-sm">Latest News</h3>
                <RelatedNewsSection news={tech.related_news.slice(0, 5)} />
              </div>
            )}

            {/* Comparisons */}
            {tech.related_comparisons.length > 0 && (
              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-4 text-sm">Comparisons</h3>
                <ul className="space-y-2">
                  {tech.related_comparisons.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/compare/${c.slug}`}
                        className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-1"
                      >
                        {c.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Learn section */}
            {(learningCourses.length > 0 || learningPaths.length > 0) && (
              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-zinc-900 dark:text-white text-sm">Learn {tech.name}</h3>
                  <Link href="/learn" className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
                    All →
                  </Link>
                </div>
                <ul className="space-y-2">
                  {learningPaths.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/learn/${p.slug}`}
                        className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                      >
                        <BookOpen className="h-3.5 w-3.5 shrink-0" />
                        <span className="line-clamp-1">{p.title}</span>
                        <ArrowRight className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100 ml-auto transition-opacity" />
                      </Link>
                    </li>
                  ))}
                  {learningCourses.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/courses/${c.slug}`}
                        className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                      >
                        <BookOpen className="h-3.5 w-3.5 shrink-0 text-zinc-300" />
                        <span className="line-clamp-1">{c.title}</span>
                        <ArrowRight className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100 ml-auto transition-opacity" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Links */}
            <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-3 text-sm">Official Resources</h3>
              <ul className="space-y-2">
                {tech.website_url && (
                  <li>
                    <a href={tech.website_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-zinc-500 hover:text-blue-600 transition-colors">
                      <Globe className="h-3.5 w-3.5" /> Website
                    </a>
                  </li>
                )}
                {tech.docs_url && (
                  <li>
                    <a href={tech.docs_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-zinc-500 hover:text-blue-600 transition-colors">
                      <BookOpen className="h-3.5 w-3.5" /> Documentation
                    </a>
                  </li>
                )}
                {tech.github_url && (
                  <li>
                    <a href={tech.github_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-zinc-500 hover:text-blue-600 transition-colors">
                      <GitBranch className="h-3.5 w-3.5" /> GitHub
                    </a>
                  </li>
                )}
                {tech.wikipedia_url && (
                  <li>
                    <a href={tech.wikipedia_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-zinc-500 hover:text-blue-600 transition-colors">
                      <Network className="h-3.5 w-3.5" /> Wikipedia
                    </a>
                  </li>
                )}
                {!tech.website_url && !tech.docs_url && !tech.github_url && !tech.wikipedia_url && (
                  <li><p className="text-xs text-zinc-400">No official links yet.</p></li>
                )}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
