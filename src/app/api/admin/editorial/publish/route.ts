import { NextRequest, NextResponse } from "next/server"
import { requireAdminAuth } from "@/lib/auth/admin-auth"
import { AuditService } from "@/lib/services/audit.service"

export async function POST(request: NextRequest) {
  const authResult = await requireAdminAuth(["admin", "super_admin", "editor"])
  if (authResult instanceof NextResponse) return authResult
  const { userId, email } = authResult

  const { news_item_id } = await request.json()
  if (!news_item_id) return NextResponse.json({ error: "news_item_id required" }, { status: 400 })

  const workerSecret = process.env.WORKER_SECRET ?? "internal"
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

  const res = await fetch(`${baseUrl}/api/worker/publish-content`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-worker-secret": workerSecret,
    },
    body: JSON.stringify({ news_item_id, published_by: userId }),
  })

  const data = await res.json()

  if (res.ok) {
    await AuditService.log({
      actor_id: userId,
      actor_email: email,
      action: "publish",
      entity_type: "news_item",
      entity_id: news_item_id,
      summary: `Published news item ${news_item_id}`,
    })
  }

  return NextResponse.json(data, { status: res.status })
}
