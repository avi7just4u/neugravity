import type { Metadata } from "next"
import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/server"
import { EnrollmentService } from "@/lib/services/enrollment.service"
import { BookOpen, Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "My Learning",
  description: "Your enrolled courses and learning progress.",
}

export const dynamic = "force-dynamic"

export default async function LearnerDashboardPage() {
  const client = await createClient()
  const { data: { user } } = await client.auth.getUser()

  if (!user) {
    redirect("/login?next=/learn/dashboard")
  }

  const enrollments = await EnrollmentService.getUserEnrollments(user.id)

  // Fetch course slugs and titles for all enrolled courses
  const courseIds = enrollments.map((e) => e.course_id)
  const courseMap: Record<string, { slug: string; title: string }> = {}
  if (courseIds.length > 0) {
    const db = createAdminClient()
    const { data: courses } = await db
      .from("courses")
      .select("id,slug,title")
      .in("id", courseIds)
    for (const c of courses ?? []) {
      const course = c as { id: string; slug: string; title: string }
      courseMap[course.id] = { slug: course.slug, title: course.title }
    }
  }

  // Get course progress for all enrolled courses
  const progressList = await Promise.all(
    enrollments.map((e) => EnrollmentService.getCourseProgress(user.id, e.course_id))
  )

  const enrolledWithProgress = enrollments.map((e, i) => ({
    enrollment: e,
    progress: progressList[i],
    course: courseMap[e.course_id] ?? null,
  }))

  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">My Learning</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          {enrollments.length === 0
            ? "You haven't enrolled in any courses yet."
            : `${enrollments.length} course${enrollments.length !== 1 ? "s" : ""} enrolled`}
        </p>
      </div>

      {enrolledWithProgress.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-10 text-center">
          <BookOpen className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">Start Learning</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-6">
            Explore our learning paths and courses to get started.
          </p>
          <div className="flex gap-3 justify-center">
            <Button asChild><Link href="/learn">Browse Paths</Link></Button>
            <Button variant="outline" asChild><Link href="/courses">Browse Courses</Link></Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrolledWithProgress.map(({ enrollment, progress, course }) => {
            const courseHref = course ? `/courses/${course.slug}` : "/courses"
            const continueHref =
              course && progress.last_lesson_id
                ? `/courses/${course.slug}/lessons/${progress.last_lesson_id}`
                : courseHref

            return (
              <div
                key={enrollment.id}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-zinc-900 dark:text-white line-clamp-2">
                      {course?.title ?? `Course ${enrollment.course_id.slice(0, 8)}…`}
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5 capitalize">{enrollment.status}</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-zinc-500">{progress.completed_lessons}/{progress.total_lessons} lessons</span>
                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{progress.percent}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all"
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {progress.last_lesson_id ? (
                    <Button size="sm" className="flex-1" asChild>
                      <Link href={continueHref}>
                        Continue <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Link>
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2 w-full">
                      <div className="flex items-center gap-1 text-xs text-zinc-400 flex-1">
                        <Clock className="h-3 w-3" />
                        Not started
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={courseHref}>Start</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
