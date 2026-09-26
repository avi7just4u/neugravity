export const revalidate = 300

import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Clock, Star, ChevronRight, CheckCircle } from "lucide-react"
import { CourseService } from "@/lib/services/course.service"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const c = await CourseService.getCourseBySlug(slug)
  if (!c) return {}
  return {
    title: c.seo_title ?? c.title,
    description: c.seo_description ?? c.description ?? undefined,
  }
}

export function generateStaticParams() { return [] }

const diffVariant: Record<string, "success" | "info" | "destructive"> = {
  beginner: "success",
  intermediate: "info",
  advanced: "destructive",
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const c = await CourseService.getCourseBySlug(slug)
  if (!c) notFound()

  const isFree = c.price === 0 || c.price === null

  return (
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
            <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {c.long_description ?? c.description ?? "Course details coming soon."}
            </p>
          </div>

          {c.outcome && (
            <section className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
              <h2 className="font-semibold text-zinc-900 dark:text-white mb-2 text-sm uppercase tracking-wide">What You&apos;ll Learn</h2>
              <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed">{c.outcome}</p>
            </section>
          )}

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Course Curriculum</h2>
            <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-center">
              <BookOpen className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
              <p className="text-sm text-zinc-400">Curriculum details coming soon.</p>
            </div>
          </section>
        </div>

        <aside>
          <div className="sticky top-20 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-5">
            <div className="text-3xl font-bold text-zinc-900 dark:text-white">
              {isFree ? "Free" : `$${c.price}`}
            </div>
            <Button className="w-full" size="lg">{isFree ? "Enroll Free" : "Enroll Now"}</Button>
            <dl className="space-y-2 text-sm border-t border-zinc-200 dark:border-zinc-800 pt-4">
              {c.estimated_hours && (
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                  <Clock className="h-4 w-4 shrink-0" />
                  <span>{c.estimated_hours} hours of content</span>
                </div>
              )}
              {c.rating_average && (
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                  <Star className="h-4 w-4 shrink-0" />
                  <span>{c.rating_average.toFixed(1)} rating ({c.rating_count} reviews)</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>Certificate of completion</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <Star className="h-4 w-4 shrink-0" />
                <span>Lifetime access</span>
              </div>
            </dl>
            <p className="text-xs text-zinc-400 text-center">30-day money-back guarantee</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
