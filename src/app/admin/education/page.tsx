import type { Metadata } from "next"
import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/server"
import { PageHeader, StatCard } from "@/components/admin"
import { BookOpen, Map, FileText, CheckCircle } from "lucide-react"

export const metadata: Metadata = { title: "Education" }
export const dynamic = "force-dynamic"

async function getStats() {
  try {
    const db = createAdminClient()
    const [totalPaths, publishedPaths, totalCourses, publishedCourses, draftCourses] = await Promise.all([
      db.from("learning_paths").select("id", { count: "exact", head: true }),
      db.from("learning_paths").select("id", { count: "exact", head: true }).eq("status", "published"),
      db.from("courses").select("id", { count: "exact", head: true }),
      db.from("courses").select("id", { count: "exact", head: true }).eq("status", "published"),
      db.from("courses").select("id", { count: "exact", head: true }).in("status", ["draft", "review"]),
    ])
    return {
      totalPaths: totalPaths.count ?? 0,
      publishedPaths: publishedPaths.count ?? 0,
      totalCourses: totalCourses.count ?? 0,
      publishedCourses: publishedCourses.count ?? 0,
      draftCourses: draftCourses.count ?? 0,
    }
  } catch {
    return { totalPaths: 0, publishedPaths: 0, totalCourses: 0, publishedCourses: 0, draftCourses: 0 }
  }
}

async function getRecentActivity() {
  try {
    const db = createAdminClient()
    const [recentPaths, recentCourses] = await Promise.all([
      db.from("learning_paths").select("id,title,slug,status,updated_at").order("updated_at", { ascending: false }).limit(5),
      db.from("courses").select("id,title,slug,status,updated_at").order("updated_at", { ascending: false }).limit(5),
    ])
    return {
      paths: (recentPaths.data ?? []) as { id: string; title: string; slug: string; status: string; updated_at: string }[],
      courses: (recentCourses.data ?? []) as { id: string; title: string; slug: string; status: string; updated_at: string }[],
    }
  } catch {
    return { paths: [], courses: [] }
  }
}

const STATUS_COLORS: Record<string, string> = {
  published: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400",
  approved: "text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400",
  review: "text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400",
  draft: "text-zinc-600 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300",
  archived: "text-zinc-400 bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-500",
}

export default async function EducationDashboardPage() {
  const [stats, activity] = await Promise.all([getStats(), getRecentActivity()])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Education"
        description="Learning paths, courses, and curriculum management"
        actions={
          <div className="flex gap-2">
            <Link
              href="/admin/education/paths"
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-300"
            >
              <Map className="h-3.5 w-3.5" /> Paths
            </Link>
            <Link
              href="/admin/education/courses"
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-300"
            >
              <BookOpen className="h-3.5 w-3.5" /> Courses
            </Link>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Learning Paths"
          value={stats.totalPaths}
          icon={<Map className="h-5 w-5" />}
          href="/admin/education/paths"
          color="info"
        />
        <StatCard
          label="Published Paths"
          value={stats.publishedPaths}
          icon={<CheckCircle className="h-5 w-5" />}
          color="success"
        />
        <StatCard
          label="Total Courses"
          value={stats.totalCourses}
          icon={<BookOpen className="h-5 w-5" />}
          href="/admin/education/courses"
          color="info"
        />
        <StatCard
          label="In Draft / Review"
          value={stats.draftCourses}
          icon={<FileText className="h-5 w-5" />}
          href="/admin/education/courses?status=draft"
          color={stats.draftCourses > 0 ? "warning" : "default"}
          attention={stats.draftCourses > 0}
        />
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recent Paths */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-white">
              <Map className="h-4 w-4 text-zinc-400" />
              Recent Paths
            </div>
            <Link href="/admin/education/paths" className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
              View all →
            </Link>
          </div>
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {activity.paths.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-zinc-400">No learning paths yet</li>
            ) : (
              activity.paths.map((path) => (
                <li key={path.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-900/30">
                  <span className="text-sm text-zinc-700 dark:text-zinc-300 truncate">{path.title}</span>
                  <span className={`ml-3 shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[path.status] ?? STATUS_COLORS.draft}`}>
                    {path.status}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Recent Courses */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-white">
              <BookOpen className="h-4 w-4 text-zinc-400" />
              Recent Courses
            </div>
            <Link href="/admin/education/courses" className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
              View all →
            </Link>
          </div>
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {activity.courses.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-zinc-400">No courses yet</li>
            ) : (
              activity.courses.map((course) => (
                <li key={course.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-900/30">
                  <span className="text-sm text-zinc-700 dark:text-zinc-300 truncate">{course.title}</span>
                  <span className={`ml-3 shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[course.status] ?? STATUS_COLORS.draft}`}>
                    {course.status}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
