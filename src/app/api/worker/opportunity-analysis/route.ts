import { NextRequest, NextResponse } from "next/server"
import { runFullGapAnalysis } from "@/lib/services/gap-analysis.service"
import { OpportunityService } from "@/lib/services/opportunity.service"
import { JobService } from "@/lib/services/job.service"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  // Verify internal caller via shared secret
  const secret = request.headers.get("x-worker-secret")
  if (secret !== process.env.WORKER_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let jobId: string | undefined
  try {
    const body = await request.json().catch(() => ({}))
    jobId = (body as { jobId?: string }).jobId
  } catch {
    // no body
  }

  try {
    const candidates = await runFullGapAnalysis()
    let created = 0
    let skipped = 0

    for (const candidate of candidates) {
      const result = await OpportunityService.create(
        {
          topic: candidate.topic,
          title_suggestion: candidate.title_suggestion,
          content_type: candidate.content_type,
          audience: candidate.audience,
          reason: candidate.reason,
          why_now: candidate.why_now,
          gap_type: candidate.gap_type,
          priority: candidate.priority,
          source: candidate.source,
          related_entity_type: candidate.related_entity_type,
          related_entity_id: candidate.related_entity_id,
          related_entity_name: candidate.related_entity_name,
          metadata: candidate.metadata,
          created_by_type: "system",
        },
        { email: "system" }
      )

      if (result) {
        created++
      } else {
        skipped++ // duplicate or error
      }
    }

    // Mark job complete if called from queue
    if (jobId) {
      await JobService.complete(jobId)
    }

    return NextResponse.json({ ok: true, created, skipped, total: candidates.length })
  } catch (err) {
    if (jobId) {
      await JobService.fail(jobId, String(err))
    }
    console.error("[opportunity-analysis] Error:", err)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}
