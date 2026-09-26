import { NextResponse } from "next/server"
import { FreshnessService } from "@/lib/services/freshness.service"
import { requireAdminAuth } from "@/lib/auth/admin-auth"
import { AuditService } from "@/lib/services/audit.service"

export async function POST() {
  const authResult = await requireAdminAuth(["admin", "super_admin", "editor"])
  if (authResult instanceof NextResponse) return authResult
  const { userId, email } = authResult

  const result = await FreshnessService.scheduleOverdueRefreshes()

  await AuditService.log({
    actor_id: userId,
    actor_email: email,
    action: "run_freshness_refresh",
    entity_type: "system",
    summary: "Triggered freshness refresh for overdue items",
    metadata: typeof result === "object" ? (result as Record<string, unknown>) : { result },
  })

  return NextResponse.json(result)
}
