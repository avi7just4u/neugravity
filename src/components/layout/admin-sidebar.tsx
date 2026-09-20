"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  Newspaper,
  Wrench,
  Building2,
  Cpu,
  BarChart3,
  Rss,
  ListChecks,
  BriefcaseBusiness,
  MessageSquare,
  Users,
  Search,
  Settings,
  AlertCircle,
  Zap,
  BookOpen,
  Mic2,
  RefreshCw,
  GitCompareArrows,
  Bell,
  BrainCircuit,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  requiredRoles?: string[]
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    title: "",
    items: [
      { label: "Dashboard", href: "/admin", icon: <LayoutDashboard className="h-4 w-4" /> },
    ],
  },
  {
    title: "Content",
    items: [
      { label: "Articles", href: "/admin/content/articles", icon: <FileText className="h-4 w-4" /> },
      { label: "News", href: "/admin/content/news", icon: <Newspaper className="h-4 w-4" /> },
      { label: "Tools", href: "/admin/content/tools", icon: <Wrench className="h-4 w-4" /> },
      { label: "Tool Changes", href: "/admin/content/tools/changes", icon: <GitCompareArrows className="h-4 w-4" /> },
      { label: "Companies", href: "/admin/content/companies", icon: <Building2 className="h-4 w-4" /> },
      { label: "Technologies", href: "/admin/content/technologies", icon: <Cpu className="h-4 w-4" /> },
      { label: "Comparisons", href: "/admin/content/comparisons", icon: <BarChart3 className="h-4 w-4" /> },
      { label: "Interviews", href: "/admin/content/interviews", icon: <Mic2 className="h-4 w-4" /> },
      { label: "Courses", href: "/admin/content/courses", icon: <BookOpen className="h-4 w-4" /> },
    ],
  },
  {
    title: "Editorial",
    items: [
      { label: "Queue", href: "/admin/editorial", icon: <ListChecks className="h-4 w-4" /> },
      { label: "Review", href: "/admin/editorial/review", icon: <FileText className="h-4 w-4" /> },
    ],
  },
  {
    title: "Sources",
    items: [
      { label: "All Sources", href: "/admin/sources", icon: <Rss className="h-4 w-4" /> },
      { label: "Add Source", href: "/admin/sources/new", icon: <ListChecks className="h-4 w-4" /> },
    ],
  },
  {
    title: "Community",
    items: [
      { label: "Posts", href: "/admin/community/posts", icon: <MessageSquare className="h-4 w-4" /> },
    ],
  },
  {
    title: "Users",
    items: [
      { label: "Users", href: "/admin/users", icon: <Users className="h-4 w-4" /> },
    ],
  },
  {
    title: "Analytics",
    items: [
      { label: "Overview", href: "/admin/analytics", icon: <BarChart3 className="h-4 w-4" /> },
      { label: "Search", href: "/admin/seo/redirects", icon: <Search className="h-4 w-4" /> },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Jobs", href: "/admin/system/jobs", icon: <BriefcaseBusiness className="h-4 w-4" /> },
      { label: "AI Usage", href: "/admin/system/ai", icon: <BrainCircuit className="h-4 w-4" /> },
      { label: "Notifications", href: "/admin/system/notifications", icon: <Bell className="h-4 w-4" /> },
      { label: "Freshness", href: "/admin/freshness", icon: <RefreshCw className="h-4 w-4" /> },
      { label: "Health", href: "/admin/system/health", icon: <AlertCircle className="h-4 w-4" /> },
      { label: "Settings", href: "/admin/settings", icon: <Settings className="h-4 w-4" /> },
    ],
  },
]

interface AdminSidebarProps {
  userRole: string
}

export function AdminSidebar({ userRole }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-56 shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col h-full overflow-y-auto">
      {/* Logo */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-900 dark:bg-white">
            <Zap className="h-3.5 w-3.5 text-white dark:text-zinc-900" />
          </div>
          <span className="font-semibold text-sm text-zinc-900 dark:text-white">NeuGravity</span>
          <span className="ml-auto text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">Admin</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-5" aria-label="Admin navigation">
        {navGroups.map((group) => (
          <div key={group.title || "main"}>
            {group.title && (
              <div className="px-2 mb-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {group.title}
              </div>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(item.href))
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors",
                        isActive
                          ? "bg-zinc-100 text-zinc-900 font-medium dark:bg-zinc-800 dark:text-white"
                          : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800/50"
                      )}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User info */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-zinc-50 dark:bg-zinc-900">
          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-zinc-200 dark:bg-zinc-700 text-xs font-medium text-zinc-600 dark:text-zinc-300">
            A
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-zinc-900 dark:text-white truncate">Admin</div>
            <div className="text-xs text-zinc-400 truncate">{userRole}</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
