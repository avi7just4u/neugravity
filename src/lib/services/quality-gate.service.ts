export interface QualityGateResult {
  passed: boolean
  missing: string[]
  warnings: string[]
}

export const QualityGateService = {
  check(item: {
    headline?: string | null
    summary?: string | null
    body?: string | null
    category?: string | null
    tags?: string[] | null
  }): QualityGateResult {
    const missing: string[] = []
    const warnings: string[] = []

    if (!item.headline || item.headline.trim().length < 10) missing.push("headline")
    if (!item.summary || item.summary.trim().length < 50) missing.push("summary")
    if (!item.body || item.body.trim().length < 100) missing.push("body")
    if (!item.category) warnings.push("category")
    if (!item.tags || item.tags.length === 0) warnings.push("tags")

    return {
      passed: missing.length === 0,
      missing,
      warnings,
    }
  },
}
