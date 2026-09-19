export const revalidate = 300

import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Wrench, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Tools",
  description: "Discover and compare developer tools, SaaS products, and software.",
}

const demoTools = [
  { name: "Cursor", slug: "cursor", tagline: "The AI-first code editor", category: "Developer", pricing: "freemium" },
  { name: "Supabase", slug: "supabase", tagline: "The open source Firebase alternative", category: "Database", pricing: "freemium" },
  { name: "Vercel", slug: "vercel", tagline: "Deploy web applications instantly", category: "Platform", pricing: "freemium" },
  { name: "Linear", slug: "linear", tagline: "Issue tracking for modern software teams", category: "Productivity", pricing: "freemium" },
  { name: "GitHub Copilot", slug: "github-copilot", tagline: "Your AI pair programmer", category: "AI", pricing: "subscription" },
  { name: "Cloudflare", slug: "cloudflare", tagline: "Build and secure applications globally", category: "Infrastructure", pricing: "freemium" },
  { name: "Notion", slug: "notion", tagline: "All-in-one workspace for notes and projects", category: "Productivity", pricing: "freemium" },
  { name: "Figma", slug: "figma", tagline: "Collaborative interface design tool", category: "Design", pricing: "freemium" },
  { name: "Postman", slug: "postman", tagline: "API platform for building and testing APIs", category: "Developer", pricing: "freemium" },
  { name: "Stripe", slug: "stripe", tagline: "Payment infrastructure for the internet", category: "Payments", pricing: "usage_based" },
  { name: "Tailwind CSS", slug: "tailwindcss", tagline: "A utility-first CSS framework", category: "Developer", pricing: "free" },
  { name: "Prisma", slug: "prisma", tagline: "Next-generation ORM for Node.js and TypeScript", category: "Database", pricing: "freemium" },
]

const filters = ["All", "SaaS", "Open Source", "Free", "Enterprise"]

const pricingVariant: Record<string, "success" | "info" | "secondary" | "outline"> = {
  free: "success",
  freemium: "info",
  subscription: "secondary",
  usage_based: "outline",
}

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <Wrench className="h-4 w-4 text-zinc-400" />
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">Tools</span>
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Tool Explorer</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Discover, evaluate, and compare developer tools and software.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {filters.map((f) => (
          <button
            key={f}
            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
              f === "All"
                ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white"
                : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {demoTools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="group flex flex-col gap-3 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm font-bold text-zinc-600 dark:text-zinc-400">
                {tool.name.charAt(0)}
              </div>
              <Badge variant={pricingVariant[tool.pricing] ?? "secondary"} className="text-xs capitalize">
                {tool.pricing.replace("_", " ")}
              </Badge>
            </div>
            <div>
              <h2 className="font-semibold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {tool.name}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{tool.tagline}</p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">{tool.category}</span>
              <span className="text-xs text-zinc-400 flex items-center gap-1 group-hover:text-blue-500 transition-colors">
                View <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
