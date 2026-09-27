import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { requireAdminAuth } from "@/lib/auth/admin-auth"

const EDUCATION_ROLES = ["admin", "super_admin", "course_manager", "editor"]

type ReorderType = "path_step" | "module" | "lesson"

interface ReorderItem {
  id: string
  sort_order: number
}

async function getSiblings(db: ReturnType<typeof createAdminClient>, type: ReorderType, parentId: string): Promise<ReorderItem[]> {
  if (type === "path_step") {
    const { data } = await db
      .from("learning_path_courses")
      .select("id,sort_order")
      .eq("learning_path_id", parentId)
      .order("sort_order")
    return (data ?? []) as ReorderItem[]
  }
  if (type === "module") {
    const { data } = await db
      .from("course_modules")
      .select("id,sort_order")
      .eq("course_id", parentId)
      .order("sort_order")
    return (data ?? []) as ReorderItem[]
  }
  // lesson
  const { data } = await db
    .from("lessons")
    .select("id,sort_order")
    .eq("module_id", parentId)
    .order("sort_order")
  return (data ?? []) as ReorderItem[]
}

async function swapSortOrders(
  db: ReturnType<typeof createAdminClient>,
  type: ReorderType,
  idA: string,
  orderA: number,
  idB: string,
  orderB: number
): Promise<void> {
  const table = type === "path_step" ? "learning_path_courses" : type === "module" ? "course_modules" : "lessons"
  // Use a temp value to avoid unique constraint issues
  const tmp = -1 - Math.floor(Math.random() * 100000)
  await db.from(table).update({ sort_order: tmp }).eq("id", idA)
  await db.from(table).update({ sort_order: orderA }).eq("id", idB)
  await db.from(table).update({ sort_order: orderB }).eq("id", idA)
}

// POST /api/admin/education/reorder
export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth(EDUCATION_ROLES)
  if (auth instanceof NextResponse) return auth

  const body = await req.json()
  const { type, parentId, itemId, direction } = body as {
    type: ReorderType
    parentId: string
    itemId: string
    direction: "up" | "down"
  }

  if (!["path_step", "module", "lesson"].includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  }
  if (!parentId || !itemId || !["up", "down"].includes(direction)) {
    return NextResponse.json({ error: "parentId, itemId, and direction are required" }, { status: 400 })
  }

  const db = createAdminClient()
  const siblings = await getSiblings(db, type, parentId)
  const idx = siblings.findIndex((s) => s.id === itemId)

  if (idx === -1) {
    return NextResponse.json({ error: "Item not found in parent" }, { status: 404 })
  }

  const swapIdx = direction === "up" ? idx - 1 : idx + 1
  if (swapIdx < 0 || swapIdx >= siblings.length) {
    return NextResponse.json({ error: "Already at boundary" }, { status: 400 })
  }

  const current = siblings[idx]
  const adjacent = siblings[swapIdx]

  await swapSortOrders(db, type, current.id, current.sort_order, adjacent.id, adjacent.sort_order)

  return NextResponse.json({ ok: true })
}
