"use client"

import { useEffect, useRef } from "react"

interface InProgressTrackerProps {
  lessonId: string
  userId: string
  courseId: string
}

export function InProgressTracker({ lessonId, userId, courseId }: InProgressTrackerProps) {
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true

    fetch(`/api/progress/${lessonId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "in_progress" }),
    }).catch(() => {})

    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "lesson_view",
        userId,
        entityType: "lesson",
        entityId: lessonId,
        properties: { courseId },
      }),
    }).catch(() => {})
  }, [lessonId, userId, courseId])

  return null
}
