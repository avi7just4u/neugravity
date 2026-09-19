import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Mic2, ChevronRight } from "lucide-react"

function toTitleCase(s: string) { return s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  return { title: toTitleCase(slug) }
}

export function generateStaticParams() { return [] }

export default async function InterviewDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const title = toTitleCase(slug)

  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex items-center gap-1.5 text-sm text-zinc-400 mb-8" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/interviews" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Interviews</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-zinc-600 dark:text-zinc-300">{title}</span>
      </nav>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <Badge variant="secondary" className="mb-3">Interview</Badge>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">{title}</h1>
            <div className="aspect-video rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-6">
              <Mic2 className="h-12 w-12 text-zinc-300 dark:text-zinc-600" />
            </div>
          </div>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">Key Insights</h2>
            <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Key insights and transcript coming soon.</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">Transcript</h2>
            <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Full transcript will be available shortly after publication.</p>
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <h3 className="font-semibold text-sm text-zinc-900 dark:text-white mb-3">Guest</h3>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-600 dark:text-zinc-400">G</div>
              <div>
                <div className="font-medium text-sm text-zinc-900 dark:text-white">Guest details</div>
                <div className="text-xs text-zinc-400">Coming soon</div>
              </div>
            </div>
          </div>
          <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <h3 className="font-semibold text-sm text-zinc-900 dark:text-white mb-3">More Interviews</h3>
            <Link href="/interviews" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Browse all interviews →</Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
