import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Globe, ChevronRight } from "lucide-react"

const techData: Record<string, { name: string; type: string; tagline: string; description: string; website: string; created: number; creator: string; license: string; openSource: boolean }> = {
  kubernetes: { name: "Kubernetes", type: "Platform", tagline: "Production-grade container orchestration", description: "Kubernetes is an open-source container orchestration system for automating deployment, scaling, and management of containerized applications. It groups containers that make up an application into logical units for easy management and discovery.", website: "kubernetes.io", created: 2014, creator: "Google", license: "Apache 2.0", openSource: true },
  python: { name: "Python", type: "Language", tagline: "Simple, readable, powerful programming language", description: "Python is a high-level, general-purpose programming language. Its design philosophy emphasizes code readability with the use of significant indentation. Python is dynamically typed and garbage-collected. It supports multiple programming paradigms, including structured, object-oriented and functional programming.", website: "python.org", created: 1991, creator: "Guido van Rossum", license: "PSF License", openSource: true },
  typescript: { name: "TypeScript", type: "Language", tagline: "JavaScript with syntax for types", description: "TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale. TypeScript adds optional static typing and class-based object-oriented programming to the language.", website: "typescriptlang.org", created: 2012, creator: "Microsoft", license: "Apache 2.0", openSource: true },
  docker: { name: "Docker", type: "Platform", tagline: "Develop, ship, and run applications in containers", description: "Docker is a platform for developing, shipping, and running applications in containers. Containers allow you to package an application with all its dependencies into a standardized unit.", website: "docker.com", created: 2013, creator: "Solomon Hykes", license: "Apache 2.0", openSource: true },
  rust: { name: "Rust", type: "Language", tagline: "A language empowering everyone to build reliable and efficient software", description: "Rust is a multi-paradigm, general-purpose programming language that emphasizes performance, type safety, and concurrency. It enforces memory safety, meaning that all references point to valid memory.", website: "rust-lang.org", created: 2010, creator: "Graydon Hoare / Mozilla", license: "MIT / Apache 2.0", openSource: true },
  postgresql: { name: "PostgreSQL", type: "Database", tagline: "The world's most advanced open-source database", description: "PostgreSQL is a powerful, open-source object-relational database system that uses and extends the SQL language combined with many features that safely store and scale complicated data workloads.", website: "postgresql.org", created: 1996, creator: "Michael Stonebraker", license: "PostgreSQL License", openSource: true },
}

function toTitleCase(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const tech = techData[slug]
  const name = tech?.name ?? toTitleCase(slug)
  return {
    title: name,
    description: tech?.description ?? `Learn about ${name} on NeuGravity.`,
  }
}

export function generateStaticParams() {
  return []
}

export default async function TechDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tech = techData[slug]
  const name = tech?.name ?? toTitleCase(slug)

  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-zinc-400 mb-8" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/tech" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Tech</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-zinc-600 dark:text-zinc-300">{name}</span>
      </nav>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Hero */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary">{tech?.type ?? "Technology"}</Badge>
              {tech?.openSource && <Badge variant="success">Open Source</Badge>}
            </div>
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">{name}</h1>
            {tech?.tagline && <p className="text-lg text-zinc-500 dark:text-zinc-400">{tech.tagline}</p>}
            {tech?.description && <p className="text-zinc-600 dark:text-zinc-300 mt-4 leading-relaxed">{tech.description}</p>}
            {tech?.website && (
              <div className="flex items-center gap-2 mt-4">
                <Button variant="outline" size="sm" asChild>
                  <a href={`https://${tech.website}`} target="_blank" rel="noopener noreferrer" className="gap-1.5">
                    <Globe className="h-3.5 w-3.5" /> {tech.website}
                  </a>
                </Button>
              </div>
            )}
          </div>

          {/* 60-second explanation */}
          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">60-Second Explanation</h2>
            <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                A concise explanation of {name} is being curated. Check back soon.
              </p>
            </div>
          </section>

          {/* Why it exists */}
          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">Why It Exists</h2>
            <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">Context on the origin and motivation behind {name} coming soon.</p>
            </div>
          </section>

          {/* How it works */}
          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">How It Works</h2>
            <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">Technical architecture and working principles coming soon.</p>
            </div>
          </section>

          {/* Related technologies */}
          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">Related Technologies</h2>
            <p className="text-sm text-zinc-400">Related technologies coming soon.</p>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {tech && (
            <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">Key Facts</h3>
              <dl className="space-y-3 text-sm">
                {[
                  { label: "Created", value: tech.created },
                  { label: "Creator", value: tech.creator },
                  { label: "License", value: tech.license },
                  { label: "Open Source", value: tech.openSource ? "Yes" : "No" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <dt className="text-zinc-400 text-xs uppercase tracking-wide">{label}</dt>
                    <dd className="text-zinc-900 dark:text-white font-medium">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-3 text-sm">Latest News</h3>
            <p className="text-xs text-zinc-400">News about {name} coming soon.</p>
          </div>

          <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-3 text-sm">Courses</h3>
            <p className="text-xs text-zinc-400">Courses covering {name} coming soon.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
