import Link from "next/link"
import { Globe, GitBranch, Share2 } from "lucide-react"

const footerLinks = {
  Platform: [
    { label: "Technology",  href: "/tech" },
    { label: "News",        href: "/news" },
    { label: "Tools",       href: "/tools" },
    { label: "Compare",     href: "/compare" },
    { label: "Companies",   href: "/companies" },
    { label: "Status",      href: "/status" },
  ],
  Learn: [
    { label: "Learn",   href: "/learn" },
    { label: "Courses", href: "/courses" },
  ],
  Enterprise: [
    { label: "Overview",        href: "/enterprise" },
    { label: "Contact Sales",   href: "/enterprise#contact" },
  ],
  Company: [
    { label: "About",           href: "/about" },
    { label: "Privacy Policy",  href: "/privacy" },
    { label: "Terms of Service",href: "/terms" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        {/* Main grid */}
        <div className="py-12 grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4 lg:grid-cols-5">

          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3" aria-label="NeuGravity home">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
                <span className="text-white font-black text-sm leading-none select-none">N</span>
              </div>
              <span className="font-bold text-lg text-zinc-900 dark:text-white">NeuGravity</span>
            </Link>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs">
              Intelligence for the technology-curious.
            </p>
            <div className="flex items-center gap-2 mt-5">
              <a
                href="https://x.com/neugravity"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center h-8 w-8 rounded-md text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors dark:hover:text-indigo-400 dark:hover:bg-indigo-950/50"
                aria-label="NeuGravity on X"
              >
                <Share2 className="h-4 w-4" />
              </a>
              <a
                href="https://github.com/neugravity"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center h-8 w-8 rounded-md text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors dark:hover:text-indigo-400 dark:hover:bg-indigo-950/50"
                aria-label="NeuGravity on GitHub"
              >
                <GitBranch className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com/company/neugravity"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center h-8 w-8 rounded-md text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors dark:hover:text-indigo-400 dark:hover:bg-indigo-950/50"
                aria-label="NeuGravity on LinkedIn"
              >
                <Globe className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h3 className="text-label text-zinc-900 dark:text-zinc-100 mb-4">
                {group}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-500 hover:text-indigo-600 transition-colors dark:text-zinc-400 dark:hover:text-indigo-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            &copy; {new Date().getFullYear()} NeuGravity. All rights reserved.
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Built for engineers and learners.
          </p>
        </div>
      </div>
    </footer>
  )
}
