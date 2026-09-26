"use client"

import { useState } from "react"
import type { ExplanationType } from "@/types"

const TABS: { type: ExplanationType; label: string }[] = [
  { type: "quick", label: "30 Sec" },
  { type: "simple", label: "Simple" },
  { type: "beginner", label: "Beginner" },
  { type: "technical", label: "Engineer" },
  { type: "architect", label: "Architect" },
]

interface Props {
  available: ExplanationType[]
  defaultTab?: ExplanationType
}

export function UnderstandTabs({ available, defaultTab }: Props) {
  const initial = defaultTab ?? available[0] ?? "quick"
  const [active, setActive] = useState<ExplanationType>(initial)

  return (
    <>
      {/* Tab controls */}
      <div
        className="flex gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 overflow-x-auto"
        role="tablist"
        aria-label="Explanation depth"
      >
        {TABS.filter((t) => available.includes(t.type)).map((tab) => (
          <button
            key={tab.type}
            role="tab"
            aria-selected={active === tab.type}
            aria-controls={`explanation-panel-${tab.type}`}
            onClick={() => {
              setActive(tab.type)
              // Show active panel, hide others
              available.forEach((type) => {
                const el = document.getElementById(`explanation-panel-${type}`)
                if (el) el.style.display = type === tab.type ? "" : "none"
              })
            }}
            className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              active === tab.type
                ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </>
  )
}
