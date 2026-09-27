import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/server"
import { PageHeader, StatusBadge } from "@/components/admin"
import { CourseEditorActions } from "./course-editor-actions"
import { ReorderButtons } from "./curriculum-reorder"
import { Clock, PlayCircle, FileText, ChevronRight } from "lucide-react"
import type { Course, CourseModule, Lesson } from "@/types"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const db = createAdminClient()
  const { data } = await db.from("courses").select("title").eq("id", id).single()
  return { title: data?.title ?? "Edit Course" }
}

async function getCourse(id: string) {
  const db = createAdminClient()
  const { data: course, error } = await db.from("courses").select("*").eq("id", id).single()
  if (error || !course) return null

  const { data: modules } = await db
    .from("course_modules")
    .select("*")
    .eq("course_id", id)
    .order("sort_order")

  const moduleList = (modules ?? []) as CourseModule[]

  const modulesWithLessons = await Promise.all(
    moduleList.map(async (mod) => {
      const { data: lessons } = await db
        .from("lessons")
        .select("id,title,lesson_type,status,is_preview,video_duration_seconds,sort_order")
        .eq("module_id", mod.id)
        .order("sort_order")
      return { ...mod, lessons: (lessons ?? []) as Lesson[] }
    })
  )

  return { ...(course as Course), modules: modulesWithLessons }
}

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  draft: ["review"],
  review: ["approved", "draft"],
  approved: ["published", "review"],
  published: ["archived"],
  archived: ["draft"],
}

const LESSON_TYPE_ICONS: Record<string, React.ReactNode> = {
  video: <PlayCircle className="h-3.5 w-3.5" />,
  article: <FileText className="h-3.5 w-3.5" />,
  quiz: <FileText className="h-3.5 w-3.5" />,
  project: <FileText className="h-3.5 w-3.5" />,
}

function formatDuration(seconds: number | null) {
  if (!seconds) return null
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

export default async function CourseEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const course = await getCourse(id)
  if (!course) notFound()

  const transitions = ALLOWED_TRANSITIONS[course.status] ?? []
  const totalLessons = course.modules?.reduce((sum, m) => sum + (m.lessons?.length ?? 0), 0) ?? 0
  const modules = course.modules ?? []

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title={course.title}
        description={course.subtitle ?? `/courses/${course.slug}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={course.status} />
            <Link
              href="/admin/education/courses"
              className="text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
            >
              ← Courses
            </Link>
          </div>
        }
      />

      {/* Meta */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
          <div className="text-xs text-zinc-500 mb-1">Difficulty</div>
          <div className="font-semibold text-zinc-900 dark:text-white capitalize">{course.difficulty}</div>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
          <div className="text-xs text-zinc-500 mb-1">Est. Hours</div>
          <div className="font-semibold text-zinc-900 dark:text-white flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-zinc-400" />
            {course.estimated_hours ?? "—"}h
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
          <div className="text-xs text-zinc-500 mb-1">Modules</div>
          <div className="font-semibold text-zinc-900 dark:text-white">{modules.length}</div>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
          <div className="text-xs text-zinc-500 mb-1">Lessons</div>
          <div className="font-semibold text-zinc-900 dark:text-white">{totalLessons}</div>
        </div>
      </div>

      {/* Description */}
      {(course.short_description || course.description) && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 space-y-3">
          {course.short_description && (
            <div>
              <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">Summary</div>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">{course.short_description}</p>
            </div>
          )}
          {course.description && (
            <div>
              <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">Description</div>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 line-clamp-4">{course.description}</p>
            </div>
          )}
          {course.learning_outcomes && course.learning_outcomes.length > 0 && (
            <div>
              <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">Learning Outcomes</div>
              <ul className="text-sm text-zinc-700 dark:text-zinc-300 space-y-1 list-disc list-inside">
                {course.learning_outcomes.map((outcome: string, i: number) => (
                  <li key={i}>{outcome}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Curriculum with reorder */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
            Curriculum ({modules.length} modules, {totalLessons} lessons)
          </h2>
        </div>
        {!modules.length ? (
          <div className="px-5 py-8 text-center text-sm text-zinc-400">
            No modules yet. Add modules and lessons to build the curriculum.
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {modules.map((mod, mi) => (
              <div key={mod.id}>
                <div className="flex items-center gap-2 px-4 py-3 bg-zinc-50/50 dark:bg-zinc-900/20">
                  <ReorderButtons type="module" parentId={id} itemId={mod.id} index={mi} total={modules.length} />
                  <span className="text-xs font-medium text-zinc-400 w-5 text-center">{mi + 1}</span>
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{mod.title}</span>
                    <span className="ml-2 text-xs text-zinc-400">{mod.lessons?.length ?? 0} lessons</span>
                  </div>
                </div>
                {mod.lessons?.map((lesson, li) => (
                  <div key={lesson.id} className="flex items-center gap-2 px-4 py-2.5 pl-10 border-t border-zinc-50 dark:border-zinc-900/50 hover:bg-zinc-50/30 dark:hover:bg-zinc-900/10">
                    <ReorderButtons type="lesson" parentId={mod.id} itemId={lesson.id} index={li} total={mod.lessons?.length ?? 0} />
                    <span className="text-zinc-400">{LESSON_TYPE_ICONS[lesson.lesson_type] ?? <ChevronRight className="h-3.5 w-3.5" />}</span>
                    <span className="flex-1 text-sm text-zinc-700 dark:text-zinc-300">{lesson.title}</span>
                    <div className="flex items-center gap-2">
                      {lesson.is_preview && (
                        <span className="text-xs text-blue-500 bg-blue-50 dark:bg-blue-950/30 px-1.5 py-0.5 rounded">preview</span>
                      )}
                      {lesson.video_duration_seconds && (
                        <span className="text-xs text-zinc-400">{formatDuration(lesson.video_duration_seconds)}</span>
                      )}
                      <StatusBadge status={lesson.status ?? "draft"} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status transitions */}
      {transitions.length > 0 && (
        <CourseEditorActions courseId={id} transitions={transitions} />
      )}
    </div>
  )
}
