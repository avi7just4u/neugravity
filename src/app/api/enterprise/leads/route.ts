import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { z } from "zod"

const schema = z.object({
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  email: z.string().email(),
  company: z.string().min(1).max(200),
  role: z.string().max(100).optional(),
  company_size: z.string().optional(),
  phone: z.string().max(30).optional(),
  service: z.string().max(100).optional(),
  message: z.string().max(5000).optional(),
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
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      )
    }

    const supabase = await createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("enterprise_leads").insert(parsed.data)

    if (error) throw error

    if (!contentType.includes("application/json")) {
      return NextResponse.redirect(new URL("/enterprise?submitted=1", request.url))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[enterprise/leads] Error:", error)
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 })
  }
}
