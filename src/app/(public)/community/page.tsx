import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, MessageSquare, Star, Cpu, Wrench, Briefcase } from "lucide-react"

export const metadata: Metadata = {
  title: "Community",
  description: "Join the NeuGravity technology community.",
}

const postTypes = [
  { label: "Questions", icon: <MessageSquare className="h-4 w-4" />, description: "Ask the community" },
  { label: "Discussions", icon: <Users className="h-4 w-4" />, description: "Start a conversation" },
  { label: "Show & Tell", icon: <Star className="h-4 w-4" />, description: "Share what you built" },
  { label: "Architecture", icon: <Cpu className="h-4 w-4" />, description: "Design discussions" },
  { label: "Tool Recommendations", icon: <Wrench className="h-4 w-4" />, description: "What tools do you use?" },
  { label: "Career", icon: <Briefcase className="h-4 w-4" />, description: "Career advice" },
]

export default function CommunityPage() {
  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-zinc-100 dark:bg-zinc-800">
            <Users className="h-7 w-7 text-zinc-500 dark:text-zinc-400" />
          </div>
        </div>
        <Badge variant="secondary" className="mb-4">Coming Soon</Badge>
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">NeuGravity Community</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed mb-8">
          A community for technology professionals to discuss tools, architecture, careers, and what&apos;s changing in technology.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10 text-left">
          {postTypes.map((t) => (
            <div key={t.label} className="flex items-start gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <div className="text-zinc-400 mt-0.5">{t.icon}</div>
              <div>
                <div className="font-medium text-sm text-zinc-900 dark:text-white">{t.label}</div>
                <div className="text-xs text-zinc-400">{t.description}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 mb-8">
          <h2 className="font-semibold text-zinc-900 dark:text-white mb-2">Get notified when we launch</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">Join the newsletter for early access to the community.</p>
          <form action="/api/newsletter/subscribe" method="POST" className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto">
            <input type="email" name="email" placeholder="Your email" required className="flex-1 h-10 px-3 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400" />
            <Button type="submit" className="shrink-0">Notify me</Button>
          </form>
        </div>

        <p className="text-sm text-zinc-400">Have questions? <Link href="/contact" className="text-indigo-600 dark:text-indigo-400 hover:underline">Contact us</Link></p>
      </div>
    </div>
  )
}
