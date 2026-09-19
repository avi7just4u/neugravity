import type { Source } from "@/types"
import type { NormalizedItem, SourceConnector } from "./types"

function extractTag(xml: string, tag: string): string {
  const patterns = [
    new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, "i"),
    new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"),
  ]
  for (const re of patterns) {
    const m = xml.match(re)
    if (m?.[1]) return m[1].trim()
  }
  return ""
}

function extractAttr(xml: string, tag: string, attr: string): string {
  const re = new RegExp(`<${tag}[^>]*\\s${attr}="([^"]*)"`, "i")
  return xml.match(re)?.[1]?.trim() ?? ""
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
}

function parseDate(s: string): Date | undefined {
  if (!s) return undefined
  const d = new Date(s)
  return isNaN(d.getTime()) ? undefined : d
}

function hashContent(s: string): string {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(31, h) + s.charCodeAt(i) | 0
  }
  return (h >>> 0).toString(16)
}

interface RSSConnectorOptions {
  contentType?: NormalizedItem["content_type"]
}

export class RSSConnector implements SourceConnector {
  private defaultContentType: NormalizedItem["content_type"]

  constructor(opts: RSSConnectorOptions = {}) {
    this.defaultContentType = opts.contentType ?? "news"
  }

  async discover(source: Source): Promise<NormalizedItem[]> {
    const feedUrl = source.feed_url ?? source.rss_url
    if (!feedUrl) return []

    let xml: string
    try {
      const res = await fetch(feedUrl, {
        headers: { "User-Agent": "NeuGravity/1.0 (+https://neugravity.vercel.app)" },
        signal: AbortSignal.timeout(15000),
      })
      if (!res.ok) return []
      xml = await res.text()
    } catch {
      return []
    }

    const isAtom = /<feed[\s>]/i.test(xml)
    const itemTag = isAtom ? "entry" : "item"

    const itemRegex = new RegExp(`<${itemTag}[\\s>]([\\s\\S]*?)</${itemTag}>`, "gi")
    const items: NormalizedItem[] = []
    let match: RegExpExecArray | null

    while ((match = itemRegex.exec(xml)) !== null && items.length < 50) {
      const chunk = match[1]

      const title = stripHtml(extractTag(chunk, "title"))
      if (!title) continue

      let link = isAtom
        ? extractAttr(chunk, "link", "href") || extractTag(chunk, "link")
        : extractTag(chunk, "link")
      if (!link) link = extractTag(chunk, "url")
      if (!link) continue

      const guid = extractTag(chunk, "guid") || extractTag(chunk, "id") || link
      const description = stripHtml(
        extractTag(chunk, "description") ||
        extractTag(chunk, "summary") ||
        extractTag(chunk, "content")
      ).slice(0, 500) || undefined

      const author =
        extractTag(chunk, "author") ||
        extractTag(chunk, "dc:creator") ||
        undefined

      const pubRaw =
        extractTag(chunk, "pubDate") ||
        extractTag(chunk, "published") ||
        extractTag(chunk, "updated")

      const raw_payload: Record<string, unknown> = { title, link, guid }
      if (author) raw_payload.author = author
      if (pubRaw) raw_payload.pubDate = pubRaw

      items.push({
        external_id: guid || hashContent(link),
        canonical_url: link,
        title,
        description: description || undefined,
        author: author || undefined,
        source_published_at: parseDate(pubRaw),
        content_type: this.defaultContentType,
        raw_payload,
      })
    }

    return items
  }

  getCanonicalUrl(raw: unknown): string {
    return (raw as Record<string, string>)?.link ?? ""
  }

  getExternalId(raw: unknown): string {
    return (raw as Record<string, string>)?.guid ?? (raw as Record<string, string>)?.link ?? ""
  }

  getPublishedAt(raw: unknown): Date | undefined {
    const s = (raw as Record<string, string>)?.pubDate
    return s ? parseDate(s) : undefined
  }

  getAuthor(raw: unknown): string | undefined {
    return (raw as Record<string, string>)?.author || undefined
  }

  getMetadata(raw: unknown): Record<string, unknown> {
    return (raw as Record<string, unknown>) ?? {}
  }
}
