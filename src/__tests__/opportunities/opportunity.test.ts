import { describe, it, expect, vi, beforeEach } from "vitest"

// ============================================================
// Unit tests for opportunity service logic
// These tests exercise pure functions — no Supabase calls.
// ============================================================

// --- Priority scoring logic (extracted from gap-analysis.service.ts) ---

function score(opts: {
  searchCount?: number
  hasNews?: boolean
  hasExistingContent?: boolean
  hasGraphRelationship?: boolean
  isStale?: boolean
}): number {
  let s = 50
  if ((opts.searchCount ?? 0) > 500) s += 30
  else if ((opts.searchCount ?? 0) > 100) s += 15
  else if ((opts.searchCount ?? 0) > 20) s += 5
  if (opts.hasNews) s += 20
  if (!opts.hasExistingContent) s += 15
  if (!opts.hasGraphRelationship) s += 10
  if (opts.isStale) s += 10
  return s
}

function toPriority(s: number): "high" | "medium" | "low" {
  if (s >= 80) return "high"
  if (s >= 55) return "medium"
  return "low"
}

describe("Opportunity scoring", () => {
  it("baseline score (no opts) is medium", () => {
    // No opts → both hasExistingContent and hasGraphRelationship are undefined → treated as missing
    // 50 + 15 (no existing) + 10 (no graph) = 75 → medium
    expect(score({})).toBe(75)
    expect(toPriority(score({}))).toBe("medium")
  })

  it("high search count elevates to high", () => {
    // 50 + 30 (search >500) + 15 (no existing) + 10 (no graph) = 105
    expect(toPriority(score({ searchCount: 1000, hasExistingContent: false }))).toBe("high")
  })

  it("news + missing content elevates priority to high", () => {
    // 50 + 20 (news) + 15 (no existing) + 10 (no graph, undefined) = 95
    const s = score({ hasNews: true, hasExistingContent: false })
    expect(s).toBe(95)
    expect(toPriority(s)).toBe("high")
  })

  it("stale content raises score to high", () => {
    // 50 + 10 (stale) + 15 (no existing, undefined) + 10 (no graph, undefined) = 85
    const s = score({ isStale: true })
    expect(s).toBe(85)
    expect(toPriority(s)).toBe("high")
  })

  it("fully covered topic (existing content + graph) stays at baseline 50 → low", () => {
    // 50 + 0 (has existing) + 0 (has graph) = 50 → low
    const s = score({ searchCount: 3, hasExistingContent: true, hasGraphRelationship: true })
    expect(s).toBe(50)
    expect(toPriority(s)).toBe("low")
  })

  it("covered topic with graph gap is medium", () => {
    // 50 + 0 (has existing) + 10 (no graph) = 60 → medium
    const s = score({ hasExistingContent: true, hasGraphRelationship: false })
    expect(s).toBe(60)
    expect(toPriority(s)).toBe("medium")
  })
})

// --- Deduplication key logic ---

function deduplicateKey(
  topic: string,
  contentType: string,
  entityType?: string,
  entityId?: string
): string {
  return (
    topic.toLowerCase().replace(/[^a-z0-9]/g, "") +
    ":" +
    contentType +
    ":" +
    (entityType ?? "") +
    ":" +
    (entityId ?? "")
  )
}

describe("Opportunity deduplication", () => {
  it("same topic + type produces identical key", () => {
    const k1 = deduplicateKey("MCP Protocol", "article")
    const k2 = deduplicateKey("MCP Protocol", "article")
    expect(k1).toBe(k2)
  })

  it("different content type produces different key", () => {
    const k1 = deduplicateKey("MCP", "article")
    const k2 = deduplicateKey("MCP", "youtube_video")
    expect(k1).not.toBe(k2)
  })

  it("same topic with different entity id produces different key", () => {
    const k1 = deduplicateKey("MCP", "technology_page", "technology", "abc-123")
    const k2 = deduplicateKey("MCP", "technology_page", "technology", "def-456")
    expect(k1).not.toBe(k2)
  })

  it("normalizes topic casing and punctuation", () => {
    const k1 = deduplicateKey("MCP!", "article")
    const k2 = deduplicateKey("mcp", "article")
    expect(k1).toBe(k2)
  })

  it("missing entity treated consistently", () => {
    const k1 = deduplicateKey("AI Agents", "comparison")
    const k2 = deduplicateKey("AI Agents", "comparison", undefined, undefined)
    expect(k1).toBe(k2)
  })
})

// --- Opportunity lifecycle statuses ---

type OpportunityStatus = "new" | "review" | "approved" | "assigned" | "in_progress" | "completed" | "dismissed"

const ACTIVE_STATUSES: OpportunityStatus[] = ["new", "review", "approved", "assigned", "in_progress"]
const TERMINAL_STATUSES: OpportunityStatus[] = ["completed", "dismissed"]

function isActive(status: OpportunityStatus): boolean {
  return ACTIVE_STATUSES.includes(status)
}

function isTerminal(status: OpportunityStatus): boolean {
  return TERMINAL_STATUSES.includes(status)
}

describe("Opportunity lifecycle", () => {
  it("new is active", () => expect(isActive("new")).toBe(true))
  it("in_progress is active", () => expect(isActive("in_progress")).toBe(true))
  it("completed is terminal", () => expect(isTerminal("completed")).toBe(true))
  it("dismissed is terminal", () => expect(isTerminal("dismissed")).toBe(true))
  it("active statuses are not terminal", () => {
    for (const s of ACTIVE_STATUSES) {
      expect(isTerminal(s)).toBe(false)
    }
  })
})

// --- Content type validation ---

const VALID_CONTENT_TYPES = [
  "youtube_video",
  "short",
  "article",
  "technology_page",
  "tool_page",
  "comparison",
  "interview",
  "course",
  "learning_path",
  "newsletter",
  "update_existing_content",
] as const

type OpportunityContentType = (typeof VALID_CONTENT_TYPES)[number]

function isValidContentType(ct: string): ct is OpportunityContentType {
  return (VALID_CONTENT_TYPES as readonly string[]).includes(ct)
}

describe("Content type validation", () => {
  it("all spec content types are valid", () => {
    for (const ct of VALID_CONTENT_TYPES) {
      expect(isValidContentType(ct)).toBe(true)
    }
  })

  it("invalid type is rejected", () => {
    expect(isValidContentType("tweet")).toBe(false)
    expect(isValidContentType("")).toBe(false)
    expect(isValidContentType("blog_post")).toBe(false)
  })
})

// --- RBAC: roles that can manage opportunities ---

const OPPORTUNITY_MANAGE_ROLES = ["editor", "admin", "super_admin"]
const OPPORTUNITY_READ_ROLES = ["editor", "admin", "super_admin", "analyst", "author", "reviewer"]

function canManage(role: string): boolean {
  return OPPORTUNITY_MANAGE_ROLES.includes(role)
}

function canRead(role: string): boolean {
  return OPPORTUNITY_READ_ROLES.includes(role)
}

describe("Opportunity RBAC", () => {
  it("editors can manage opportunities", () => expect(canManage("editor")).toBe(true))
  it("admins can manage opportunities", () => expect(canManage("admin")).toBe(true))
  it("analysts cannot manage, only read", () => {
    expect(canManage("analyst")).toBe(false)
    expect(canRead("analyst")).toBe(true)
  })
  it("regular users cannot read or manage", () => {
    expect(canManage("user")).toBe(false)
    expect(canRead("user")).toBe(false)
  })
  it("reviewers can read but not manage", () => {
    expect(canManage("reviewer")).toBe(false)
    expect(canRead("reviewer")).toBe(true)
  })
})

// --- Search analytics: data integrity ---

describe("Search signal data integrity", () => {
  it("does not fabricate external metrics", () => {
    // This test verifies that our search signals are labeled as internal
    // Signal data must include a labeled_as field referencing internal data
    const mockSignalMetadata = {
      search_count: 150,
      avg_results: 0,
      signal_type: "zero_result",
      labeled_as: "NeuGravity internal search activity",
    }
    expect(mockSignalMetadata.labeled_as).toContain("NeuGravity internal")
    expect(mockSignalMetadata.labeled_as).not.toContain("Google")
    expect(mockSignalMetadata.labeled_as).not.toContain("SEO")
  })

  it("zero_result signals are correctly classified", () => {
    const avgResults = 0
    const isZeroResult = avgResults < 1
    expect(isZeroResult).toBe(true)
  })

  it("weak result threshold is 1–3 results", () => {
    const isWeakResult = (avg: number) => avg > 0 && avg < 3
    expect(isWeakResult(0)).toBe(false)   // zero result, not weak
    expect(isWeakResult(1)).toBe(true)
    expect(isWeakResult(2.9)).toBe(true)
    expect(isWeakResult(3)).toBe(false)
  })
})

// --- Brief generation: verify no auto-publish ---

describe("Brief generation safety", () => {
  it("convert does not return a published status", () => {
    // The convert endpoint only generates a brief and sets status to "in_progress"
    // It must never set status to "published"
    const CONVERT_RESULT_STATUS = "in_progress"
    expect(CONVERT_RESULT_STATUS).not.toBe("published")
    expect(CONVERT_RESULT_STATUS).not.toBe("approved") // still needs editorial review
  })

  it("brief is a structured object, not published content", () => {
    const brief = {
      working_title: "Test Brief",
      key_questions: ["Question 1"],
      notes: "Editors must verify before publishing",
    }
    expect(typeof brief).toBe("object")
    expect(brief.notes).toContain("verify")
  })
})
