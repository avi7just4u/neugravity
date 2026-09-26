import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/server"
import { ExplanationService } from "@/lib/services/explanation.service"
import { PageHeader } from "@/components/admin"
import { ExplanationEditor } from "@/components/admin/explanation-editor"
import type { ExplanationType } from "@/types"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  return { title: `Explanations — ${slug}` }
}

const EXPLANATION_TYPES: ExplanationType[] = ['quick', 'simple', 'beginner', 'technical', 'architect']

export default async function ExplanationsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const db = createAdminClient()
  const { data: tech } = await db
    .from("technologies")
    .select("id,name,slug,status,verified,published,maturity,difficulty,short_definition")
    .eq("slug", slug)
    .single()

  if (!tech) notFound()

  const explanations = await ExplanationService.getExplanations(tech.id as string)

  const publishedCount = EXPLANATION_TYPES.filter(
    (t) => explanations[t]?.status === "published"
  ).length

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${tech.name as string} — Explanations`}
        description={(tech.short_definition as string | null) ?? "Manage the five explanation modes for this technology"}
        breadcrumb={[
          { label: "Knowledge", href: "/admin/knowledge" },
          { label: tech.name as string, href: `/admin/knowledge/${slug}/explanations` },
        ]}
      />

      {/* Quality checklist */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Completion</h3>
          <span className="text-sm font-mono text-zinc-500">{publishedCount}/{EXPLANATION_TYPES.length} published</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {EXPLANATION_TYPES.map((type) => {
            const exp = explanations[type]
            const isPublished = exp?.status === "published"
            const isDraft = exp && !isPublished
            return (
              <span
                key={type}
                className={`px-2 py-1 text-xs rounded-full font-medium capitalize ${
                  isPublished
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : isDraft
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
                }`}
              >
                {type === 'quick' ? '30 Sec' : type === 'technical' ? 'Engineer' : type}
                {isPublished && " ✓"}
                {isDraft && " (draft)"}
                {!exp && " —"}
              </span>
            )
          })}
        </div>
      </div>

      {/* Editor */}
      <ExplanationEditor
        technologyId={tech.id as string}
        technologyName={tech.name as string}
        explanations={explanations}
      />
    </div>
  )
}
