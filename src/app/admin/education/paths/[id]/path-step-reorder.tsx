"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronUp, ChevronDown } from "lucide-react"

interface PathStepReorderProps {
  pathId: string
  stepId: string
  index: number
  total: number
}

export function PathStepReorder({ pathId, stepId, index, total }: PathStepReorderProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function move(direction: "up" | "down") {
    setLoading(true)
    try {
      await fetch("/api/admin/education/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "path_step", parentId: pathId, itemId: stepId, direction }),
      })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-0.5">
      <button
        onClick={() => move("up")}
        disabled={loading || index === 0}
        className="p-0.5 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Move up"
      >
        <ChevronUp className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => move("down")}
        disabled={loading || index === total - 1}
        className="p-0.5 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Move down"
      >
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
