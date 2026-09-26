import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { AdminShell } from "@/components/layout/admin-shell"

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | NeuGravity Admin" },
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login?redirect=/admin")

  // Use admin client (service-role) to read role — bypasses RLS user self-read restriction
  const svc = createAdminClient()
  const { data: profile } = await svc
    .from("users")
    .select("role, display_name")
    .eq("id", user.id)
    .single()

  const role: string = (profile as { role: string; display_name: string | null } | null)?.role ?? "user"
  const adminRoles = ["admin", "super_admin", "editor", "author", "reviewer", "analyst", "course_manager", "community_moderator"]
  if (!adminRoles.includes(role)) {
    redirect("/?error=unauthorized")
  }

  const { data: { user: authUser } } = await svc.auth.admin.getUserById(user.id)
  const email = authUser?.email ?? ""
  const rawDisplayName = (profile as { role: string; display_name: string | null } | null)?.display_name
  const displayName = rawDisplayName ?? email.split("@")[0] ?? "Admin"

  return (
    <AdminShell userRole={role} userEmail={email} displayName={displayName}>
      {children}
    </AdminShell>
  )
}
