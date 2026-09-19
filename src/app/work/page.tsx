import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Briefcase, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Inside Work",
  description: "Understand how technology companies, teams, and careers actually work.",
}

const topics = [
  { name: "Engineering", slug: "engineering", description: "How engineering teams are structured, how code gets shipped, how decisions get made." },
  { name: "Product", slug: "product", description: "How product teams work, how features are prioritized, and how roadmaps are built." },
  { name: "Leadership", slug: "leadership", description: "What CTOs, VPs of Engineering, and technical leaders actually do." },
  { name: "Career", slug: "career", description: "How to grow as an engineer, switch roles, and navigate technology careers." },
  { name: "Finance", slug: "finance", description: "How technology budgets work, how software is bought, and how ROI is measured." },
  { name: "Sales", slug: "sales", description: "How enterprise software is sold, evaluated, and implemented." },
  { name: "Operations", slug: "operations", description: "How technology operations, incident response, and reliability engineering work." },
]

const featuredArticles = [
  { title: "How engineering teams are structured at scale", slug: "how-engineering-teams-structured", category: "Engineering", readingTime: 8 },
  { title: "What a CTO actually does all day", slug: "what-cto-does", category: "Leadership", readingTime: 6 },
  { title: "How enterprise software purchasing decisions are made", slug: "enterprise-software-purchasing", category: "Sales", readingTime: 10 },
  { title: "How technology budgets are set and managed", slug: "technology-budget-management", category: "Finance", readingTime: 7 },
  { title: "How to get promoted as a software engineer", slug: "how-to-get-promoted-engineer", category: "Career", readingTime: 9 },
  { title: "Why companies reorganize their engineering teams", slug: "why-companies-reorganize", category: "Engineering", readingTime: 5 },
]

export default function WorkPage() {
  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <Briefcase className="h-4 w-4 text-zinc-400" />
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">Inside Work</span>
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Inside Corporate Technology</h1>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl">Understand how technology companies, engineering teams, and technology careers actually work — beyond the surface level.</p>
      </div>

      {/* Topics */}
      <section className="mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {topics.map((t) => (
            <Link key={t.slug} href={`/work/${t.slug}`} className="group flex flex-col gap-2 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all">
              <h2 className="font-semibold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{t.name}</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">{t.description}</p>
              <span className="text-xs text-zinc-400 flex items-center gap-1 group-hover:text-blue-500 transition-colors mt-auto">Explore <ArrowRight className="h-3 w-3" /></span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Articles */}
      <section>
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-6">Featured Articles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredArticles.map((a) => (
            <Link key={a.slug} href={`/work/${a.slug}`} className="group flex flex-col gap-2 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all">
              <Badge variant="secondary" className="text-xs w-fit">{a.category}</Badge>
              <h3 className="font-medium text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">{a.title}</h3>
              <span className="text-xs text-zinc-400">{a.readingTime} min read</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
