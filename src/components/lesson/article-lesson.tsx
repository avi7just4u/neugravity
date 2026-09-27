interface ArticleLessonProps {
  content: string
}

function parseInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/)
    const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/)
    const codeMatch = remaining.match(/`(.+?)`/)

    const candidates = [
      boldMatch ? { type: "bold" as const, match: boldMatch } : null,
      italicMatch ? { type: "italic" as const, match: italicMatch } : null,
      codeMatch ? { type: "code" as const, match: codeMatch } : null,
    ].filter(Boolean) as { type: "bold" | "italic" | "code"; match: RegExpMatchArray }[]

    if (!candidates.length) {
      parts.push(remaining)
      break
    }

    candidates.sort((a, b) => (a.match.index ?? 0) - (b.match.index ?? 0))
    const first = candidates[0]
    const idx = first.match.index ?? 0

    if (idx > 0) parts.push(remaining.slice(0, idx))

    if (first.type === "bold") {
      parts.push(<strong key={key++} className="font-semibold text-zinc-900 dark:text-white">{first.match[1]}</strong>)
    } else if (first.type === "italic") {
      parts.push(<em key={key++} className="italic">{first.match[1]}</em>)
    } else {
      parts.push(<code key={key++} className="font-mono text-sm bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-blue-600 dark:text-blue-400">{first.match[1]}</code>)
    }

    remaining = remaining.slice(idx + first.match[0].length)
  }

  return parts.length === 1 && typeof parts[0] === "string" ? parts[0] : <>{parts}</>
}

export function ArticleLesson({ content }: ArticleLessonProps) {
  const lines = content.split("\n")
  const nodes: React.ReactNode[] = []
  let i = 0
  let key = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith("```")) {
      const lang = line.slice(3).trim()
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i])
        i++
      }
      nodes.push(
        <div key={key++} className="my-6 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
          {lang && (
            <div className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 text-xs font-mono text-zinc-500">
              {lang}
            </div>
          )}
          <pre className="p-4 bg-zinc-50 dark:bg-zinc-900 overflow-x-auto text-sm leading-relaxed">
            <code className="font-mono text-zinc-800 dark:text-zinc-200">{codeLines.join("\n")}</code>
          </pre>
        </div>
      )
      i++
      continue
    }

    if (line.startsWith("# ")) {
      nodes.push(<h2 key={key++} className="text-2xl font-bold text-zinc-900 dark:text-white mt-10 mb-4 leading-tight">{parseInline(line.slice(2))}</h2>)
      i++; continue
    }
    if (line.startsWith("## ")) {
      nodes.push(<h3 key={key++} className="text-xl font-semibold text-zinc-900 dark:text-white mt-8 mb-3">{parseInline(line.slice(3))}</h3>)
      i++; continue
    }
    if (line.startsWith("### ")) {
      nodes.push(<h4 key={key++} className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mt-6 mb-2">{parseInline(line.slice(4))}</h4>)
      i++; continue
    }
    if (line.startsWith("> ")) {
      nodes.push(
        <blockquote key={key++} className="border-l-4 border-blue-400 pl-4 my-4 text-zinc-600 dark:text-zinc-400 italic text-sm">
          {parseInline(line.slice(2))}
        </blockquote>
      )
      i++; continue
    }
    if (line.match(/^[-*] /)) {
      const items: string[] = []
      while (i < lines.length && lines[i].match(/^[-*] /)) {
        items.push(lines[i].slice(2))
        i++
      }
      nodes.push(
        <ul key={key++} className="my-4 space-y-2 pl-4">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-2 text-zinc-700 dark:text-zinc-300 text-[15px] leading-relaxed">
              <span className="text-blue-500 font-bold mt-0.5 shrink-0">•</span>
              {parseInline(item)}
            </li>
          ))}
        </ul>
      )
      continue
    }
    if (line.match(/^\d+\. /)) {
      const items: string[] = []
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        items.push(lines[i].replace(/^\d+\. /, ""))
        i++
      }
      nodes.push(
        <ol key={key++} className="my-4 space-y-2 pl-4">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-3 text-zinc-700 dark:text-zinc-300 text-[15px] leading-relaxed">
              <span className="text-blue-500 font-semibold shrink-0 min-w-[1.5rem]">{j + 1}.</span>
              {parseInline(item)}
            </li>
          ))}
        </ol>
      )
      continue
    }
    if (line.match(/^---+$/)) {
      nodes.push(<hr key={key++} className="my-8 border-zinc-200 dark:border-zinc-800" />)
      i++; continue
    }
    if (line.trim() === "") {
      i++; continue
    }
    nodes.push(
      <p key={key++} className="text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300 my-4">
        {parseInline(line)}
      </p>
    )
    i++
  }

  return <div className="lesson-article">{nodes}</div>
}
