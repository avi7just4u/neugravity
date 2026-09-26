import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Supabase Auth callback — handles OAuth code exchange and email confirmation links.
// Supabase redirects here after: Google/GitHub OAuth, email verification, password reset.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Redirect to intended destination or homepage after successful auth
      const redirectUrl = new URL(next, origin)
      // Only allow same-origin redirects to prevent open redirect attacks
      if (redirectUrl.origin === origin) {
        return NextResponse.redirect(redirectUrl)
      }
      return NextResponse.redirect(new URL("/", origin))
    }

    console.error("[auth/callback] Code exchange failed:", error.message)
  }

  // Auth code missing or exchange failed — redirect to login with error
  return NextResponse.redirect(new URL("/login?error=auth_callback_failed", origin))
}
