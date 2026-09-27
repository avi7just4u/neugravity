import { NextRequest, NextResponse } from "next/server"
import { JobService } from "@/lib/services/job.service"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Enqueue opportunity analysis job — idempotent (one per day via key)
  const today = new Date().toISOString().slice(0, 10)
  const job = await JobService.enqueue({
    queue_name: "opportunity-generation",
    job_type: "ANALYZE_OPPORTUNITIES",
    payload: { triggered_by: "cron", date: today },
    priority: 3,
    idempotency_key: `opportunity-analysis:${today}`,
  })

  if (!job) {
    // Duplicate idempotency key — already queued today
    return NextResponse.json({ ok: true, queued: false, reason: "already_queued_today" })
  }

  // Fire the worker directly (Vercel Hobby — no persistent queue worker)
  const workerUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://neugravity.vercel.app"}/api/worker/opportunity-analysis`
  try {
    await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-worker-secret": process.env.WORKER_SECRET ?? "",
      },
      body: JSON.stringify({ jobId: job.id }),
    })
  } catch {
    // Worker call is best-effort — job stays queued for retry
  }

  return NextResponse.json({ ok: true, queued: true, jobId: job.id })
}
