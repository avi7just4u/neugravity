import { NextResponse, type NextRequest } from "next/server"
import { FreshnessService } from "@/lib/services/freshness.service"

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const result = await FreshnessService.scheduleOverdueRefreshes()
  return NextResponse.json(result)
}
