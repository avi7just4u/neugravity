import { NextResponse, type NextRequest } from "next/server"
import { StatusService } from "@/lib/services/status.service"
import { JobService } from "@/lib/services/job.service"

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-worker-secret")
  if (!secret || secret !== process.env.WORKER_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let provider_id: string
  try {
    const body = await request.json()
    provider_id = body.provider_id
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  if (!provider_id) {
    return NextResponse.json({ error: "provider_id required" }, { status: 400 })
  }

  const result = await StatusService.pollProvider(provider_id)

  if (result.incidents_created > 0) {
    await JobService.enqueue({
      queue_name: "notifications",
      job_type: "NOTIFY_NEW_INCIDENT",
      payload: { provider_id, incidents_created: result.incidents_created },
      priority: 8,
    })
  }

  return NextResponse.json(result)
}
