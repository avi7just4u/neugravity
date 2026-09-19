import { createAdminClient } from "@/lib/supabase/server"
import type { Job } from "@/types"

const QUEUES = [
  "source-fetch",
  "content-normalization",
  "deduplication",
  "content-enrichment",
  "news-processing",
  "tool-refresh",
  "status-monitor",
  "search-indexing",
  "embedding-generation",
  "publishing",
  "notifications",
]

export const JobService = {
  async enqueue(opts: {
    queue_name: string
    job_type: string
    payload: Record<string, unknown>
    priority?: number
    max_attempts?: number
    scheduled_at?: Date
    idempotency_key?: string
    created_by?: string
  }): Promise<{ id: string } | null> {
    const db = createAdminClient()
    const { data, error } = await db
      .from("jobs")
      .insert({
        queue_name: opts.queue_name,
        job_type: opts.job_type,
        payload: opts.payload,
        priority: opts.priority ?? 5,
        max_attempts: opts.max_attempts ?? 3,
        scheduled_at: opts.scheduled_at?.toISOString() ?? new Date().toISOString(),
        idempotency_key: opts.idempotency_key ?? null,
        created_by: opts.created_by ?? null,
        status: "queued",
        attempts: 0,
      })
      .select("id")
      .single()

    if (error) {
      if (error.code === "23505") return null // duplicate idempotency_key — that's fine
      return null
    }
    return data ? { id: data.id } : null
  },

  async claimNext(queue_name: string): Promise<Job | null> {
    const db = createAdminClient()
    const now = new Date().toISOString()

    // Atomically claim the highest-priority due job
    const { data, error } = await db.rpc("claim_next_job", { p_queue_name: queue_name, p_now: now })
    if (error || !data) return null
    return data as Job
  },

  async complete(job_id: string): Promise<void> {
    const db = createAdminClient()
    await db
      .from("jobs")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", job_id)
  },

  async fail(job_id: string, error: string, error_code?: string): Promise<void> {
    const db = createAdminClient()

    const { data: job } = await db
      .from("jobs")
      .select("attempts, max_attempts")
      .eq("id", job_id)
      .single()

    if (!job) return

    const attempts = (job.attempts ?? 0) + 1
    const isDead = attempts >= (job.max_attempts ?? 3)
    const backoffSeconds = Math.min(Math.pow(2, attempts), 3600)
    const nextRetry = new Date(Date.now() + backoffSeconds * 1000).toISOString()

    await db.from("jobs").update({
      attempts,
      status: isDead ? "dead_lettered" : "retrying",
      last_error: error,
      error_message: error,
      error_code: error_code ?? null,
      failed_at: isDead ? new Date().toISOString() : null,
      scheduled_at: isDead ? undefined : nextRetry,
    }).eq("id", job_id)

    await db.from("job_attempts").insert({
      job_id,
      attempt_number: attempts,
      status: "failed",
      error,
      completed_at: new Date().toISOString(),
    })
  },

  async getJobs(opts: {
    queue_name?: string
    status?: string
    limit?: number
    page?: number
  }): Promise<{ data: Job[]; total: number }> {
    const db = createAdminClient()
    const limit = opts.limit ?? 50
    const page = opts.page ?? 1
    const from = (page - 1) * limit
    const to = from + limit - 1

    let q = db
      .from("jobs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to)

    if (opts.queue_name) q = q.eq("queue_name", opts.queue_name)
    if (opts.status) q = q.eq("status", opts.status)

    const { data, count, error } = await q
    if (error) return { data: [], total: 0 }
    return { data: (data ?? []) as Job[], total: count ?? 0 }
  },

  async retry(job_id: string): Promise<void> {
    const db = createAdminClient()
    await db.from("jobs").update({
      status: "queued",
      scheduled_at: new Date().toISOString(),
      error_message: null,
      last_error: null,
    }).eq("id", job_id)
  },

  async cancel(job_id: string): Promise<void> {
    const db = createAdminClient()
    await db.from("jobs").update({ status: "cancelled" }).eq("id", job_id).in("status", ["queued", "retrying"])
  },

  async getQueueStats(): Promise<Record<string, { queued: number; running: number; failed: number; dead_lettered: number }>> {
    const db = createAdminClient()
    const { data } = await db
      .from("jobs")
      .select("queue_name, status")
      .in("status", ["queued", "running", "failed", "dead_lettered", "retrying"])

    const stats: Record<string, { queued: number; running: number; failed: number; dead_lettered: number }> = {}
    for (const q of QUEUES) {
      stats[q] = { queued: 0, running: 0, failed: 0, dead_lettered: 0 }
    }

    for (const row of data ?? []) {
      const q = row.queue_name as string
      if (!stats[q]) stats[q] = { queued: 0, running: 0, failed: 0, dead_lettered: 0 }
      if (row.status === "queued" || row.status === "retrying") stats[q].queued++
      else if (row.status === "running") stats[q].running++
      else if (row.status === "failed") stats[q].failed++
      else if (row.status === "dead_lettered") stats[q].dead_lettered++
    }

    return stats
  },
}
