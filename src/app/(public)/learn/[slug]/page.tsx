export const revalidate = 300

import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Clock, ChevronRight, ArrowRight, CheckCircle } from "lucide-react"
import { CourseService } from "@/lib/services/course.service"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://neugravity.vercel.app"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const path = await CourseService.getLearningPathBySlug(slug)
  if (!path) return {}

  const pageUrl = `${SITE_URL}/learn/${slug}`
  const description = path.short_description ?? path.description ?? undefined

  return {
    title: path.title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title: path.title,
      description,
      type: "article",
      url: pageUrl,
    },
  }
}

export function generateStaticParams() { return [] }

const diffVariant: Record<string, "success" | "info" | "destructive"> = {
  beginner: "success",
  intermediate: "info",
  advanced: "destructive",
  expert: "destructive",
}

export default async function LearningPathPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const path = await CourseService.getLearningPathBySlug(slug)
  if (!path) notFound()

  const publishedSteps = (path.steps ?? []).filter((s) => s.course?.status === "published")

  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-zinc-400 mb-8" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/learn" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Learn</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-zinc-600 dark:text-zinc-300">{path.title}</span>
      </nav>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Main */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              {path.difficulty && (
                <Badge variant={diffVariant[path.difficulty] ?? "secondary"} className="capitalize">
                  {path.difficulty}
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-3">{path.title}</h1>
            {(path.short_description || path.description) && (
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed text-lg">
                {path.short_description ?? path.description}
              </p>
            )}
          </div>

          {/* Outcome */}
          {path.outcome && (
            <section className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
              <h2 className="font-semibold text-zinc-900 dark:text-white mb-2 text-sm uppercase tracking-wide">What You&apos;ll Achieve</h2>
              <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed">{path.outcome}</p>
            </section>
          )}

          {/* Career outcomes */}
          {path.career_outcomes && path.career_outcomes.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">Career Outcomes</h2>
              <ul className="space-y-2">
                {path.career_outcomes.map((outcome, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    {outcome}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Courses in this path */}
          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
              Path Curriculum
              <span className="ml-2 text-sm font-normal text-zinc-400">{publishedSteps.length} courses</span>
            </h2>

            {publishedSteps.length === 0 ? (
              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-center">
                <BookOpen className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                <p className="text-sm text-zinc-400">Courses coming soon.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {publishedSteps.map((step, i) => {
                  const c = step.course!
                  return (
                    <Link
                      key={step.id}
                      href={`/courses/${c.slug}`}
                      className="group flex items-center gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-sm font-semibold text-zinc-500">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {c.title}
                          </span>
                          {!step.is_required && (
                            <span className="text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">optional</span>
                          )}
                          {c.difficulty && (
                            <Badge variant={diffVariant[c.difficulty] ?? "secondary"} className="capitalize text-xs">
                              {c.difficulty}
                            </Badge>
                          )}
                        </div>
                        {(step.description ?? c.short_description) && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                            {step.description ?? c.short_description}
                          </p>
                        )}
                        {c.estimated_hours && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-zinc-400">
                            <Clock className="h-3 w-3" />
                            {c.estimated_hours}h
                          </div>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-zinc-300 group-hover:text-zinc-600 transition-colors shrink-0" />
                    </Link>
                  )
                })}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside>
          <div className="sticky top-20 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
            <h3 className="font-semibold text-zinc-900 dark:text-white">Path Overview</h3>
            <dl className="space-y-2 text-sm">
              {path.difficulty && (
                <div className="flex items-center justify-between">
                  <dt className="text-zinc-500">Level</dt>
                  <dd className="font-medium text-zinc-900 dark:text-white capitalize">{path.difficulty}</dd>
                </div>
              )}
              {path.estimated_hours && (
                <div className="flex items-center justify-between">
                  <dt className="text-zinc-500">Total time</dt>
                  <dd className="font-medium text-zinc-900 dark:text-white flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-zinc-400" />
                    {path.estimated_hours}h
                  </dd>
                </div>
              )}
              <div className="flex items-center justify-between">
                <dt className="text-zinc-500">Courses</dt>
                <dd className="font-medium text-zinc-900 dark:text-white">{publishedSteps.length}</dd>
              </div>
            </dl>

            {publishedSteps.length > 0 && (
              <Button className="w-full" asChild>
                <Link href={`/courses/${publishedSteps[0].course!.slug}`}>
                  Start Learning
                </Link>
              </Button>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
