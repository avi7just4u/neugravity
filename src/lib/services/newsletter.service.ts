import { createAdminClient } from "@/lib/supabase/server"

// newsletter_subscribers has no public RLS policies — must use service-role admin client.
export const NewsletterService = {
  async subscribe(data: {
    email: string
    firstName?: string
    topics?: string[]
    source?: string
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createAdminClient()
      const email = data.email.toLowerCase().trim()

      const { data: existing } = await supabase
        .from("newsletter_subscribers")
        .select("status")
        .eq("email", email)
        .single()

      if (existing?.status === "bounced") {
        return { success: false, error: "This email address cannot receive newsletters." }
      }
      if (existing?.status === "active") {
        return { success: false, error: "This email is already subscribed." }
      }

      const { error } = await supabase.from("newsletter_subscribers").upsert(
        {
          email,
          first_name: data.firstName ?? null,
          topics: data.topics ?? [],
          source: data.source ?? "website",
          consent: true,
          consent_at: new Date().toISOString(),
          status: "active",
        },
        { onConflict: "email" }
      )

      if (error) {
        console.error("[NewsletterService.subscribe] DB error:", error.message)
        return { success: false, error: "Failed to subscribe. Please try again." }
      }
      return { success: true }
    } catch (e) {
      console.error("[NewsletterService.subscribe] Unexpected error:", e)
      return { success: false, error: "An unexpected error occurred." }
    }
  },

  async unsubscribe(email: string): Promise<{ success: boolean }> {
    try {
      const supabase = createAdminClient()
      const { error } = await supabase
        .from("newsletter_subscribers")
        .update({ status: "unsubscribed" })
        .eq("email", email.toLowerCase().trim())

      if (error) console.error("[NewsletterService.unsubscribe] DB error:", error.message)
      return { success: !error }
    } catch (e) {
      console.error("[NewsletterService.unsubscribe] Unexpected error:", e)
      return { success: false }
    }
  },
}
