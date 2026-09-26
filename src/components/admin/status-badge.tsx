import { cn } from "@/lib/utils"

type StatusVariant =
  | 'healthy' | 'active' | 'published' | 'approved'
  | 'warning' | 'stale' | 'needs_review'
  | 'failed' | 'rejected' | 'error' | 'dead_lettered'
  | 'not_configured' | 'unknown' | 'inactive'
  | 'pending' | 'queued' | 'discovered' | 'enriching'
  | 'draft'

interface StatusBadgeProps {
  status: StatusVariant | string
  size?: 'sm' | 'md'
  className?: string
}

function capitalize(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function getVariant(status: string): { dot: string; label: string } {
  switch (status) {
    case 'healthy':
    case 'active':
    case 'published':
    case 'approved':
      return { dot: 'bg-emerald-500', label: capitalize(status) }
    case 'warning':
      return { dot: 'bg-amber-500', label: 'Warning' }
    case 'stale':
      return { dot: 'bg-amber-500', label: 'Stale' }
    case 'needs_review':
      return { dot: 'bg-amber-500', label: 'Needs Review' }
    case 'failed':
    case 'rejected':
    case 'error':
    case 'dead_lettered':
      return { dot: 'bg-red-500', label: capitalize(status) }
    case 'not_configured':
      return { dot: 'bg-zinc-400', label: 'Not Configured' }
    case 'unknown':
      return { dot: 'bg-zinc-400', label: 'Unknown' }
    case 'inactive':
      return { dot: 'bg-zinc-400', label: 'Inactive' }
    case 'pending':
    case 'queued':
      return { dot: 'bg-blue-500', label: 'Pending' }
    case 'discovered':
      return { dot: 'bg-blue-500', label: 'Discovered' }
    case 'enriching':
      return { dot: 'bg-blue-500', label: 'Enriching' }
    case 'draft':
      return { dot: 'bg-zinc-500', label: 'Draft' }
    default:
      return { dot: 'bg-zinc-400', label: capitalize(status) }
  }
}

export function StatusBadge({ status, size = 'sm', className }: StatusBadgeProps) {
  const { dot, label } = getVariant(status)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        'bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800',
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1',
        className
      )}
    >
      <span
        className={cn(
          'shrink-0 rounded-full',
          dot,
          size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'
        )}
      />
      {label}
    </span>
  )
}
