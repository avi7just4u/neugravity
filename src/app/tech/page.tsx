export const revalidate = 300 // 5 minutes

import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Cpu, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Technology",
  description: "Explore the technologies shaping how we build and work.",
}

const demoTechnologies = [
  { name: "Kubernetes", slug: "kubernetes", type: "platform", description: "Open-source container orchestration system for automating deployment, scaling, and management." },
  { name: "Python", slug: "python", type: "language", description: "High-level, general-purpose programming language known for its simplicity and versatility." },
  { name: "TypeScript", slug: "typescript", type: "language", description: "Strongly typed superset of JavaScript that compiles to plain JavaScript." },
  { name: "PostgreSQL", slug: "postgresql", type: "database", description: "Powerful, open-source object-relational database system with proven reliability." },
  { name: "React", slug: "react", type: "framework", description: "JavaScript library for building user interfaces with a component-based architecture." },
  { name: "Docker", slug: "docker", type: "platform", description: "Platform for developing, shipping, and running applications in containers." },
  { name: "Rust", slug: "rust", type: "language", description: "Systems programming language focused on safety, performance, and concurrency." },
  { name: "GraphQL", slug: "graphql", type: "protocol", description: "Query language for APIs and runtime for executing those queries." },
  { name: "Redis", slug: "redis", type: "database", description: "In-memory data structure store used as database, cache, and message broker." },
  { name: "TensorFlow", slug: "tensorflow", type: "framework", description: "Open-source machine learning framework developed by Google Brain." },
  { name: "Next.js", slug: "nextjs", type: "framework", description: "React framework for production — hybrid static & server rendering, routing, and more." },
  { name: "Terraform", slug: "terraform", type: "platform", description: "Infrastructure as code tool for building, changing, and versioning infrastructure safely." },
]

const filters = ["All", "AI", "Languages", "Frameworks", "Databases", "Cloud", "Infrastructure"]

const typeVariant: Record<string, "info" | "success" | "warning" | "secondary" | "outline"> = {
  language: "info",
  framework: "success",
  database: "warning",
  platform: "secondary",
  protocol: "outline",
}

export default function TechPage() {
  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <Cpu className="h-4 w-4 text-zinc-400" />
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">Technology</span>
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Technology</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Explore the technologies shaping how we build and work.</p>
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
        {demoTechnologies.map((tech) => (
          <Link
            key={tech.slug}
            href={`/tech/${tech.slug}`}
            className="group flex flex-col gap-3 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between">
              <Badge variant={typeVariant[tech.type] ?? "secondary"} className="text-xs capitalize">
                {tech.type}
              </Badge>
            </div>
            <div>
              <h2 className="font-semibold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {tech.name}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">{tech.description}</p>
            </div>
            <span className="text-xs text-zinc-400 flex items-center gap-1 group-hover:text-blue-500 transition-colors">
              Learn more <ArrowRight className="h-3 w-3" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
