import { NextRequest, NextResponse } from "next/server"
import { SourceService } from "@/lib/services/source.service"
import { IngestionService } from "@/lib/services/ingestion.service"

// Called by Vercel Cron every minute
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const sources = await SourceService.getDueSources(10)
  const results: Array<{ source_id: string; discovered: number; queued: number; errors: string[] }> = []

  await Promise.allSettled(
    sources.map(async (source) => {
      const result = await IngestionService.processSource(source.id)
      results.push({ source_id: source.id, ...result })
    })
  )

  return NextResponse.json({
    polled: sources.length,
    results,
    timestamp: new Date().toISOString(),
  })
}
