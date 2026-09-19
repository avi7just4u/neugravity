import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Newspaper, Clock, TrendingUp } from "lucide-react"

export const metadata: Metadata = {
  title: "Technology News",
  description: "Curated, sourced, and contextualized technology news.",
}

const demoNews = [
  { headline: "Anthropic releases Claude's Model Context Protocol as open standard", slug: "anthropic-mcp-open-standard", summary: "MCP enables AI models to securely connect with external tools and data sources through a standardized interface, opening new possibilities for AI application development.", category: "AI", publishedAt: "2 hours ago", importance: 9 },
  { headline: "OpenAI announces real-time voice API for developers", slug: "openai-realtime-voice-api", summary: "The new API enables low-latency speech-to-speech interactions, creating new possibilities for voice-enabled AI applications.", category: "AI", publishedAt: "5 hours ago", importance: 8 },
  { headline: "Google introduces Gemini 2.0 with native multimodal output", slug: "google-gemini-2-multimodal", summary: "Gemini 2.0 brings native audio and image generation alongside improved reasoning for complex tasks.", category: "AI", publishedAt: "1 day ago", importance: 8 },
  { headline: "Vercel releases v0 generative UI for React component creation", slug: "vercel-v0-generative-ui", summary: "v0 allows developers to generate production-ready React components from natural language prompts.", category: "Developer", publishedAt: "2 days ago", importance: 7 },
  { headline: "Cloudflare launches AI Gateway for LLM observability", slug: "cloudflare-ai-gateway", summary: "The new service provides unified logging, caching, and rate limiting across multiple AI providers.", category: "Cloud", publishedAt: "3 days ago", importance: 7 },
  { headline: "GitHub Copilot adds multi-file editing and workspace agent", slug: "github-copilot-workspace", summary: "Copilot Workspace enables AI-driven planning and implementation across entire repositories.", category: "Developer", publishedAt: "4 days ago", importance: 7 },
  { headline: "Amazon Web Services expands Bedrock with new foundation models", slug: "aws-bedrock-expansion", summary: "AWS adds several new models to Bedrock, including models from Mistral AI and Meta.", category: "Cloud", publishedAt: "5 days ago", importance: 6 },
  { headline: "Rust surpasses C++ in Linux kernel contributions for the first time", slug: "rust-linux-kernel-contributions", summary: "The Rust programming language has seen a significant increase in upstream Linux kernel patches.", category: "Developer", publishedAt: "1 week ago", importance: 6 },
]

const categories = ["All", "AI", "Cloud", "Developer", "Enterprise", "Security"]
const trendingTopics = ["Model Context Protocol", "AI Agents", "Serverless", "Rust", "LLMs", "WebAssembly"]

export default function NewsPage() {
  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Newspaper className="h-4 w-4 text-zinc-400" />
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">News</span>
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Technology News</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Curated, sourced, and contextualized technology news.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((c) => (
          <button key={c} className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${c === "All" ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white" : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 hover:text-zinc-900 dark:hover:text-white"}`}>{c}</button>
        ))}
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {demoNews.map((item, i) => (
              <Link key={item.slug} href={`/news/${item.slug}`} className="group flex flex-col gap-2 py-5 first:pt-0">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">{item.category}</Badge>
                  {item.importance >= 9 && <Badge variant="brand" className="text-xs">Breaking</Badge>}
                  <span className="text-xs text-zinc-400 ml-auto flex items-center gap-1"><Clock className="h-3 w-3" />{item.publishedAt}</span>
                </div>
                <h2 className={`font-semibold text-zinc-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ${i === 0 ? "text-xl" : "text-base"}`}>{item.headline}</h2>
                {(i < 3) && <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">{item.summary}</p>}
                <p className="text-xs text-zinc-400">Source attribution available on article page.</p>
              </Link>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-zinc-400" />
              <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">Trending Topics</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {trendingTopics.map((t) => (
                <Link key={t} href={`/search?q=${encodeURIComponent(t)}`} className="px-2.5 py-1 text-xs rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">{t}</Link>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <h3 className="font-semibold text-sm text-zinc-900 dark:text-white mb-3">Newsletter</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">Get technology news in your inbox weekly.</p>
            <form action="/api/newsletter/subscribe" method="POST" className="space-y-2">
              <input type="email" name="email" placeholder="Your email" required className="w-full h-8 px-3 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400" />
              <button type="submit" className="w-full h-8 text-xs font-medium bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-md hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors">Subscribe</button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  )
}
