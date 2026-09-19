import { NextResponse, type NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { ToolRefreshService } from "@/lib/services/tool-refresh.service"
import { JobService } from "@/lib/services/job.service"

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-worker-secret")
  if (!secret || secret !== process.env.WORKER_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let tool_id: string
  let field_group: string

  try {
    const body = await request.json()
    tool_id = body.tool_id
    field_group = body.field_group
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  if (!tool_id || !field_group) {
    return NextResponse.json({ error: "tool_id and field_group required" }, { status: 400 })
  }

  const db = createAdminClient()
  const { data: tool } = await db.from("tools").select("*").eq("id", tool_id).single()

  if (!tool) {
    return NextResponse.json({ error: "Tool not found" }, { status: 404 })
  }

  let changes_detected = 0

  if (tool.website_url && field_group === "pricing") {
    try {
      const res = await fetch(tool.website_url, {
        signal: AbortSignal.timeout(8000),
        headers: { "User-Agent": "NeuGravity-Bot/1.0" },
      })

      if (res.ok) {
        const html = await res.text()

        const pricingKeywords = ["pricing", "plans", "per month", "per user", "free tier", "enterprise"]
        const foundKeywords = pricingKeywords.filter((kw) => html.toLowerCase().includes(kw))

        const detectedFreeModel = html.toLowerCase().includes("free forever") || html.toLowerCase().includes("always free")
        const detectedPaid = html.toLowerCase().includes("per month") || html.toLowerCase().includes("/mo")

        const old_data: Record<string, unknown> = {
          has_free_tier: tool.has_free_tier,
          pricing_model: tool.pricing_model,
        }

        const new_data: Record<string, unknown> = {}

        if (detectedFreeModel && !tool.has_free_tier) {
          new_data.has_free_tier = true
        }

        if (detectedPaid && tool.pricing_model === "free") {
          new_data.pricing_model = "freemium"
        }

        if (Object.keys(new_data).length > 0) {
          changes_detected = await ToolRefreshService.detectChanges(tool_id, field_group, old_data, new_data)
        }

        if (changes_detected > 0) {
          await JobService.enqueue({
            queue_name: "notifications",
            job_type: "NOTIFY_TOOL_CHANGE",
            payload: { tool_id, field_group, changes_detected },
            priority: 4,
          })
        }

        void foundKeywords
      }
    } catch {
      // fetch failed — record verified with no changes
    }
  }

  await ToolRefreshService.recordVerified(tool_id, field_group)

  return NextResponse.json({ tool_id, changes_detected, field_group })
}
