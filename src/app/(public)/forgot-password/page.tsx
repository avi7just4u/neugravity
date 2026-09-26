"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Zap } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) {
        setError(error.message)
      } else {
        setSent(true)
      }
    } catch {
      setError("An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-zinc-900 dark:bg-white">
              <Zap className="h-4 w-4 text-white dark:text-zinc-900" />
            </div>
            <span className="font-bold text-zinc-900 dark:text-white">NeuGravity</span>
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Reset password</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {sent ? "Check your email" : "Enter your email to receive a reset link"}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          {sent ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                We sent a password reset link to <strong>{email}</strong>. Check your inbox and follow the link to set a new password.
              </p>
              <Button variant="outline" asChild className="w-full">
                <Link href="/login">Back to sign in</Link>
              </Button>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5" htmlFor="email">
                    Email address
                  </label>
                  <input
                    required
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send reset link"}
                </Button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-4">
          <Link href="/login" className="font-medium text-zinc-900 dark:text-white hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
