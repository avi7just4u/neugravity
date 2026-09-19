import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Globe, ChevronRight, CheckCircle, AlertCircle } from "lucide-react"

const toolData: Record<string, { name: string; tagline: string; description: string; website: string; company: string; category: string; platforms: string[]; pricing: string; hasFreeTier: boolean }> = {
  cursor: { name: "Cursor", tagline: "The AI-first code editor", description: "Cursor is an AI-powered code editor built on top of VS Code. It features deep AI integration including AI-assisted code generation, explanation, and refactoring — right inside your editor.", website: "cursor.com", company: "Anysphere", category: "Developer Tools", platforms: ["macOS", "Windows", "Linux"], pricing: "freemium", hasFreeTier: true },
  supabase: { name: "Supabase", tagline: "The open source Firebase alternative", description: "Supabase is an open-source Firebase alternative. Start your project with a Postgres database, authentication, instant APIs, edge functions, realtime subscriptions, and storage.", website: "supabase.com", company: "Supabase Inc.", category: "Database & Backend", platforms: ["Web", "iOS", "Android"], pricing: "freemium", hasFreeTier: true },
  vercel: { name: "Vercel", tagline: "Deploy web applications instantly", description: "Vercel is a cloud platform for static sites and Serverless Functions. It enables developers to host websites and web services that deploy instantly, scale automatically, and require no supervision.", website: "vercel.com", company: "Vercel Inc.", category: "Platform", platforms: ["Web"], pricing: "freemium", hasFreeTier: true },
  notion: { name: "Notion", tagline: "All-in-one workspace for notes and projects", description: "Notion is a productivity and note-taking web application that offers organizational tools including task management, project tracking, to-do lists, bookmarking, and more.", website: "notion.so", company: "Notion Labs", category: "Productivity", platforms: ["Web", "macOS", "Windows", "iOS", "Android"], pricing: "freemium", hasFreeTier: true },
}

function toTitleCase(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const tool = toolData[slug]
  const name = tool?.name ?? toTitleCase(slug)
  return { title: name, description: tool?.description ?? `Discover ${name} on NeuGravity.` }
}

export function generateStaticParams() { return [] }

export default async function ToolDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tool = toolData[slug]
  const name = tool?.name ?? toTitleCase(slug)

  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex items-center gap-1.5 text-sm text-zinc-400 mb-8" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/tools" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Tools</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-zinc-600 dark:text-zinc-300">{name}</span>
      </nav>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xl font-bold text-zinc-600 dark:text-zinc-300">
                {name.charAt(0)}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">{name}</h1>
                {tool?.tagline && <p className="text-zinc-500 dark:text-zinc-400">{tool.tagline}</p>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary">{tool?.category ?? "Tool"}</Badge>
              {tool?.hasFreeTier && <Badge variant="success">Free Tier</Badge>}
              <Badge variant="outline" className="capitalize">{tool?.pricing ?? "See website"}</Badge>
            </div>
            {tool?.website && (
              <Button variant="outline" size="sm" asChild>
                <a href={`https://${tool.website}`} target="_blank" rel="noopener noreferrer" className="gap-1.5">
                  <Globe className="h-3.5 w-3.5" /> {tool.website}
                </a>
              </Button>
            )}
          </div>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">Overview</h2>
            <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">{tool?.description ?? `${name} is a powerful tool. Full details coming soon.`}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">Key Features</h2>
            <div className="space-y-2">
              {["Feature details are being verified and compiled.", "Check the official website for the most current capabilities.", "Comparisons with alternatives coming soon."].map((f) => (
                <div key={f} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <CheckCircle className="h-4 w-4 text-zinc-300 mt-0.5 shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">Pricing</h2>
            <div className="p-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 flex items-start gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-amber-800 dark:text-amber-300">
                Pricing information is sourced from official sources and verified periodically. Always confirm current pricing on the official website.
              </p>
            </div>
            <div className="mt-4 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Structured pricing details coming soon.</p>
              {tool?.website && (
                <a href={`https://${tool.website}/pricing`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2 block">
                  View pricing on {tool.website} →
                </a>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          {tool && (
            <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-4 text-sm">Details</h3>
              <dl className="space-y-3 text-sm">
                <div><dt className="text-xs text-zinc-400 uppercase tracking-wide">Company</dt><dd className="text-zinc-900 dark:text-white font-medium">{tool.company}</dd></div>
                <div><dt className="text-xs text-zinc-400 uppercase tracking-wide">Category</dt><dd className="text-zinc-900 dark:text-white font-medium">{tool.category}</dd></div>
                <div><dt className="text-xs text-zinc-400 uppercase tracking-wide">Platforms</dt><dd className="text-zinc-900 dark:text-white font-medium">{tool.platforms.join(", ")}</dd></div>
                <div><dt className="text-xs text-zinc-400 uppercase tracking-wide">Pricing Model</dt><dd className="text-zinc-900 dark:text-white font-medium capitalize">{tool.pricing.replace("_", " ")}</dd></div>
              </dl>
            </div>
          )}
          <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-3 text-sm">Alternatives</h3>
            <p className="text-xs text-zinc-400">Alternative tools coming soon.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
