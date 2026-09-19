import { NextRequest, NextResponse } from "next/server"
import { AnalyticsService } from "@/lib/services/analytics.service"
import { z } from "zod"

const schema = z.object({
  type: z.string().min(1).max(100),
  sessionId: z.string().optional(),
  pagePath: z.string().optional(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  properties: z.record(z.string(), z.unknown()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    await AnalyticsService.track(parsed.data)
    return NextResponse.json({ ok: true })
  } catch {
    // Analytics failures must never break the caller
    return NextResponse.json({ ok: true })
  }
}
