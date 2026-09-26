"use client"

import { useState } from "react"
import { CheckCircle, XCircle, Network, Trash2 } from "lucide-react"

interface Relationship {
  id: string
  source_entity_type: string
  source_entity_id: string
  target_entity_type: string
  target_entity_id: string
  relationship_type: string
  weight: number
  confidence: number
  source: string | null
  created_by_type: string | null
  verified: boolean
  created_at: string
}

interface Props {
  relationships: Record<string, unknown>[]
  relationshipColors: Record<string, string>
}

export function KnowledgeRelationshipTable({ relationships: initial, relationshipColors }: Props) {
  const [relationships, setRelationships] = useState<Relationship[]>(initial as unknown as Relationship[])
  const [loading, setLoading] = useState<string | null>(null)

  async function handleApprove(id: string) {
    setLoading(id)
    try {
      await fetch(`/api/admin/knowledge/relationships/${id}/approve`, { method: "POST" })
      setRelationships((prev) => prev.map((r) => r.id === id ? { ...r, verified: true } : r))
    } finally {
      setLoading(null)
    }
  }

  async function handleReject(id: string) {
    if (!confirm("Delete this relationship?")) return
    setLoading(id)
    try {
      await fetch(`/api/admin/knowledge/relationships/${id}/reject`, { method: "POST" })
      setRelationships((prev) => prev.filter((r) => r.id !== id))
    } finally {
      setLoading(null)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this relationship?")) return
    setLoading(id)
    try {
      await fetch(`/api/admin/knowledge/relationships/${id}`, { method: "DELETE" })
      setRelationships((prev) => prev.filter((r) => r.id !== id))
    } finally {
      setLoading(null)
    }
  }

  if (relationships.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-12 text-center">
        <Network className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
        <p className="text-sm text-zinc-400">No relationships found</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
            <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Source</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Relationship</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Target</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Confidence</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {relationships.map((rel) => {
            const isLoading = loading === rel.id
            const isPending = !rel.verified && rel.created_by_type === "ai"
            const badgeColor = relationshipColors[rel.relationship_type] ?? "text-zinc-500 bg-zinc-100 dark:bg-zinc-800"

            return (
              <tr key={rel.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                <td className="px-4 py-3">
                  <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300 capitalize">
                    {rel.source_entity_type}
                  </div>
                  <div className="text-xs text-zinc-400 font-mono truncate max-w-[120px]">
                    {rel.source_entity_id.slice(0, 8)}…
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${badgeColor}`}>
                    {rel.relationship_type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300 capitalize">
                    {rel.target_entity_type}
                  </div>
                  <div className="text-xs text-zinc-400 font-mono truncate max-w-[120px]">
                    {rel.target_entity_id.slice(0, 8)}…
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-zinc-400 font-mono">{rel.confidence.toFixed(2)}</span>
                  {rel.created_by_type === "ai" && (
                    <span className="ml-1 text-xs text-purple-500">AI</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {rel.verified ? (
                    <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                      <XCircle className="h-3 w-3" />
                      Pending
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    {isPending && (
                      <>
                        <button
                          onClick={() => handleApprove(rel.id)}
                          disabled={isLoading}
                          className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(rel.id)}
                          disabled={isLoading}
                          className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {rel.verified && (
                      <button
                        onClick={() => handleDelete(rel.id)}
                        disabled={isLoading}
                        className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-colors disabled:opacity-50"
                        title="Delete relationship"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
