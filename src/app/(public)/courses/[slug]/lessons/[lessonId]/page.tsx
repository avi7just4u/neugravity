import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/server"
import { EnrollmentService } from "@/lib/services/enrollment.service"
import { MarkCompleteButton } from "./mark-complete-button"
import { BookOpen, ChevronLeft, ChevronRight, CheckCircle, PlayCircle, FileText, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Course, CourseModule, Lesson } from "@/types"

export const dynamic = "force-dynamic"

export function generateStaticParams() { return [] }

interface LessonParams {
  slug: string
  lessonId: string
}

async function getCourseWithCurriculum(slug: string) {
  const db = createAdminClient()
  const { data: course, error } = await db
    .from("courses")
    .select("id,title,slug,status")
    .eq("slug", slug)
    .eq("status", "published")
    .eq("is_demo", false)
    .single()

  if (error || !course) return null

  const { data: modules } = await db
    .from("course_modules")
    .select("id,title,sort_order")
    .eq("course_id", (course as Course).id)
    .order("sort_order")

  const moduleList = (modules ?? []) as CourseModule[]
  const modulesWithLessons = await Promise.all(
    moduleList.map(async (mod) => {
      const { data: lessons } = await db
        .from("lessons")
        .select("id,title,lesson_type,status,is_preview,video_duration_seconds,sort_order")
        .eq("module_id", mod.id)
        .eq("status", "published")
        .order("sort_order")
      return { ...mod, lessons: (lessons ?? []) as Lesson[] }
    })
  )

  return { ...(course as Course), modules: modulesWithLessons }
}

async function getLesson(lessonId: string) {
  const db = createAdminClient()
  const { data, error } = await db
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .eq("status", "published")
    .single()
  if (error || !data) return null
  return data as Lesson
}

export async function generateMetadata({ params }: { params: Promise<LessonParams> }): Promise<Metadata> {
  const { lessonId } = await params
  const lesson = await getLesson(lessonId)
  return { title: lesson?.title ?? "Lesson" }
}

const LESSON_TYPE_ICONS: Record<string, React.ReactNode> = {
  video: <PlayCircle className="h-3.5 w-3.5 shrink-0" />,
  article: <FileText className="h-3.5 w-3.5 shrink-0" />,
  quiz: <FileText className="h-3.5 w-3.5 shrink-0" />,
  project: <FileText className="h-3.5 w-3.5 shrink-0" />,
}

function formatDuration(seconds: number | null) {
  if (!seconds) return null
  const m = Math.floor(seconds / 60)
  return `${m} min`
}

export default async function LessonViewerPage({ params }: { params: Promise<LessonParams> }) {
  const { slug, lessonId } = await params

  const client = await createClient()
  const { data: { user } } = await client.auth.getUser()

  if (!user) {
    redirect(`/login?next=/courses/${slug}/lessons/${lessonId}`)
  }

  const [course, lesson] = await Promise.all([
    getCourseWithCurriculum(slug),
    getLesson(lessonId),
  ])

  if (!course || !lesson) notFound()

  const enrollment = await EnrollmentService.getEnrollment(user.id, course.id)
  if (!enrollment) {
    redirect(`/courses/${slug}`)
  }

  const userProgress = await EnrollmentService.getLessonProgress(user.id, lessonId)
  const isCompleted = userProgress?.status === "completed"

  // Flatten all published lessons in order for prev/next navigation
  const allLessons = course.modules?.flatMap((m) => m.lessons ?? []) ?? []
  const currentIdx = allLessons.findIndex((l) => l.id === lessonId)
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null

  return (
    <div className="flex min-h-screen">
      {/* Sidebar: curriculum */}
      <aside className="hidden lg:flex flex-col w-72 shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 h-screen overflow-y-auto">
        <div className="px-4 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <Link
            href={`/courses/${slug}`}
            className="flex items-center gap-1.5 text-sm font-semibold text-zinc-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <BookOpen className="h-4 w-4 shrink-0" />
            <span className="line-clamp-1">{course.title}</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          {course.modules?.map((mod) => (
            <div key={mod.id}>
              <div className="px-4 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                {mod.title}
              </div>
              {mod.lessons?.map((l) => {
                const isActive = l.id === lessonId
                return (
                  <Link
                    key={l.id}
                    href={`/courses/${slug}/lessons/${l.id}`}
                    className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-medium"
                        : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    }`}
                  >
                    <span className="shrink-0">
                      {LESSON_TYPE_ICONS[l.lesson_type] ?? <FileText className="h-3.5 w-3.5" />}
                    </span>
                    <span className="flex-1 line-clamp-1">{l.title}</span>
                    {formatDuration(l.video_duration_seconds) && (
                      <span className="text-xs text-zinc-400 shrink-0">{formatDuration(l.video_duration_seconds)}</span>
                    )}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main lesson content */}
      <main className="flex-1 min-w-0">
        <div className="mx-auto max-w-3xl px-4 sm:px-8 py-10 space-y-8">
          {/* Title + completion */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
                <Link href={`/courses/${slug}`} className="hover:text-zinc-600 transition-colors">
                  {course.title}
                </Link>
                <ChevronRight className="h-3 w-3" />
                <span>Lesson</span>
              </div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{lesson.title}</h1>
            </div>
            {isCompleted && (
              <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-sm font-medium shrink-0">
                <CheckCircle className="h-4 w-4" />
                Completed
              </div>
            )}
          </div>

          {/* Description */}
          {lesson.description && (
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{lesson.description}</p>
          )}

          {/* Video */}
          {lesson.lesson_type === "video" && lesson.video_url && (
            <div className="aspect-video rounded-xl overflow-hidden bg-zinc-950">
              <iframe
                src={lesson.video_url}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Article content */}
          {lesson.lesson_type === "article" && lesson.content && (
            <div className="prose prose-zinc dark:prose-invert max-w-none">
              {lesson.content.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          )}

          {/* Quiz/Project placeholder */}
          {(lesson.lesson_type === "quiz" || lesson.lesson_type === "project") && (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-8 text-center">
              <Lock className="h-8 w-8 text-zinc-400 mx-auto mb-3" />
              <p className="text-sm text-zinc-500">
                {lesson.lesson_type === "quiz" ? "Quiz" : "Project"} viewer coming soon.
              </p>
            </div>
          )}

          {/* Learning outcomes */}
          {lesson.learning_outcomes && lesson.learning_outcomes.length > 0 && (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">What you&apos;ll learn</h3>
              <ul className="space-y-2">
                {lesson.learning_outcomes.map((outcome: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    {outcome}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Mark complete + navigation */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div>
              {prevLesson ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/courses/${slug}/lessons/${prevLesson.id}`}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/courses/${slug}`}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Course
                  </Link>
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!isCompleted && (
                <MarkCompleteButton lessonId={lessonId} courseSlug={slug} />
              )}
              {nextLesson ? (
                <Button size="sm" asChild>
                  <Link href={`/courses/${slug}/lessons/${nextLesson.id}`}>
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              ) : (
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/courses/${slug}`}>
                    Finish Course
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
