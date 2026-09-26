import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Learn",
  description: "Structured learning paths and courses for technology professionals.",
}

const paths = [
  { title: "AI Engineer", slug: "ai-engineer", description: "From machine learning foundations to production AI systems.", courses: 8, hours: 42, difficulty: "Intermediate" },
  { title: "Cloud Architecture", slug: "cloud-architecture", description: "Design scalable, reliable systems on AWS, Azure, and GCP.", courses: 6, hours: 34, difficulty: "Advanced" },
  { title: "Full Stack Developer", slug: "full-stack-developer", description: "Build modern web applications from frontend to backend.", courses: 10, hours: 60, difficulty: "Beginner" },
  { title: "DevOps & Platform Engineering", slug: "devops-platform", description: "Kubernetes, CI/CD, observability, and infrastructure as code.", courses: 7, hours: 38, difficulty: "Intermediate" },
  { title: "Data Engineering", slug: "data-engineering", description: "Build robust data pipelines and analytics infrastructure.", courses: 6, hours: 32, difficulty: "Intermediate" },
  { title: "Security Engineering", slug: "security-engineering", description: "Zero-trust, application security, and threat modeling.", courses: 5, hours: 28, difficulty: "Advanced" },
]

const categories = [
  { name: "Artificial Intelligence", slug: "artificial-intelligence", count: 24 },
  { name: "Cloud Computing", slug: "cloud", count: 18 },
  { name: "Web Development", slug: "web-development", count: 32 },
  { name: "Data Engineering", slug: "data-engineering", count: 15 },
  { name: "Security", slug: "security", count: 12 },
  { name: "DevOps", slug: "devops", count: 10 },
]

export default function LearnPage() {
  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="mb-12 max-w-2xl">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-4 w-4 text-zinc-400" />
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">Learn</span>
        </div>
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-3">Learn Technology</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed">Structured learning paths and courses built for technology professionals. From fundamentals to advanced practice.</p>
        <div className="flex gap-3 mt-5">
          <Button asChild><Link href="/courses">Browse Courses</Link></Button>
          <Button variant="outline" asChild><Link href="/learn/paths">All Paths</Link></Button>
        </div>
      </div>

      {/* Learning Paths */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Learning Paths</h2>
          <Link href="/learn/paths" className="text-sm text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 transition-colors">All paths <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paths.map((p) => (
            <Link key={p.slug} href={`/learn/paths/${p.slug}`} className="group flex flex-col gap-4 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <Badge variant={p.difficulty === "Beginner" ? "success" : p.difficulty === "Advanced" ? "destructive" : "info"}>{p.difficulty}</Badge>
                <ArrowRight className="h-4 w-4 text-zinc-300 group-hover:text-zinc-600 transition-colors" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{p.title}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">{p.description}</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-400">
                <span>{p.courses} courses</span><span>·</span><span>{p.hours}h</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section>
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-6">Browse by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((c) => (
            <Link key={c.slug} href={`/courses?category=${c.slug}`} className="group flex flex-col gap-1 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all text-center">
              <span className="font-medium text-sm text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{c.name}</span>
              <span className="text-xs text-zinc-400">{c.count} courses</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
