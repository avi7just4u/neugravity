import { NextRequest, NextResponse } from "next/server"
import { requireAdminAuth } from "@/lib/auth/admin-auth"
import { ExplanationService } from "@/lib/services/explanation.service"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth(["admin", "editor", "author"])
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const body = await req.json()
  const { content, title } = body

  if (!content) {
    return NextResponse.json({ error: "content required" }, { status: 400 })
  }

  await ExplanationService.updateExplanation(id, content as string, title as string | undefined)
  return NextResponse.json({ success: true })
}
