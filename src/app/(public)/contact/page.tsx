import type { Metadata } from "next"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the NeuGravity team.",
}

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-xl">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Contact</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8">Have a question, feedback, or want to work with us? We&apos;d love to hear from you.</p>

        <form action="/api/contact" method="POST" className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5" htmlFor="name">Name *</label>
            <input required id="name" name="name" type="text" className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5" htmlFor="email">Email *</label>
            <input required id="email" name="email" type="email" className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5" htmlFor="subject">Subject</label>
            <input id="subject" name="subject" type="text" className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5" htmlFor="message">Message *</label>
            <textarea required id="message" name="message" rows={5} className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 resize-none" />
          </div>
          <Button type="submit">Send message</Button>
          <p className="text-xs text-zinc-400">For enterprise inquiries, visit our <a href="/enterprise" className="underline">Enterprise page</a>.</p>
        </form>
      </div>
    </div>
  )
}
