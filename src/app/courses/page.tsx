import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, Star } from "lucide-react"

export const metadata: Metadata = {
  title: "Courses",
  description: "Technology courses for engineers, architects, and technology professionals.",
}

const demoCourses = [
  { title: "AI Foundations", slug: "ai-foundations", description: "Understand how modern AI works, from neural networks to large language models.", instructor: "NeuGravity", difficulty: "Beginner", hours: 6, price: 0, rating: 4.8, students: 1240 },
  { title: "Kubernetes for Engineers", slug: "kubernetes-engineers", description: "Deploy, manage, and scale containerized applications with Kubernetes.", instructor: "NeuGravity", difficulty: "Intermediate", hours: 8, price: 49, rating: 4.9, students: 876 },
  { title: "Building with LLMs", slug: "building-with-llms", description: "Practical patterns for building production applications powered by large language models.", instructor: "NeuGravity", difficulty: "Intermediate", hours: 10, price: 79, rating: 4.7, students: 654 },
  { title: "Cloud Architecture on AWS", slug: "cloud-architecture-aws", description: "Design resilient, scalable architectures using core AWS services.", instructor: "NeuGravity", difficulty: "Advanced", hours: 12, price: 99, rating: 4.8, students: 542 },
  { title: "TypeScript Mastery", slug: "typescript-mastery", description: "Go from JavaScript developer to TypeScript expert with practical exercises.", instructor: "NeuGravity", difficulty: "Intermediate", hours: 7, price: 59, rating: 4.6, students: 1100 },
  { title: "PostgreSQL Deep Dive", slug: "postgresql-deep-dive", description: "Advanced query optimization, indexing strategies, and performance tuning.", instructor: "NeuGravity", difficulty: "Advanced", hours: 9, price: 79, rating: 4.9, students: 398 },
]

const diffVariant: Record<string, "success" | "info" | "destructive"> = { Beginner: "success", Intermediate: "info", Advanced: "destructive" }

export default function CoursesPage() {
  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-4 w-4 text-zinc-400" />
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">Courses</span>
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Courses</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Structured, hands-on courses for technology professionals at every level.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {demoCourses.map((c) => (
          <Link key={c.slug} href={`/courses/${c.slug}`} className="group flex flex-col gap-4 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md transition-all">
            <div className="aspect-video rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-zinc-300 dark:text-zinc-600" />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={diffVariant[c.difficulty] ?? "secondary"} className="text-xs">{c.difficulty}</Badge>
              {c.price === 0 && <Badge variant="success" className="text-xs">Free</Badge>}
            </div>
            <div>
              <h2 className="font-semibold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">{c.title}</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">{c.description}</p>
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-400 mt-auto">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{c.hours}h</span>
                <span className="flex items-center gap-1"><Star className="h-3 w-3" />{c.rating}</span>
              </div>
              <span className="font-semibold text-zinc-900 dark:text-white text-sm">{c.price === 0 ? "Free" : `$${c.price}`}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
