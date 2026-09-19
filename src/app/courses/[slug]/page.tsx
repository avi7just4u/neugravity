import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Clock, Star, ChevronRight, CheckCircle } from "lucide-react"

function toTitleCase(s: string) { return s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) }

const courseData: Record<string, { title: string; description: string; outcome: string; instructor: string; difficulty: string; hours: number; price: number; modules: { title: string; lessons: string[] }[] }> = {
  "ai-foundations": {
    title: "AI Foundations",
    description: "Understand how modern AI works, from neural networks to large language models.",
    outcome: "Understand the core concepts behind modern AI, how language models work, and how to evaluate AI tools for your work.",
    instructor: "NeuGravity Editorial", difficulty: "Beginner", hours: 6, price: 0,
    modules: [
      { title: "Introduction to AI", lessons: ["What is Artificial Intelligence?", "A brief history of AI", "Types of AI systems"] },
      { title: "Machine Learning Fundamentals", lessons: ["Supervised vs unsupervised learning", "How models are trained", "Evaluation and overfitting"] },
      { title: "Neural Networks", lessons: ["Neurons and layers", "Backpropagation explained", "Deep learning architectures"] },
      { title: "Large Language Models", lessons: ["The transformer architecture", "Pre-training and fine-tuning", "Prompting and in-context learning", "Working with LLM APIs"] },
    ],
  },
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const c = courseData[slug]
  return { title: c?.title ?? toTitleCase(slug), description: c?.description }
}

export function generateStaticParams() { return [] }

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const c = courseData[slug]
  const title = c?.title ?? toTitleCase(slug)

  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex items-center gap-1.5 text-sm text-zinc-400 mb-8" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/courses" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Courses</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-zinc-600 dark:text-zinc-300">{title}</span>
      </nav>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div>
            {c && <Badge variant={c.difficulty === "Beginner" ? "success" : c.difficulty === "Advanced" ? "destructive" : "info"} className="mb-3">{c.difficulty}</Badge>}
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">{title}</h1>
            <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">{c?.description ?? "Course details coming soon."}</p>
          </div>

          {c?.outcome && (
            <section className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
              <h2 className="font-semibold text-zinc-900 dark:text-white mb-2 text-sm uppercase tracking-wide">What You&apos;ll Learn</h2>
              <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed">{c.outcome}</p>
            </section>
          )}

          {c?.modules && (
            <section>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Course Curriculum</h2>
              <div className="space-y-3">
                {c.modules.map((mod, i) => (
                  <details key={i} className="group rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                    <summary className="flex items-center justify-between p-4 cursor-pointer bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                      <span className="font-medium text-zinc-900 dark:text-white text-sm">Module {i + 1}: {mod.title}</span>
                      <span className="text-xs text-zinc-400">{mod.lessons.length} lessons</span>
                    </summary>
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                      {mod.lessons.map((l) => (
                        <div key={l} className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-600 dark:text-zinc-400">
                          <BookOpen className="h-3.5 w-3.5 shrink-0 text-zinc-300" />{l}
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside>
          <div className="sticky top-20 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-5">
            <div className="text-3xl font-bold text-zinc-900 dark:text-white">{c?.price === 0 ? "Free" : c ? `$${c.price}` : "—"}</div>
            <Button className="w-full" size="lg">{c?.price === 0 ? "Enroll Free" : "Enroll Now"}</Button>
            {c && (
              <dl className="space-y-2 text-sm border-t border-zinc-200 dark:border-zinc-800 pt-4">
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400"><Clock className="h-4 w-4 shrink-0" /><span>{c.hours} hours of content</span></div>
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400"><CheckCircle className="h-4 w-4 shrink-0" /><span>Certificate of completion</span></div>
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400"><Star className="h-4 w-4 shrink-0" /><span>Lifetime access</span></div>
              </dl>
            )}
            <p className="text-xs text-zinc-400 text-center">30-day money-back guarantee</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
