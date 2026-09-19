import { NextRequest, NextResponse } from "next/server"
import { RevisionService } from "@/lib/services/revision.service"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ entity_type: string; id: string }> }
) {
  const { entity_type, id } = await params
  const revisions = await RevisionService.getHistory(entity_type, id)
  return NextResponse.json({ data: revisions })
}
