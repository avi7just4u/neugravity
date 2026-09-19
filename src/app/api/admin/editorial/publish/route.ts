import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const auth = await createClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

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
    body: JSON.stringify({ news_item_id, published_by: user.id }),
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
