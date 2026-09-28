export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  BookOpen, Clock, ChevronRight, CheckCircle, PlayCircle,
  FileText, HelpCircle, Folder, Lock, Users, Code2, Award,
} from "lucide-react"
import { CourseService } from "@/lib/services/course.service"
import { EnrollmentService } from "@/lib/services/enrollment.service"
import { createAdminClient } from "@/lib/supabase/server"
import { EnrollButton } from "./enroll-button"
import type { Lesson } from "@/types"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://neugravity.vercel.app"

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
  video:       <PlayCircle className="h-4 w-4 shrink-0 text-zinc-400" />,
  article:     <FileText className="h-4 w-4 shrink-0 text-zinc-400" />,
  quiz:        <HelpCircle className="h-4 w-4 shrink-0 text-zinc-400" />,
  project:     <Code2 className="h-4 w-4 shrink-0 text-zinc-400" />,
  assignment:  <Code2 className="h-4 w-4 shrink-0 text-zinc-400" />,
  interactive: <FileText className="h-4 w-4 shrink-0 text-zinc-400" />,
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
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8 pb-28 lg:pb-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-zinc-400 mb-8" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/courses" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Courses</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-zinc-600 dark:text-zinc-300 line-clamp-1">{c.title}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-10 lg:gap-16">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-10">

            {/* Hero */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {c.difficulty && (
                  <Badge variant={diffVariant[c.difficulty] ?? "secondary"} className="capitalize">
                    {c.difficulty}
                  </Badge>
                )}
                {isFree && (
                  <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-transparent">
                    Free
                  </Badge>
                )}
              </div>
              <h1 className="text-headline text-zinc-900 dark:text-white">{c.title}</h1>
              {c.subtitle && (
                <p className="text-xl text-zinc-500 dark:text-zinc-400 leading-relaxed">{c.subtitle}</p>
              )}
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
                {c.long_description ?? c.description ?? "Course details coming soon."}
              </p>
              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-4 pt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {c.estimated_hours && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 shrink-0" />
                    {c.estimated_hours}h of content
                  </span>
                )}
                {totalLessons > 0 && (
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 shrink-0" />
                    {totalLessons} lessons
                  </span>
                )}
                {c.audience && (
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 shrink-0" />
                    {c.audience}
                  </span>
                )}
              </div>
            </div>

            {/* What You'll Learn */}
            {((c.learning_outcomes?.length ?? 0) > 0 || c.outcome) && (
              <section className="rounded-xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/10 p-6">
                <div className="section-label text-indigo-600 dark:text-indigo-400 mb-4">
                  <Award className="h-3.5 w-3.5" />
                  What You&apos;ll Learn
                </div>
                {c.learning_outcomes && c.learning_outcomes.length > 0 ? (
                  <ul className="grid sm:grid-cols-2 gap-3">
                    {c.learning_outcomes.map((outcome: string, i: number) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-700 dark:text-zinc-300">
                        <CheckCircle className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                        {outcome}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">{c.outcome}</p>
                )}
              </section>
            )}

            {/* Curriculum */}
            <section>
              <div className="section-header mb-5">
                <div>
                  <div className="section-label text-indigo-600 dark:text-indigo-400 mb-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    Course Curriculum
                  </div>
                  {totalLessons > 0 && (
                    <p className="text-sm text-zinc-500">
                      {c.modules?.length} module{(c.modules?.length ?? 0) !== 1 ? "s" : ""} · {totalLessons} lesson{totalLessons !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>

              {!c.modules?.length ? (
                <div className="p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-center">
                  <BookOpen className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
                  <p className="text-sm text-zinc-400">Curriculum details coming soon.</p>
                </div>
              ) : (
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
                  {c.modules.map((mod, mi) => (
                    <details key={mod.id} className="group" open={mi === 0}>
                      <summary className="flex items-center gap-3 px-5 py-4 bg-zinc-50 dark:bg-zinc-900/50 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors list-none">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          {mi + 1}
                        </span>
                        <span className="flex-1 font-semibold text-sm text-zinc-900 dark:text-white">{mod.title}</span>
                        <span className="text-xs text-zinc-400 mr-1">{mod.lessons?.length ?? 0} lessons</span>
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
                              <span>
                                {isLessonCompleted
                                  ? <CheckCircle className="h-4 w-4 text-emerald-500" />
                                  : isEnrolled || lesson.is_preview
                                  ? (LESSON_TYPE_ICONS[lesson.lesson_type] ?? <FileText className="h-4 w-4 shrink-0 text-zinc-400" />)
                                  : <Lock className="h-4 w-4 shrink-0 text-zinc-300 dark:text-zinc-600" />
                                }
                              </span>
                              <span className="flex-1 text-sm text-zinc-700 dark:text-zinc-300">
                                {lessonHref ? (
                                  <Link
                                    href={lessonHref}
                                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                  >
                                    {lesson.title}
                                  </Link>
                                ) : lesson.title}
                              </span>
                              <div className="flex items-center gap-2 shrink-0">
                                {lesson.is_preview && !isEnrolled && (
                                  <span className="text-xs text-indigo-500 font-medium">Preview</span>
                                )}
                                {lesson.video_duration_seconds && (
                                  <span className="text-xs text-zinc-400">{formatDuration(lesson.video_duration_seconds)}</span>
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

            {/* Trust signals */}
            <section className="flex flex-wrap gap-6 py-6 border-t border-zinc-100 dark:border-zinc-800 text-sm text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 shrink-0 text-zinc-400" />
                <span>By NeuGravity</span>
              </div>
              {c.updated_at && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0 text-zinc-400" />
                  <span>Updated {new Date(c.updated_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside>
            <div className="sticky top-6 space-y-4">
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
                {/* Price strip */}
                <div className="px-5 pt-5 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                    {isFree ? (
                      <span className="flex items-center gap-2">
                        Free
                        <span className="text-sm font-normal text-indigo-500">No credit card needed</span>
                      </span>
                    ) : `$${c.price}`}
                  </div>
                </div>

                {/* CTA */}
                <div className="px-5 py-4 space-y-3">
                  {isEnrolled ? (
                    <>
                      <Button
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                        size="lg"
                        asChild
                      >
                        <Link href={
                          continueLessonId
                            ? `/courses/${slug}/lessons/${continueLessonId}`
                            : firstLessonId
                            ? `/courses/${slug}/lessons/${firstLessonId}`
                            : `/courses/${slug}`
                        }>
                          Continue Learning →
                        </Link>
                      </Button>
                      {totalLessons > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-zinc-500">
                            <span>Your progress</span>
                            <span>{Object.values(progressMap).filter(s => s === "completed").length}/{totalLessons} lessons</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-indigo-600 transition-all"
                              style={{ width: totalLessons > 0 ? `${Math.round(Object.values(progressMap).filter(s => s === "completed").length / totalLessons * 100)}%` : "0%" }}
                            />
                          </div>
                        </div>
                      )}
                    </>
                  ) : c.id ? (
                    <>
                      <EnrollButton courseId={c.id} courseSlug={slug} isFree={isFree} firstLessonId={firstLessonId} />
                      {firstLessonId && (
                        <Button variant="outline" className="w-full" size="lg" asChild>
                          <Link href={`/courses/${slug}/lessons/${firstLessonId}`}>
                            Preview First Lesson
                          </Link>
                        </Button>
                      )}
                    </>
                  ) : null}
                </div>

                {/* Meta list */}
                <dl className="px-5 py-4 space-y-2.5 text-sm border-t border-zinc-100 dark:border-zinc-800">
                  {c.estimated_hours && (
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                      <Clock className="h-4 w-4 shrink-0 text-zinc-400" />
                      <span>{c.estimated_hours} hours of content</span>
                    </div>
                  )}
                  {totalLessons > 0 && (
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                      <BookOpen className="h-4 w-4 shrink-0 text-zinc-400" />
                      <span>{totalLessons} lessons · {c.modules?.length} modules</span>
                    </div>
                  )}
                  {c.difficulty && (
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                      <Award className="h-4 w-4 shrink-0 text-zinc-400" />
                      <span className="capitalize">{c.difficulty} level</span>
                    </div>
                  )}
                  {c.audience && (
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                      <Users className="h-4 w-4 shrink-0 text-zinc-400" />
                      <span>{c.audience}</span>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile sticky enrollment CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-950/95 border-t border-zinc-200 dark:border-zinc-800 px-4 py-3 backdrop-blur-sm">
        {isEnrolled ? (
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" size="lg" asChild>
            <Link href={
              continueLessonId
                ? `/courses/${slug}/lessons/${continueLessonId}`
                : firstLessonId
                ? `/courses/${slug}/lessons/${firstLessonId}`
                : `/courses/${slug}`
            }>
              Continue Learning →
            </Link>
          </Button>
        ) : c.id ? (
          <EnrollButton courseId={c.id} courseSlug={slug} isFree={isFree} firstLessonId={firstLessonId} />
        ) : null}
      </div>
    </>
  )
}
