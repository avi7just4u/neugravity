export const revalidate = 300

import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  BookOpen, Clock, ChevronRight, CheckCircle, PlayCircle,
  FileText, HelpCircle, Folder, Lock,
} from "lucide-react"
import { CourseService } from "@/lib/services/course.service"
import { EnrollmentService } from "@/lib/services/enrollment.service"
import { createAdminClient } from "@/lib/supabase/server"
import { EnrollButton } from "./enroll-button"
import type { Lesson } from "@/types"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://neugravity.com"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const c = await CourseService.getCourseBySlug(slug)
  if (!c) return {}
  const pageUrl = `${SITE_URL}/courses/${slug}`
  const description = c.seo_description ?? c.short_description ?? c.description ?? undefined
  return {
    title: c.seo_title ?? c.title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: { title: c.seo_title ?? c.title, description, type: "article", url: pageUrl },
  }
}

export function generateStaticParams() { return [] }

const diffVariant: Record<string, "success" | "info" | "destructive"> = {
  beginner: "success",
  intermediate: "info",
  advanced: "destructive",
  expert: "destructive",
}

const LESSON_TYPE_ICONS: Record<string, React.ReactNode> = {
  video:       <PlayCircle className="h-4 w-4 shrink-0" />,
  article:     <FileText className="h-4 w-4 shrink-0" />,
  quiz:        <HelpCircle className="h-4 w-4 shrink-0" />,
  project:     <Folder className="h-4 w-4 shrink-0" />,
  assignment:  <Folder className="h-4 w-4 shrink-0" />,
  interactive: <FileText className="h-4 w-4 shrink-0" />,
}

function formatDuration(seconds: number | null) {
  if (!seconds) return null
  const m = Math.floor(seconds / 60)
  return `${m} min`
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const c = await CourseService.getCourseWithCurriculum(slug)
  if (!c) notFound()

  const userId = await EnrollmentService.getCurrentUserId()
  const enrollment = userId && c.id ? await EnrollmentService.getEnrollment(userId, c.id) : null
  const isEnrolled = Boolean(enrollment)

  let progressMap: Record<string, string> = {}
  let continueLessonId: string | null = null

  if (isEnrolled && userId && c.id) {
    const [continueLesson] = await Promise.all([
      EnrollmentService.getContinueLearningLesson(userId, c.id),
    ])
    continueLessonId = continueLesson.lessonId

    const allLessons = c.modules?.flatMap((m) => m.lessons ?? []) ?? []
    if (allLessons.length > 0) {
      const db = createAdminClient()
      const { data: rows } = await db
        .from("lesson_progress")
        .select("lesson_id,status")
        .eq("user_id", userId)
        .in("lesson_id", allLessons.map((l) => l.id))
      for (const r of rows ?? []) {
        const row = r as { lesson_id: string; status: string }
        progressMap[row.lesson_id] = row.status
      }
    }
  }

  const isFree = c.price === 0 || c.price === null
  const totalLessons = c.modules?.reduce((sum, m) => sum + (m.lessons?.length ?? 0), 0) ?? 0
  const firstLessonId = c.modules?.[0]?.lessons?.[0]?.id ?? null

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: c.title,
    description: c.short_description ?? c.description ?? undefined,
    url: `${SITE_URL}/courses/${c.slug}`,
    ...(c.estimated_hours ? { timeRequired: `PT${c.estimated_hours}H` } : {}),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex items-center gap-1.5 text-sm text-zinc-400 mb-8" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/courses" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Courses</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-zinc-600 dark:text-zinc-300">{c.title}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                {c.difficulty && (
                  <Badge variant={diffVariant[c.difficulty] ?? "secondary"} className="capitalize">
                    {c.difficulty}
                  </Badge>
                )}
                {isFree && <Badge variant="success">Free</Badge>}
              </div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">{c.title}</h1>
              {c.subtitle && (
                <p className="text-lg text-zinc-500 dark:text-zinc-400 mb-2">{c.subtitle}</p>
              )}
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {c.long_description ?? c.description ?? "Course details coming soon."}
              </p>
            </div>

            {c.learning_outcomes && c.learning_outcomes.length > 0 && (
              <section className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                <h2 className="font-semibold text-zinc-900 dark:text-white mb-3 text-sm uppercase tracking-wide">
                  What You&apos;ll Learn
                </h2>
                <ul className="grid sm:grid-cols-2 gap-2">
                  {c.learning_outcomes.map((outcome: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                      <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      {outcome}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {!c.learning_outcomes?.length && c.outcome && (
              <section className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                <h2 className="font-semibold text-zinc-900 dark:text-white mb-2 text-sm uppercase tracking-wide">
                  What You&apos;ll Learn
                </h2>
                <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed">{c.outcome}</p>
              </section>
            )}

            {/* Curriculum */}
            <section>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                Course Curriculum
                {totalLessons > 0 && (
                  <span className="ml-2 text-sm font-normal text-zinc-400">
                    {c.modules?.length} modules · {totalLessons} lessons
                  </span>
                )}
              </h2>

              {!c.modules?.length ? (
                <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-center">
                  <BookOpen className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                  <p className="text-sm text-zinc-400">Curriculum details coming soon.</p>
                </div>
              ) : (
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
                  {c.modules.map((mod, mi) => (
                    <details key={mod.id} className="group" open={mi === 0}>
                      <summary className="flex items-center gap-3 px-5 py-3.5 bg-zinc-50 dark:bg-zinc-900/50 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors list-none">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                          {mi + 1}
                        </span>
                        <span className="flex-1 font-semibold text-sm text-zinc-900 dark:text-white">{mod.title}</span>
                        <span className="text-xs text-zinc-400">{mod.lessons?.length ?? 0} lessons</span>
                        <ChevronRight className="h-4 w-4 text-zinc-400 transition-transform group-open:rotate-90" />
                      </summary>
                      <div className="divide-y divide-zinc-50 dark:divide-zinc-900/50">
                        {mod.lessons?.map((lesson: Lesson) => {
                          const lessonStatus = progressMap[lesson.id]
                          const isLessonCompleted = lessonStatus === "completed"
                          const lessonHref = isEnrolled || lesson.is_preview
                            ? `/courses/${slug}/lessons/${lesson.id}`
                            : null

                          return (
                            <div key={lesson.id} className="flex items-center gap-3 px-5 py-3 pl-14 bg-white dark:bg-zinc-950/50">
                              <span className="text-zinc-400">
                                {isLessonCompleted
                                  ? <CheckCircle className="h-4 w-4 text-emerald-500" />
                                  : isEnrolled || lesson.is_preview
                                  ? (LESSON_TYPE_ICONS[lesson.lesson_type] ?? <FileText className="h-4 w-4 shrink-0" />)
                                  : <Lock className="h-4 w-4 shrink-0 text-zinc-300" />
                                }
                              </span>
                              <span className="flex-1 text-sm text-zinc-700 dark:text-zinc-300">
                                {lessonHref
                                  ? (
                                    <Link
                                      href={lessonHref}
                                      className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                    >
                                      {lesson.title}
                                    </Link>
                                  )
                                  : lesson.title
                                }
                              </span>
                              <div className="flex items-center gap-2">
                                {lesson.is_preview && !isEnrolled && (
                                  <span className="text-xs text-blue-500">Preview</span>
                                )}
                                {lesson.video_duration_seconds && (
                                  <span className="text-xs text-zinc-400">{formatDuration(lesson.video_duration_seconds)}</span>
                                )}
                                {isLessonCompleted && (
                                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">✓</span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </details>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside>
            <div className="sticky top-20 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-5">
              <div className="text-3xl font-bold text-zinc-900 dark:text-white">
                {isFree ? "Free" : `$${c.price}`}
              </div>

              {isEnrolled ? (
                <div className="space-y-2">
                  <Button className="w-full" size="lg" asChild>
                    <Link
                      href={
                        continueLessonId
                          ? `/courses/${slug}/lessons/${continueLessonId}`
                          : firstLessonId
                          ? `/courses/${slug}/lessons/${firstLessonId}`
                          : `/courses/${slug}`
                      }
                    >
                      Continue Learning
                    </Link>
                  </Button>
                  <p className="text-xs text-zinc-400 text-center">You&apos;re enrolled</p>
                </div>
              ) : c.id ? (
                <EnrollButton courseId={c.id} courseSlug={slug} isFree={isFree} firstLessonId={firstLessonId} />
              ) : null}

              <dl className="space-y-2 text-sm border-t border-zinc-200 dark:border-zinc-800 pt-4">
                {c.estimated_hours && (
                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <Clock className="h-4 w-4 shrink-0" />
                    <span>{c.estimated_hours} hours of content</span>
                  </div>
                )}
                {totalLessons > 0 && (
                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <BookOpen className="h-4 w-4 shrink-0" />
                    <span>{totalLessons} lessons across {c.modules?.length} modules</span>
                  </div>
                )}
                {c.audience && (
                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    <span>{c.audience}</span>
                  </div>
                )}
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
