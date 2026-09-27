import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { EnrollmentService } from "@/lib/services/enrollment.service"
import { MarkCompleteButton } from "./mark-complete-button"
import { VideoLesson } from "@/components/lesson/video-lesson"
import { ArticleLesson } from "@/components/lesson/article-lesson"
import { QuizLesson } from "@/components/lesson/quiz-lesson"
import { ProjectLesson } from "@/components/lesson/project-lesson"
import { LearningObjectives } from "@/components/lesson/callouts"
import { InProgressTracker } from "@/components/lesson/in-progress-tracker"
import {
  BookOpen, ChevronLeft, ChevronRight, CheckCircle, PlayCircle,
  FileText, HelpCircle, Folder, ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Course, CourseModule, Lesson, Quiz, QuizQuestion, CourseProject, ProjectSubmission } from "@/types"

export const dynamic = "force-dynamic"
export function generateStaticParams() { return [] }

interface LessonParams { slug: string; lessonId: string }

const LESSON_ICONS: Record<string, React.ReactNode> = {
  video:       <PlayCircle className="h-3.5 w-3.5 shrink-0" />,
  article:     <FileText className="h-3.5 w-3.5 shrink-0" />,
  quiz:        <HelpCircle className="h-3.5 w-3.5 shrink-0" />,
  interactive: <FileText className="h-3.5 w-3.5 shrink-0" />,
  project:     <Folder className="h-3.5 w-3.5 shrink-0" />,
  assignment:  <Folder className="h-3.5 w-3.5 shrink-0" />,
}

async function getCourseWithCurriculum(slug: string) {
  const db = createAdminClient()
  const { data: course } = await db
    .from("courses")
    .select("id,title,slug,status")
    .eq("slug", slug)
    .eq("status", "published")
    .eq("is_demo", false)
    .single()
  if (!course) return null

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
  const { data } = await db
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .eq("status", "published")
    .single()
  return data ? (data as Lesson) : null
}

async function getQuizForLesson(lessonId: string): Promise<{ quiz: Quiz; questions: QuizQuestion[] } | null> {
  const db = createAdminClient()
  const { data: quiz } = await db
    .from("quizzes")
    .select("*")
    .eq("lesson_id", lessonId)
    .single()
  if (!quiz) return null

  const { data: questions } = await db
    .from("quiz_questions")
    .select("id,quiz_id,question_text,question_type,options,explanation,points,sort_order")
    .eq("quiz_id", (quiz as Quiz).id)
    .order("sort_order")

  // Strip correct_answer — never expose to client
  const safeQuestions = ((questions ?? []) as (QuizQuestion & { correct_answer?: unknown })[]).map(
    ({ correct_answer: _ca, ...q }) => q as QuizQuestion
  )
  return { quiz: quiz as Quiz, questions: safeQuestions }
}

async function getProjectForLesson(lessonId: string, userId: string): Promise<{
  project: CourseProject
  submission: ProjectSubmission | null
} | null> {
  const db = createAdminClient()
  const { data: lesson } = await db
    .from("lessons")
    .select("module_id")
    .eq("id", lessonId)
    .single()
  if (!lesson) return null

  const { data: project } = await db
    .from("course_projects")
    .select("*")
    .eq("module_id", (lesson as { module_id: string }).module_id)
    .single()
  if (!project) return null

  const { data: submission } = await db
    .from("project_submissions")
    .select("*")
    .eq("user_id", userId)
    .eq("project_id", (project as CourseProject).id)
    .single()

  return { project: project as CourseProject, submission: (submission as ProjectSubmission) ?? null }
}

export async function generateMetadata({ params }: { params: Promise<LessonParams> }): Promise<Metadata> {
  const { lessonId } = await params
  const lesson = await getLesson(lessonId)
  return {
    title: lesson?.title ?? "Lesson",
    robots: { index: false },
  }
}

export default async function LessonViewerPage({ params }: { params: Promise<LessonParams> }) {
  const { slug, lessonId } = await params

  const client = await createClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) redirect(`/login?next=/courses/${slug}/lessons/${lessonId}`)

  const [course, lesson] = await Promise.all([
    getCourseWithCurriculum(slug),
    getLesson(lessonId),
  ])
  if (!course || !lesson) notFound()

  const enrollment = await EnrollmentService.getEnrollment(user.id, course.id)
  if (!enrollment) redirect(`/courses/${slug}`)

  const [userProgress, courseProgress, quizData, projectData] = await Promise.all([
    EnrollmentService.getLessonProgress(user.id, lessonId),
    EnrollmentService.getCourseProgress(user.id, course.id),
    lesson.lesson_type === "quiz" ? getQuizForLesson(lessonId) : Promise.resolve(null),
    lesson.lesson_type === "project" || lesson.lesson_type === "assignment"
      ? getProjectForLesson(lessonId, user.id)
      : Promise.resolve(null),
  ])

  const isCompleted = userProgress?.status === "completed"

  // Build progress map for curriculum completion indicators
  const allLessons = course.modules?.flatMap((m) => m.lessons ?? []) ?? []
  const lessonIds = allLessons.map((l) => l.id)
  const progressMap: Record<string, string> = {}

  if (lessonIds.length > 0) {
    const db = createAdminClient()
    const { data: progressRows } = await db
      .from("lesson_progress")
      .select("lesson_id,status")
      .eq("user_id", user.id)
      .in("lesson_id", lessonIds)

    for (const p of progressRows ?? []) {
      const row = p as { lesson_id: string; status: string }
      progressMap[row.lesson_id] = row.status
    }
  }

  // Prev/next navigation by sort_order
  const currentIdx = allLessons.findIndex((l) => l.id === lessonId)
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null

  // Header context
  const currentModule = course.modules?.find((m) => m.lessons?.some((l) => l.id === lessonId))
  const moduleIdx = course.modules?.findIndex((m) => m.id === currentModule?.id) ?? 0
  const lessonInModuleIdx = currentModule?.lessons?.findIndex((l) => l.id === lessonId) ?? 0

  const isInteractive = lesson.lesson_type === "quiz" || lesson.lesson_type === "project" || lesson.lesson_type === "assignment"

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-950">
      <InProgressTracker lessonId={lessonId} userId={user.id} courseId={course.id} />

      {/* Progress header */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm">
        <div className="flex items-center gap-4 px-4 h-14">
          <Link
            href={`/courses/${slug}`}
            className="flex items-center gap-1.5 text-sm font-semibold text-zinc-900 dark:text-white hover:text-blue-600 transition-colors shrink-0 max-w-[200px]"
          >
            <BookOpen className="h-4 w-4 shrink-0 text-blue-500" />
            <span className="truncate hidden sm:block">{course.title}</span>
          </Link>

          <div className="flex-1 flex items-center gap-3 min-w-0">
            <div className="flex-1 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div
                role="progressbar"
                aria-valuenow={courseProgress.percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Course progress: ${courseProgress.percent}%`}
                className="h-full rounded-full bg-blue-500 transition-all duration-500"
                style={{ width: `${courseProgress.percent}%` }}
              />
            </div>
            <span className="text-xs text-zinc-500 shrink-0 tabular-nums">
              {courseProgress.completed_lessons}/{courseProgress.total_lessons}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1 text-xs text-zinc-400 shrink-0">
            <span>Module {moduleIdx + 1}</span>
            <span>·</span>
            <span>Lesson {lessonInModuleIdx + 1}</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Desktop curriculum sidebar */}
        <aside className="hidden lg:flex flex-col w-72 shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
          <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Curriculum</div>
          </div>
          <nav className="flex-1 overflow-y-auto py-2">
            {course.modules?.map((mod) => (
              <div key={mod.id}>
                <div className="px-4 py-2.5 text-xs font-semibold text-zinc-500 uppercase tracking-wide bg-zinc-50 dark:bg-zinc-900/50">
                  {mod.title}
                </div>
                {mod.lessons?.map((l) => {
                  const isActive = l.id === lessonId
                  const status = progressMap[l.id]
                  return (
                    <Link
                      key={l.id}
                      href={`/courses/${slug}/lessons/${l.id}`}
                      className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                        isActive
                          ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-medium"
                          : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                      }`}
                    >
                      <span className="shrink-0 w-4 flex justify-center">
                        {status === "completed"
                          ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                          : isActive
                          ? <span className="h-2 w-2 rounded-full bg-blue-500 inline-block" />
                          : <span className="h-2 w-2 rounded-full border border-zinc-300 dark:border-zinc-600 inline-block" />
                        }
                      </span>
                      <span className="shrink-0 text-zinc-400">
                        {LESSON_ICONS[l.lesson_type] ?? <FileText className="h-3.5 w-3.5" />}
                      </span>
                      <span className="flex-1 line-clamp-1 text-xs">{l.title}</span>
                    </Link>
                  )
                })}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 flex flex-col">
          {/* Mobile curriculum accordion */}
          <details className="lg:hidden border-b border-zinc-200 dark:border-zinc-800 group">
            <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer list-none text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
              <BookOpen className="h-4 w-4 text-zinc-400" />
              <span className="flex-1">Course curriculum</span>
              <ChevronDown className="h-4 w-4 text-zinc-400 transition-transform group-open:rotate-180" />
            </summary>
            <div className="bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 max-h-64 overflow-y-auto">
              {course.modules?.map((mod) => (
                <div key={mod.id}>
                  <div className="px-4 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                    {mod.title}
                  </div>
                  {mod.lessons?.map((l) => {
                    const isActive = l.id === lessonId
                    const status = progressMap[l.id]
                    return (
                      <Link
                        key={l.id}
                        href={`/courses/${slug}/lessons/${l.id}`}
                        className={`flex items-center gap-2 px-4 py-2 text-xs transition-colors ${
                          isActive
                            ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600 font-medium"
                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <span className="shrink-0">
                          {status === "completed"
                            ? <CheckCircle className="h-3 w-3 text-emerald-500" />
                            : <span className="h-2 w-2 rounded-full border border-current inline-block opacity-40" />
                          }
                        </span>
                        <span className="line-clamp-1">{l.title}</span>
                      </Link>
                    )
                  })}
                </div>
              ))}
            </div>
          </details>

          {/* Lesson content */}
          <div className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-8 py-10 space-y-8">
            {/* Breadcrumb + title */}
            <div>
              <div className="flex items-center gap-2 text-xs text-zinc-400 mb-3">
                <Link href={`/courses/${slug}`} className="hover:text-zinc-600 transition-colors">
                  {course.title}
                </Link>
                <ChevronRight className="h-3 w-3" />
                <span>{currentModule?.title}</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white leading-tight">
                  {lesson.title}
                </h1>
                {isCompleted && (
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-sm font-medium shrink-0 mt-1">
                    <CheckCircle className="h-4 w-4" />
                    <span className="hidden sm:block">Completed</span>
                  </div>
                )}
              </div>
            </div>

            {/* Learning outcomes */}
            {lesson.learning_outcomes && lesson.learning_outcomes.length > 0 && (
              <LearningObjectives outcomes={lesson.learning_outcomes} />
            )}

            {/* Description */}
            {lesson.description && (
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{lesson.description}</p>
            )}

            {/* Video */}
            {lesson.lesson_type === "video" && lesson.video_url && (
              <VideoLesson videoUrl={lesson.video_url} durationSeconds={lesson.video_duration_seconds} />
            )}
            {lesson.lesson_type === "video" && !lesson.video_url && (
              <div className="aspect-video rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 text-sm">
                Video not yet available
              </div>
            )}

            {/* Article */}
            {(lesson.lesson_type === "article" || lesson.lesson_type === "interactive") && lesson.content && (
              <ArticleLesson content={lesson.content} />
            )}

            {/* Quiz */}
            {lesson.lesson_type === "quiz" && quizData && (
              <QuizLesson
                quiz={quizData.quiz}
                questions={quizData.questions}
                lessonId={lessonId}
                onComplete={() => {}}
              />
            )}
            {lesson.lesson_type === "quiz" && !quizData && (
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-8 text-center">
                <HelpCircle className="h-8 w-8 text-zinc-400 mx-auto mb-3" />
                <p className="text-sm text-zinc-500">Quiz questions not yet available.</p>
              </div>
            )}

            {/* Project / Assignment */}
            {(lesson.lesson_type === "project" || lesson.lesson_type === "assignment") && projectData && (
              <ProjectLesson
                projectId={projectData.project.id}
                courseId={course.id}
                lessonId={lessonId}
                title={projectData.project.title}
                instructions={projectData.project.instructions}
                submissionType={projectData.project.submission_type}
                existingSubmission={projectData.submission}
                onComplete={() => {}}
              />
            )}
            {(lesson.lesson_type === "project" || lesson.lesson_type === "assignment") && !projectData && lesson.content && (
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-5">
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-3">Assignment</h3>
                <div className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">{lesson.content}</div>
              </div>
            )}

            {/* Nav + complete bar */}
            <div className="flex items-center justify-between gap-4 pt-6 border-t border-zinc-100 dark:border-zinc-800">
              <div>
                {prevLesson ? (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/courses/${slug}/lessons/${prevLesson.id}`}>
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      <span>Previous</span>
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
                {!isCompleted && !isInteractive && (
                  <MarkCompleteButton lessonId={lessonId} courseSlug={slug} />
                )}
                {nextLesson ? (
                  <Button size="sm" asChild>
                    <Link href={`/courses/${slug}/lessons/${nextLesson.id}`}>
                      <span>Next</span>
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                ) : (
                  <Button size="sm" asChild>
                    <Link href={`/courses/${slug}`}>Finish Course</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
