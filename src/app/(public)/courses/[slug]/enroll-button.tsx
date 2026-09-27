"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface EnrollButtonProps {
  courseId: string
  courseSlug: string
  isFree: boolean
  firstLessonId: string | null
}

export function EnrollButton({ courseId, courseSlug, isFree, firstLessonId }: EnrollButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function enroll() {
    setLoading(true)
    try {
      const res = await fetch(`/api/enroll/${courseId}`, { method: "POST" })
      if (res.status === 401) {
        router.push(`/login?next=/courses/${courseSlug}`)
        return
      }
      if (res.ok) {
        const target = firstLessonId
          ? `/courses/${courseSlug}/lessons/${firstLessonId}`
          : `/courses/${courseSlug}`
        router.push(target)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button className="w-full" size="lg" onClick={enroll} disabled={loading}>
      {loading ? "Enrolling…" : isFree ? "Enroll Free" : "Enroll Now"}
    </Button>
  )
}
