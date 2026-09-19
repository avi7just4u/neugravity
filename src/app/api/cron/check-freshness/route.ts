import { NextResponse, type NextRequest } from "next/server"
import { FreshnessService } from "@/lib/services/freshness.service"

export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret")
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const result = await FreshnessService.scheduleOverdueRefreshes()
  return NextResponse.json(result)
}
