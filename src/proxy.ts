import { NextResponse, type NextRequest } from "next/server"

// Proxy must be synchronous — no network calls allowed.
// Admin route auth is enforced server-side in src/app/admin/layout.tsx.
// Here we only do a fast cookie presence check to avoid flashing the admin UI.
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const hasSession = request.cookies.getAll().some((c) =>
      c.name.startsWith("sb-") && c.name.endsWith("-auth-token")
    )
    if (!hasSession) {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      url.searchParams.set("redirect", request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
