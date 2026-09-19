import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Building2, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Companies",
  description: "Explore technology companies shaping the industry.",
}

const demoCompanies = [
  { name: "OpenAI", slug: "openai", description: "AI research and deployment company behind ChatGPT and GPT-4.", type: "private", founded: 2015, hq: "San Francisco, CA" },
  { name: "Google", slug: "google", description: "Multinational technology company specializing in search, cloud, and AI.", type: "public", founded: 1998, hq: "Mountain View, CA" },
  { name: "Microsoft", slug: "microsoft", description: "Technology corporation producing software, hardware, and cloud services.", type: "public", founded: 1975, hq: "Redmond, WA" },
  { name: "Anthropic", slug: "anthropic", description: "AI safety company and the creator of Claude, focused on reliable AI.", type: "private", founded: 2021, hq: "San Francisco, CA" },
  { name: "Vercel", slug: "vercel", description: "Cloud platform for frontend developers enabling instant deployments.", type: "private", founded: 2015, hq: "San Francisco, CA" },
  { name: "Supabase", slug: "supabase", description: "Open-source Firebase alternative built on PostgreSQL.", type: "private", founded: 2020, hq: "San Francisco, CA" },
  { name: "HashiCorp", slug: "hashicorp", description: "Infrastructure automation company behind Terraform, Vault, and Consul.", type: "public", founded: 2012, hq: "San Francisco, CA" },
  { name: "Cloudflare", slug: "cloudflare", description: "Network security and performance company operating a global CDN.", type: "public", founded: 2009, hq: "San Francisco, CA" },
  { name: "GitHub", slug: "github", description: "Platform for software development, version control, and collaboration.", type: "private", founded: 2008, hq: "San Francisco, CA" },
  { name: "Stripe", slug: "stripe", description: "Financial infrastructure platform for internet businesses.", type: "private", founded: 2010, hq: "San Francisco, CA" },
]

export default function CompaniesPage() {
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {demoCompanies.map((co) => (
          <Link
            key={co.slug}
            href={`/companies/${co.slug}`}
            className="group flex flex-col gap-3 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm font-bold text-zinc-600 dark:text-zinc-400">
                {co.name.charAt(0)}
              </div>
              <Badge variant={co.type === "public" ? "info" : "secondary"} className="text-xs capitalize">{co.type}</Badge>
            </div>
            <div>
              <h2 className="font-semibold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{co.name}</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">{co.description}</p>
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Founded {co.founded}</span>
              <span className="flex items-center gap-1 group-hover:text-blue-500 transition-colors">View <ArrowRight className="h-3 w-3" /></span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
