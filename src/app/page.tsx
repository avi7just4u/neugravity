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
  Zap,
  Shield,
  Globe,

  Cloud,
  Code2,
  ChevronRight,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const trendingTechnologies = [
  { name: "Model Context Protocol", slug: "model-context-protocol", type: "Protocol", trend: "+340%" },
  { name: "Agentic AI", slug: "agentic-ai", type: "Concept", trend: "+280%" },
  { name: "Vector Databases", slug: "vector-databases", type: "Database", trend: "+190%" },
  { name: "Kubernetes", slug: "kubernetes", type: "Platform", trend: "+12%" },
  { name: "TypeScript", slug: "typescript", type: "Language", trend: "+8%" },
  { name: "Rust", slug: "rust", type: "Language", trend: "+22%" },
]

const latestNews = [
  {
    headline: "Anthropic releases Claude's Model Context Protocol as open standard",
    slug: "anthropic-mcp-open-standard",
    summary: "MCP enables AI models to securely connect with external tools and data sources through a standardized interface.",
    category: "AI",
    publishedAt: "2 hours ago",
    importance: 9,
  },
  {
    headline: "OpenAI announces real-time voice API for developers",
    slug: "openai-realtime-voice-api",
    summary: "",
    category: "AI",
    publishedAt: "5 hours ago",
    importance: 8,
  },
  {
    headline: "Google introduces Gemini 2.0 with multimodal capabilities",
    slug: "google-gemini-2-multimodal",
    summary: "",
    category: "AI",
    publishedAt: "1 day ago",
    importance: 8,
  },
  {
    headline: "Vercel releases v0 generative UI — a new era for frontend development",
    slug: "vercel-v0-generative-ui",
    summary: "",
    category: "Tools",
    publishedAt: "2 days ago",
    importance: 7,
  },
]

const featuredTools = [
  { name: "Cursor", slug: "cursor", tagline: "The AI-first code editor", pricingModel: "freemium" },
  { name: "Supabase", slug: "supabase", tagline: "The open source Firebase alternative", pricingModel: "freemium" },
  { name: "Vercel", slug: "vercel", tagline: "Deploy web applications instantly", pricingModel: "freemium" },
  { name: "Linear", slug: "linear", tagline: "Issue tracking for modern software teams", pricingModel: "freemium" },
  { name: "GitHub Copilot", slug: "github-copilot", tagline: "Your AI pair programmer", pricingModel: "subscription" },
  { name: "Cloudflare", slug: "cloudflare", tagline: "Build and secure applications globally", pricingModel: "freemium" },
]

const popularComparisons = [
  { title: "ChatGPT vs Claude", slug: "chatgpt-vs-claude", views: "12.4k" },
  { title: "AWS vs Azure vs GCP", slug: "aws-vs-azure-vs-gcp", views: "8.2k" },
  { title: "React vs Next.js", slug: "react-vs-nextjs", views: "6.7k" },
  { title: "Postgres vs MongoDB", slug: "postgres-vs-mongodb", views: "5.1k" },
  { title: "Vercel vs Netlify", slug: "vercel-vs-netlify", views: "4.3k" },
]

const learningPaths = [
  { title: "AI Engineer", slug: "ai-engineer", courses: 8, hours: 42, difficulty: "Intermediate" },
  { title: "Cloud Architecture", slug: "cloud-architecture", courses: 6, hours: 34, difficulty: "Advanced" },
  { title: "Full Stack Developer", slug: "full-stack-developer", courses: 10, hours: 60, difficulty: "Beginner" },
]

const techRadarItems = [
  { name: "AI Agents", status: "Adopt", description: "Production-ready for many use cases" },
  { name: "WebAssembly", status: "Trial", description: "Growing adoption in performance-critical apps" },
  { name: "Edge Computing", status: "Adopt", description: "Established for latency-sensitive workloads" },
  { name: "Quantum Computing", status: "Assess", description: "Early stage, watch for enterprise impact" },
  { name: "Zero-Trust Security", status: "Adopt", description: "Standard practice for modern organizations" },
  { name: "AI Code Generation", status: "Adopt", description: "Transforming developer productivity" },
]

function statusBadgeVariant(status: string): "success" | "info" | "warning" | "destructive" | "secondary" {
  if (status === "Adopt") return "success"
  if (status === "Trial") return "info"
  if (status === "Assess") return "warning"
  if (status === "Hold") return "destructive"
  return "secondary"
}

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-zinc-100 dark:border-zinc-900">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-36">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <Badge variant="secondary" className="text-xs">Technology Intelligence Platform</Badge>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-zinc-900 dark:text-white leading-[1.08]">
              Understand<br />
              Technology.<br />
              <span className="text-zinc-400 dark:text-zinc-500">Navigate What&apos;s Next.</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
              Learn technology, discover the right tools, understand how companies work,
              and stay ahead of what is changing.
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-3 mt-8">
              <Button size="lg" asChild className="gap-2">
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
            <div className="flex flex-wrap items-center gap-6 mt-12 pt-8 border-t border-zinc-100 dark:border-zinc-800">
              {[
                { value: "500+", label: "Technologies" },
                { value: "1,200+", label: "Tools" },
                { value: "200+", label: "Companies" },
                { value: "50+", label: "Courses" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-zinc-900 dark:text-white">{stat.value}</div>
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -z-10 w-1/2 h-full overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-zinc-100/60 dark:bg-zinc-900/60 blur-3xl" />
        </div>
      </section>

      {/* TRENDING TECHNOLOGY */}
      <section className="py-12 border-b border-zinc-100 dark:border-zinc-900">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-zinc-400" />
              <h2 className="font-semibold text-zinc-900 dark:text-white">Trending Technology</h2>
            </div>
            <Link href="/tech" className="text-sm text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 transition-colors">
              All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {trendingTechnologies.map((tech) => (
              <Link
                key={tech.slug}
                href={`/tech/${tech.slug}`}
                className="group flex flex-col gap-2 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all bg-white dark:bg-zinc-900"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    <Cpu className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">{tech.trend}</span>
                </div>
                <div>
                  <div className="font-medium text-sm text-zinc-900 dark:text-white leading-snug">{tech.name}</div>
                  <div className="text-xs text-zinc-400">{tech.type}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* NEWS + TOOLS */}
      <section className="py-12 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/30">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-10">
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Newspaper className="h-4 w-4 text-zinc-400" />
                  <h2 className="font-semibold text-zinc-900 dark:text-white">Technology News</h2>
                </div>
                <Link href="/news" className="text-sm text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 transition-colors">
                  All news <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {latestNews.map((item, i) => (
                  <Link
                    key={item.slug}
                    href={`/news/${item.slug}`}
                    className="group flex flex-col gap-1.5 py-4 first:pt-0"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">{item.category}</Badge>
                      {item.importance >= 9 && <Badge variant="brand" className="text-xs">Breaking</Badge>}
                      <span className="text-xs text-zinc-400 ml-auto flex items-center gap-1">
                        <Clock className="h-3 w-3" />{item.publishedAt}
                      </span>
                    </div>
                    <h3 className={`font-semibold text-zinc-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ${i === 0 ? "text-base" : "text-sm"}`}>
                      {item.headline}
                    </h3>
                    {i === 0 && item.summary && (
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">{item.summary}</p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-zinc-400" />
                  <h2 className="font-semibold text-zinc-900 dark:text-white">Tool Explorer</h2>
                </div>
                <Link href="/tools" className="text-sm text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 transition-colors">
                  All <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="space-y-2">
                {featuredTools.map((tool) => (
                  <Link
                    key={tool.slug}
                    href={`/tools/${tool.slug}`}
                    className="group flex items-center gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 shrink-0 text-xs font-bold text-zinc-600 dark:text-zinc-400">
                      {tool.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-zinc-900 dark:text-white">{tool.name}</div>
                      <div className="text-xs text-zinc-400 truncate">{tool.tagline}</div>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">{tool.pricingModel}</Badge>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RADAR + COMPARISONS */}
      <section className="py-12 border-b border-zinc-100 dark:border-zinc-900">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <div className="flex items-center gap-2 mb-5">
                <Shield className="h-4 w-4 text-zinc-400" />
                <h2 className="font-semibold text-zinc-900 dark:text-white">Technology Radar</h2>
              </div>
              <div className="space-y-2">
                {techRadarItems.map((item) => (
                  <div key={item.name} className="flex items-start gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <Badge variant={statusBadgeVariant(item.status)} className="mt-0.5 shrink-0">{item.status}</Badge>
                    <div>
                      <div className="font-medium text-sm text-zinc-900 dark:text-white">{item.name}</div>
                      <div className="text-xs text-zinc-400">{item.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-zinc-400" />
                  <h2 className="font-semibold text-zinc-900 dark:text-white">Popular Comparisons</h2>
                </div>
                <Link href="/compare" className="text-sm text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 transition-colors">
                  All <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="space-y-2">
                {popularComparisons.map((comp, i) => (
                  <Link
                    key={comp.slug}
                    href={`/compare/${comp.slug}`}
                    className="group flex items-center gap-4 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900 hover:shadow-sm transition-all"
                  >
                    <span className="text-sm font-medium text-zinc-400 w-5 shrink-0">{i + 1}</span>
                    <span className="flex-1 font-medium text-sm text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{comp.title}</span>
                    <span className="text-xs text-zinc-400 shrink-0">{comp.views}</span>
                    <ChevronRight className="h-4 w-4 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LEARNING PATHS */}
      <section className="py-12 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/30">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-zinc-400" />
              <h2 className="font-semibold text-zinc-900 dark:text-white">Learning Paths</h2>
            </div>
            <Link href="/learn" className="text-sm text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 transition-colors">
              All paths <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {learningPaths.map((path) => (
              <Link
                key={path.slug}
                href={`/learn/paths/${path.slug}`}
                className="group flex flex-col gap-4 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <Badge variant={path.difficulty === "Beginner" ? "success" : path.difficulty === "Advanced" ? "destructive" : "info"}>
                    {path.difficulty}
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-zinc-300 group-hover:text-zinc-600 transition-colors" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{path.title}</h3>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-400">
                    <span>{path.courses} courses</span>
                    <span>·</span>
                    <span>{path.hours}h estimated</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* INSIDE CORPORATE */}
      <section className="py-12 border-b border-zinc-100 dark:border-zinc-900">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-4 w-4 text-zinc-400" />
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">Inside Work</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white leading-tight mb-3">
                Understand how technology companies actually work
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed mb-5">
                From how engineering teams are structured to how enterprise software is purchased.
              </p>
              <div className="flex flex-wrap gap-2 mb-5">
                {["Engineering", "Product", "Leadership", "Career", "Sales", "Finance"].map((topic) => (
                  <Link
                    key={topic}
                    href={`/work/${topic.toLowerCase()}`}
                    className="px-3 py-1 text-sm rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                  >
                    {topic}
                  </Link>
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
                <div key={item.title} className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                  <Badge variant="secondary" className="mb-2 text-xs">{item.category}</Badge>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white leading-snug">{item.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ENTERPRISE */}
      <section className="py-12 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-900">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <Badge variant="secondary" className="mb-4 text-xs">Enterprise</Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-4">
                Technology intelligence for enterprise teams
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-6">
                AI strategy, cloud architecture, technology advisory, and custom training for engineering and executive teams.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="default" asChild className="bg-white text-zinc-900 hover:bg-zinc-100">
                  <Link href="/enterprise">Talk to us</Link>
                </Button>
                <Button size="default" variant="ghost" asChild className="text-white hover:bg-zinc-800">
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
                <div key={service.title} className="flex items-center gap-3 p-3.5 rounded-lg bg-zinc-800 border border-zinc-700">
                  <div className="text-zinc-400">{service.icon}</div>
                  <span className="text-sm font-medium text-zinc-200">{service.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="py-12">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">
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
                className="flex-1 h-10 px-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                aria-label="Email address"
              />
              <Button type="submit" className="shrink-0">Subscribe</Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
