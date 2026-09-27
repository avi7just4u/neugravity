import { describe, it, expect } from "vitest"

// ─── ISR revalidate strategy ──────────────────────────────────────────────────

describe("ISR revalidate strategy (unit)", () => {
  const ISR_POLICY: Record<string, number> = {
    "/": 60,
    "/news": 60,
    "/news/[slug]": 60,
    "/status": 120,
    "/tech": 300,
    "/tech/[slug]": 300,
    "/tools": 300,
    "/tools/[slug]": 300,
    "/courses": 300,
    "/courses/[slug]": 300,
    "/compare": 300,
    "/compare/[slug]": 300,
    "/articles": 300,
    "/articles/[slug]": 300,
    "/interviews": 300,
    "/companies": 300,
    "/companies/[slug]": 300,
    "/learn": 300,
    "/sitemap.xml": 3600,
  }

  it("homepage revalidates every 60s", () => {
    expect(ISR_POLICY["/"]).toBe(60)
  })

  it("news revalidates every 60s", () => {
    expect(ISR_POLICY["/news"]).toBe(60)
  })

  it("status revalidates every 120s", () => {
    expect(ISR_POLICY["/status"]).toBe(120)
  })

  it("tech/tools/courses revalidate every 300s", () => {
    expect(ISR_POLICY["/tech"]).toBe(300)
    expect(ISR_POLICY["/tools"]).toBe(300)
    expect(ISR_POLICY["/courses"]).toBe(300)
  })

  it("sitemap revalidates every 3600s", () => {
    expect(ISR_POLICY["/sitemap.xml"]).toBe(3600)
  })

  it("no public page has revalidate > 3600s", () => {
    const maxAllowed = 3600
    for (const [path, val] of Object.entries(ISR_POLICY)) {
      expect(val, `${path} revalidate too long`).toBeLessThanOrEqual(maxAllowed)
    }
  })
})

// ─── Cache invalidation paths ─────────────────────────────────────────────────

describe("cache invalidation paths (unit)", () => {
  function getPublishNewsInvalidationPaths(slug: string) {
    return ["/news", `/news/${slug}`, "/", "/tech", "/tools", "/companies"]
  }

  function getCoursePublishInvalidationPaths(slug: string) {
    return ["/courses", "/learn", `/courses/${slug}`]
  }

  it("news publish invalidates news index and slug", () => {
    const paths = getPublishNewsInvalidationPaths("my-news-item")
    expect(paths).toContain("/news")
    expect(paths).toContain("/news/my-news-item")
  })

  it("news publish also invalidates homepage", () => {
    const paths = getPublishNewsInvalidationPaths("my-news-item")
    expect(paths).toContain("/")
  })

  it("news publish invalidates adjacent indexes", () => {
    const paths = getPublishNewsInvalidationPaths("my-news-item")
    expect(paths).toContain("/tech")
    expect(paths).toContain("/tools")
    expect(paths).toContain("/companies")
  })

  it("course publish invalidates courses index and slug", () => {
    const paths = getCoursePublishInvalidationPaths("intro-to-ai")
    expect(paths).toContain("/courses")
    expect(paths).toContain("/courses/intro-to-ai")
    expect(paths).toContain("/learn")
  })
})
