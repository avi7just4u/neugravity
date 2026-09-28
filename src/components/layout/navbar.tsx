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
  Activity,
  Home,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const primaryNavItems = [
  { label: "Learn",     href: "/learn",     icon: <Code2     className="h-4 w-4" /> },
  { label: "News",      href: "/news",      icon: <Newspaper className="h-4 w-4" /> },
  { label: "Tools",     href: "/tools",     icon: <Wrench    className="h-4 w-4" /> },
  { label: "Compare",   href: "/compare",   icon: <BarChart3 className="h-4 w-4" /> },
  { label: "Tech",      href: "/tech",      icon: <Cpu       className="h-4 w-4" /> },
  { label: "Companies", href: "/companies", icon: <Building2 className="h-4 w-4" /> },
  { label: "Status",    href: "/status",    icon: <Activity  className="h-4 w-4" /> },
]

// Mobile: first 4 inline + More drawer for the rest
const mobilePrimary = primaryNavItems.slice(0, 4)
const mobileMore    = primaryNavItems.slice(4)

export function Navbar() {
  const pathname   = usePathname()
  const router     = useRouter()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [moreOpen,   setMoreOpen]   = React.useState(false)
  const [searchOpen, setSearchOpen] = React.useState(false)

  function closeMobile() {
    setMobileOpen(false)
    setMoreOpen(false)
  }

  // ⌘K / Ctrl+K → open search
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  // Lock body scroll while mobile drawer is open
  React.useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  // Focus trap: when drawer is open, constrain Tab/Shift+Tab to #mobile-nav
  const hamburgerRef = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (!mobileOpen) return
    const drawer = document.getElementById("mobile-nav")
    if (!drawer) return
    const focusable = () => Array.from(
      drawer.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),input,textarea,select,[tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.closest("[aria-hidden]"))
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { closeMobile(); hamburgerRef.current?.focus(); return }
      if (e.key !== "Tab") return
      const els = focusable()
      if (!els.length) return
      const first = els[0]; const last = els[els.length - 1]
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus() } }
      else            { if (document.activeElement === last)  { e.preventDefault(); first.focus() } }
    }
    // Set initial focus to first focusable element in drawer
    focusable()[0]?.focus()
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [mobileOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {/* ──────────────────── HEADER ──────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-zinc-800/80 dark:bg-zinc-950/95">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-4">

            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 shrink-0"
              aria-label="NeuGravity home"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
                <span className="text-white font-black text-sm leading-none select-none">N</span>
              </div>
              <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-white">
                NeuGravity
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-0.5" aria-label="Main navigation">
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
                        ? "text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/50"
                        : "text-zinc-600 hover:text-indigo-600 hover:bg-indigo-50/60 dark:text-zinc-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-950/30"
                    )}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 h-9 px-3 rounded-md border border-zinc-200 bg-zinc-50 text-sm text-zinc-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-indigo-700 dark:hover:text-indigo-400 lg:min-w-[200px]"
                aria-label="Search (⌘K)"
              >
                <Search className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden lg:block">Search...</span>
                <kbd className="hidden lg:flex ml-auto items-center gap-0.5 rounded border border-zinc-200 px-1.5 py-0.5 text-xs text-zinc-400 dark:border-zinc-700">
                  ⌘K
                </kbd>
              </button>

              {/* Enterprise — desktop */}
              <Link
                href="/enterprise"
                className="hidden md:flex items-center px-3 py-1.5 text-sm font-medium text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors"
              >
                Enterprise
              </Link>

              {/* Auth — desktop */}
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                  <Link href="/signup">Get started</Link>
                </Button>
              </div>

              {/* Hamburger — mobile */}
              <button
                ref={hamburgerRef}
                onClick={() => setMobileOpen(!mobileOpen)}
                className="flex items-center justify-center h-11 w-11 rounded-md border border-zinc-200 lg:hidden dark:border-zinc-700 hover:border-indigo-300 hover:text-indigo-600 dark:hover:border-indigo-700 dark:hover:text-indigo-400 transition-colors"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                aria-controls="mobile-nav"
              >
                {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ──────────────────── MOBILE DRAWER ──────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={closeMobile}
            aria-hidden="true"
          />
          <nav
            id="mobile-nav"
            className="absolute right-0 top-0 h-full w-72 bg-white shadow-xl dark:bg-zinc-950 flex flex-col"
            aria-label="Mobile navigation"
            aria-modal="true"
            role="dialog"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
              <Link href="/" className="flex items-center gap-2" onClick={closeMobile}>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
                  <span className="text-white font-black text-sm leading-none select-none">N</span>
                </div>
                <span className="font-bold text-zinc-900 dark:text-white">NeuGravity</span>
              </Link>
              <button
                onClick={closeMobile}
                className="flex items-center justify-center h-11 w-11 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-0.5">
              {/* Home */}
              <MobileNavLink href="/" label="Home" icon={<Home className="h-4 w-4" />} pathname={pathname} onClick={closeMobile} />

              {/* Primary 4 items */}
              {mobilePrimary.map((item) => (
                <MobileNavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  pathname={pathname}
                  onClick={closeMobile}
                />
              ))}

              {/* Search shortcut */}
              <button
                onClick={() => { closeMobile(); setSearchOpen(true) }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-zinc-600 hover:bg-indigo-50/60 hover:text-indigo-600 dark:text-zinc-400 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-400 transition-colors"
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
                  <ChevronRight
                    className={cn("h-3.5 w-3.5 ml-auto transition-transform", moreOpen && "rotate-90")}
                  />
                </button>

                {moreOpen && (
                  <div className="mt-1 ml-4 pl-3 border-l border-zinc-200 dark:border-zinc-800 space-y-0.5">
                    {mobileMore.map((item) => (
                      <MobileNavLink
                        key={item.href}
                        href={item.href}
                        label={item.label}
                        icon={item.icon}
                        pathname={pathname}
                        onClick={closeMobile}
                        compact
                      />
                    ))}
                    <MobileNavLink
                      href="/enterprise"
                      label="Enterprise"
                      icon={<Building2 className="h-4 w-4" />}
                      pathname={pathname}
                      onClick={closeMobile}
                      compact
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Auth footer */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/login" onClick={closeMobile}>Sign in</Link>
              </Button>
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600"
                asChild
              >
                <Link href="/signup" onClick={closeMobile}>Get started</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}

      {/* ──────────────────── SEARCH MODAL ──────────────────── */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          aria-label="Search"
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
            aria-hidden="true"
          />
          <div className="relative mx-auto mt-20 max-w-2xl px-4">
            <div className="rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-950 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">
                <Search className="h-4 w-4 text-indigo-500 shrink-0" />
                <input
                  autoFocus
                  type="search"
                  inputMode="search"
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

/* ──────────────────── HELPER ──────────────────── */
function MobileNavLink({
  href,
  label,
  icon,
  pathname,
  onClick,
  compact = false,
}: {
  href: string
  label: string
  icon: React.ReactNode
  pathname: string
  onClick: () => void
  compact?: boolean
}) {
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href))
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-md text-sm font-medium transition-colors",
        compact ? "px-3 py-2" : "px-3 py-2.5",
        isActive
          ? "text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/50"
          : "text-zinc-600 hover:bg-indigo-50/60 hover:text-indigo-600 dark:text-zinc-400 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-400"
      )}
    >
      {icon}
      {label}
    </Link>
  )
}
