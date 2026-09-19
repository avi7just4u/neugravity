"use client"

import { useState } from "react"
import { Play, Power, Loader2 } from "lucide-react"

interface SourceActionsProps {
  id: string
  active: boolean
}

export function SourceActions({ id, active: initialActive }: SourceActionsProps) {
  const [active, setActive] = useState(initialActive)
  const [running, setRunning] = useState(false)
  const [toggling, setToggling] = useState(false)

  async function runNow() {
    setRunning(true)
    try {
      await fetch(`/api/admin/sources/${id}/run`, { method: "POST" })
    } finally {
      setRunning(false)
    }
  }

  async function toggle() {
    setToggling(true)
    try {
      const res = await fetch(`/api/admin/sources/${id}/toggle`, { method: "POST" })
      if (res.ok) {
        const data = await res.json() as { active: boolean }
        setActive(data.active)
      }
    } finally {
      setToggling(false)
    }
  }

  return (
    <div className="flex items-center gap-1 justify-end">
      <button
        onClick={runNow}
        disabled={running || !active}
        title="Run now"
        className="flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {running ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
        Run
      </button>
      <button
        onClick={toggle}
        disabled={toggling}
        title={active ? "Disable source" : "Enable source"}
        className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md border transition-colors disabled:opacity-40 ${
          active
            ? "border-green-200 text-green-700 dark:border-green-800 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
            : "border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
        }`}
      >
        {toggling ? <Loader2 className="h-3 w-3 animate-spin" /> : <Power className="h-3 w-3" />}
        {active ? "On" : "Off"}
      </button>
    </div>
  )
}
