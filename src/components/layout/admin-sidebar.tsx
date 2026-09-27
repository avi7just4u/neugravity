"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  Newspaper,
  Wrench,
  Building2,
  Cpu,
  BarChart3,
  Rss,
  BriefcaseBusiness,
  MessageSquare,
  Users,
  Settings,
  AlertCircle,
  Zap,
  BookOpen,
  RefreshCw,
  Bell,
  BrainCircuit,
  LogOut,
  X,
  ScrollText,
  Network,
  Bot,
  Lightbulb,
  CalendarDays,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  requiredRoles?: string[]
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    title: "OVERVIEW",
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: <LayoutDashboard className="h-4 w-4" />,
      },
    ],
  },
  {
    title: "EDITORIAL",
    items: [
      {
        label: "Opportunities",
        href: "/admin/content-opportunities",
        icon: <Lightbulb className="h-4 w-4" />,
        requiredRoles: ["admin", "super_admin", "editor", "author", "reviewer", "analyst"],
      },
      {
        label: "Content Calendar",
        href: "/admin/content-calendar",
        icon: <CalendarDays className="h-4 w-4" />,
        requiredRoles: ["admin", "super_admin", "editor", "author", "reviewer", "analyst"],
      },
    ],
  },
  {
    title: "CONTENT",
    items: [
      {
        label: "News",
        href: "/admin/editorial",
        icon: <Newspaper className="h-4 w-4" />,
        requiredRoles: ["admin", "super_admin", "editor", "author", "reviewer"],
      },
      {
        label: "Sources",
        href: "/admin/sources",
        icon: <Rss className="h-4 w-4" />,
        requiredRoles: ["admin", "super_admin", "editor", "analyst"],
      },
      {
        label: "Knowledge",
        href: "/admin/knowledge",
        icon: <Network className="h-4 w-4" />,
        requiredRoles: ["admin", "super_admin", "editor", "author"],
      },
      {
        label: "Articles",
        href: "/admin/content/articles",
        icon: <FileText className="h-4 w-4" />,
        requiredRoles: ["admin", "super_admin", "editor", "author"],
      },
      {
        label: "Tools",
        href: "/admin/content/tools",
        icon: <Wrench className="h-4 w-4" />,
        requiredRoles: ["admin", "super_admin", "editor", "analyst"],
      },
      {
        label: "Technologies",
        href: "/admin/content/technologies",
        icon: <Cpu className="h-4 w-4" />,
        requiredRoles: ["admin", "super_admin", "editor"],
      },
      {
        label: "Companies",
        href: "/admin/content/companies",
        icon: <Building2 className="h-4 w-4" />,
        requiredRoles: ["admin", "super_admin", "editor"],
      },
      {
        label: "Comparisons",
        href: "/admin/content/comparisons",
        icon: <BarChart3 className="h-4 w-4" />,
        requiredRoles: ["admin", "super_admin", "editor"],
      },
    ],
  },
  {
    title: "EDUCATION",
    items: [
      {
        label: "Education",
        href: "/admin/education",
        icon: <BookOpen className="h-4 w-4" />,
        requiredRoles: ["admin", "super_admin", "course_manager", "editor"],
      },
    ],
  },
  {
    title: "COMMUNITY",
    items: [
      {
        label: "Posts",
        href: "/admin/community/posts",
        icon: <MessageSquare className="h-4 w-4" />,
        requiredRoles: ["admin", "super_admin", "community_moderator"],
      },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      {
        label: "Automation",
        href: "/admin/system/automation",
        icon: <Bot className="h-4 w-4" />,
        requiredRoles: ["admin", "super_admin", "analyst"],
      },
      {
        label: "Jobs",
        href: "/admin/system/jobs",
        icon: <BriefcaseBusiness className="h-4 w-4" />,
        requiredRoles: ["admin", "super_admin", "analyst"],
      },
      {
        label: "AI Usage",
        href: "/admin/system/ai",
        icon: <BrainCircuit className="h-4 w-4" />,
        requiredRoles: ["admin", "super_admin"],
      },
      {
        label: "Freshness",
        href: "/admin/freshness",
        icon: <RefreshCw className="h-4 w-4" />,
        requiredRoles: ["admin", "super_admin", "analyst"],
      },
      {
        label: "Health",
        href: "/admin/system/health",
        icon: <AlertCircle className="h-4 w-4" />,
        requiredRoles: ["admin", "super_admin"],
      },
      {
        label: "Audit Log",
        href: "/admin/system/audit",
        icon: <ScrollText className="h-4 w-4" />,
        requiredRoles: ["admin", "super_admin"],
      },
      {
        label: "Notifications",
        href: "/admin/system/notifications",
        icon: <Bell className="h-4 w-4" />,
        requiredRoles: ["admin", "super_admin"],
      },
      {
        label: "Settings",
        href: "/admin/settings",
        icon: <Settings className="h-4 w-4" />,
        requiredRoles: ["admin", "super_admin"],
      },
      {
        label: "Users",
        href: "/admin/users",
        icon: <Users className="h-4 w-4" />,
        requiredRoles: ["admin", "super_admin"],
      },
    ],
  },
]

interface AdminSidebarProps {
  userRole: string
  displayName?: string
  mobileOpen: boolean
  onMobileClose: () => void
}

export function AdminSidebar({ userRole, displayName, mobileOpen, onMobileClose }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
    router.refresh()
  }

  const avatarLetter = (displayName?.[0] ?? userRole[0] ?? "A").toUpperCase()

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-60 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col transition-transform duration-200 ease-in-out",
          "md:relative md:translate-x-0 md:z-auto",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center">
          <Link href="/admin" className="flex items-center gap-2 flex-1">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-900 dark:bg-white shrink-0">
              <Zap className="h-3.5 w-3.5 text-white dark:text-zinc-900" />
            </div>
            <span className="font-semibold text-sm text-zinc-900 dark:text-white">NeuGravity</span>
            <span className="ml-auto text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">Admin</span>
          </Link>
          {/* Mobile close button */}
          <button
            type="button"
            onClick={onMobileClose}
            className="md:hidden ml-2 p-1 rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-5 overflow-y-auto" aria-label="Admin navigation">
          {navSections.map((section) => {
            const visibleItems = section.items.filter(
              (item) => !item.requiredRoles || item.requiredRoles.includes(userRole)
            )
            if (visibleItems.length === 0) return null

            return (
              <div key={section.title}>
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-2 mb-1.5">
                  {section.title}
                </div>
                <ul className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const isActive =
                      item.href === "/admin"
                        ? pathname === item.href
                        : pathname.startsWith(item.href)
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onMobileClose}
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
            )
          })}
        </nav>

        {/* User info + logout */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-zinc-50 dark:bg-zinc-900">
            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-zinc-200 dark:bg-zinc-700 text-xs font-medium text-zinc-600 dark:text-zinc-300 shrink-0">
              {avatarLetter}
            </div>
            <div className="flex-1 min-w-0">
              {displayName ? (
                <>
                  <div className="text-xs font-medium text-zinc-900 dark:text-white truncate">{displayName}</div>
                  <div className="text-xs text-zinc-500 truncate capitalize">{userRole.replace(/_/g, " ")}</div>
                </>
              ) : (
                <div className="text-xs font-medium text-zinc-900 dark:text-white truncate capitalize">{userRole}</div>
              )}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}
