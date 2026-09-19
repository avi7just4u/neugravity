import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Globe, ChevronRight } from "lucide-react"

const companyData: Record<string, { name: string; description: string; longDescription: string; website: string; founded: number; hq: string; type: string; products: string[]; techStack: string[] }> = {
  openai: { name: "OpenAI", description: "AI research and deployment company.", longDescription: "OpenAI is an AI research and deployment company. Its mission is to ensure that artificial general intelligence benefits all of humanity. OpenAI develops and maintains large-scale AI models including GPT-4, DALL-E, Whisper, and the ChatGPT product.", website: "openai.com", founded: 2015, hq: "San Francisco, CA", type: "Private", products: ["ChatGPT", "GPT-4 API", "DALL-E", "Whisper", "Sora"], techStack: ["Python", "PyTorch", "Kubernetes", "Azure"] },
  anthropic: { name: "Anthropic", description: "AI safety company and creator of Claude.", longDescription: "Anthropic is an AI safety company working to build reliable, interpretable, and steerable AI systems. Founded by former OpenAI researchers, Anthropic created Claude — a family of AI assistants built with a focus on safety and helpfulness.", website: "anthropic.com", founded: 2021, hq: "San Francisco, CA", type: "Private", products: ["Claude", "Claude API"], techStack: ["Python", "JAX", "AWS"] },
  vercel: { name: "Vercel", description: "Cloud platform for frontend developers.", longDescription: "Vercel is a cloud platform enabling developers to deploy and host web applications with a focus on developer experience, performance, and scale. Vercel created and maintains Next.js, the leading React framework.", website: "vercel.com", founded: 2015, hq: "San Francisco, CA", type: "Private", products: ["Vercel Platform", "Next.js", "v0", "Vercel AI SDK"], techStack: ["Next.js", "Go", "Rust", "Turborepo"] },
  cloudflare: { name: "Cloudflare", description: "Network security and performance company.", longDescription: "Cloudflare operates one of the largest networks in the world. It provides a broad range of network services including CDN, DDoS protection, DNS, and a developer platform for building globally distributed applications.", website: "cloudflare.com", founded: 2009, hq: "San Francisco, CA", type: "Public", products: ["Cloudflare CDN", "Workers", "Pages", "R2", "D1", "Zero Trust"], techStack: ["Rust", "C++", "Go", "JavaScript"] },
}

function toTitleCase(s: string) { return s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const co = companyData[slug]
  const name = co?.name ?? toTitleCase(slug)
  return { title: name, description: co?.description }
}

export function generateStaticParams() { return [] }

export default async function CompanyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const co = companyData[slug]
  const name = co?.name ?? toTitleCase(slug)

  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex items-center gap-1.5 text-sm text-zinc-400 mb-8" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/companies" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Companies</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-zinc-600 dark:text-zinc-300">{name}</span>
      </nav>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xl font-bold text-zinc-600 dark:text-zinc-300">{name.charAt(0)}</div>
              <div>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">{name}</h1>
                {co && <Badge variant={co.type === "Public" ? "info" : "secondary"}>{co.type}</Badge>}
              </div>
            </div>
            <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">{co?.longDescription ?? `${name} company profile coming soon.`}</p>
            {co?.website && (
              <Button variant="outline" size="sm" asChild>
                <a href={`https://${co.website}`} target="_blank" rel="noopener noreferrer" className="gap-1.5"><Globe className="h-3.5 w-3.5" /> {co.website}</a>
              </Button>
            )}
          </div>

          {co?.products && (
            <section>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">Products</h2>
              <div className="flex flex-wrap gap-2">{co.products.map((p) => <Badge key={p} variant="outline">{p}</Badge>)}</div>
            </section>
          )}

          {co?.techStack && (
            <section>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">Technology Stack</h2>
              <div className="flex flex-wrap gap-2">{co.techStack.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}</div>
            </section>
          )}

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">Latest News</h2>
            <p className="text-sm text-zinc-400">News about {name} coming soon.</p>
          </section>
        </div>

        <aside>
          {co && (
            <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-20">
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-4 text-sm">Company Info</h3>
              <dl className="space-y-3 text-sm">
                <div><dt className="text-xs text-zinc-400 uppercase tracking-wide">Founded</dt><dd className="font-medium text-zinc-900 dark:text-white">{co.founded}</dd></div>
                <div><dt className="text-xs text-zinc-400 uppercase tracking-wide">Headquarters</dt><dd className="font-medium text-zinc-900 dark:text-white">{co.hq}</dd></div>
                <div><dt className="text-xs text-zinc-400 uppercase tracking-wide">Type</dt><dd className="font-medium text-zinc-900 dark:text-white">{co.type}</dd></div>
              </dl>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
