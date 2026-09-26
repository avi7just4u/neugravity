"use client"

import { useEffect } from "react"

interface Props {
  technologyId: string
  technologySlug: string
  technologyName: string
}

export function TechPageAnalytics({ technologyId, technologySlug, technologyName }: Props) {
  useEffect(() => {
    fetch("/api/analytics/event", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        event: "technology_view",
        properties: { technology_id: technologyId, slug: technologySlug, name: technologyName },
      }),
    }).catch(() => {
      // analytics never throws
    })
  }, [technologyId, technologySlug, technologyName])

  return null
}
