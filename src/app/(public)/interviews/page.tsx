export const revalidate = 300

import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Mic2, Clock, ArrowRight } from "lucide-react"
import { InterviewService } from "@/lib/services/interview.service"
import { formatRelativeDate } from "@/lib/utils"
import type { Interview } from "@/types"

export const metadata: Metadata = {
  title: "Interviews",
  description: "Conversations with technology leaders, engineers, and builders.",
}

function InterviewCard({ interview }: { interview: Interview }) {
  const duration = InterviewService.formatDuration(interview.duration_seconds)
  return (
    <Link
      href={`/interviews/${interview.slug}`}
      className="group flex flex-col gap-4 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md transition-all"
    >
      <div className="aspect-video rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
        {interview.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={interview.thumbnail_url} alt={interview.title} className="h-full w-full object-cover" />
        ) : (
          <Mic2 className="h-8 w-8 text-zinc-300 dark:text-zinc-600" />
        )}
      </div>
      <div>
        <h2 className="font-semibold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug mb-1">
          {interview.title}
        </h2>
        {interview.guest_role && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{interview.guest_role}</p>
        )}
        {interview.description && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1">{interview.description}</p>
        )}
      </div>
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-3 text-xs text-zinc-400">
          {duration && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {duration}
            </span>
          )}
          {interview.published_at && (
            <span>{formatRelativeDate(interview.published_at)}</span>
          )}
        </div>
        <span className="text-xs text-zinc-400 flex items-center gap-1 group-hover:text-indigo-500 transition-colors">
          Watch <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  )
}

export default async function InterviewsPage() {
  const { data: interviews } = await InterviewService.getPublishedInterviews({ perPage: 20 })

  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <Mic2 className="h-4 w-4 text-zinc-400" />
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">Interviews</span>
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Interviews</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Conversations with technology leaders, engineers, and builders.</p>
      </div>

      {interviews.length === 0 ? (
        <div className="py-24 text-center text-zinc-400">
          <Mic2 className="h-10 w-10 mx-auto mb-4 opacity-30" />
          <p>No interviews published yet. Check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {interviews.map((interview) => (
            <InterviewCard key={interview.id} interview={interview} />
          ))}
        </div>
      )}
    </div>
  )
}
