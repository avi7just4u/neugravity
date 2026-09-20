import { describe, it, expect } from "vitest"
import { QualityGateService } from "@/lib/services/quality-gate.service"

describe("QualityGateService.check", () => {
  it("passes when all required fields are present", () => {
    const result = QualityGateService.check({
      headline: "This is a valid headline with enough length",
      summary: "This summary has more than fifty characters and is descriptive enough to pass quality gate.",
      body: "This is a body that has more than one hundred characters to pass the minimum content threshold required by the quality gate service.",
      category: "ai",
      tags: ["openai", "gpt-4"],
    })
    expect(result.passed).toBe(true)
    expect(result.missing).toHaveLength(0)
  })

  it("fails when headline is missing", () => {
    const result = QualityGateService.check({
      headline: null,
      summary: "A long enough summary that satisfies the fifty character minimum for the quality gate.",
      body: "Body content that is long enough to satisfy the minimum body length requirement for the quality gate check.",
      category: "ai",
      tags: ["tag"],
    })
    expect(result.passed).toBe(false)
    expect(result.missing).toContain("headline")
  })

  it("fails when summary is too short", () => {
    const result = QualityGateService.check({
      headline: "A valid headline here",
      summary: "Short",
      body: "Body content that is long enough to satisfy the minimum body length requirement for the quality gate.",
      category: "ai",
      tags: ["tag"],
    })
    expect(result.passed).toBe(false)
    expect(result.missing).toContain("summary")
  })

  it("issues warning when tags are missing", () => {
    const result = QualityGateService.check({
      headline: "A valid headline with enough length",
      summary: "This summary is long enough to pass the fifty character minimum requirement for the quality gate.",
      body: "Body content that is long enough to satisfy the minimum body length requirement for the quality gate.",
      category: "ai",
      tags: [],
    })
    expect(result.passed).toBe(true)
    expect(result.warnings).toContain("tags")
  })

  it("warns when category is missing", () => {
    const result = QualityGateService.check({
      headline: "A valid headline with enough length",
      summary: "This summary is long enough to pass the fifty character minimum requirement for the quality gate.",
      body: "Body content that is long enough to satisfy the minimum body length requirement for the quality gate.",
      category: null,
      tags: ["tag"],
    })
    expect(result.warnings).toContain("category")
  })
})
