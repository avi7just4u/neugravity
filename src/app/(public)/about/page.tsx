import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Zap } from "lucide-react"

export const metadata: Metadata = {
  title: "About",
  description: "About NeuGravity — the technology intelligence and learning platform.",
}

const values = [
  { title: "Source everything", description: "Every factual claim references its source. We don't publish invented information." },
  { title: "Verify before publishing", description: "Human editors review and verify content before it is published." },
  { title: "Explain clearly", description: "Technology should be understandable. We meet readers at their level." },
  { title: "Stay independent", description: "We don't take money to promote specific tools or technologies." },
]

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-2xl">
        <div className="flex items-center gap-2 mb-8">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-zinc-900 dark:bg-white">
            <Zap className="h-5 w-5 text-white dark:text-zinc-900" />
          </div>
          <span className="font-bold text-xl text-zinc-900 dark:text-white">NeuGravity</span>
        </div>

        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4 leading-tight">
          Understand Technology.<br />Navigate What&apos;s Next.
        </h1>

        <p className="text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed mb-8">
          NeuGravity is a technology intelligence and learning platform. We help engineers, product managers, executives, and professionals understand technology, discover tools, follow industry developments, and build real knowledge.
        </p>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">Our Mission</h2>
          <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
            Technology is changing faster than anyone can keep up with. Most information about technology is either too shallow, too promotional, or buried in documentation written for people who already understand the subject. We are building a resource that meets people where they are and gives them what they actually need — sourced, structured, and explained clearly.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">Our Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {values.map((v) => (
              <div key={v.title} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-1 text-sm">{v.title}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{v.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">What We&apos;re Building</h2>
          <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
            NeuGravity is being built as a technology knowledge graph — structured, interconnected information covering technologies, tools, companies, people, and events. Every entity connects to others. Every content page surfaces related learning, news, and tools.
          </p>
        </section>

        <div className="flex gap-3">
          <Button asChild><Link href="/enterprise">Work with us</Link></Button>
          <Button variant="outline" asChild><Link href="/contact">Contact</Link></Button>
        </div>
      </div>
    </div>
  )
}
