"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, HelpCircle, Bell, LogOut, Settings, User, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

interface AdminHeaderProps {
  userRole: string
  userEmail?: string
  displayName?: string
  onMenuClick: () => void
  notificationCount?: number
}

function getPageTitle(pathname: string): string {
  if (pathname === "/admin") return "Dashboard"
  if (pathname.startsWith("/admin/editorial")) return "Editorial Queue"
  if (pathname.startsWith("/admin/sources")) return "Sources"
  if (pathname.startsWith("/admin/content/news")) return "News"
  if (pathname.startsWith("/admin/content/articles")) return "Articles"
  if (pathname.startsWith("/admin/content/tools")) return "Tools"
  if (pathname.startsWith("/admin/content/companies")) return "Companies"
  if (pathname.startsWith("/admin/content/technologies")) return "Technologies"
  if (pathname.startsWith("/admin/content/comparisons")) return "Comparisons"
  if (pathname.startsWith("/admin/content/courses")) return "Courses"
  if (pathname.startsWith("/admin/community")) return "Community"
  if (pathname.startsWith("/admin/system/jobs")) return "Jobs"
  if (pathname.startsWith("/admin/system/ai")) return "AI Usage"
  if (pathname.startsWith("/admin/system/health")) return "Health"
  if (pathname.startsWith("/admin/system/audit")) return "Audit Log"
  if (pathname.startsWith("/admin/system/notifications")) return "Notifications"
  if (pathname.startsWith("/admin/system")) return "System"
  if (pathname.startsWith("/admin/freshness")) return "Freshness"
  if (pathname.startsWith("/admin/settings")) return "Settings"
  if (pathname.startsWith("/admin/users")) return "Users"
  if (pathname.startsWith("/admin/analytics")) return "Analytics"
  return "Admin"
}

export function AdminHeader({
  userRole,
  userEmail,
  displayName,
  onMenuClick,
  notificationCount = 0,
}: AdminHeaderProps) {
  const pathname = usePathname()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const pageTitle = getPageTitle(pathname)
  const avatarLetter = (displayName?.[0] ?? userRole[0] ?? "A").toUpperCase()

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleMouseDown)
    }
    return () => document.removeEventListener("mousedown", handleMouseDown)
  }, [userMenuOpen])

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" })
    window.location.href = "/login"
  }

  return (
    <header className="h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 md:px-6 flex items-center gap-4 shrink-0">
      {/* Left side */}
      <button
        type="button"
        onClick={onMenuClick}
        className="md:hidden p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <h1 className="text-sm font-semibold text-zinc-900 dark:text-white flex-1">
        {pageTitle}
      </h1>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* PROD badge */}
        <span className="hidden sm:inline-flex text-xs font-medium px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
          PROD
        </span>

        {/* Help */}
        <Link
          href="/admin/docs"
          target="_blank"
          className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors"
          aria-label="Help"
        >
          <HelpCircle className="h-4 w-4" />
        </Link>

        {/* Notifications */}
        <button
          type="button"
          className="relative p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
          )}
        </button>

        {/* User menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setUserMenuOpen((prev) => !prev)}
            className="flex items-center justify-center h-7 w-7 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold hover:opacity-80 transition-opacity"
            aria-label="User menu"
            aria-expanded={userMenuOpen}
          >
            {avatarLetter}
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-56 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg rounded-xl p-1">
              {/* User info */}
              <div className="px-3 py-2.5 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                {displayName && (
                  <div className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                    {displayName}
                  </div>
                )}
                {userEmail && (
                  <div className="text-xs text-zinc-500 truncate mt-0.5">
                    {userEmail}
                  </div>
                )}
                <span className="inline-flex mt-1.5 text-xs font-medium px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 capitalize">
                  {userRole.replace(/_/g, " ")}
                </span>
              </div>

              {/* Links */}
              <Link
                href="/admin/settings/profile"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <User className="h-3.5 w-3.5 text-zinc-400" />
                Profile
              </Link>
              <Link
                href="/admin/settings/activity"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <Activity className="h-3.5 w-3.5 text-zinc-400" />
                My Activity
              </Link>
              <Link
                href="/admin/settings"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <Settings className="h-3.5 w-3.5 text-zinc-400" />
                Settings
              </Link>

              {/* Divider */}
              <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
