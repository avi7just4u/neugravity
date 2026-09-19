import { NextRequest, NextResponse } from "next/server"
import { NewsletterService } from "@/lib/services/newsletter.service"
import { z } from "zod"

const schema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().optional(),
  topics: z.array(z.string()).optional(),
  source: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    let body: unknown
    const contentType = request.headers.get("content-type") ?? ""

    if (contentType.includes("application/json")) {
      body = await request.json()
    } else {
      const formData = await request.formData()
      body = {
        email: formData.get("email"),
        firstName: formData.get("firstName") ?? formData.get("first_name"),
        topics: formData.getAll("topics"),
        source: formData.get("source") ?? "homepage",
      }
    }

    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      )
    }

    const result = await NewsletterService.subscribe({
      email: parsed.data.email,
      firstName: parsed.data.firstName,
      topics: parsed.data.topics,
      source: parsed.data.source ?? "website",
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 409 })
    }

    // Redirect for form submissions
    if (!contentType.includes("application/json")) {
      return NextResponse.redirect(new URL("/?subscribed=1", request.url))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[newsletter/subscribe] Error:", error)
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 })
  }
}
