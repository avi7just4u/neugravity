"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Zap, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (!agreed) { setError("Please agree to the terms."); return }
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: name } },
      })
      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
      }
    } catch {
      setError("An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm text-center">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 dark:bg-white">
              <Zap className="h-4 w-4 text-white dark:text-zinc-900" />
            </div>
          </div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">Check your email</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
          </p>
          <Button variant="outline" asChild>
            <Link href="/login">Back to sign in</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 dark:bg-white">
            <Zap className="h-4 w-4 text-white dark:text-zinc-900" />
          </div>
          <span className="font-bold text-lg text-zinc-900 dark:text-white">NeuGravity</span>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-white mb-1">Create account</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
            Join NeuGravity to track technologies, save tools, and learn.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            <div className="flex items-start gap-2">
              <input
                id="terms"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-zinc-300 dark:border-zinc-600"
              />
              <label htmlFor="terms" className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                I agree to the{" "}
                <Link href="/terms" className="underline hover:text-zinc-900 dark:hover:text-white">Terms of Service</Link>
                {" "}and{" "}
                <Link href="/privacy" className="underline hover:text-zinc-900 dark:hover:text-white">Privacy Policy</Link>
              </label>
            </div>

            <Button type="submit" className="w-full gap-2" disabled={loading}>
              {loading ? "Creating account..." : (
                <>Create account <ArrowRight className="h-4 w-4" /></>
              )}
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-zinc-900 dark:text-white hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
