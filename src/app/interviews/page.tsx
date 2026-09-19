import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Mic2, Clock, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Interviews",
  description: "Conversations with technology leaders, engineers, and builders.",
}

const demoInterviews = [
  { title: "Building AI Products at Scale", slug: "building-ai-products-scale", guest: "Technology Leader", company: "AI Company", topics: ["AI", "Product", "Scale"], duration: "52 min", publishedAt: "1 week ago" },
  { title: "The Future of Infrastructure Engineering", slug: "future-infrastructure-engineering", guest: "Principal Engineer", company: "Cloud Company", topics: ["Cloud", "Infrastructure", "Career"], duration: "44 min", publishedAt: "2 weeks ago" },
  { title: "Leading Engineering Teams Through Uncertainty", slug: "leading-engineering-teams", guest: "VP Engineering", company: "Enterprise Tech", topics: ["Leadership", "Management", "Career"], duration: "61 min", publishedAt: "3 weeks ago" },
  { title: "From Developer to CTO: Lessons Learned", slug: "developer-to-cto", guest: "CTO", company: "Scale-up", topics: ["Career", "Leadership", "Engineering"], duration: "48 min", publishedAt: "1 month ago" },
]

export default function InterviewsPage() {
  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <Mic2 className="h-4 w-4 text-zinc-400" />
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">Interviews</span>
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Interviews</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Conversations with technology leaders, engineers, and builders.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {demoInterviews.map((i) => (
          <Link key={i.slug} href={`/interviews/${i.slug}`} className="group flex flex-col gap-4 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md transition-all">
            <div className="aspect-video rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <Mic2 className="h-8 w-8 text-zinc-300 dark:text-zinc-600" />
            </div>
            <div>
              <h2 className="font-semibold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug mb-1">{i.title}</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{i.guest} · {i.company}</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5">{i.topics.slice(0, 2).map((t) => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}</div>
              <div className="flex items-center gap-3 text-xs text-zinc-400">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{i.duration}</span>
                <span className="flex items-center gap-1 group-hover:text-blue-500 transition-colors">Watch <ArrowRight className="h-3 w-3" /></span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
