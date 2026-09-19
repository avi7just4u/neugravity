import type { Metadata } from "next"
import { Badge } from "@/components/ui/badge"
import { Shield, ExternalLink, Clock } from "lucide-react"

export const metadata: Metadata = {
  title: "Technology Status",
  description: "Current operational status of major technology providers.",
}

type ProviderStatus = "operational" | "degraded" | "outage" | "maintenance"

const providers: { name: string; slug: string; category: string; status: ProviderStatus; statusUrl: string }[] = [
  { name: "OpenAI", slug: "openai", category: "AI", status: "operational", statusUrl: "https://status.openai.com" },
  { name: "Anthropic", slug: "anthropic", category: "AI", status: "operational", statusUrl: "https://status.anthropic.com" },
  { name: "Amazon Web Services", slug: "aws", category: "Cloud", status: "operational", statusUrl: "https://health.aws.amazon.com" },
  { name: "Google Cloud", slug: "gcp", category: "Cloud", status: "operational", statusUrl: "https://status.cloud.google.com" },
  { name: "Microsoft Azure", slug: "azure", category: "Cloud", status: "operational", statusUrl: "https://status.azure.com" },
  { name: "GitHub", slug: "github", category: "Developer", status: "operational", statusUrl: "https://githubstatus.com" },
  { name: "Vercel", slug: "vercel", category: "Developer", status: "operational", statusUrl: "https://www.vercel-status.com" },
  { name: "Cloudflare", slug: "cloudflare", category: "Infrastructure", status: "operational", statusUrl: "https://www.cloudflarestatus.com" },
  { name: "Stripe", slug: "stripe", category: "Payments", status: "operational", statusUrl: "https://status.stripe.com" },
  { name: "Supabase", slug: "supabase", category: "Developer", status: "operational", statusUrl: "https://status.supabase.com" },
]

const statusDot: Record<ProviderStatus, string> = {
  operational: "bg-green-500",
  degraded: "bg-yellow-500",
  outage: "bg-red-500",
  maintenance: "bg-blue-500",
}

const statusLabel: Record<ProviderStatus, string> = {
  operational: "Operational",
  degraded: "Degraded",
  outage: "Outage",
  maintenance: "Maintenance",
}

const statusBadgeVariant: Record<ProviderStatus, "success" | "warning" | "destructive" | "info"> = {
  operational: "success",
  degraded: "warning",
  outage: "destructive",
  maintenance: "info",
}

const categories = ["AI", "Cloud", "Developer", "Infrastructure", "Payments"]

export default function StatusPage() {
  const grouped = categories.reduce<Record<string, typeof providers>>((acc, cat) => {
    acc[cat] = providers.filter((p) => p.category === cat)
    return acc
  }, {})

  const allOperational = providers.every((p) => p.status === "operational")

  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-4 w-4 text-zinc-400" />
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">Status</span>
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Technology Status</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Current operational status of major technology providers.</p>
      </div>

      {/* Overall status banner */}
      <div className={`flex items-center gap-3 p-4 rounded-xl mb-8 border ${allOperational ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800" : "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800"}`}>
        <div className={`h-3 w-3 rounded-full ${allOperational ? "bg-green-500" : "bg-yellow-500"}`} />
        <span className={`font-medium text-sm ${allOperational ? "text-green-800 dark:text-green-300" : "text-yellow-800 dark:text-yellow-300"}`}>
          {allOperational ? "All monitored services are operational." : "Some services are experiencing issues."}
        </span>
        <span className="text-xs text-zinc-400 ml-auto flex items-center gap-1"><Clock className="h-3 w-3" />Updated now</span>
      </div>

      <div className="space-y-8">
        {Object.entries(grouped).filter(([, items]) => items.length > 0).map(([category, items]) => (
          <section key={category}>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-3">{category}</h2>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden divide-y divide-zinc-200 dark:divide-zinc-800">
              {items.map((p) => (
                <div key={p.slug} className="flex items-center gap-4 px-4 py-3 bg-white dark:bg-zinc-900">
                  <div className="flex items-center gap-2 flex-1">
                    <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${statusDot[p.status]}`} />
                    <span className="font-medium text-sm text-zinc-900 dark:text-white">{p.name}</span>
                  </div>
                  <Badge variant={statusBadgeVariant[p.status]} className="text-xs">{statusLabel[p.status]}</Badge>
                  <a href={p.statusUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                    <ExternalLink className="h-3 w-3" />Official
                  </a>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-8 text-xs text-zinc-400">
        Status information is sourced from official provider status pages. NeuGravity does not independently monitor uptime. Always check the official status page for the most accurate information.
      </p>
    </div>
  )
}
