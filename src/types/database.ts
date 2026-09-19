// Supabase generated types placeholder
// Run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string | null
          display_name: string | null
          bio: string | null
          avatar_url: string | null
          website_url: string | null
          twitter_handle: string | null
          linkedin_url: string | null
          role: string
          status: string
          email_verified: boolean
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["users"]["Row"], "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>
      }
      technologies: {
        Row: {
          id: string
          name: string
          slug: string
          tagline: string | null
          description: string | null
          long_description: string | null
          type: string
          category_id: string | null
          icon_url: string | null
          logo_url: string | null
          hero_image_url: string | null
          website_url: string | null
          docs_url: string | null
          github_url: string | null
          wikipedia_url: string | null
          created_year: number | null
          creator: string | null
          maintained_by: string | null
          license: string | null
          open_source: boolean | null
          status: string
          difficulty: string | null
          popularity_score: number
          trending_score: number
          seo_title: string | null
          seo_description: string | null
          published: boolean
          featured: boolean
          verified: boolean
          last_verified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["technologies"]["Row"], "id" | "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["technologies"]["Insert"]>
      }
      tools: {
        Row: {
          id: string
          name: string
          slug: string
          tagline: string | null
          description: string | null
          long_description: string | null
          icon_url: string | null
          logo_url: string | null
          hero_image_url: string | null
          website_url: string | null
          docs_url: string | null
          github_url: string | null
          category_id: string | null
          company_id: string | null
          tool_type: string | null
          platforms: string[]
          pricing_model: string | null
          has_free_tier: boolean
          has_api: boolean
          enterprise_available: boolean
          status: string
          featured: boolean
          verified: boolean
          published: boolean
          trending_score: number
          popularity_score: number
          rating_average: number | null
          rating_count: number
          seo_title: string | null
          seo_description: string | null
          last_verified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["tools"]["Row"], "id" | "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["tools"]["Insert"]>
      }
      articles: {
        Row: {
          id: string
          title: string
          slug: string
          subtitle: string | null
          excerpt: string | null
          body: string | null
          hero_image_url: string | null
          author_id: string | null
          category_id: string | null
          status: string
          published_at: string | null
          scheduled_publish_at: string | null
          seo_title: string | null
          seo_description: string | null
          canonical_url: string | null
          reading_time_minutes: number | null
          featured: boolean
          featured_order: number | null
          allow_comments: boolean
          view_count: number
          share_count: number
          seo_score: number | null
          structured_data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["articles"]["Row"], "id" | "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["articles"]["Insert"]>
      }
      news_items: {
        Row: {
          id: string
          headline: string
          slug: string
          summary: string | null
          body: string | null
          hero_image_url: string | null
          author_id: string | null
          cluster_id: string | null
          category_id: string | null
          status: string
          importance: number
          published_at: string | null
          source_published_at: string | null
          discovered_at: string
          last_verified_at: string | null
          seo_title: string | null
          seo_description: string | null
          canonical_url: string | null
          view_count: number
          featured: boolean
          needs_verification: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["news_items"]["Row"], "id" | "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["news_items"]["Insert"]>
      }
      companies: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          long_description: string | null
          logo_url: string | null
          hero_image_url: string | null
          website_url: string | null
          founded_year: number | null
          headquarters: string | null
          employee_count_range: string | null
          company_type: string | null
          stock_symbol: string | null
          linkedin_url: string | null
          twitter_handle: string | null
          github_url: string | null
          category_id: string | null
          status: string
          featured: boolean
          verified: boolean
          published: boolean
          seo_title: string | null
          seo_description: string | null
          last_verified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["companies"]["Row"], "id" | "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["companies"]["Insert"]>
      }
      comparisons: {
        Row: {
          id: string
          title: string
          slug: string
          description: string | null
          status: string
          featured: boolean
          view_count: number
          seo_title: string | null
          seo_description: string | null
          last_verified_at: string | null
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["comparisons"]["Row"], "id" | "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["comparisons"]["Insert"]>
      }
      courses: {
        Row: {
          id: string
          title: string
          slug: string
          description: string | null
          long_description: string | null
          outcome: string | null
          thumbnail_url: string | null
          instructor_id: string | null
          category_id: string | null
          difficulty: string | null
          estimated_hours: number | null
          price: number | null
          price_currency: string
          status: string
          featured: boolean
          published_at: string | null
          seo_title: string | null
          seo_description: string | null
          view_count: number
          enrollment_count: number
          rating_average: number | null
          rating_count: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["courses"]["Row"], "id" | "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["courses"]["Insert"]>
      }
      sources: {
        Row: {
          id: string
          name: string
          domain: string
          source_type: string
          rss_url: string | null
          api_endpoint: string | null
          feed_enabled: boolean
          trust_level: number
          active: boolean
          last_fetched_at: string | null
          fetch_frequency_minutes: number
          robots_status: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["sources"]["Row"], "id" | "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["sources"]["Insert"]>
      }
      ingestion_jobs: {
        Row: {
          id: string
          type: string
          status: string
          payload: Json
          attempts: number
          max_attempts: number
          priority: number
          created_at: string
          started_at: string | null
          completed_at: string | null
          next_retry_at: string | null
          error_message: string | null
          error_details: Json | null
          created_by: string | null
        }
        Insert: Omit<Database["public"]["Tables"]["ingestion_jobs"]["Row"], "id" | "created_at">
        Update: Partial<Database["public"]["Tables"]["ingestion_jobs"]["Insert"]>
      }
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          first_name: string | null
          topics: string[]
          frequency: string
          status: string
          source: string | null
          consent: boolean
          consent_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["newsletter_subscribers"]["Row"], "id" | "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["newsletter_subscribers"]["Insert"]>
      }
      enterprise_leads: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          company: string
          role: string | null
          company_size: string | null
          phone: string | null
          service: string | null
          message: string | null
          status: string
          assigned_to: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["enterprise_leads"]["Row"], "id" | "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["enterprise_leads"]["Insert"]>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
