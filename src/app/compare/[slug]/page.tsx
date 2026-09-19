import type { Metadata } from "next"
import Link from "next/link"
import { ChevronRight, CheckCircle, XCircle, Clock } from "lucide-react"

function toTitleCase(s: string) { return s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) }
function formatSlug(s: string) { return s.split("-vs-").map(toTitleCase).join(" vs ") }

type DimValue = { chatgpt: string | boolean | null; claude: string | boolean | null }
type Dimension = { label: string; values: DimValue }

const chatgptVsClaude: { entities: string[]; lastUpdated: string; dimensions: Record<string, Dimension[]> } = {
  entities: ["ChatGPT", "Claude"],
  lastUpdated: "September 2026",
  dimensions: {
    Pricing: [
      { label: "Free Tier", values: { chatgpt: true, claude: true } },
      { label: "Pro Plan", values: { chatgpt: "$20/mo", claude: "$20/mo" } },
      { label: "API Access", values: { chatgpt: "OpenAI API", claude: "Anthropic API" } },
    ],
    Capabilities: [
      { label: "Context Window", values: { chatgpt: "128k tokens", claude: "200k tokens" } },
      { label: "Code Generation", values: { chatgpt: "Excellent", claude: "Excellent" } },
      { label: "Vision / Images", values: { chatgpt: true, claude: true } },
      { label: "Web Browsing", values: { chatgpt: true, claude: false } },
      { label: "Image Generation", values: { chatgpt: true, claude: false } },
    ],
    "Developer Features": [
      { label: "API Available", values: { chatgpt: true, claude: true } },
      { label: "Function Calling", values: { chatgpt: true, claude: true } },
      { label: "JSON Mode", values: { chatgpt: true, claude: true } },
      { label: "Streaming", values: { chatgpt: true, claude: true } },
    ],
  },
}

function renderValue(val: string | boolean | null) {
  if (val === true) return <CheckCircle className="h-4 w-4 text-green-500" />
  if (val === false) return <XCircle className="h-4 w-4 text-zinc-300 dark:text-zinc-600" />
  if (val === null) return <span className="text-zinc-400 text-xs">—</span>
  return <span className="text-sm text-zinc-700 dark:text-zinc-300">{val}</span>
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const title = formatSlug(slug)
  return { title, description: `Compare ${title} — features, pricing, and capabilities.` }
}

export function generateStaticParams() { return [] }

export default async function CompareDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const title = formatSlug(slug)
  const data = slug === "chatgpt-vs-claude" ? chatgptVsClaude : null

  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex items-center gap-1.5 text-sm text-zinc-400 mb-8" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/compare" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Compare</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-zinc-600 dark:text-zinc-300">{title}</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">{title}</h1>
        {data && (
          <p className="text-sm text-zinc-400 flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Last verified: {data.lastUpdated}</p>
        )}
        <p className="text-xs text-zinc-400 mt-1">All data sourced from official documentation and verified periodically.</p>
      </div>

      {data ? (
        <div className="space-y-8">
          {Object.entries(data.dimensions).map(([category, dims]) => (
            <section key={category}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-3">{category}</h2>
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                      <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400 w-1/3">Feature</th>
                      {data.entities.map((e) => (
                        <th key={e} className="text-center px-4 py-3 font-semibold text-zinc-900 dark:text-white">{e}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
                    {dims.map((dim) => (
                      <tr key={dim.label}>
                        <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{dim.label}</td>
                        <td className="px-4 py-3 text-center">{renderValue(dim.values.chatgpt)}</td>
                        <td className="px-4 py-3 text-center">{renderValue(dim.values.claude)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}

          <section className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
            <h2 className="font-semibold text-zinc-900 dark:text-white mb-2">Verdict</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">Both ChatGPT and Claude are excellent AI assistants with different strengths. ChatGPT excels at real-time web browsing and image generation; Claude offers a larger context window and strong reasoning for long documents. Your choice depends on specific use case requirements.</p>
            <p className="text-xs text-zinc-400 mt-2">NeuGravity editorial. Updated {data.lastUpdated}.</p>
          </section>
        </div>
      ) : (
        <div className="p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-center">
          <p className="text-zinc-500 dark:text-zinc-400 mb-1">Comparison data for <strong>{title}</strong> is being compiled.</p>
          <p className="text-sm text-zinc-400">All comparison data is verified from official sources before publication.</p>
        </div>
      )}
    </div>
  )
}
