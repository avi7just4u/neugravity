// Revalidate every 60 seconds — ISR keeps homepage fresh without full SSR on every request
export const revalidate = 60

import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  Cpu,
  Newspaper,
  Wrench,
  BarChart3,
  BookOpen,
  Building2,
  TrendingUp,
  Shield,
  Globe,
  Cloud,
  Code2,
  ChevronRight,
  Clock,
  Zap,
  GraduationCap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TechnologyService } from "@/lib/services/technology.service"
import { ContentService } from "@/lib/services/content.service"
import { ToolService } from "@/lib/services/tool.service"
import { ComparisonService } from "@/lib/services/comparison.service"
import { formatRelativeDate } from "@/lib/utils"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://neugravity.vercel.app"

export const metadata: Metadata = {
  title: "NeuGravity — Tech Intelligence Platform",
  description: "The intelligence layer for engineering teams. Track technologies, tools, companies, and industry trends in one place.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "NeuGravity — Tech Intelligence Platform",
    description: "The intelligence layer for engineering teams. Track technologies, tools, companies, and industry trends in one place.",
    url: SITE_URL,
    siteName: "NeuGravity",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NeuGravity — Tech Intelligence Platform",
    description: "The intelligence layer for engineering teams.",
  },
}

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "NeuGravity",
      url: SITE_URL,
      description: "Tech intelligence platform for engineering teams",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "NeuGravity",
      publisher: { "@id": `${SITE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
  ],
}

const RADAR_ITEMS = [
  { name: "AI Agents", status: "Adopt", description: "Production-ready for many use cases" },
  { name: "WebAssembly", status: "Trial", description: "Growing adoption in performance-critical apps" },
  { name: "Edge Computing", status: "Adopt", description: "Established for latency-sensitive workloads" },
  { name: "Quantum Computing", status: "Assess", description: "Early stage, watch for enterprise impact" },
  { name: "Zero-Trust Security", status: "Adopt", description: "Standard practice for modern organizations" },
  { name: "AI Code Generation", status: "Adopt", description: "Transforming developer productivity" },
]

const RADAR_BORDER: Record<string, string> = {
  Adopt: "border-l-green-500",
  Trial: "border-l-blue-500",
  Assess: "border-l-amber-500",
  Hold: "border-l-red-500",
}
const RADAR_TEXT: Record<string, string> = {
  Adopt: "text-green-600 dark:text-green-400",
  Trial: "text-blue-600 dark:text-blue-400",
  Assess: "text-amber-600 dark:text-amber-400",
  Hold: "text-red-600 dark:text-red-400",
}

export default async function HomePage() {
  const [trendingTech, featuredNews, featuredTools, comparisons] = await Promise.all([
    TechnologyService.getTrendingTechnologies(6),
    ContentService.getPublishedNews({ perPage: 4, featured: true }),
    ToolService.getFeaturedTools(6),
    ComparisonService.getPopularComparisons(5),
  ])

  const latestNews = featuredNews.data.length > 0
    ? featuredNews.data
    : await ContentService.getPublishedNews({ perPage: 4 }).then(r => r.data)

  return (
    <div className="flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden border-b border-zinc-100 dark:border-zinc-900 bg-dot-grid">
        {/* Fade the dot grid at edges */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/60 to-white dark:from-zinc-950/80 dark:via-zinc-950/60 dark:to-zinc-950 pointer-events-none" aria-hidden="true" />

        <div className="relative mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-36">
          <div className="max-w-3xl animate-fade-in">
            <div className="flex items-center gap-2 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                <span className="signal-dot signal-dot--live" />
                Technology Intelligence Platform
              </span>
            </div>

            <h1 className="text-display text-zinc-900 dark:text-white">
              Understand<br />
              Technology.<br />
              <span className="text-gradient-subtle">Navigate What&apos;s Next.</span>
            </h1>

            <p className="mt-6 text-lg md:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
              Learn technology, discover the right tools, understand how companies work,
              and stay ahead of what is changing.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-3 mt-8">
              <Button size="lg" asChild className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-md shadow-indigo-200 dark:shadow-indigo-950">
                <Link href="/tech">
                  Explore Technology
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/learn">Start Learning</Link>
              </Button>
              <Button size="lg" variant="ghost" asChild>
                <Link href="/tools">Explore Tools</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Connected-nodes diagram — subtle brand motif */}
        <div className="absolute top-0 right-0 -z-10 w-1/2 h-full overflow-hidden pointer-events-none" aria-hidden="true">
          <svg
            viewBox="0 0 480 480"
            fill="none"
            className="absolute top-1/2 right-0 -translate-y-1/2 w-[480px] h-[480px] opacity-[0.07] dark:opacity-[0.10]"
          >
            <circle cx="240" cy="120" r="24" stroke="#4f46e5" strokeWidth="2" />
            <circle cx="380" cy="220" r="18" stroke="#4f46e5" strokeWidth="2" />
            <circle cx="140" cy="280" r="20" stroke="#4f46e5" strokeWidth="2" />
            <circle cx="320" cy="360" r="14" stroke="#4f46e5" strokeWidth="2" />
            <circle cx="100" cy="160" r="12" stroke="#4f46e5" strokeWidth="1.5" />
            <line x1="240" y1="120" x2="380" y2="220" stroke="#4f46e5" strokeWidth="1.5" />
            <line x1="240" y1="120" x2="140" y2="280" stroke="#4f46e5" strokeWidth="1.5" />
            <line x1="380" y1="220" x2="320" y2="360" stroke="#4f46e5" strokeWidth="1.5" />
            <line x1="140" y1="280" x2="320" y2="360" stroke="#4f46e5" strokeWidth="1.5" />
            <line x1="100" y1="160" x2="240" y2="120" stroke="#4f46e5" strokeWidth="1" />
            <line x1="100" y1="160" x2="140" y2="280" stroke="#4f46e5" strokeWidth="1" />
          </svg>
        </div>
      </section>

      {/* ── TRENDING TECHNOLOGY ── */}
      <section className="py-12 border-b border-zinc-100 dark:border-zinc-900">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="section-header">
            <div>
              <span className="section-label">
                <TrendingUp className="h-3.5 w-3.5" />
                Trending
              </span>
              <h2 className="text-title text-zinc-900 dark:text-white mt-1">Trending Technology</h2>
            </div>
            <Link href="/tech" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors font-medium">
              All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 animate-children">
            {trendingTech.length === 0 && (
              <div className="col-span-6 py-8 text-center text-zinc-400 text-sm">No technologies yet — check back soon.</div>
            )}
            {trendingTech.map((tech) => (
              <Link
                key={tech.slug}
                href={`/tech/${tech.slug}`}
                className="card-base card-interactive group flex flex-col gap-2 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                    <Cpu className="h-4 w-4" />
                  </div>
                  {tech.trending_score > 0 && (
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400">#{tech.trending_score}</span>
                  )}
                </div>
                <div>
                  <div className="font-medium text-sm text-zinc-900 dark:text-white leading-snug">{tech.name}</div>
                  <div className="text-label text-zinc-400 capitalize mt-0.5">{tech.type ?? ""}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWS + TOOLS ── */}
      <section className="py-12 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/30">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-10">

            {/* News */}
            <div className="lg:col-span-3">
              <div className="section-header mb-5">
                <div>
                  <span className="section-label">
                    <Newspaper className="h-3.5 w-3.5" />
                    Latest
                  </span>
                  <h2 className="text-title text-zinc-900 dark:text-white mt-1">Technology News</h2>
                </div>
                <Link href="/news" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors font-medium">
                  All news <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {latestNews.length === 0 && (
                  <p className="py-8 text-center text-sm text-zinc-400">No news yet — check back soon.</p>
                )}
                {latestNews.map((item, i) => (
                  <Link
                    key={item.slug}
                    href={`/news/${item.slug}`}
                    className="group flex flex-col gap-1.5 py-4 first:pt-0"
                  >
                    <div className="flex items-center gap-2">
                      {item.importance >= 9 && <Badge variant="brand" className="text-xs">Breaking</Badge>}
                      {item.importance >= 7 && item.importance < 9 && <Badge variant="warning" className="text-xs">Major</Badge>}
                      {item.published_at && (
                        <span className="text-xs text-zinc-400 ml-auto flex items-center gap-1">
                          <Clock className="h-3 w-3" />{formatRelativeDate(item.published_at)}
                        </span>
                      )}
                    </div>
                    <h3 className={`font-semibold text-zinc-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors ${i === 0 ? "text-base" : "text-sm"}`}>
                      {item.headline}
                    </h3>
                    {i === 0 && item.summary && (
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">{item.summary}</p>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* Tools */}
            <div className="lg:col-span-2">
              <div className="section-header mb-5">
                <div>
                  <span className="section-label">
                    <Wrench className="h-3.5 w-3.5" />
                    Tools
                  </span>
                  <h2 className="text-title text-zinc-900 dark:text-white mt-1">Tool Explorer</h2>
                </div>
                <Link href="/tools" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors font-medium">
                  All <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="space-y-2">
                {featuredTools.length === 0 && (
                  <p className="py-4 text-center text-xs text-zinc-400">No tools yet — check back soon.</p>
                )}
                {featuredTools.map((tool) => (
                  <Link
                    key={tool.slug}
                    href={`/tools/${tool.slug}`}
                    className="card-base card-interactive group flex items-center gap-3 p-3"
                  >
                    <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 shrink-0 text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      {tool.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-zinc-900 dark:text-white">{tool.name}</div>
                      <div className="text-xs text-zinc-400 truncate">{tool.tagline ?? tool.description ?? ""}</div>
                    </div>
                    {tool.pricing_model && (
                      <Badge variant="outline" className="text-xs shrink-0 capitalize">{tool.pricing_model.replace("_", " ")}</Badge>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── RADAR + COMPARISONS ── */}
      <section className="py-12 border-b border-zinc-100 dark:border-zinc-900">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10">

            {/* Radar */}
            <div>
              <div className="mb-5">
                <span className="section-label">
                  <Shield className="h-3.5 w-3.5" />
                  Editorial
                </span>
                <h2 className="text-title text-zinc-900 dark:text-white mt-1">Technology Radar</h2>
              </div>
              <div className="space-y-2">
                {RADAR_ITEMS.map((item) => (
                  <div
                    key={item.name}
                    className={`flex items-start gap-4 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 border-l-4 ${RADAR_BORDER[item.status] ?? "border-l-zinc-300"}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-zinc-900 dark:text-white">{item.name}</span>
                        <span className={`text-label ${RADAR_TEXT[item.status] ?? "text-zinc-400"}`}>{item.status}</span>
                      </div>
                      <div className="text-xs text-zinc-400 mt-0.5">{item.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comparisons */}
            <div>
              <div className="section-header mb-5">
                <div>
                  <span className="section-label">
                    <BarChart3 className="h-3.5 w-3.5" />
                    Compare
                  </span>
                  <h2 className="text-title text-zinc-900 dark:text-white mt-1">Popular Comparisons</h2>
                </div>
                <Link href="/compare" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors font-medium">
                  All <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="space-y-2">
                {comparisons.length === 0 && (
                  <p className="py-4 text-center text-xs text-zinc-400">No comparisons yet — check back soon.</p>
                )}
                {comparisons.map((comp, i) => (
                  <Link
                    key={comp.slug}
                    href={`/compare/${comp.slug}`}
                    className="card-base card-interactive group flex items-center gap-4 p-3"
                  >
                    <span className="text-sm font-bold text-indigo-500 dark:text-indigo-400 w-5 shrink-0 tabular-nums">{i + 1}</span>
                    <span className="flex-1 font-medium text-sm text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{comp.title}</span>
                    {comp.view_count > 0 && (
                      <span className="text-xs text-zinc-400 shrink-0">{comp.view_count.toLocaleString()}</span>
                    )}
                    <ChevronRight className="h-4 w-4 text-zinc-300 group-hover:text-indigo-400 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LEARN — Course Launch CTA ── */}
      <section className="py-16 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/30">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="section-label mb-3 inline-flex items-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5" />
              Learning
            </span>
            <h2 className="text-headline text-zinc-900 dark:text-white mt-2 mb-4">
              Structured learning for<br />modern engineers
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6 max-w-lg">
              In-depth courses on AI, cloud architecture, and developer tools — built for how engineers actually learn.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white border-0">
                <Link href="/courses">
                  Browse Courses
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/learn">Explore Learning Paths</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── INSIDE CORPORATE ── */}
      <section className="py-12 border-b border-zinc-100 dark:border-zinc-900">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="section-label mb-3 inline-flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                Inside Work
              </span>
              <h2 className="text-headline text-zinc-900 dark:text-white mt-2 mb-3">
                Understand how technology companies actually work
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed mb-5">
                From how engineering teams are structured to how enterprise software is purchased.
              </p>
              <div className="flex flex-wrap gap-2 mb-5">
                {["Engineering", "Product", "Leadership", "Career", "Sales", "Finance"].map((topic) => (
                  <span
                    key={topic}
                    className="px-3 py-1 text-sm rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                  >
                    {topic}
                  </span>
                ))}
              </div>
              <Button variant="outline" asChild>
                <Link href="/work" className="gap-2">
                  Explore Inside Work <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { title: "How engineering teams are structured", category: "Engineering" },
                { title: "What a CTO actually does", category: "Leadership" },
                { title: "How enterprise software is purchased", category: "Sales" },
                { title: "How technology budgets work", category: "Finance" },
              ].map((item) => (
                <div key={item.title} className="card-raised p-4">
                  <Badge variant="secondary" className="mb-2 text-xs">{item.category}</Badge>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white leading-snug">{item.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ENTERPRISE ── */}
      <section className="py-12 border-b border-zinc-900 bg-zinc-950">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="section-label mb-4 inline-flex items-center gap-1.5 text-indigo-400">
                <Zap className="h-3.5 w-3.5" />
                Enterprise
              </span>
              <h2 className="text-headline text-white mt-2 mb-4">
                Technology intelligence for enterprise teams
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-6">
                AI strategy, cloud architecture, technology advisory, and custom training for engineering and executive teams.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="default" asChild className="bg-white text-zinc-900 hover:bg-zinc-100">
                  <Link href="/enterprise">Talk to us</Link>
                </Button>
                <Button size="default" variant="ghost" asChild className="text-zinc-300 hover:text-white hover:bg-zinc-800">
                  <Link href="/enterprise#services">See services</Link>
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { title: "AI Strategy", icon: <Zap className="h-4 w-4" /> },
                { title: "Architecture Review", icon: <Code2 className="h-4 w-4" /> },
                { title: "Cloud Strategy", icon: <Cloud className="h-4 w-4" /> },
                { title: "Executive Workshops", icon: <Building2 className="h-4 w-4" /> },
                { title: "Custom Training", icon: <BookOpen className="h-4 w-4" /> },
                { title: "Custom Research", icon: <Globe className="h-4 w-4" /> },
              ].map((service) => (
                <div key={service.title} className="flex items-center gap-3 p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-indigo-800 transition-colors">
                  <div className="text-indigo-400">{service.icon}</div>
                  <span className="text-sm font-medium text-zinc-200">{service.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="py-14">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-title text-zinc-900 dark:text-white mb-3">
              Stay ahead of technology
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6 text-sm">
              Weekly intelligence on AI, cloud, developer tools, and the technology industry.
            </p>
            <form action="/api/newsletter/subscribe" method="POST" className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                name="email"
                placeholder="Your email address"
                required
                className="flex-1 h-10 px-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                aria-label="Email address"
              />
              <Button type="submit" className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white border-0">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
