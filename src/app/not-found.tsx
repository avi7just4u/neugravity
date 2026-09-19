import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Home, Search, Cpu, Wrench, Newspaper } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-20 text-center">
      <div className="mb-6 text-6xl font-bold text-zinc-200 dark:text-zinc-800 select-none">404</div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">
        Page not found
      </h1>
      <p className="text-zinc-500 dark:text-zinc-400 max-w-md mb-8">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
        Try searching or explore what NeuGravity has to offer.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-12">
        <Button asChild>
          <Link href="/" className="gap-2">
            <Home className="h-4 w-4" />
            Go home
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/search" className="gap-2">
            <Search className="h-4 w-4" />
            Search
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg w-full">
        {[
          { label: "Technology", href: "/tech", icon: <Cpu className="h-4 w-4" /> },
          { label: "Tools", href: "/tools", icon: <Wrench className="h-4 w-4" /> },
          { label: "News", href: "/news", icon: <Newspaper className="h-4 w-4" /> },
          { label: "Learn", href: "/learn", icon: <ArrowRight className="h-4 w-4" /> },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-2 justify-center p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
          >
            {link.icon}
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
