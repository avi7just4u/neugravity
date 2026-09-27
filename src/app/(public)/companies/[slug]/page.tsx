export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Globe, ChevronRight, ExternalLink } from "lucide-react"
import { CompanyService } from "@/lib/services/company.service"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://neugravity.com"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const co = await CompanyService.getCompanyBySlug(slug)
  if (!co) return {}
  const title = co.seo_title ?? co.name
  const description = (co.seo_description ?? co.description) || undefined
  const url = `${siteUrl}/companies/${slug}`
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

export default async function CompanyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const co = await CompanyService.getCompanyBySlug(slug)
  if (!co) notFound()

  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex items-center gap-1.5 text-sm text-zinc-400 mb-8" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/companies" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Companies</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-zinc-600 dark:text-zinc-300">{co.name}</span>
      </nav>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xl font-bold text-zinc-600 dark:text-zinc-300 overflow-hidden shrink-0">
                {co.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={co.logo_url} alt={co.name} className="h-full w-full object-contain" />
                ) : (
                  co.name.charAt(0)
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">{co.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  {co.company_type && (
                    <Badge variant={co.company_type === "public" ? "info" : "secondary"} className="capitalize">
                      {co.company_type}
                    </Badge>
                  )}
                  {co.verified && <Badge variant="success">Verified</Badge>}
                </div>
              </div>
            </div>

            <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
              {co.long_description ?? co.description ?? "Company profile coming soon."}
            </p>

            <div className="flex flex-wrap gap-2">
              {co.website_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={co.website_url} target="_blank" rel="noopener noreferrer" className="gap-1.5">
                    <Globe className="h-3.5 w-3.5" /> Website
                  </a>
                </Button>
              )}
              {co.github_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={co.github_url} target="_blank" rel="noopener noreferrer" className="gap-1.5">
                    <ExternalLink className="h-3.5 w-3.5" /> GitHub
                  </a>
                </Button>
              )}
            </div>
          </div>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">Latest News</h2>
            <p className="text-sm text-zinc-400">News about {co.name} coming soon.</p>
          </section>
        </div>

        <aside>
          <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-20">
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-4 text-sm">Company Info</h3>
            <dl className="space-y-3 text-sm">
              {co.founded_year && (
                <div>
                  <dt className="text-xs text-zinc-400 uppercase tracking-wide">Founded</dt>
                  <dd className="font-medium text-zinc-900 dark:text-white">{co.founded_year}</dd>
                </div>
              )}
              {co.headquarters && (
                <div>
                  <dt className="text-xs text-zinc-400 uppercase tracking-wide">Headquarters</dt>
                  <dd className="font-medium text-zinc-900 dark:text-white">{co.headquarters}</dd>
                </div>
              )}
              {co.company_type && (
                <div>
                  <dt className="text-xs text-zinc-400 uppercase tracking-wide">Type</dt>
                  <dd className="font-medium text-zinc-900 dark:text-white capitalize">{co.company_type}</dd>
                </div>
              )}
              {co.employee_count_range && (
                <div>
                  <dt className="text-xs text-zinc-400 uppercase tracking-wide">Employees</dt>
                  <dd className="font-medium text-zinc-900 dark:text-white">{co.employee_count_range}</dd>
                </div>
              )}
              {co.stock_symbol && (
                <div>
                  <dt className="text-xs text-zinc-400 uppercase tracking-wide">Ticker</dt>
                  <dd className="font-medium text-zinc-900 dark:text-white">{co.stock_symbol}</dd>
                </div>
              )}
            </dl>
          </div>
        </aside>
      </div>
    </div>
  )
}
