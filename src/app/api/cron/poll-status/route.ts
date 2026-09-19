import { NextResponse, type NextRequest } from "next/server"
import { StatusService } from "@/lib/services/status.service"
import { JobService } from "@/lib/services/job.service"

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const providers = await StatusService.getActiveProviders()
  let queued = 0

  for (const provider of providers) {
    const result = await JobService.enqueue({
      queue_name: "status-monitor",
      job_type: "STATUS_MONITOR",
      payload: { provider_id: provider.id },
      priority: 7,
      idempotency_key: `status-monitor:${provider.id}:${new Date().toISOString().slice(0, 13)}`,
    })
    if (result) queued++
  }

  return NextResponse.json({ queued, providers: providers.length })
}
