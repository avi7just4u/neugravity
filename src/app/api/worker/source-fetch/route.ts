import { NextRequest, NextResponse } from "next/server"
import { IngestionService } from "@/lib/services/ingestion.service"

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-worker-secret")
  if (secret !== process.env.WORKER_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { source_id } = await request.json()
  if (!source_id) {
    return NextResponse.json({ error: "source_id required" }, { status: 400 })
  }

  const result = await IngestionService.processSource(source_id)
  return NextResponse.json(result)
}
