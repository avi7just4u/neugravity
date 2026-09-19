import { createServiceClient } from "@/lib/supabase/server"
import type { Interview } from "@/types"

function formatDuration(seconds: number | null): string {
  if (!seconds) return ""
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s > 0 ? `${m}:${String(s).padStart(2, "0")} min` : `${m} min`
}

export const InterviewService = {
  formatDuration,

  async getPublishedInterviews(opts: { page?: number; perPage?: number; featured?: boolean } = {}): Promise<{
    data: Interview[]
    total: number
  }> {
    const supabase = await createServiceClient()
    const page = opts.page ?? 1
    const perPage = opts.perPage ?? 20
    const from = (page - 1) * perPage
    const to = from + perPage - 1

    let q = supabase
      .from("interviews")
      .select(
        "id,slug,title,description,guest_role,thumbnail_url,video_url,youtube_video_id,published_at,duration_seconds,featured,view_count,guest_id,guest_company_id",
        { count: "exact" }
      )
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .range(from, to)

    if (opts.featured !== undefined) q = q.eq("featured", opts.featured)

    const { data, count, error } = await q
    if (error) return { data: [], total: 0 }
    return { data: (data ?? []) as unknown as Interview[], total: count ?? 0 }
  },

  async getInterviewBySlug(slug: string): Promise<Interview | null> {
    const supabase = await createServiceClient()
    const { data, error } = await supabase
      .from("interviews")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single()

    if (error || !data) return null
    return data as Interview
  },

  async getFeaturedInterviews(limit = 4): Promise<Interview[]> {
    const { data } = await this.getPublishedInterviews({ featured: true, perPage: limit })
    return data
  },
}
