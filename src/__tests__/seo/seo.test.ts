import { describe, it, expect } from "vitest"

// ─── Canonical URL generation ─────────────────────────────────────────────────

describe("canonical URL generation (unit)", () => {
  const siteUrl = "https://neugravity.com"

  function canonicalFor(section: string, slug: string) {
    return `${siteUrl}/${section}/${slug}`
  }

  it("news slug produces correct canonical", () => {
    expect(canonicalFor("news", "ai-breakthroughs-2026")).toBe(
      "https://neugravity.com/news/ai-breakthroughs-2026"
    )
  })

  it("tools slug produces correct canonical", () => {
    expect(canonicalFor("tools", "cursor-ai")).toBe("https://neugravity.com/tools/cursor-ai")
  })

  it("companies slug produces correct canonical", () => {
    expect(canonicalFor("companies", "openai")).toBe("https://neugravity.com/companies/openai")
  })

  it("compare slug produces correct canonical", () => {
    expect(canonicalFor("compare", "gpt-4-vs-claude")).toBe(
      "https://neugravity.com/compare/gpt-4-vs-claude"
    )
  })

  it("articles slug produces correct canonical", () => {
    expect(canonicalFor("articles", "intro-to-rag")).toBe(
      "https://neugravity.com/articles/intro-to-rag"
    )
  })
})

// ─── robots.txt private route policy ──────────────────────────────────────────

describe("robots.txt private route policy (unit)", () => {
  const privateRoutes = ["/admin/", "/api/", "/login", "/signup", "/learn/dashboard", "/courses/"]

  function isDisallowed(path: string) {
    return privateRoutes.some((r) => path.startsWith(r))
  }

  it("disallows /admin/", () => expect(isDisallowed("/admin/")).toBe(true))
  it("disallows /api/", () => expect(isDisallowed("/api/")).toBe(true))
  it("disallows /login", () => expect(isDisallowed("/login")).toBe(true))
  it("disallows /signup", () => expect(isDisallowed("/signup")).toBe(true))
  it("disallows /learn/dashboard", () => expect(isDisallowed("/learn/dashboard")).toBe(true))
  it("disallows /courses/ (lesson pages)", () => expect(isDisallowed("/courses/intro-to-ai/lessons/lesson-1")).toBe(true))
  it("allows /news", () => expect(isDisallowed("/news")).toBe(false))
  it("allows /tech", () => expect(isDisallowed("/tech")).toBe(false))
  it("allows /tools", () => expect(isDisallowed("/tools")).toBe(false))
  it("allows /courses index page", () => expect(isDisallowed("/courses")).toBe(false))
})

// ─── noindex policy for search ────────────────────────────────────────────────

describe("search page noindex policy (unit)", () => {
  function searchMetadataRobots() {
    return { index: false, follow: true }
  }

  it("search page is noindex", () => {
    expect(searchMetadataRobots().index).toBe(false)
  })

  it("search page still follows links", () => {
    expect(searchMetadataRobots().follow).toBe(true)
  })
})

// ─── OG metadata completeness ─────────────────────────────────────────────────

describe("OpenGraph metadata completeness (unit)", () => {
  function buildOgMetadata(item: { title: string; description: string; slug: string; published_at?: string }, section: string) {
    const siteUrl = "https://neugravity.com"
    const url = `${siteUrl}/${section}/${item.slug}`
    return {
      title: item.title,
      description: item.description,
      alternates: { canonical: url },
      openGraph: {
        title: item.title,
        description: item.description,
        url,
        type: section === "news" || section === "articles" ? "article" : "website",
        siteName: "NeuGravity",
        ...(item.published_at ? { publishedTime: item.published_at } : {}),
      },
    }
  }

  const newsItem = { title: "AI News", description: "Breaking AI developments", slug: "ai-news", published_at: "2026-09-01" }

  it("news metadata includes canonical", () => {
    const meta = buildOgMetadata(newsItem, "news")
    expect(meta.alternates.canonical).toContain("/news/ai-news")
  })

  it("news OG type is article", () => {
    const meta = buildOgMetadata(newsItem, "news")
    expect(meta.openGraph.type).toBe("article")
  })

  it("news OG includes publishedTime", () => {
    const meta = buildOgMetadata(newsItem, "news")
    expect(meta.openGraph.publishedTime).toBe("2026-09-01")
  })

  it("tools OG type is website", () => {
    const tool = { title: "Cursor AI", description: "AI code editor", slug: "cursor-ai" }
    const meta = buildOgMetadata(tool, "tools")
    expect(meta.openGraph.type).toBe("website")
  })

  it("all metadata includes siteName", () => {
    const meta = buildOgMetadata(newsItem, "news")
    expect(meta.openGraph.siteName).toBe("NeuGravity")
  })
})
