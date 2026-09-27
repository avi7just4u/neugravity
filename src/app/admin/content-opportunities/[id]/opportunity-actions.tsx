"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import type { OpportunityStatus, OpportunityContentType } from "@/types"
import { CheckCircle, XCircle, FileText, ArrowRight } from "lucide-react"

interface OpportunityActionsProps {
  id: string
  status: OpportunityStatus
  contentType: OpportunityContentType
  hasBrief: boolean
}

export function OpportunityActions({ id, status, contentType, hasBrief }: OpportunityActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function setStatus(newStatus: OpportunityStatus) {
    setLoading(newStatus)
    try {
      const res = await fetch(`/api/admin/opportunities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        router.refresh()
      } else {
        setMessage("Update failed")
      }
    } catch {
      setMessage("Error")
    } finally {
      setLoading(null)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  async function dismiss() {
    setLoading("dismiss")
    try {
      await fetch(`/api/admin/opportunities/${id}/dismiss`, { method: "POST" })
      router.push("/admin/content-opportunities")
    } catch {
      setMessage("Error")
    } finally {
      setLoading(null)
    }
  }

  async function convertToBrief() {
    setLoading("convert")
    try {
      const res = await fetch(`/api/admin/opportunities/${id}/convert`, { method: "POST" })
      if (res.ok) {
        setMessage("Brief generated")
        router.refresh()
      } else {
        setMessage("Error generating brief")
      }
    } catch {
      setMessage("Error")
    } finally {
      setLoading(null)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const isDismissed = status === "dismissed"
  const isCompleted = status === "completed"

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {message && <span className="text-xs text-zinc-500">{message}</span>}

      {!isDismissed && !isCompleted && (
        <>
          {!hasBrief && (
            <Button size="sm" onClick={convertToBrief} disabled={loading === "convert"}>
              <FileText className="h-4 w-4 mr-1.5" />
              {loading === "convert" ? "Generating..." : "Generate Brief"}
            </Button>
          )}

          {hasBrief && status !== "in_progress" && (
            <Button size="sm" onClick={() => setStatus("in_progress")} disabled={loading === "in_progress"}>
              <ArrowRight className="h-4 w-4 mr-1.5" />
              Mark In Progress
            </Button>
          )}

          {status === "in_progress" && (
            <Button size="sm" onClick={() => setStatus("completed")} disabled={loading === "completed"}>
              <CheckCircle className="h-4 w-4 mr-1.5" />
              {loading === "completed" ? "Saving..." : "Mark Complete"}
            </Button>
          )}

          {status === "new" && (
            <Button variant="outline" size="sm" onClick={() => setStatus("review")} disabled={loading === "review"}>
              Move to Review
            </Button>
          )}

          {status === "review" && (
            <Button variant="outline" size="sm" onClick={() => setStatus("approved")} disabled={loading === "approved"}>
              Approve
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={dismiss}
            disabled={loading === "dismiss"}
            className="text-zinc-400 hover:text-red-600"
          >
            <XCircle className="h-4 w-4 mr-1" />
            Dismiss
          </Button>
        </>
      )}

      {isDismissed && (
        <Button variant="outline" size="sm" onClick={() => setStatus("new")} disabled={loading === "new"}>
          Restore
        </Button>
      )}
    </div>
  )
}
