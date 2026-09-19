import { createAdminClient } from "@/lib/supabase/server"
import type { IngestionJob } from "@/types"

export const IngestionService = {
  async createJob(
    type: string,
    payload: Record<string, unknown>,
    opts?: { priority?: number; createdBy?: string }
  ): Promise<string> {
    const supabase = await createAdminClient()
    const { data, error } = await supabase
      .from("ingestion_jobs")
      .insert({
        type,
        payload,
        priority: opts?.priority ?? 5,
        created_by: opts?.createdBy ?? null,
        status: "pending",
        attempts: 0,
        max_attempts: 3,
      })
      .select("id")
      .single()

    if (error || !data) throw new Error(`Failed to create job: ${error?.message}`)
    return data.id
  },

  async getJob(id: string): Promise<IngestionJob | null> {
    try {
      const supabase = await createAdminClient()
      const { data, error } = await supabase
        .from("ingestion_jobs")
        .select("*")
        .eq("id", id)
        .single()

      if (error || !data) return null
      return data as IngestionJob
    } catch {
      return null
    }
  },

  async getPendingJobs(limit = 50): Promise<IngestionJob[]> {
    try {
      const supabase = await createAdminClient()
      const { data, error } = await supabase
        .from("ingestion_jobs")
        .select("*")
        .eq("status", "pending")
        .order("priority", { ascending: false })
        .order("created_at", { ascending: true })
        .limit(limit)

      if (error || !data) return []
      return data as IngestionJob[]
    } catch {
      return []
    }
  },

  async markJobRunning(id: string): Promise<void> {
    const supabase = await createAdminClient()
    await supabase
      .from("ingestion_jobs")
      .update({ status: "running", started_at: new Date().toISOString() })
      .eq("id", id)
  },

  async markJobCompleted(id: string): Promise<void> {
    const supabase = await createAdminClient()
    await supabase
      .from("ingestion_jobs")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", id)
  },

  async markJobFailed(id: string, error: string, details?: unknown): Promise<void> {
    const supabase = await createAdminClient()

    // Check attempt count to decide if dead letter
    const { data: job } = await supabase
      .from("ingestion_jobs")
      .select("attempts, max_attempts")
      .eq("id", id)
      .single()

    const attempts = (job?.attempts ?? 0) + 1
    const isDead = attempts >= (job?.max_attempts ?? 3)

    const retryAt = isDead
      ? null
      : new Date(Date.now() + Math.pow(2, attempts) * 60_000).toISOString() // exponential backoff

    await supabase.from("ingestion_jobs").update({
      status: isDead ? "dead_letter" : "retrying",
      attempts,
      error_message: error,
      error_details: details ? (details as Record<string, unknown>) : null,
      next_retry_at: retryAt,
    }).eq("id", id)
  },

  async retryJob(id: string): Promise<void> {
    const supabase = await createAdminClient()
    await supabase
      .from("ingestion_jobs")
      .update({
        status: "pending",
        next_retry_at: null,
        error_message: null,
        error_details: null,
      })
      .eq("id", id)
  },
}
