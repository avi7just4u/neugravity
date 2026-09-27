import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/server"
import { PageHeader, StatusBadge } from "@/components/admin"
import { PathEditorActions } from "./path-editor-actions"
import { PathStepReorder } from "./path-step-reorder"
import { Clock, BookOpen, ArrowRight } from "lucide-react"
import type { LearningPath, LearningPathCourse, Course } from "@/types"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const db = createAdminClient()
  const { data } = await db.from("learning_paths").select("title").eq("id", id).single()
  return { title: data?.title ?? "Edit Path" }
}

async function getPath(id: string) {
  const db = createAdminClient()
  const { data: path, error } = await db.from("learning_paths").select("*").eq("id", id).single()
  if (error || !path) return null

  const { data: steps } = await db
    .from("learning_path_courses")
    .select("*")
    .eq("learning_path_id", id)
    .order("sort_order")

  const stepList = (steps ?? []) as LearningPathCourse[]
  const courseIds = stepList.map((s) => s.course_id)
  const courses: Record<string, Course> = {}

  if (courseIds.length > 0) {
    const { data: courseData } = await db
      .from("courses")
      .select("id,title,slug,difficulty,status,estimated_hours")
      .in("id", courseIds)

    for (const c of courseData ?? []) {
      const course = c as Course
      if (course.id) courses[course.id] = course
    }
  }

  return {
    ...(path as LearningPath),
    steps: stepList.map((s) => ({ ...s, course: courses[s.course_id] ?? null })),
  }
}

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  draft: ["review"],
  review: ["approved", "draft"],
  approved: ["published", "review"],
  published: ["archived"],
  archived: ["draft"],
}

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  expert: "Expert",
}

export default async function PathEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const path = await getPath(id)
  if (!path) notFound()

  const transitions = ALLOWED_TRANSITIONS[path.status] ?? []
  const steps = path.steps ?? []

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title={path.title}
        description={`/learn/${path.slug}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={path.status} />
            <Link
              href="/admin/education/paths"
              className="text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
            >
              ← Paths
            </Link>
          </div>
        }
      />

      {/* Meta */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
          <div className="text-xs text-zinc-500 mb-1">Difficulty</div>
          <div className="font-semibold text-zinc-900 dark:text-white">{path.difficulty ? (DIFFICULTY_LABELS[path.difficulty] ?? path.difficulty) : "—"}</div>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
          <div className="text-xs text-zinc-500 mb-1">Est. Hours</div>
          <div className="font-semibold text-zinc-900 dark:text-white flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-zinc-400" />
            {path.estimated_hours ?? "—"}h
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
          <div className="text-xs text-zinc-500 mb-1">Courses</div>
          <div className="font-semibold text-zinc-900 dark:text-white flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5 text-zinc-400" />
            {steps.length}
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
          <div className="text-xs text-zinc-500 mb-1">Demo</div>
          <div className="font-semibold text-zinc-900 dark:text-white">{path.is_demo ? "Yes" : "No"}</div>
        </div>
      </div>

      {/* Description */}
      {(path.description || path.short_description || path.outcome) && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 space-y-4">
          {path.short_description && (
            <div>
              <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">Summary</div>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">{path.short_description}</p>
            </div>
          )}
          {path.description && (
            <div>
              <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">Description</div>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">{path.description}</p>
            </div>
          )}
          {path.outcome && (
            <div>
              <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">Outcome</div>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">{path.outcome}</p>
            </div>
          )}
        </div>
      )}

      {/* Courses in this path */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Course Steps ({steps.length})</h2>
        </div>
        {!steps.length ? (
          <div className="px-5 py-8 text-center text-sm text-zinc-400">
            No courses added to this path yet.
          </div>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {steps.map((step, i) => (
              <li key={step.id} className="flex items-center gap-3 px-5 py-3">
                <PathStepReorder pathId={id} stepId={step.id} index={i} total={steps.length} />
                <span className="text-xs font-medium text-zinc-400 w-5 shrink-0 text-center">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  {step.course ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-zinc-900 dark:text-white">{step.course.title}</span>
                        <StatusBadge status={step.course.status} size="sm" />
                        {!step.is_required && (
                          <span className="text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">optional</span>
                        )}
                      </div>
                      {step.description && (
                        <p className="text-xs text-zinc-500 mt-0.5">{step.description}</p>
                      )}
                    </>
                  ) : (
                    <span className="text-sm text-zinc-400 italic">Course not found ({step.course_id})</span>
                  )}
                </div>
                {step.course && (
                  <Link
                    href={`/admin/education/courses/${step.course_id}`}
                    className="shrink-0 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Status transitions */}
      {transitions.length > 0 && (
        <PathEditorActions pathId={id} transitions={transitions} />
      )}
    </div>
  )
}
