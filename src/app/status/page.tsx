import type { Metadata } from "next"
import { Badge } from "@/components/ui/badge"
import { Shield, ExternalLink, Clock, AlertTriangle } from "lucide-react"
import { StatusService } from "@/lib/services/status.service"
import { formatDistanceToNow } from "date-fns"

export const revalidate = 120

export const metadata: Metadata = {
  title: "Technology Status",
  description: "Current operational status of major technology providers.",
}

const DEMO_PROVIDERS = [
  { name: "OpenAI", category: "AI", statusUrl: "https://status.openai.com" },
  { name: "Anthropic", category: "AI", statusUrl: "https://status.anthropic.com" },
  { name: "Amazon Web Services", category: "Cloud", statusUrl: "https://health.aws.amazon.com" },
  { name: "Google Cloud", category: "Cloud", statusUrl: "https://status.cloud.google.com" },
  { name: "Microsoft Azure", category: "Cloud", statusUrl: "https://status.azure.com" },
  { name: "GitHub", category: "Developer", statusUrl: "https://githubstatus.com" },
  { name: "Vercel", category: "Developer", statusUrl: "https://www.vercel-status.com" },
  { name: "Cloudflare", category: "Infrastructure", statusUrl: "https://www.cloudflarestatus.com" },
  { name: "Stripe", category: "Payments", statusUrl: "https://status.stripe.com" },
  { name: "Supabase", category: "Developer", statusUrl: "https://status.supabase.com" },
]

function severityBadge(severity: string | null) {
  if (severity === "critical") return <Badge variant="destructive">Critical</Badge>
  if (severity === "major") return <Badge variant="warning">Major</Badge>
  return <Badge variant="secondary">Minor</Badge>
}

function statusDot(status: string) {
  if (status === "resolved") return "bg-green-500"
  if (status === "monitoring") return "bg-yellow-400"
  return "bg-red-500"
}

export default async function StatusPage() {
  let activeIncidents: Awaited<ReturnType<typeof StatusService.getActiveIncidents>> = []
  let providers: Awaited<ReturnType<typeof StatusService.getActiveProviders>> = []

  try {
    ;[activeIncidents, providers] = await Promise.all([
      StatusService.getActiveIncidents(),
      StatusService.getActiveProviders(),
    ])
  } catch {
    // DB not ready — show demo UI
  }

  const allOperational = activeIncidents.length === 0

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
          {allOperational ? "All monitored services are operational." : `${activeIncidents.length} active incident${activeIncidents.length !== 1 ? "s" : ""} detected.`}
        </span>
        <span className="text-xs text-zinc-400 ml-auto flex items-center gap-1">
          <Clock className="h-3 w-3" />Updated {formatDistanceToNow(new Date(), { addSuffix: true })}
        </span>
      </div>

      {/* Active incidents */}
      {activeIncidents.length > 0 && (
        <div className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />Active Incidents
          </h2>
          <div className="space-y-4">
            {activeIncidents.map((incident) => (
              <div key={incident.id} className="rounded-xl border border-yellow-200 dark:border-yellow-800 overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20">
                  <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${statusDot(incident.status)}`} />
                  <div className="flex-1">
                    <span className="font-medium text-sm text-zinc-900 dark:text-white">{incident.title}</span>
                    <span className="ml-2 text-xs text-zinc-400">{incident.provider?.name}</span>
                  </div>
                  {severityBadge(incident.severity)}
                  {incident.source_url && (
                    <a href={incident.source_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                      <ExternalLink className="h-3 w-3" />Details
                    </a>
                  )}
                </div>
                {incident.updates.length > 0 && (
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {incident.updates.slice(0, 3).map((update) => (
                      <div key={update.id} className="px-4 py-2.5 bg-white dark:bg-zinc-900">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs capitalize">{update.status}</Badge>
                          {update.published_at && (
                            <span className="text-xs text-zinc-400">
                              {formatDistanceToNow(new Date(update.published_at), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-300">{update.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Provider list */}
      {providers.length > 0 ? (
        <div className="space-y-8">
          {Object.entries(
            providers.reduce<Record<string, typeof providers>>((acc, p) => {
              const cat = (p as any).category ?? "Other"
              acc[cat] = [...(acc[cat] ?? []), p]
              return acc
            }, {})
          ).map(([category, items]) => (
            <section key={category}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-3">{category}</h2>
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden divide-y divide-zinc-200 dark:divide-zinc-800">
                {items.map((p) => {
                  const hasIncident = activeIncidents.some((i) => i.provider_id === p.id)
                  return (
                    <div key={p.id} className="flex items-center gap-4 px-4 py-3 bg-white dark:bg-zinc-900">
                      <div className="flex items-center gap-2 flex-1">
                        <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${hasIncident ? "bg-yellow-500" : "bg-green-500"}`} />
                        <span className="font-medium text-sm text-zinc-900 dark:text-white">{p.name}</span>
                      </div>
                      <Badge variant={hasIncident ? "warning" : "success"} className="text-xs">
                        {hasIncident ? "Incident" : "Operational"}
                      </Badge>
                      {p.official_status_url && (
                        <a href={p.official_status_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                          <ExternalLink className="h-3 w-3" />Official
                        </a>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      ) : (
        // Fallback demo when DB has no providers yet
        <div className="space-y-8">
          {Object.entries(
            DEMO_PROVIDERS.reduce<Record<string, typeof DEMO_PROVIDERS>>((acc, p) => {
              acc[p.category] = [...(acc[p.category] ?? []), p]
              return acc
            }, {})
          ).map(([category, items]) => (
            <section key={category}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-3">{category}</h2>
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden divide-y divide-zinc-200 dark:divide-zinc-800">
                {items.map((p) => (
                  <div key={p.name} className="flex items-center gap-4 px-4 py-3 bg-white dark:bg-zinc-900">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="h-2.5 w-2.5 rounded-full shrink-0 bg-green-500" />
                      <span className="font-medium text-sm text-zinc-900 dark:text-white">{p.name}</span>
                    </div>
                    <Badge variant="success" className="text-xs">Operational</Badge>
                    <a href={p.statusUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                      <ExternalLink className="h-3 w-3" />Official
                    </a>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <p className="mt-8 text-xs text-zinc-400">
        Status information is sourced from official provider status pages. NeuGravity does not independently monitor uptime. Always check the official status page for the most accurate information.
      </p>
    </div>
  )
}
