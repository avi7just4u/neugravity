import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import {
  FileText,
  Newspaper,
  Wrench,
  Cpu,
  BriefcaseBusiness,
  ListChecks,
  AlertCircle,
  TrendingUp,
} from "lucide-react"

export const metadata: Metadata = { title: "Dashboard" }

async function getDashboardStats() {
  try {
    const supabase = await createClient()
    const [articles, news, tools, technologies, jobs] = await Promise.all([
      supabase.from("articles").select("id, status", { count: "exact" }).limit(0),
      supabase.from("news_items").select("id, status", { count: "exact" }).limit(0),
      supabase.from("tools").select("id", { count: "exact" }).limit(0),
      supabase.from("technologies").select("id", { count: "exact" }).limit(0),
      supabase.from("ingestion_jobs").select("id, status", { count: "exact" }).eq("status", "pending").limit(0),
    ])
    return {
      articles: articles.count ?? 0,
      news: news.count ?? 0,
      tools: tools.count ?? 0,
      technologies: technologies.count ?? 0,
      pendingJobs: jobs.count ?? 0,
    }
  } catch {
    return { articles: 0, news: 0, tools: 0, technologies: 0, pendingJobs: 0 }
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  const statCards = [
    { label: "Articles", value: stats.articles, icon: <FileText className="h-5 w-5" />, href: "/admin/content/articles", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950" },
    { label: "News Items", value: stats.news, icon: <Newspaper className="h-5 w-5" />, href: "/admin/content/news", color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950" },
    { label: "Tools", value: stats.tools, icon: <Wrench className="h-5 w-5" />, href: "/admin/content/tools", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950" },
    { label: "Technologies", value: stats.technologies, icon: <Cpu className="h-5 w-5" />, href: "/admin/content/technologies", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950" },
    { label: "Pending Jobs", value: stats.pendingJobs, icon: <BriefcaseBusiness className="h-5 w-5" />, href: "/admin/ingestion/jobs", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950" },
  ]

  const quickActions = [
    { label: "Review Queue", href: "/admin/editorial/review", icon: <ListChecks className="h-4 w-4" />, description: "Review AI-generated drafts and candidates" },
    { label: "Add Technology", href: "/admin/content/technologies/new", icon: <Cpu className="h-4 w-4" />, description: "Create a new technology entry" },
    { label: "Add Tool", href: "/admin/content/tools/new", icon: <Wrench className="h-4 w-4" />, description: "Add a tool to the directory" },
    { label: "System Health", href: "/admin/system/health", icon: <AlertCircle className="h-4 w-4" />, description: "Check system status" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">NeuGravity Admin — Platform overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <a
            key={stat.label}
            href={stat.href}
            className="flex flex-col gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-sm transition-all"
          >
            <div className={`flex items-center justify-center h-9 w-9 rounded-lg ${stat.bg} ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-white">{stat.value}</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">{stat.label}</div>
            </div>
          </a>
        ))}
      </div>

      {/* Quick actions + recent activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">Quick Actions</h2>
          <div className="space-y-2">
            {quickActions.map((action) => (
              <a
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-center h-8 w-8 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 shrink-0">
                  {action.icon}
                </div>
                <div>
                  <div className="text-sm font-medium text-zinc-900 dark:text-white">{action.label}</div>
                  <div className="text-xs text-zinc-400">{action.description}</div>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">Content Pipeline</h2>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-zinc-400" />
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Ingestion pipeline status</span>
            </div>
            <div className="space-y-3">
              {[
                { stage: "Sources configured", status: "pending", count: 0 },
                { stage: "Candidates in queue", status: "pending", count: 0 },
                { stage: "Awaiting review", status: "pending", count: 0 },
                { stage: "Scheduled to publish", status: "pending", count: 0 },
              ].map((item) => (
                <div key={item.stage} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">{item.stage}</span>
                  <span className="font-medium text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-xs">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <p className="text-xs text-zinc-400">Connect Supabase to see live data.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
