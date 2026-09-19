import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Clock, ChevronRight, ExternalLink } from "lucide-react"

function toTitleCase(s: string) { return s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) }

const articleData: Record<string, { title: string; excerpt: string; category: string; author: string; readingTime: number; publishedAt: string; body: string; tags: string[]; sources: { name: string; url: string }[] }> = {
  "how-rag-works": {
    title: "How RAG (Retrieval-Augmented Generation) Actually Works",
    excerpt: "RAG is one of the most important patterns in modern AI application development.",
    category: "AI", author: "NeuGravity Editorial", readingTime: 8, publishedAt: "September 12, 2026",
    body: `Retrieval-Augmented Generation (RAG) is a technique that combines information retrieval with language model generation to produce more accurate and grounded responses.

## The Problem RAG Solves

Large language models are trained on data up to a certain cutoff date, and they cannot access proprietary or real-time information. This creates a gap between what the model knows and what it needs to know to be useful in production applications.

## How RAG Works

A RAG system consists of two main components: a retriever and a generator.

**The Retriever** takes a user query, converts it into a vector embedding, and searches a vector database for semantically similar documents. The top-k results are returned as context.

**The Generator** (the language model) receives both the original query and the retrieved documents as input and generates a response grounded in the retrieved context.

## The Embedding Pipeline

Before retrieval can happen, your documents must be indexed. This involves:

1. Chunking documents into meaningful segments
2. Generating vector embeddings for each chunk using an embedding model
3. Storing those vectors in a vector database such as Pinecone, Weaviate, or pgvector

## When to Use RAG

RAG is the right choice when your application needs access to:
- Proprietary company knowledge
- Real-time or frequently updated data
- Large document collections that exceed context window limits`,
    tags: ["AI", "RAG", "LLMs", "Vector Databases"],
    sources: [{ name: "Lewis et al. (2020) — Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks", url: "https://arxiv.org/abs/2005.11401" }],
  },
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = articleData[slug]
  return { title: article?.title ?? toTitleCase(slug), description: article?.excerpt }
}

export function generateStaticParams() { return [] }

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = articleData[slug]
  const title = article?.title ?? toTitleCase(slug)

  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex items-center gap-1.5 text-sm text-zinc-400 mb-8" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/articles" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Articles</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-zinc-600 dark:text-zinc-300 truncate max-w-xs">{title}</span>
      </nav>

      <div className="grid lg:grid-cols-4 gap-10">
        <article className="lg:col-span-3">
          <header className="mb-8">
            <Badge variant="secondary" className="mb-3">{article?.category ?? "Article"}</Badge>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white leading-tight mb-4">{title}</h1>
            {article?.excerpt && <p className="text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">{article.excerpt}</p>}
            <div className="flex items-center gap-4 text-sm text-zinc-400 pb-6 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-400">
                  {(article?.author ?? "N").charAt(0)}
                </div>
                <span>{article?.author ?? "NeuGravity"}</span>
              </div>
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{article?.readingTime ?? "?"} min read</span>
              <span>{article?.publishedAt ?? "Recent"}</span>
            </div>
          </header>

          {article?.body ? (
            <div className="prose prose-zinc dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-blue-600 dark:prose-a:text-blue-400">
              {article.body.split("\n\n").map((para, i) => {
                if (para.startsWith("## ")) return <h2 key={i} className="text-xl font-semibold text-zinc-900 dark:text-white mt-8 mb-3">{para.slice(3)}</h2>
                if (para.startsWith("**") && para.includes("**")) {
                  return <p key={i} className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: para.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
                }
                if (para.startsWith("1. ") || para.startsWith("- ")) {
                  return <div key={i} className="mb-4"><ul className="list-disc list-inside space-y-1 text-zinc-600 dark:text-zinc-300">{para.split("\n").map((l, j) => <li key={j}>{l.replace(/^[\d\-\*]\.\s|^-\s/, "")}</li>)}</ul></div>
                }
                return <p key={i} className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">{para}</p>
              })}
            </div>
          ) : (
            <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
              <p className="text-zinc-500 dark:text-zinc-400">Full article coming soon.</p>
            </div>
          )}

          {article?.sources && article.sources.length > 0 && (
            <section className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-3">Sources & References</h2>
              {article.sources.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline mb-1">
                  <ExternalLink className="h-3.5 w-3.5 mt-0.5 shrink-0" />{s.name}
                </a>
              ))}
            </section>
          )}

          {article?.tags && (
            <div className="flex flex-wrap gap-2 mt-6">
              {article.tags.map((t) => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
            </div>
          )}
        </article>

        <aside className="space-y-5">
          <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <h3 className="font-semibold text-sm text-zinc-900 dark:text-white mb-3">Related Articles</h3>
            <p className="text-xs text-zinc-400">More articles on this topic coming soon.</p>
          </div>
          <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <h3 className="font-semibold text-sm text-zinc-900 dark:text-white mb-3">Related Courses</h3>
            <p className="text-xs text-zinc-400">Courses covering these topics coming soon.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
