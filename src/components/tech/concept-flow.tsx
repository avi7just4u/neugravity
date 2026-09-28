import Link from "next/link"
import type { FlowNode } from "@/lib/knowledge/tech-flows"

interface Props {
  nodes: FlowNode[]
  className?: string
}

export function ConceptFlow({ nodes, className = "" }: Props) {
  if (nodes.length === 0) return null

  return (
    <div className={`flex flex-col items-center gap-0 ${className}`} aria-label="Process flow diagram">
      {nodes.map((node, i) => (
        <div key={node.id} className="flex flex-col items-center w-full max-w-sm">
          {/* Node */}
          <div className="w-full">
            {node.href ? (
              <Link
                href={node.href}
                className="group flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-sm transition-all"
              >
                <div className="flex-shrink-0 h-7 w-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {node.label}
                  </div>
                  {node.description && (
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">{node.description}</div>
                  )}
                </div>
              </Link>
            ) : (
              <div className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
                <div className="flex-shrink-0 h-7 w-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-zinc-900 dark:text-white">{node.label}</div>
                  {node.description && (
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{node.description}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Connector arrow (not after last node) */}
          {i < nodes.length - 1 && (
            <div className="flex flex-col items-center py-1" aria-hidden="true">
              <div className="w-px h-3 bg-zinc-300 dark:bg-zinc-700" />
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="text-zinc-300 dark:text-zinc-700">
                <path d="M0 0L5 6L10 0" fill="currentColor" />
              </svg>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
