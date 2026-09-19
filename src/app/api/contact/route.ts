import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  subject: z.string().max(300).optional(),
  message: z.string().min(1).max(10000),
})

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") ?? ""
    let body: unknown

    if (contentType.includes("application/json")) {
      body = await request.json()
    } else {
      const formData = await request.formData()
      body = Object.fromEntries(formData.entries())
    }

    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 })
    }

    // In production: send via email service (Resend/SendGrid/etc.)
    console.log("[contact] Message from:", parsed.data.email, "| Subject:", parsed.data.subject)

    if (!contentType.includes("application/json")) {
      return NextResponse.redirect(new URL("/contact?sent=1", request.url))
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
