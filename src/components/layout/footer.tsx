import Link from "next/link"
import { Zap, Globe, GitBranch, Share2 } from "lucide-react"

const footerLinks = {
  Platform: [
    { label: "Technology", href: "/tech" },
    { label: "News", href: "/news" },
    { label: "Tools", href: "/tools" },
    { label: "Compare", href: "/compare" },
    { label: "Learn", href: "/learn" },
    { label: "Courses", href: "/courses" },
  ],
  Explore: [
    { label: "Companies", href: "/companies" },
    { label: "Interviews", href: "/interviews" },
    { label: "Inside Work", href: "/work" },
    { label: "Technology Status", href: "/status" },
    { label: "Community", href: "/community" },
    { label: "Learning Paths", href: "/learn" },
  ],
  Enterprise: [
    { label: "Enterprise Overview", href: "/enterprise" },
    { label: "AI Strategy", href: "/enterprise#ai-strategy" },
    { label: "Technology Advisory", href: "/enterprise#advisory" },
    { label: "Custom Training", href: "/enterprise#training" },
    { label: "Architecture Review", href: "/enterprise#architecture" },
    { label: "Contact Sales", href: "/enterprise#contact" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Sitemap", href: "/sitemap.xml" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        {/* Main footer */}
        <div className="py-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4" aria-label="NeuGravity home">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 dark:bg-white">
                <Zap className="h-4 w-4 text-white dark:text-zinc-900" />
              </div>
              <span className="font-bold text-lg text-zinc-900 dark:text-white">NeuGravity</span>
            </Link>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs">
              Understand technology. Navigate what&apos;s next.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a
                href="https://x.com/neugravity"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center h-8 w-8 rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors dark:hover:text-white dark:hover:bg-zinc-800"
                aria-label="NeuGravity on X"
              >
                <Share2 className="h-4 w-4" />
              </a>
              <a
                href="https://github.com/neugravity"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center h-8 w-8 rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors dark:hover:text-white dark:hover:bg-zinc-800"
                aria-label="NeuGravity on GitHub"
              >
                <GitBranch className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com/company/neugravity"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center h-8 w-8 rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors dark:hover:text-white dark:hover:bg-zinc-800"
                aria-label="NeuGravity on LinkedIn"
              >
                <Globe className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Link groups */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-4">
                {group}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors dark:text-zinc-400 dark:hover:text-white"
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
        <div className="border-t border-zinc-200 dark:border-zinc-800 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            &copy; {new Date().getFullYear()} NeuGravity. All rights reserved.
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Built for technologists, by technologists.
          </p>
        </div>
      </div>
    </footer>
  )
}
