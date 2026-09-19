import { createServiceClient } from "@/lib/supabase/server"

export const NewsletterService = {
  async subscribe(data: {
    email: string
    firstName?: string
    topics?: string[]
    source?: string
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = await createServiceClient()

      // Check for bounced status first
      const { data: existing } = await supabase
        .from("newsletter_subscribers")
        .select("status")
        .eq("email", data.email.toLowerCase().trim())
        .single()

      if (existing?.status === "bounced") {
        return { success: false, error: "This email address cannot receive newsletters." }
      }
      if (existing?.status === "active") {
        return { success: false, error: "This email is already subscribed." }
      }

      const { error } = await supabase.from("newsletter_subscribers").upsert(
        {
          email: data.email.toLowerCase().trim(),
          first_name: data.firstName ?? null,
          topics: data.topics ?? [],
          source: data.source ?? "website",
          consent: true,
          consent_at: new Date().toISOString(),
          status: "active",
        },
        { onConflict: "email" }
      )

      if (error) return { success: false, error: "Failed to subscribe. Please try again." }
      return { success: true }
    } catch {
      return { success: false, error: "An unexpected error occurred." }
    }
  },

  async unsubscribe(email: string): Promise<{ success: boolean }> {
    try {
      const supabase = await createServiceClient()
      const { error } = await supabase
        .from("newsletter_subscribers")
        .update({ status: "unsubscribed" })
        .eq("email", email.toLowerCase().trim())

      return { success: !error }
    } catch {
      return { success: false }
    }
  },
}
