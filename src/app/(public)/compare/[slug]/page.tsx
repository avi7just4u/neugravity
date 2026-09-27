export const revalidate = 3600

import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Clock, ChevronRight, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ComparisonService } from "@/lib/services/comparison.service"
import { formatDate } from "@/lib/utils"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://neugravity.com"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const c = await ComparisonService.getComparisonBySlug(slug)
  if (!c) return {}
  const title = c.seo_title ?? c.title
  const description = (c.seo_description ?? c.description) || undefined
  const url = `${siteUrl}/compare/${slug}`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: "NeuGravity",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  }
}

export function generateStaticParams() { return [] }

export default async function CompareDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const c = await ComparisonService.getComparisonBySlug(slug)
  if (!c) notFound()

  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex items-center gap-1.5 text-sm text-zinc-400 mb-8" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/compare" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Compare</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-zinc-600 dark:text-zinc-300">{c.title}</span>
      </nav>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          {c.featured && <Badge variant="brand">Featured</Badge>}
          <span className="text-xs text-zinc-400 flex items-center gap-1">
            <Eye className="h-3 w-3" />{c.view_count.toLocaleString()} views
          </span>
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">{c.title}</h1>
        {c.description && (
          <p className="text-zinc-500 dark:text-zinc-400 mb-3">{c.description}</p>
        )}
        {c.last_verified_at && (
          <p className="text-sm text-zinc-400 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> Last verified: {formatDate(c.last_verified_at)}
          </p>
        )}
        <p className="text-xs text-zinc-400 mt-1">All data sourced from official documentation and verified periodically.</p>
      </div>

      <div className="p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-center">
        <p className="text-zinc-500 dark:text-zinc-400 mb-1">Detailed comparison for <strong>{c.title}</strong> is being compiled.</p>
        <p className="text-sm text-zinc-400">All comparison data is verified from official sources before publication.</p>
      </div>
    </div>
  )
}
