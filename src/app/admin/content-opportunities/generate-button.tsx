"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export function OpportunityGenerateButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function handleGenerate() {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch("/api/admin/opportunities/generate", { method: "POST" })
      const data = await res.json()
      if (data.queued) {
        setResult("Analysis queued — opportunities will appear shortly")
      } else {
        setResult(data.reason === "already_queued_recently" ? "Already running" : "Queued")
      }
    } catch {
      setResult("Error — try again")
    } finally {
      setLoading(false)
      setTimeout(() => setResult(null), 4000)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={handleGenerate} disabled={loading}>
        <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
        {loading ? "Running..." : "Analyze Gaps"}
      </Button>
      {result && <span className="text-xs text-zinc-500">{result}</span>}
    </div>
  )
}
