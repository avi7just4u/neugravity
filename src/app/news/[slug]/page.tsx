import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Clock, ChevronRight, ExternalLink } from "lucide-react"

function toTitleCase(s: string) { return s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) }

const newsData: Record<string, { headline: string; category: string; publishedAt: string; summary: string; whatHappened: string; whyItMatters: string; whatToKnow: string; sources: { name: string; url: string }[]; tags: string[] }> = {
  "anthropic-mcp-open-standard": {
    headline: "Anthropic releases Claude's Model Context Protocol as open standard",
    category: "AI", publishedAt: "September 19, 2026",
    summary: "Anthropic has open-sourced the Model Context Protocol (MCP), a standard that allows AI models to securely connect with external tools and data sources.",
    whatHappened: "Anthropic released the Model Context Protocol (MCP) as an open standard. MCP provides a standardized interface for AI models to interact with external data sources, tools, and services. The protocol handles authentication, data retrieval, and tool execution in a consistent way across different AI systems.",
    whyItMatters: "Standardizing how AI connects to external tools is a significant step toward interoperability in the AI ecosystem. Rather than each AI provider building proprietary integrations, MCP allows any AI model to connect with any MCP-compatible tool. This could dramatically accelerate the development of AI-powered applications.",
    whatToKnow: "MCP is now available as an open specification. Early adopters include developer tools companies building MCP server implementations. The protocol is already available in Claude desktop applications and the Claude API.",
    sources: [{ name: "Anthropic Blog", url: "https://anthropic.com/news" }],
    tags: ["AI", "MCP", "Open Source", "Anthropic", "Standards"],
  },
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const item = newsData[slug]
  return { title: item?.headline ?? toTitleCase(slug), description: item?.summary }
}

export function generateStaticParams() { return [] }

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const item = newsData[slug]
  const headline = item?.headline ?? toTitleCase(slug)

  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex items-center gap-1.5 text-sm text-zinc-400 mb-8" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/news" className="hover:text-zinc-900 dark:hover:text-white transition-colors">News</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-zinc-600 dark:text-zinc-300 truncate max-w-xs">{headline}</span>
      </nav>

      <div className="grid lg:grid-cols-3 gap-10">
        <article className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary">{item?.category ?? "News"}</Badge>
              <span className="text-xs text-zinc-400 flex items-center gap-1"><Clock className="h-3 w-3" />{item?.publishedAt ?? "Recent"}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white leading-tight mb-3">{headline}</h1>
            {item?.summary && <p className="text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed border-l-2 border-zinc-200 dark:border-zinc-700 pl-4">{item.summary}</p>}
          </div>

          {item ? (
            <div className="space-y-6">
              <section>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-2">What Happened</h2>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">{item.whatHappened}</p>
              </section>
              <section>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-2">Why It Matters</h2>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">{item.whyItMatters}</p>
              </section>
              <section>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-2">What You Should Know</h2>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">{item.whatToKnow}</p>
              </section>

              {item.sources.length > 0 && (
                <section className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">Sources</h2>
                  <div className="space-y-1">
                    {item.sources.map((s) => (
                      <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        <ExternalLink className="h-3.5 w-3.5" />{s.name}
                      </a>
                    ))}
                  </div>
                  <p className="text-xs text-zinc-400 mt-2">NeuGravity does not reproduce source article text. We create original summaries and commentary. Always refer to primary sources.</p>
                </section>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                {item.tags.map((t) => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
              <p className="text-zinc-500 dark:text-zinc-400">Full article details coming soon.</p>
            </div>
          )}
        </article>

        <aside className="space-y-5">
          <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <h3 className="font-semibold text-sm text-zinc-900 dark:text-white mb-3">Related News</h3>
            <p className="text-xs text-zinc-400">Related stories coming soon.</p>
          </div>
          <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <h3 className="font-semibold text-sm text-zinc-900 dark:text-white mb-3">Related Technologies</h3>
            <p className="text-xs text-zinc-400">Technologies mentioned in this story will appear here.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
