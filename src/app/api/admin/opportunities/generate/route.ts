import { NextRequest, NextResponse } from "next/server"
import { requireAdminAuth } from "@/lib/auth/admin-auth"
import { JobService } from "@/lib/services/job.service"

export const dynamic = "force-dynamic"

export async function POST(_req: NextRequest) {
  const authResult = await requireAdminAuth(["admin", "super_admin", "editor"])
  if (authResult instanceof NextResponse) return authResult

  const today = new Date().toISOString().slice(0, 10)
  const ts = new Date().toISOString()

  const job = await JobService.enqueue({
    queue_name: "opportunity-generation",
    job_type: "ANALYZE_OPPORTUNITIES",
    payload: { triggered_by: "manual", date: today, triggered_at: ts },
    priority: 2,
    idempotency_key: `opportunity-analysis:manual:${ts.slice(0, 16)}`,
  })

  if (!job) {
    return NextResponse.json({ ok: true, queued: false, reason: "already_queued_recently" })
  }

  // Fire the worker (best-effort, Vercel Hobby plan)
  const workerUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://neugravity.vercel.app"}/api/worker/opportunity-analysis`
  try {
    fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-worker-secret": process.env.WORKER_SECRET ?? "",
      },
      body: JSON.stringify({ jobId: job.id }),
    }).catch(() => {})
  } catch {
    // Fire-and-forget
  }

  return NextResponse.json({ ok: true, queued: true, jobId: job.id })
}
