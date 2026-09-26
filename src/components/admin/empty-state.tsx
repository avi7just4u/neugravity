import Link from "next/link"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
          {icon}
        </div>
      )}
      <p className="text-sm font-medium text-zinc-900 dark:text-white">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
      )}
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-white hover:underline"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-white hover:underline"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  )
}
