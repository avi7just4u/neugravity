"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Zap, Globe } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? "Login failed.")
      } else {
        router.push("/")
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
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Sign in</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Welcome back</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 h-10 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
          >
            <Globe className="h-4 w-4" />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
            or
            <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5" htmlFor="email">Email</label>
              <input
                required id="email" type="email" autoComplete="email"
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300" htmlFor="password">Password</label>
                <Link href="/forgot-password" className="text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-white">Forgot?</Link>
              </div>
              <input
                required id="password" type="password" autoComplete="current-password"
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-4">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-zinc-900 dark:text-white hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
