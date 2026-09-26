import { createClient, createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export interface AdminAuthResult {
  userId: string
  email: string
  role: string
}

const ALL_ADMIN_ROLES = [
  "admin",
  "super_admin",
  "editor",
  "author",
  "reviewer",
  "analyst",
  "course_manager",
  "community_moderator",
]

export async function requireAdminAuth(
  allowedRoles: string[] = ALL_ADMIN_ROLES
): Promise<AdminAuthResult | NextResponse> {
  // Get session user via cookie-based client (respects RLS)
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check role in public.users via service-role client (bypasses RLS)
  const svc = createAdminClient()
  const { data: profile } = await svc
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile?.role || !allowedRoles.includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Prefer email from the auth user object; fall back to admin API
  let email = user.email ?? ""
  if (!email) {
    const {
      data: { user: authUser },
    } = await svc.auth.admin.getUserById(user.id)
    email = authUser?.email ?? ""
  }

  return { userId: user.id, email, role: profile.role }
}
