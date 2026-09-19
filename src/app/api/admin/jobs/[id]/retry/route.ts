import { NextRequest, NextResponse } from "next/server"
import { JobService } from "@/lib/services/job.service"

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await JobService.retry(id)
  return NextResponse.json({ success: true })
}
