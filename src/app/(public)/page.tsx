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
import {
  AnimatedSection,
  StaggerContainer,
  StaggerChild,
  WordReveal,
} from "@/components/ui/motion"
import { TechnologyService } from "@/lib/services/technology.service"
import { ContentService } from "@/lib/services/content.service"
import { ToolService } from "@/lib/services/tool.service"
import { ComparisonService } from "@/lib/services/comparison.service"
import { formatRelativeDate } from "@/lib/utils"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://neugravity.vercel.app"

export const metadata: Metadata = {
  title: "NeuGravity — Tech Intelligence Platform",
  description:
    "The intelligence layer for engineering teams. Track technologies, tools, companies, and industry trends in one place.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "NeuGravity — Tech Intelligence Platform",
    description:
      "The intelligence layer for engineering teams. Track technologies, tools, companies, and industry trends in one place.",
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
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
        },
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
  Hold:   "border-l-red-500",
}
const RADAR_TEXT: Record<string, string> = {
  Adopt: "text-green-600 dark:text-green-400",
  Trial: "text-indigo-600 dark:text-indigo-400",
  Assess: "text-amber-600 dark:text-amber-400",
  Hold:  "text-red-600 dark:text-red-400",
}

export default async function HomePage() {
  const [trendingTech, featuredNews, latestNewsResult, featuredTools, comparisons] = await Promise.all([
    TechnologyService.getTrendingTechnologies(6),
    ContentService.getPublishedNews({ perPage: 4, featured: true }),
    ContentService.getPublishedNews({ perPage: 4 }),
    ToolService.getFeaturedTools(6),
    ComparisonService.getPopularComparisons(5),
  ])

  const latestNews = featuredNews.data.length > 0 ? featuredNews.data : latestNewsResult.data

  return (
    <div className="flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      {/* ═══════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden min-h-[88vh] flex items-center border-b border-zinc-100 dark:border-zinc-900">

        {/* Gradient orbs — animated via CSS, zero JS weight */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-[120px] animate-[pulse_8s_ease-in-out_infinite]" />
          <div className="absolute top-1/2 -left-60 h-[500px] w-[500px] rounded-full bg-violet-500/8 blur-[100px] animate-[pulse_10s_ease-in-out_2s_infinite]" />
          <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-indigo-400/6 blur-[80px] animate-[pulse_12s_ease-in-out_4s_infinite]" />
        </div>

        {/* Dot grid */}
        <div aria-hidden="true" className="absolute inset-0 bg-dot-grid opacity-40 dark:opacity-30" />
        {/* Edge fade */}
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-white dark:from-zinc-950/0 dark:via-zinc-950/0 dark:to-zinc-950" />

        <div className="relative mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-4xl">

            {/* Live badge */}
            <AnimatedSection delay={0}>
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase text-indigo-700 dark:text-indigo-300">
                <span className="signal-dot signal-dot--live" />
                Technology Intelligence Platform
              </div>
            </AnimatedSection>

            {/* Headline — word-by-word reveal */}
            <h1 className="text-display text-zinc-900 dark:text-white mb-6 leading-[1.05]">
              <WordReveal text="Understand Technology." delay={0.1} />
              <br />
              <span className="text-gradient-subtle">
                <WordReveal text="Navigate What's Next." delay={0.4} />
              </span>
            </h1>

            {/* Subtext */}
            <AnimatedSection delay={0.65}>
              <p className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed mb-8">
                Learn technology, discover the right tools, understand how companies work,
                and stay ahead of what is changing.
              </p>
              <div className="flex flex-col sm:flex-row items-start gap-3">
                <Button
                  size="lg"
                  asChild
                  className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-lg shadow-indigo-500/25 dark:shadow-indigo-900/40 transition-all duration-200 hover:-translate-y-0.5"
                >
                  <Link href="/tech">
                    Explore Technology
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="hover:-translate-y-0.5 transition-transform duration-200">
                  <Link href="/learn">Start Learning</Link>
                </Button>
                <Button size="lg" variant="ghost" asChild>
                  <Link href="/tools">Explore Tools</Link>
                </Button>
              </div>
            </AnimatedSection>
          </div>

          {/* Animated SVG connection diagram */}
          <div aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 hidden xl:block">
            <svg
              viewBox="0 0 520 520"
              fill="none"
              className="w-[480px] h-[480px] opacity-20 dark:opacity-25"
            >
              {/* Orbiting rings */}
              <circle cx="260" cy="260" r="180" stroke="#4f46e5" strokeWidth="0.5" strokeDasharray="6 8" />
              <circle cx="260" cy="260" r="110" stroke="#4f46e5" strokeWidth="0.5" strokeDasharray="4 6" />
              {/* Nodes */}
              <circle cx="260" cy="80"  r="22" fill="#4f46e5" fillOpacity="0.15" stroke="#4f46e5" strokeWidth="1.5" />
              <circle cx="420" cy="200" r="16" fill="#4f46e5" fillOpacity="0.1"  stroke="#4f46e5" strokeWidth="1.5" />
              <circle cx="390" cy="380" r="20" fill="#4f46e5" fillOpacity="0.12" stroke="#4f46e5" strokeWidth="1.5" />
              <circle cx="140" cy="380" r="14" fill="#4f46e5" fillOpacity="0.1"  stroke="#4f46e5" strokeWidth="1.5" />
              <circle cx="110" cy="200" r="18" fill="#4f46e5" fillOpacity="0.12" stroke="#4f46e5" strokeWidth="1.5" />
              <circle cx="260" cy="260" r="28" fill="#4f46e5" fillOpacity="0.2"  stroke="#4f46e5" strokeWidth="2"   />
              {/* Connections */}
              <line x1="260" y1="80"  x2="260" y2="232" stroke="#4f46e5" strokeWidth="1" strokeOpacity="0.6" />
              <line x1="420" y1="200" x2="288" y2="260" stroke="#4f46e5" strokeWidth="1" strokeOpacity="0.6" />
              <line x1="390" y1="380" x2="280" y2="282" stroke="#4f46e5" strokeWidth="1" strokeOpacity="0.6" />
              <line x1="140" y1="380" x2="240" y2="282" stroke="#4f46e5" strokeWidth="1" strokeOpacity="0.6" />
              <line x1="110" y1="200" x2="232" y2="260" stroke="#4f46e5" strokeWidth="1" strokeOpacity="0.6" />
              {/* Cross connections */}
              <line x1="260" y1="80"  x2="420" y2="200" stroke="#4f46e5" strokeWidth="0.5" strokeOpacity="0.3" />
              <line x1="420" y1="200" x2="390" y2="380" stroke="#4f46e5" strokeWidth="0.5" strokeOpacity="0.3" />
              <line x1="110" y1="200" x2="140" y2="380" stroke="#4f46e5" strokeWidth="0.5" strokeOpacity="0.3" />
              <line x1="260" y1="80"  x2="110" y2="200" stroke="#4f46e5" strokeWidth="0.5" strokeOpacity="0.3" />
              {/* Center dot */}
              <circle cx="260" cy="260" r="6" fill="#4f46e5" />
            </svg>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          TRENDING TECHNOLOGY
      ═══════════════════════════════════════════════ */}
      <section className="py-14 border-b border-zinc-100 dark:border-zinc-900">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="section-header mb-6">
            <div>
              <span className="section-label">
                <TrendingUp className="h-3.5 w-3.5" />
                Trending
              </span>
              <h2 className="text-title text-zinc-900 dark:text-white mt-1">Trending Technology</h2>
            </div>
            <Link
              href="/tech"
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors font-medium"
            >
              All <ChevronRight className="h-4 w-4" />
            </Link>
          </AnimatedSection>

          <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {trendingTech.length === 0 && (
              <div className="col-span-6 py-8 text-center text-zinc-400 text-sm">
                No technologies yet — check back soon.
              </div>
            )}
            {trendingTech.map((tech) => (
              <StaggerChild key={tech.slug}>
                <Link
                  href={`/tech/${tech.slug}`}
                  className="card-base card-interactive group flex flex-col gap-2 p-4 h-full"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-950/70 transition-colors">
                      <Cpu className="h-4 w-4" />
                    </div>
                    {tech.trending_score > 0 && (
                      <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                        #{tech.trending_score}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-sm text-zinc-900 dark:text-white leading-snug">
                      {tech.name}
                    </div>
                    <div className="text-label text-zinc-400 capitalize mt-0.5">{tech.type ?? ""}</div>
                  </div>
                </Link>
              </StaggerChild>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          NEWS + TOOLS
      ═══════════════════════════════════════════════ */}
      <section className="py-14 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/20">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12">

            {/* News */}
            <AnimatedSection className="lg:col-span-3">
              <div className="section-header mb-5">
                <div>
                  <span className="section-label">
                    <Newspaper className="h-3.5 w-3.5" />
                    Latest
                  </span>
                  <h2 className="text-title text-zinc-900 dark:text-white mt-1">Technology News</h2>
                </div>
                <Link
                  href="/news"
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors font-medium"
                >
                  All news <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {latestNews.length === 0 && (
                  <p className="py-8 text-center text-sm text-zinc-400">
                    No news yet — check back soon.
                  </p>
                )}
                {latestNews.map((item, i) => (
                  <Link
                    key={item.slug}
                    href={`/news/${item.slug}`}
                    className="group flex flex-col gap-1.5 py-4 first:pt-0"
                  >
                    <div className="flex items-center gap-2">
                      {item.importance >= 9 && (
                        <Badge variant="brand" className="text-xs">Breaking</Badge>
                      )}
                      {item.importance >= 7 && item.importance < 9 && (
                        <Badge variant="warning" className="text-xs">Major</Badge>
                      )}
                      {item.published_at && (
                        <span className="text-xs text-zinc-400 ml-auto flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatRelativeDate(item.published_at)}
                        </span>
                      )}
                    </div>
                    <h3
                      className={`font-semibold text-zinc-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors ${i === 0 ? "text-base" : "text-sm"}`}
                    >
                      {item.headline}
                    </h3>
                    {i === 0 && item.summary && (
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
                        {item.summary}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </AnimatedSection>

            {/* Tools */}
            <AnimatedSection className="lg:col-span-2" delay={0.1}>
              <div className="section-header mb-5">
                <div>
                  <span className="section-label">
                    <Wrench className="h-3.5 w-3.5" />
                    Tools
                  </span>
                  <h2 className="text-title text-zinc-900 dark:text-white mt-1">Tool Explorer</h2>
                </div>
                <Link
                  href="/tools"
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors font-medium"
                >
                  All <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="space-y-2">
                {featuredTools.length === 0 && (
                  <p className="py-4 text-center text-xs text-zinc-400">
                    No tools yet — check back soon.
                  </p>
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
                      <div className="font-medium text-sm text-zinc-900 dark:text-white">
                        {tool.name}
                      </div>
                      <div className="text-xs text-zinc-400 truncate">
                        {tool.tagline ?? tool.description ?? ""}
                      </div>
                    </div>
                    {tool.pricing_model && (
                      <Badge variant="outline" className="text-xs shrink-0 capitalize">
                        {tool.pricing_model.replace("_", " ")}
                      </Badge>
                    )}
                  </Link>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          RADAR + COMPARISONS
      ═══════════════════════════════════════════════ */}
      <section className="py-14 border-b border-zinc-100 dark:border-zinc-900">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">

            {/* Radar */}
            <AnimatedSection>
              <div className="mb-5">
                <span className="section-label">
                  <Shield className="h-3.5 w-3.5" />
                  Editorial
                </span>
                <h2 className="text-title text-zinc-900 dark:text-white mt-1">Technology Radar</h2>
              </div>
              <StaggerContainer className="space-y-2" fast>
                {RADAR_ITEMS.map((item) => (
                  <StaggerChild key={item.name}>
                    <div
                      className={`flex items-start gap-4 p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 border-l-4 ${RADAR_BORDER[item.status] ?? "border-l-zinc-300"}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-zinc-900 dark:text-white">
                            {item.name}
                          </span>
                          <span className={`text-label ${RADAR_TEXT[item.status] ?? "text-zinc-400"}`}>
                            {item.status}
                          </span>
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </StaggerChild>
                ))}
              </StaggerContainer>
            </AnimatedSection>

            {/* Comparisons */}
            <AnimatedSection delay={0.1}>
              <div className="section-header mb-5">
                <div>
                  <span className="section-label">
                    <BarChart3 className="h-3.5 w-3.5" />
                    Compare
                  </span>
                  <h2 className="text-title text-zinc-900 dark:text-white mt-1">Popular Comparisons</h2>
                </div>
                <Link
                  href="/compare"
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors font-medium"
                >
                  All <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <StaggerContainer className="space-y-2" fast>
                {comparisons.length === 0 && (
                  <p className="py-4 text-center text-xs text-zinc-400">
                    No comparisons yet — check back soon.
                  </p>
                )}
                {comparisons.map((comp, i) => (
                  <StaggerChild key={comp.slug}>
                    <Link
                      href={`/compare/${comp.slug}`}
                      className="card-base card-interactive group flex items-center gap-4 p-3.5"
                    >
                      <span className="text-sm font-bold text-indigo-500 dark:text-indigo-400 w-6 shrink-0 tabular-nums">
                        {i + 1}
                      </span>
                      <span className="flex-1 font-medium text-sm text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {comp.title}
                      </span>
                      {comp.view_count > 0 && (
                        <span className="text-xs text-zinc-400 shrink-0">
                          {comp.view_count.toLocaleString()}
                        </span>
                      )}
                      <ChevronRight className="h-4 w-4 text-zinc-300 group-hover:text-indigo-400 transition-colors shrink-0" />
                    </Link>
                  </StaggerChild>
                ))}
              </StaggerContainer>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          LEARN — Course Launch CTA
      ═══════════════════════════════════════════════ */}
      <section className="py-20 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/20">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="max-w-2xl">
            <span className="section-label mb-3 inline-flex items-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5" />
              Learning
            </span>
            <h2 className="text-headline text-zinc-900 dark:text-white mt-2 mb-4">
              Structured learning for<br className="hidden sm:block" /> modern engineers
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8 max-w-lg">
              In-depth courses on AI, cloud architecture, and developer tools — built for how
              engineers actually learn.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                asChild
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5 transition-all duration-200"
              >
                <Link href="/courses">
                  Browse Courses
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild className="hover:-translate-y-0.5 transition-transform duration-200">
                <Link href="/learn">Explore Learning Paths</Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          INSIDE CORPORATE
      ═══════════════════════════════════════════════ */}
      <section className="py-16 border-b border-zinc-100 dark:border-zinc-900">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection>
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
              <div className="flex flex-wrap gap-2 mb-6">
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
            </AnimatedSection>

            <StaggerContainer className="grid grid-cols-2 gap-3" delay={0.1}>
              {[
                { title: "How engineering teams are structured", category: "Engineering" },
                { title: "What a CTO actually does",            category: "Leadership" },
                { title: "How enterprise software is purchased", category: "Sales" },
                { title: "How technology budgets work",         category: "Finance" },
              ].map((item) => (
                <StaggerChild key={item.title}>
                  <div className="card-raised p-4 h-full">
                    <Badge variant="secondary" className="mb-2 text-xs">
                      {item.category}
                    </Badge>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white leading-snug">
                      {item.title}
                    </p>
                  </div>
                </StaggerChild>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          ENTERPRISE — dark section
      ═══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-16 border-b border-zinc-900 bg-zinc-950">
        {/* Background glow */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-indigo-600/10 blur-[80px]" />
        </div>

        <div className="relative mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection>
              <span className="section-label mb-4 inline-flex items-center gap-1.5 text-indigo-400">
                <Zap className="h-3.5 w-3.5" />
                Enterprise
              </span>
              <h2 className="text-headline text-white mt-2 mb-4">
                Technology intelligence for enterprise teams
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-8">
                AI strategy, cloud architecture, technology advisory, and custom training for
                engineering and executive teams.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild className="bg-white text-zinc-900 hover:bg-zinc-100 hover:-translate-y-0.5 transition-all duration-200">
                  <Link href="/enterprise">Talk to us</Link>
                </Button>
                <Button
                  variant="ghost"
                  asChild
                  className="text-zinc-300 hover:text-white hover:bg-zinc-800"
                >
                  <Link href="/enterprise#services">See services</Link>
                </Button>
              </div>
            </AnimatedSection>

            <StaggerContainer className="grid grid-cols-2 gap-3" delay={0.1}>
              {[
                { title: "AI Strategy",         icon: <Zap       className="h-4 w-4" /> },
                { title: "Architecture Review", icon: <Code2     className="h-4 w-4" /> },
                { title: "Cloud Strategy",      icon: <Cloud     className="h-4 w-4" /> },
                { title: "Executive Workshops", icon: <Building2 className="h-4 w-4" /> },
                { title: "Custom Training",     icon: <BookOpen  className="h-4 w-4" /> },
                { title: "Custom Research",     icon: <Globe     className="h-4 w-4" /> },
              ].map((service) => (
                <StaggerChild key={service.title}>
                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-indigo-700 hover:bg-zinc-900/80 transition-all duration-200 cursor-default">
                    <div className="text-indigo-400 shrink-0">{service.icon}</div>
                    <span className="text-sm font-medium text-zinc-200">{service.title}</span>
                  </div>
                </StaggerChild>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          NEWSLETTER
      ═══════════════════════════════════════════════ */}
      <section className="py-16">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="max-w-xl mx-auto text-center">
            <h2 className="text-title text-zinc-900 dark:text-white mb-3">
              Stay ahead of technology
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6 text-sm leading-relaxed">
              Weekly intelligence on AI, cloud, developer tools, and the technology industry.
            </p>
            <form
              action="/api/newsletter/subscribe"
              method="POST"
              className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
            >
              <input
                type="email"
                name="email"
                placeholder="Your email address"
                required
                className="flex-1 h-10 px-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-shadow"
                aria-label="Email address"
              />
              <Button
                type="submit"
                className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white border-0"
              >
                Subscribe
              </Button>
            </form>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
