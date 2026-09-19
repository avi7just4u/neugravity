import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Articles",
  description: "In-depth technology articles, explainers, and analysis.",
}

const demoArticles = [
  { title: "How RAG (Retrieval-Augmented Generation) Actually Works", slug: "how-rag-works", excerpt: "RAG is one of the most important patterns in modern AI application development. This article explains the architecture, when to use it, and the tradeoffs.", category: "AI", author: "NeuGravity", readingTime: 8, publishedAt: "1 week ago", featured: true },
  { title: "Understanding the CAP Theorem", slug: "understanding-cap-theorem", excerpt: "The CAP theorem is fundamental to distributed systems design. We break down what it means and how it affects your database choices.", category: "Systems", author: "NeuGravity", readingTime: 6, publishedAt: "2 weeks ago", featured: false },
  { title: "The Architecture of Large Language Models", slug: "architecture-large-language-models", excerpt: "A technical deep-dive into how transformer-based language models are built, trained, and deployed at scale.", category: "AI", author: "NeuGravity", readingTime: 12, publishedAt: "3 weeks ago", featured: false },
  { title: "Why Rust is Taking Over Systems Programming", slug: "rust-systems-programming", excerpt: "Rust's memory safety guarantees and performance characteristics are making it the language of choice for systems software.", category: "Programming", author: "NeuGravity", readingTime: 7, publishedAt: "1 month ago", featured: false },
  { title: "Kubernetes at Scale: Lessons from Running 10,000 Pods", slug: "kubernetes-at-scale", excerpt: "Operating Kubernetes in production at scale requires understanding networking, resource management, and operational patterns.", category: "Cloud", author: "NeuGravity", readingTime: 10, publishedAt: "1 month ago", featured: false },
]

export default function ArticlesPage() {
  const featured = demoArticles.find((a) => a.featured)
  const rest = demoArticles.filter((a) => !a.featured)

  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-4 w-4 text-zinc-400" />
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">Articles</span>
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Articles</h1>
        <p className="text-zinc-500 dark:text-zinc-400">In-depth technology explainers, analysis, and guides.</p>
      </div>

      {featured && (
        <Link href={`/articles/${featured.slug}`} className="group block mb-10 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md transition-all">
          <Badge variant="brand" className="mb-3 text-xs">Featured</Badge>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">{featured.title}</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-4">{featured.excerpt}</p>
          <div className="flex items-center gap-4 text-xs text-zinc-400">
            <span>{featured.author}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{featured.readingTime} min read</span>
            <span>{featured.publishedAt}</span>
            <span className="ml-auto flex items-center gap-1 group-hover:text-blue-500 transition-colors">Read article <ArrowRight className="h-3 w-3" /></span>
          </div>
        </Link>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rest.map((a) => (
          <Link key={a.slug} href={`/articles/${a.slug}`} className="group flex flex-col gap-3 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all">
            <Badge variant="secondary" className="text-xs w-fit">{a.category}</Badge>
            <div>
              <h2 className="font-semibold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">{a.title}</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">{a.excerpt}</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-400 mt-auto">
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{a.readingTime} min</span>
              <span>{a.publishedAt}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
