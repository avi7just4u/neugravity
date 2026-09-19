import type { Source } from "@/types"

export interface NormalizedItem {
  external_id: string
  canonical_url: string
  title: string
  description?: string
  content?: string
  author?: string
  source_published_at?: Date
  content_type: "news" | "tool" | "technology" | "company" | "interview" | "article" | "status" | "other"
  raw_payload: Record<string, unknown>
  metadata?: Record<string, unknown>
}

export interface SourceConnector {
  discover(source: Source): Promise<NormalizedItem[]>
  getCanonicalUrl(raw: unknown): string
  getExternalId(raw: unknown): string
  getPublishedAt(raw: unknown): Date | undefined
  getAuthor(raw: unknown): string | undefined
  getMetadata(raw: unknown): Record<string, unknown>
}
