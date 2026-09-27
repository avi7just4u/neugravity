import { Lightbulb, BookOpen, AlertTriangle, HelpCircle, Code2, Star } from "lucide-react"

interface CalloutProps {
  children: React.ReactNode
  title?: string
}

function CalloutBase({
  children, title, icon, bg, border, titleColor,
}: {
  children: React.ReactNode
  title?: string
  icon: React.ReactNode
  bg: string
  border: string
  titleColor: string
}) {
  return (
    <div className={`rounded-xl border p-5 my-6 ${bg} ${border}`}>
      <div className={`flex items-center gap-2 font-semibold text-sm mb-2 ${titleColor}`}>
        {icon}
        {title}
      </div>
      <div className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{children}</div>
    </div>
  )
}

export function KeyIdea({ children, title = "Key Idea" }: CalloutProps) {
  return (
    <CalloutBase
      icon={<Lightbulb className="h-4 w-4" />}
      title={title}
      bg="bg-blue-50 dark:bg-blue-950/20"
      border="border-blue-200 dark:border-blue-800"
      titleColor="text-blue-700 dark:text-blue-400"
    >
      {children}
    </CalloutBase>
  )
}

export function Analogy({ children, title = "Analogy" }: CalloutProps) {
  return (
    <CalloutBase
      icon={<HelpCircle className="h-4 w-4" />}
      title={title}
      bg="bg-purple-50 dark:bg-purple-950/20"
      border="border-purple-200 dark:border-purple-800"
      titleColor="text-purple-700 dark:text-purple-400"
    >
      {children}
    </CalloutBase>
  )
}

export function Important({ children, title = "Important" }: CalloutProps) {
  return (
    <CalloutBase
      icon={<AlertTriangle className="h-4 w-4" />}
      title={title}
      bg="bg-amber-50 dark:bg-amber-950/20"
      border="border-amber-200 dark:border-amber-800"
      titleColor="text-amber-700 dark:text-amber-400"
    >
      {children}
    </CalloutBase>
  )
}

export function WatchOut({ children, title = "Watch Out" }: CalloutProps) {
  return (
    <CalloutBase
      icon={<AlertTriangle className="h-4 w-4" />}
      title={title}
      bg="bg-red-50 dark:bg-red-950/20"
      border="border-red-200 dark:border-red-800"
      titleColor="text-red-700 dark:text-red-400"
    >
      {children}
    </CalloutBase>
  )
}

export function Example({ children, title = "Example" }: CalloutProps) {
  return (
    <CalloutBase
      icon={<Code2 className="h-4 w-4" />}
      title={title}
      bg="bg-zinc-50 dark:bg-zinc-900"
      border="border-zinc-200 dark:border-zinc-700"
      titleColor="text-zinc-700 dark:text-zinc-300"
    >
      {children}
    </CalloutBase>
  )
}

export function Takeaway({ children, title = "Key Takeaway" }: CalloutProps) {
  return (
    <CalloutBase
      icon={<Star className="h-4 w-4" />}
      title={title}
      bg="bg-emerald-50 dark:bg-emerald-950/20"
      border="border-emerald-200 dark:border-emerald-800"
      titleColor="text-emerald-700 dark:text-emerald-400"
    >
      {children}
    </CalloutBase>
  )
}

export function LearningObjectives({ outcomes }: { outcomes: string[] }) {
  if (!outcomes.length) return null
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 mb-8">
      <div className="flex items-center gap-2 font-semibold text-sm text-zinc-900 dark:text-white mb-3">
        <BookOpen className="h-4 w-4 text-blue-500" />
        After this lesson, you can:
      </div>
      <ul className="space-y-1.5">
        {outcomes.map((o, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <span className="text-blue-500 font-bold shrink-0">→</span>
            {o}
          </li>
        ))}
      </ul>
    </div>
  )
}
