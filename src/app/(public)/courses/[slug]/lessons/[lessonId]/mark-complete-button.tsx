"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

interface MarkCompleteButtonProps {
  lessonId: string
  courseSlug: string
}

export function MarkCompleteButton({ lessonId, courseSlug }: MarkCompleteButtonProps) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()

  async function markComplete() {
    setLoading(true)
    try {
      const res = await fetch(`/api/progress/${lessonId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed", progress_percent: 100 }),
      })
      if (res.ok) {
        setDone(true)
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-sm font-medium">
        <CheckCircle className="h-4 w-4" />
        Marked complete
      </div>
    )
  }

  return (
    <Button size="sm" variant="outline" onClick={markComplete} disabled={loading}>
      <CheckCircle className="h-4 w-4 mr-1.5" />
      {loading ? "Saving…" : "Mark Complete"}
    </Button>
  )
}
