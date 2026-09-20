import { describe, it, expect, vi, beforeEach } from "vitest"
import { hashContent } from "@/lib/services/deduplication.service"

describe("hashContent", () => {
  it("returns a 64-char hex string", () => {
    const hash = hashContent("Title", "Content")
    expect(hash).toHaveLength(64)
    expect(/^[a-f0-9]+$/.test(hash)).toBe(true)
  })

  it("is deterministic", () => {
    expect(hashContent("T", "C")).toBe(hashContent("T", "C"))
  })

  it("differs for different content", () => {
    expect(hashContent("A", "B")).not.toBe(hashContent("A", "C"))
  })

  it("is case-insensitive", () => {
    expect(hashContent("TITLE", "CONTENT")).toBe(hashContent("title", "content"))
  })

  it("handles null content", () => {
    const hash = hashContent("title", null)
    expect(hash).toHaveLength(64)
  })
})

// Chainable mock builder: every method returns `this`, terminal methods return resolved promises
function makeChainableMock(terminalResult: { data: unknown }) {
  const chain: Record<string, unknown> = {}
  const methods = ["from", "select", "eq", "neq", "gte", "limit", "in"]
  for (const m of methods) {
    chain[m] = () => chain
  }
  chain["maybeSingle"] = async () => terminalResult
  return chain
}

describe("DeduplicationService.check (mocked)", () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it("returns isDuplicate=false when no matches found", async () => {
    const chain = makeChainableMock({ data: null })
    vi.doMock("@/lib/supabase/server", () => ({
      createAdminClient: () => chain,
    }))
    const { DeduplicationService } = await import("@/lib/services/deduplication.service")
    const result = await DeduplicationService.check({
      canonical_url: "https://example.com/unique-article",
      source_id: "src-1",
      source_item_id: "item-1",
      title: "A unique article",
      content: "Some unique content",
    })
    expect(result.isDuplicate).toBe(false)
  })

  it("returns isDuplicate=true when URL match found", async () => {
    const chain = makeChainableMock({ data: { id: "existing-id" } })
    vi.doMock("@/lib/supabase/server", () => ({
      createAdminClient: () => chain,
    }))
    const { DeduplicationService } = await import("@/lib/services/deduplication.service")
    const result = await DeduplicationService.check({
      canonical_url: "https://example.com/duplicate",
      source_id: "src-1",
      source_item_id: "item-new",
      title: "Some article",
      content: "Some content",
    })
    expect(result.isDuplicate).toBe(true)
    expect(result.strategy).toBe("url")
    expect(result.existingId).toBe("existing-id")
  })
})
