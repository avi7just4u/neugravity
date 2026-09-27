import type { Metadata } from "next"
import { Suspense } from "react"
import { SearchIsland } from "./search-island"

export function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }): Metadata {
  return {
    title: "Search — NeuGravity",
    description: "Search for technologies, tools, companies, articles, courses, and more.",
    robots: { index: false, follow: true },
  }
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  return (
    <Suspense fallback={<div className="p-12 text-center text-zinc-400">Loading search...</div>}>
      <SearchIsland initialQuery={q ?? ""} />
    </Suspense>
  )
}
