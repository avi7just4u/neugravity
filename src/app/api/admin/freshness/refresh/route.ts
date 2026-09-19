import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/server"
import { FreshnessService } from "@/lib/services/freshness.service"

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const db = createAdminClient()
  const { data: profile } = await db.from("user_profiles").select("role").eq("id", user.id).maybeSingle()
  const role = profile?.role ?? "user"
  if (!["admin", "super_admin", "editor"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const result = await FreshnessService.scheduleOverdueRefreshes()
  return NextResponse.json(result)
}
