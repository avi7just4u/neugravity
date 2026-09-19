import { NextResponse, type NextRequest } from "next/server"
import { ToolRefreshService } from "@/lib/services/tool-refresh.service"

export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret")
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const result = await ToolRefreshService.scheduleRefreshes()
  return NextResponse.json(result)
}
