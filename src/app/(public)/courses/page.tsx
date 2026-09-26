export const revalidate = 300

import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, Star } from "lucide-react"
import { CourseService } from "@/lib/services/course.service"
import type { Course } from "@/types"

export const metadata: Metadata = {
  title: "Courses",
  description: "Technology courses for engineers, architects, and technology professionals.",
}

const diffVariant: Record<string, "success" | "info" | "destructive"> = {
  beginner: "success",
  intermediate: "info",
  advanced: "destructive",
}

function CourseCard({ c }: { c: Course }) {
  return (
    <Link
      href={`/courses/${c.slug}`}
      className="group flex flex-col gap-4 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md transition-all"
    >
      <div className="aspect-video rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
        {c.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.thumbnail_url} alt={c.title} className="h-full w-full object-cover" />
        ) : (
          <BookOpen className="h-8 w-8 text-zinc-300 dark:text-zinc-600" />
        )}
      </div>
      <div className="flex items-center gap-2">
        {c.difficulty && (
          <Badge variant={diffVariant[c.difficulty] ?? "secondary"} className="text-xs capitalize">
            {c.difficulty}
          </Badge>
        )}
        {(c.price === 0 || c.price === null) && <Badge variant="success" className="text-xs">Free</Badge>}
      </div>
      <div>
        <h2 className="font-semibold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
          {c.title}
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">{c.description ?? ""}</p>
      </div>
      <div className="flex items-center justify-between text-xs text-zinc-400 mt-auto">
        <div className="flex items-center gap-3">
          {c.estimated_hours && (
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{c.estimated_hours}h</span>
          )}
          {c.rating_average && (
            <span className="flex items-center gap-1"><Star className="h-3 w-3" />{c.rating_average.toFixed(1)}</span>
          )}
        </div>
        <span className="font-semibold text-zinc-900 dark:text-white text-sm">
          {c.price === 0 || c.price === null ? "Free" : `$${c.price}`}
        </span>
      </div>
    </Link>
  )
}

export default async function CoursesPage() {
  const { data: courses } = await CourseService.getCourses({ page: 1, perPage: 24 })

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

      {courses.length === 0 ? (
        <div className="py-24 text-center text-zinc-400">
          <BookOpen className="h-10 w-10 mx-auto mb-4 opacity-30" />
          <p>No courses published yet. Check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((c) => (
            <CourseCard key={c.id} c={c} />
          ))}
        </div>
      )}
    </div>
  )
}
