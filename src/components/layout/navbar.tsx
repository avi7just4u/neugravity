"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Search,
  Menu,
  X,
  Cpu,
  Newspaper,
  Wrench,
  BarChart3,
  Code2,
  Building2,
  Briefcase,
  Mic2,
  Users,
  Zap,
  Home,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const primaryNavItems = [
  { label: "Learn", href: "/learn", icon: <Code2 className="h-4 w-4" /> },
  { label: "News", href: "/news", icon: <Newspaper className="h-4 w-4" /> },
  { label: "Tools", href: "/tools", icon: <Wrench className="h-4 w-4" /> },
  { label: "Compare", href: "/compare", icon: <BarChart3 className="h-4 w-4" /> },
  { label: "Tech", href: "/tech", icon: <Cpu className="h-4 w-4" /> },
  { label: "Companies", href: "/companies", icon: <Building2 className="h-4 w-4" /> },
  { label: "Work", href: "/work", icon: <Briefcase className="h-4 w-4" /> },
  { label: "Interviews", href: "/interviews", icon: <Mic2 className="h-4 w-4" /> },
  { label: "Community", href: "/community", icon: <Users className="h-4 w-4" /> },
]

// Mobile: 5 primary items visible directly + More for the rest
const mobilePrimary = primaryNavItems.slice(0, 4)
const mobileMore = primaryNavItems.slice(4)

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [moreOpen, setMoreOpen] = React.useState(false)
  const [searchOpen, setSearchOpen] = React.useState(false)

  function closeMobile() {
    setMobileOpen(false)
    setMoreOpen(false)
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-zinc-800/80 dark:bg-zinc-950/95">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-4">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 shrink-0"
              aria-label="NeuGravity home"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 dark:bg-white">
                <Zap className="h-4 w-4 text-white dark:text-zinc-900" />
              </div>
              <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-white">
                NeuGravity
              </span>
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
              {primaryNavItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "text-zinc-900 bg-zinc-100 dark:text-white dark:bg-zinc-800"
                        : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800/50"
                    )}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {/* Search button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 h-9 px-3 rounded-md border border-zinc-200 bg-zinc-50 text-sm text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 transition-colors dark:border-zinc-700 dark:bg-zinc-900 dark:hover:text-white dark:hover:border-zinc-600 lg:min-w-[200px]"
                aria-label="Search"
              >
                <Search className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden lg:block">Search technology...</span>
                <kbd className="hidden lg:flex ml-auto items-center gap-0.5 rounded border border-zinc-200 px-1.5 py-0.5 text-xs text-zinc-400 dark:border-zinc-700">
                  ⌘K
                </kbd>
              </button>

              {/* Enterprise link - desktop */}
              <Link
                href="/enterprise"
                className="hidden md:flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
              >
                Enterprise
              </Link>

              {/* Auth buttons */}
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/signup">Get started</Link>
                </Button>
              </div>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="flex items-center justify-center h-9 w-9 rounded-md border border-zinc-200 lg:hidden dark:border-zinc-700"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile navigation drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={closeMobile}
          />
          <nav
            className="absolute right-0 top-0 h-full w-72 bg-white shadow-xl dark:bg-zinc-950 flex flex-col"
            aria-label="Mobile navigation"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
              <Link
                href="/"
                className="flex items-center gap-2"
                onClick={closeMobile}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 dark:bg-white">
                  <Zap className="h-4 w-4 text-white dark:text-zinc-900" />
                </div>
                <span className="font-bold text-zinc-900 dark:text-white">NeuGravity</span>
              </Link>
              <button
                onClick={closeMobile}
                className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {/* Home */}
              <Link
                href="/"
                onClick={closeMobile}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  pathname === "/"
                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                )}
              >
                <Home className="h-4 w-4" />
                Home
              </Link>

              {/* Primary 4 items */}
              {mobilePrimary.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobile}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                )
              })}

              {/* Search shortcut */}
              <button
                onClick={() => { closeMobile(); setSearchOpen(true) }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors"
              >
                <Search className="h-4 w-4" />
                Search
              </button>

              {/* More section */}
              <div className="pt-1">
                <button
                  onClick={() => setMoreOpen(!moreOpen)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors"
                  aria-expanded={moreOpen}
                >
                  <MoreHorizontal className="h-4 w-4" />
                  More
                  <ChevronRight className={cn("h-3.5 w-3.5 ml-auto transition-transform", moreOpen && "rotate-90")} />
                </button>

                {moreOpen && (
                  <div className="mt-1 ml-4 pl-3 border-l border-zinc-200 dark:border-zinc-800 space-y-1">
                    {mobileMore.map((item) => {
                      const isActive =
                        pathname === item.href ||
                        (item.href !== "/" && pathname.startsWith(item.href))
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={closeMobile}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                            isActive
                              ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
                              : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                          )}
                        >
                          {item.icon}
                          {item.label}
                        </Link>
                      )
                    })}
                    <Link
                      href="/enterprise"
                      onClick={closeMobile}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors"
                    >
                      <Building2 className="h-4 w-4" />
                      Enterprise
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Auth actions */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/login" onClick={closeMobile}>
                  Sign in
                </Link>
              </Button>
              <Button className="w-full" asChild>
                <Link href="/signup" onClick={closeMobile}>
                  Get started
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}

      {/* Search modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          />
          <div className="relative mx-auto mt-20 max-w-2xl px-4">
            <div className="rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-950 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">
                <Search className="h-4 w-4 text-zinc-400 shrink-0" />
                <input
                  autoFocus
                  type="text"
                  placeholder="What do you want to understand?"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400 dark:text-white"
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setSearchOpen(false)
                    if (e.key === "Enter") {
                      const query = (e.target as HTMLInputElement).value
                      if (query.trim()) {
                        router.push(`/search?q=${encodeURIComponent(query)}`)
                        setSearchOpen(false)
                      }
                    }
                  }}
                />
                <kbd className="hidden sm:flex items-center gap-0.5 rounded border border-zinc-200 px-1.5 py-0.5 text-xs text-zinc-400 dark:border-zinc-700">
                  ESC
                </kbd>
              </div>
              <div className="px-4 py-3 text-xs text-zinc-400 dark:text-zinc-500">
                Search for technologies, tools, companies, articles, and more
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
