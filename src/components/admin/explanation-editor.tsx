"use client"

import { useState, useTransition } from "react"
import { Loader2, Wand2, Edit3, CheckCircle, Clock, Archive, AlertCircle } from "lucide-react"
import type { ExplanationType, TechnologyExplanation } from "@/types"

const TABS: { type: ExplanationType; label: string; audience: string }[] = [
  { type: "quick", label: "30 Sec", audience: "Anyone — 2-3 sentences" },
  { type: "simple", label: "Simple", audience: "Non-technical — analogies" },
  { type: "beginner", label: "Beginner", audience: "New to the field" },
  { type: "technical", label: "Engineer", audience: "Working engineers" },
  { type: "architect", label: "Architect", audience: "Senior engineers / architects" },
]

const STATUS_BADGE: Record<string, { label: string; icon: React.ReactNode; class: string }> = {
  draft: { label: "Draft", icon: <Edit3 className="h-3 w-3" />, class: "text-zinc-500 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400" },
  in_review: { label: "In Review", icon: <Clock className="h-3 w-3" />, class: "text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400" },
  approved: { label: "Approved", icon: <CheckCircle className="h-3 w-3" />, class: "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400" },
  published: { label: "Published", icon: <CheckCircle className="h-3 w-3" />, class: "text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400" },
  archived: { label: "Archived", icon: <Archive className="h-3 w-3" />, class: "text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 dark:text-zinc-500" },
}

interface Props {
  technologyId: string
  technologyName: string
  explanations: Partial<Record<ExplanationType, TechnologyExplanation | null>>
}

interface LocalExplanation {
  id?: string
  title: string | null
  content: string
  status: string
  generated_by?: string | null
}

export function ExplanationEditor({ technologyId, technologyName: _technologyName, explanations: initial }: Props) {
  const [activeTab, setActiveTab] = useState<ExplanationType>("quick")
  const [mode, setMode] = useState<"view" | "edit">("view")
  const [isPending, startTransition] = useTransition()

  const [localExplanations, setLocalExplanations] = useState<Partial<Record<ExplanationType, LocalExplanation | null>>>(() => {
    const result: Partial<Record<ExplanationType, LocalExplanation | null>> = {}
    for (const tab of TABS) {
      const exp = initial[tab.type]
      result[tab.type] = exp ? { id: exp.id, title: exp.title, content: exp.content, status: exp.status, generated_by: exp.generated_by } : null
    }
    return result
  })

  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  const current = localExplanations[activeTab]

  function enterEdit() {
    setEditTitle(current?.title ?? "")
    setEditContent(current?.content ?? "")
    setMode("edit")
    setError(null)
    setSuccessMsg(null)
  }

  function cancelEdit() {
    setMode("view")
    setError(null)
    setSuccessMsg(null)
  }

  async function handleSave() {
    setError(null)
    startTransition(async () => {
      try {
        let resp: Response
        if (current?.id) {
          resp = await fetch(`/api/admin/knowledge/explanations/${current.id}`, {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ title: editTitle, content: editContent }),
          })
        } else {
          resp = await fetch("/api/admin/knowledge/explanations", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ technology_id: technologyId, explanation_type: activeTab, title: editTitle, content: editContent }),
          })
        }

        if (!resp.ok) {
          const j = await resp.json().catch(() => ({ error: "Request failed" }))
          setError(j.error ?? "Failed to save")
          return
        }

        const j = await resp.json()
        setLocalExplanations((prev) => ({
          ...prev,
          [activeTab]: { id: j.id ?? current?.id, title: editTitle, content: editContent, status: j.status ?? current?.status ?? "draft" },
        }))
        setMode("view")
        setSuccessMsg("Saved")
        setTimeout(() => setSuccessMsg(null), 3000)
      } catch {
        setError("Network error")
      }
    })
  }

  async function handleGenerate() {
    setGenerating(true)
    setError(null)
    try {
      const resp = await fetch("/api/admin/knowledge/explanations/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ technology_id: technologyId, explanation_type: activeTab }),
      })
      const j = await resp.json()
      if (!resp.ok) {
        setError(j.error ?? "Generation failed")
        return
      }
      setLocalExplanations((prev) => ({
        ...prev,
        [activeTab]: { id: j.id, title: j.title, content: j.content, status: "draft", generated_by: "ai" },
      }))
      setEditTitle(j.title)
      setEditContent(j.content)
      setMode("edit")
      setSuccessMsg("Draft generated — review before publishing")
      setTimeout(() => setSuccessMsg(null), 5000)
    } catch {
      setError("Network error")
    } finally {
      setGenerating(false)
    }
  }

  async function handlePublish() {
    if (!current?.id) return
    if (!confirm("Publish this explanation? It will be publicly visible.")) return
    setError(null)
    startTransition(async () => {
      try {
        const resp = await fetch(`/api/admin/knowledge/explanations/${current.id}/publish`, { method: "POST" })
        if (!resp.ok) {
          const j = await resp.json().catch(() => ({ error: "Failed" }))
          setError(j.error ?? "Failed to publish")
          return
        }
        setLocalExplanations((prev) => ({
          ...prev,
          [activeTab]: prev[activeTab] ? { ...prev[activeTab]!, status: "published" } : null,
        }))
        setSuccessMsg("Published")
        setTimeout(() => setSuccessMsg(null), 3000)
      } catch {
        setError("Network error")
      }
    })
  }

  async function handleArchive() {
    if (!current?.id) return
    if (!confirm("Archive this explanation?")) return
    setError(null)
    startTransition(async () => {
      try {
        const resp = await fetch(`/api/admin/knowledge/explanations/${current.id}/archive`, { method: "POST" })
        if (!resp.ok) return
        setLocalExplanations((prev) => ({
          ...prev,
          [activeTab]: prev[activeTab] ? { ...prev[activeTab]!, status: "archived" } : null,
        }))
        setSuccessMsg("Archived")
        setTimeout(() => setSuccessMsg(null), 3000)
      } catch {
        setError("Network error")
      }
    })
  }

  const statusInfo = current?.status ? STATUS_BADGE[current.status] : null

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto">
        {TABS.map((tab) => {
          const exp = localExplanations[tab.type]
          const isActive = activeTab === tab.type
          const isPublished = exp?.status === "published"
          const hasDraft = exp && !isPublished
          return (
            <button
              key={tab.type}
              onClick={() => { setActiveTab(tab.type); setMode("view"); setError(null); setSuccessMsg(null) }}
              className={`flex-shrink-0 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors relative ${
                isActive
                  ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              {tab.label}
              {isPublished && <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-green-500" />}
              {hasDraft && <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-amber-400" />}
            </button>
          )
        })}
      </div>

      <div className="p-5 space-y-4">
        {/* Status + audience */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {statusInfo ? (
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.class}`}>
                {statusInfo.icon}
                {statusInfo.label}
              </span>
            ) : (
              <span className="text-xs text-zinc-400">No explanation yet</span>
            )}
            {current?.generated_by === "ai" && current.status === "draft" && (
              <span className="px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">AI Generated</span>
            )}
          </div>
          <span className="text-xs text-zinc-400">{TABS.find(t => t.type === activeTab)?.audience}</span>
        </div>

        {/* Feedback messages */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}
        {successMsg && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-sm text-green-600 dark:text-green-400">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            {successMsg}
          </div>
        )}

        {/* Content area */}
        {mode === "view" ? (
          <div className="min-h-[160px]">
            {current?.content ? (
              <div className="space-y-2">
                {current.title && <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{current.title}</h4>}
                <div className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">{current.content}</div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[160px] gap-3">
                <p className="text-sm text-zinc-400">No explanation for this mode yet.</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
                    Generate Draft
                  </button>
                  <button
                    onClick={enterEdit}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Write Manually
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Explanation title (optional)"
              className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Explanation content..."
              rows={10}
              className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y font-mono"
            />
            <div className="text-xs text-zinc-400">
              {activeTab === "quick" && "Keep to 2-3 sentences. No jargon."}
              {activeTab === "simple" && "Use analogies. Assume no technical background."}
              {activeTab === "beginner" && "Assume basic programming knowledge. Explain why it matters."}
              {activeTab === "technical" && "Target working engineers. Include trade-offs and use cases."}
              {activeTab === "architect" && "Target senior engineers. Include internals, scale, decisions."}
            </div>
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex gap-2">
            {mode === "view" && current?.content && (
              <>
                <button
                  onClick={enterEdit}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  <Edit3 className="h-3 w-3" />
                  Edit
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-purple-200 dark:border-purple-800 rounded-lg text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 disabled:opacity-50"
                >
                  {generating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
                  Regenerate
                </button>
              </>
            )}
            {mode === "edit" && (
              <>
                <button
                  onClick={handleSave}
                  disabled={isPending || !editContent.trim()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                  Save Draft
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                >
                  Cancel
                </button>
              </>
            )}
          </div>

          <div className="flex gap-2">
            {current?.id && current.status !== "published" && current.status !== "archived" && mode === "view" && (
              <button
                onClick={handlePublish}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <CheckCircle className="h-3 w-3" />
                Publish
              </button>
            )}
            {current?.id && current.status === "published" && mode === "view" && (
              <button
                onClick={handleArchive}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                <Archive className="h-3 w-3" />
                Archive
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
