import type { StatusConnector } from "./types"
import { StatuspageConnector } from "./statuspage.connector"
import { AWSHealthConnector } from "./aws.connector"
import { GoogleCloudConnector } from "./gcp.connector"

export type { StatusConnector, StatusConnectorResult, StatusConnectorIncident, StatusConnectorUpdate } from "./types"

// Providers using the standard Statuspage.io API
const STATUSPAGE_PROVIDERS: Record<string, { base_url: string; name: string }> = {
  openai: { base_url: "https://status.openai.com", name: "OpenAI" },
  anthropic: { base_url: "https://status.anthropic.com", name: "Anthropic" },
  github: { base_url: "https://githubstatus.com", name: "GitHub" },
  cloudflare: { base_url: "https://www.cloudflarestatus.com", name: "Cloudflare" },
  azure: { base_url: "https://azure.status.microsoft", name: "Azure" },
  vercel: { base_url: "https://www.vercel-status.com", name: "Vercel" },
  stripe: { base_url: "https://status.stripe.com", name: "Stripe" },
  supabase: { base_url: "https://status.supabase.com", name: "Supabase" },
}

export const SUPPORTED_PROVIDER_SLUGS = [
  "openai", "anthropic", "github", "cloudflare", "azure", "vercel", "aws", "gcp", "stripe", "supabase",
]

export function getStatusConnector(slug: string): StatusConnector | null {
  const sp = STATUSPAGE_PROVIDERS[slug.toLowerCase()]
  if (sp) {
    return new StatuspageConnector({ provider_id: slug, base_url: sp.base_url, name: sp.name })
  }
  if (slug === "aws" || slug === "amazon-web-services") return new AWSHealthConnector(slug)
  if (slug === "gcp" || slug === "google-cloud") return new GoogleCloudConnector(slug)
  return null
}
