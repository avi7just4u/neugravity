import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Mic2, Clock, Eye, ChevronRight } from "lucide-react"
import { InterviewService } from "@/lib/services/interview.service"
import { formatRelativeDate } from "@/lib/utils"

export function generateStaticParams() { return [] }

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const interview = await InterviewService.getInterviewBySlug(slug)
  if (!interview) return { title: "Interview Not Found" }
  return {
    title: interview.seo_title ?? interview.title,
    description: interview.seo_description ?? interview.description ?? undefined,
  }
}

export default async function InterviewDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const interview = await InterviewService.getInterviewBySlug(slug)
  if (!interview) notFound()

  const duration = InterviewService.formatDuration(interview.duration_seconds)

  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex items-center gap-1.5 text-sm text-zinc-400 mb-8" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/interviews" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Interviews</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-zinc-600 dark:text-zinc-300">{interview.title}</span>
      </nav>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <Badge variant="secondary" className="mb-3">Interview</Badge>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">{interview.title}</h1>

            {interview.youtube_video_id ? (
              <div className="aspect-video rounded-xl overflow-hidden mb-4">
                <iframe
                  src={`https://www.youtube.com/embed/${interview.youtube_video_id}`}
                  title={interview.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            ) : interview.thumbnail_url ? (
              <div className="aspect-video rounded-xl overflow-hidden mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={interview.thumbnail_url} alt={interview.title} className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="aspect-video rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                <Mic2 className="h-12 w-12 text-zinc-300 dark:text-zinc-600" />
              </div>
            )}

            <div className="flex items-center gap-4 text-xs text-zinc-400">
              {duration && (
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{duration}</span>
              )}
              {interview.view_count > 0 && (
                <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{interview.view_count.toLocaleString()} views</span>
              )}
              {interview.published_at && (
                <span>{formatRelativeDate(interview.published_at)}</span>
              )}
            </div>
          </div>

          {interview.description && (
            <section>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">About this interview</h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{interview.description}</p>
            </section>
          )}

          {interview.transcript ? (
            <section>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">Transcript</h2>
              <div className="prose prose-zinc dark:prose-invert prose-sm max-w-none p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                <div className="whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">{interview.transcript}</div>
              </div>
            </section>
          ) : (
            <section>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">Transcript</h2>
              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Full transcript will be available shortly after publication.</p>
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-5">
          <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <h3 className="font-semibold text-sm text-zinc-900 dark:text-white mb-3">Guest</h3>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-600 dark:text-zinc-400">
                {interview.guest_role?.charAt(0).toUpperCase() ?? "G"}
              </div>
              <div>
                {interview.guest_role && (
                  <div className="font-medium text-sm text-zinc-900 dark:text-white">{interview.guest_role}</div>
                )}
                <div className="text-xs text-zinc-400">Interview guest</div>
              </div>
            </div>
          </div>

          {interview.video_url && !interview.youtube_video_id && (
            <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <h3 className="font-semibold text-sm text-zinc-900 dark:text-white mb-3">Watch</h3>
              <a
                href={interview.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Watch on external platform →
              </a>
            </div>
          )}

          <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <h3 className="font-semibold text-sm text-zinc-900 dark:text-white mb-3">More Interviews</h3>
            <Link href="/interviews" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Browse all interviews →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
