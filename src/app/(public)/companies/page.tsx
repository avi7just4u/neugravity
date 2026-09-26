export const revalidate = 300

import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Building2, ArrowRight } from "lucide-react"
import { CompanyService } from "@/lib/services/company.service"
import { ENV } from "@/lib/config/environment"
import type { Company } from "@/types"

export const metadata: Metadata = {
  title: "Companies",
  description: "Explore technology companies shaping the industry.",
  robots: ENV.filterDemoData ? undefined : { index: false, follow: true },
}

function CompanyCard({ co }: { co: Company }) {
  return (
    <Link
      href={`/companies/${co.slug}`}
      className="group flex flex-col gap-3 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm font-bold text-zinc-600 dark:text-zinc-400 overflow-hidden">
          {co.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={co.logo_url} alt={co.name} className="h-full w-full object-contain" />
          ) : (
            co.name.charAt(0)
          )}
        </div>
        {co.company_type && (
          <Badge variant={co.company_type === "public" ? "info" : "secondary"} className="text-xs capitalize">
            {co.company_type}
          </Badge>
        )}
      </div>
      <div>
        <h2 className="font-semibold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {co.name}
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
          {co.description ?? ""}
        </p>
      </div>
      <div className="flex items-center justify-between text-xs text-zinc-400">
        {co.founded_year && <span>Founded {co.founded_year}</span>}
        <span className="flex items-center gap-1 group-hover:text-blue-500 transition-colors ml-auto">
          View <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  )
}

export default async function CompaniesPage() {
  const { data: companies } = await CompanyService.getCompanies({ perPage: 48 })

  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="h-4 w-4 text-zinc-400" />
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">Companies</span>
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Technology Companies</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Understand the companies building and shaping technology.</p>
      </div>

      {companies.length === 0 ? (
        <div className="py-24 text-center text-zinc-400">
          <Building2 className="h-10 w-10 mx-auto mb-4 opacity-30" />
          <p>No companies found yet. Check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((co) => (
            <CompanyCard key={co.id} co={co} />
          ))}
        </div>
      )}
    </div>
  )
}
