export const revalidate = 300

import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, ArrowRight, Clock } from "lucide-react"
import { CourseService } from "@/lib/services/course.service"

export const metadata: Metadata = {
  title: "Learn",
  description: "Structured learning paths and courses for technology professionals.",
}

const diffVariant: Record<string, "success" | "info" | "destructive"> = {
  beginner: "success",
  intermediate: "info",
  advanced: "destructive",
  expert: "destructive",
}

export default async function LearnPage() {
  const [paths, featuredCourses] = await Promise.all([
    CourseService.getLearningPaths({ featured: true, limit: 6 }),
    CourseService.getFeaturedCourses(4),
  ])

  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="mb-12 max-w-2xl">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-4 w-4 text-zinc-400" />
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">Learn</span>
        </div>
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-3">Learn Technology</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed">
          Structured learning paths and courses built for technology professionals. From fundamentals to advanced practice.
        </p>
        <div className="flex gap-3 mt-5">
          <Button asChild><Link href="/courses">Browse Courses</Link></Button>
        </div>
      </div>

      {/* Learning Paths */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Learning Paths</h2>
        </div>

        {paths.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-8 text-center">
            <BookOpen className="h-8 w-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
            <p className="text-sm text-zinc-400">Learning paths coming soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paths.map((p) => (
              <Link
                key={p.slug}
                href={`/learn/${p.slug}`}
                className="group flex flex-col gap-4 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  {p.difficulty && (
                    <Badge variant={diffVariant[p.difficulty] ?? "secondary"} className="capitalize">
                      {p.difficulty}
                    </Badge>
                  )}
                  <ArrowRight className="h-4 w-4 text-zinc-300 group-hover:text-zinc-600 transition-colors" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                    {p.short_description ?? p.description}
                  </p>
                </div>
                {p.estimated_hours && (
                  <div className="flex items-center gap-1 text-xs text-zinc-400">
                    <Clock className="h-3 w-3" />
                    <span>{p.estimated_hours}h</span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Courses */}
      {featuredCourses.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Featured Courses</h2>
            <Link href="/courses" className="text-sm text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 transition-colors">
              All courses <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredCourses.map((c) => (
              <Link
                key={c.slug}
                href={`/courses/${c.slug}`}
                className="group flex flex-col gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all"
              >
                {c.difficulty && (
                  <Badge variant={diffVariant[c.difficulty] ?? "secondary"} className="capitalize w-fit">
                    {c.difficulty}
                  </Badge>
                )}
                <div>
                  <h3 className="font-semibold text-sm text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {c.title}
                  </h3>
                  {c.short_description && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">{c.short_description}</p>
                  )}
                </div>
                {c.estimated_hours && (
                  <div className="flex items-center gap-1 text-xs text-zinc-400">
                    <Clock className="h-3 w-3" />
                    <span>{c.estimated_hours}h</span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
