import Link from "next/link"
import { cn } from "@/lib/utils"

interface Breadcrumb {
  label: string
  href?: string
}

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  breadcrumb?: Breadcrumb[]
  className?: string
}

export function PageHeader({ title, description, actions, breadcrumb, className }: PageHeaderProps) {
  return (
    <div className={cn("border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-6", className)}>
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mb-2">
          {breadcrumb.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-zinc-300 dark:text-zinc-600">/</span>}
              {crumb.href && i < breadcrumb.length - 1 ? (
                <Link href={crumb.href} className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className={i === breadcrumb.length - 1 ? "text-zinc-700 dark:text-zinc-300" : ""}>
                  {crumb.label}
                </span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">{title}</h1>
          {description && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{description}</p>
          )}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
    </div>
  )
}
