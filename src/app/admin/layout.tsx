import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/layout/admin-sidebar"

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
    .select("role")
    .eq("id", user.id)
    .single()

  const role: string = (profile as { role: string } | null)?.role ?? "user"
  const adminRoles = ["admin", "super_admin", "editor", "author", "reviewer", "analyst", "course_manager", "community_moderator"]
  if (!adminRoles.includes(role)) {
    redirect("/?error=unauthorized")
  }

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      <AdminSidebar userRole={role} />
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8 max-w-screen-2xl">
          {children}
        </div>
      </main>
    </div>
  )
}
