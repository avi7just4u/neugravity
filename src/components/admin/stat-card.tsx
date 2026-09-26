import Link from "next/link"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: number | string
  icon: React.ReactNode
  href?: string
  trend?: 'up' | 'down' | 'neutral'
  color?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  attention?: boolean
  className?: string
}

const iconColors: Record<NonNullable<StatCardProps['color']>, string> = {
  default: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400',
  success: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400',
  warning: 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400',
  danger: 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400',
  info: 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400',
}

function CardContent({
  label,
  value,
  icon,
  color = 'default',
  attention,
}: Pick<StatCardProps, 'label' | 'value' | 'icon' | 'color' | 'attention'>) {
  const showDot = attention && Number(value) > 0
  return (
    <>
      {showDot && (
        <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-amber-400" />
      )}
      <div className={cn('shrink-0 flex h-10 w-10 items-center justify-center rounded-lg', iconColors[color ?? 'default'])}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-bold text-zinc-900 dark:text-white leading-none">{value}</div>
        <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">{label}</div>
      </div>
    </>
  )
}

export function StatCard({ label, value, icon, href, color = 'default', attention, className }: StatCardProps) {
  const isAttentionActive = attention && Number(value) > 0
  const borderClass = isAttentionActive
    ? 'border-amber-300 dark:border-amber-700'
    : 'border-zinc-200 dark:border-zinc-800'

  const base = cn(
    'relative rounded-xl border bg-white dark:bg-zinc-950 p-4 flex items-center gap-4',
    borderClass,
    href && 'hover:shadow-sm transition-shadow',
    className
  )

  if (href) {
    return (
      <Link href={href} className={base}>
        <CardContent label={label} value={value} icon={icon} color={color} attention={attention} />
      </Link>
    )
  }

  return (
    <div className={base}>
      <CardContent label={label} value={value} icon={icon} color={color} attention={attention} />
    </div>
  )
}
