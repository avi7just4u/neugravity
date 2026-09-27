/**
 * Gap Analysis Service — Phase 4.5
 *
 * Detects content gaps from multiple signals:
 *   A. Internal search (zero/weak results)
 *   B. Knowledge graph (missing relationships/explanations)
 *   C. News signals (trending topic with weak coverage)
 *   D. Tool gaps (no comparison, stale data)
 *   E. Learning gaps (technology with no course/lesson)
 *   F. Content decay (stale published content)
 *
 * This service runs asynchronously (called from opportunity-analysis worker).
 * It NEVER writes to content_opportunities directly — it returns candidates
 * that the caller can deduplicate and persist.
 *
 * NOTE: Supabase JS nested subquery filters (.not("id","in",queryBuilder))
 * do not work reliably against the PostgREST REST API. All subquery lookups
 * use a two-step fetch: get IDs from the secondary table, then exclude them.
 */

import { createAdminClient } from "@/lib/supabase/server"
import type { CreateOpportunityInput } from "./opportunity.service"

export interface OpportunityCandidate extends CreateOpportunityInput {
  _score: number // internal scoring signal; not exposed publicly
}

export function score(opts: {
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

export function toPriority(s: number): "high" | "medium" | "low" {
  if (s >= 80) return "high"
  if (s >= 55) return "medium"
  return "low"
}

// ============================================================
// A. SEARCH SIGNAL ANALYSIS
// ============================================================
export async function analyzeSearchSignals(opts: {
  zeroResultsMinCount?: number
  weakResultsMinCount?: number
  since?: Date
} = {}): Promise<OpportunityCandidate[]> {
  const candidates: OpportunityCandidate[] = []

  try {
    const db = createAdminClient()
    const since = (opts.since ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).toISOString()

    const { data: rows } = await db
      .from("search_query_log")
      .select("query, normalized, results_count")
      .gte("created_at", since)

    if (!rows || rows.length === 0) return candidates

    // Aggregate in JS — track original query for human-readable topic/title
    const agg = new Map<string, { count: number; total_results: number; bestQuery: string }>()
    for (const row of rows) {
      const k = row.normalized as string
      if (!k) continue
      const e = agg.get(k) ?? { count: 0, total_results: 0, bestQuery: row.query as string }
      e.count++
      e.total_results += (row.results_count as number) ?? 0
      // Keep the shortest original query as the most readable label
      if ((row.query as string).length < e.bestQuery.length) e.bestQuery = row.query as string
      agg.set(k, e)
    }

    for (const [normalized, { count, total_results, bestQuery }] of agg.entries()) {
      const avgResults = count > 0 ? total_results / count : 0
      const isZeroResult = avgResults < 1
      const isWeakResult = avgResults > 0 && avgResults < 3
      const displayTopic = bestQuery.trim()

      if (isZeroResult && count >= (opts.zeroResultsMinCount ?? 5)) {
        const sc = score({ searchCount: count, hasExistingContent: false })
        candidates.push({
          topic: displayTopic,
          title_suggestion: `What is ${displayTopic}?`,
          content_type: "article",
          audience: "developers, technologists",
          reason: `${count} internal searches for "${displayTopic}" with zero results`,
          why_now: `NeuGravity users are actively searching for "${displayTopic}" and finding nothing.`,
          gap_type: "missing",
          priority: toPriority(sc),
          source: "search_signal",
          metadata: {
            search_count: count,
            avg_results: Math.round(avgResults),
            signal_type: "zero_result",
            labeled_as: "NeuGravity internal search activity",
          },
          created_by_type: "system",
          _score: sc,
        })
      } else if (isWeakResult && count >= (opts.weakResultsMinCount ?? 20)) {
        const sc = score({ searchCount: count, hasExistingContent: true })
        candidates.push({
          topic: displayTopic,
          title_suggestion: `${displayTopic} — Improve coverage`,
          content_type: "update_existing_content",
          audience: "developers, technologists",
          reason: `${count} searches for "${displayTopic}" yield only ~${Math.round(avgResults)} results`,
          why_now: `Existing coverage for "${displayTopic}" is weak relative to search interest.`,
          gap_type: "weak",
          priority: toPriority(sc),
          source: "search_signal",
          metadata: {
            search_count: count,
            avg_results: Math.round(avgResults),
            signal_type: "weak_result",
            labeled_as: "NeuGravity internal search activity",
          },
          created_by_type: "system",
          _score: sc,
        })
      }
    }
  } catch {
    // Never throw from gap analysis
  }

  return candidates
}

// ============================================================
// B. KNOWLEDGE GRAPH GAPS
// Two-step fetch pattern: get exclusion IDs first, then filter.
// ============================================================
export async function analyzeKnowledgeGraphGaps(): Promise<OpportunityCandidate[]> {
  const candidates: OpportunityCandidate[] = []

  try {
    const db = createAdminClient()

    // --- Technologies with no explanation ---
    // Step 1: get all technology IDs that already have explanations
    const { data: explainedRows } = await db
      .from("technology_explanations")
      .select("technology_id")
    const explainedIds = (explainedRows ?? []).map((r: { technology_id: string }) => r.technology_id).filter(Boolean)

    // Step 2: fetch published techs not in that list
    let techExplQuery = db
      .from("technologies")
      .select("id, name, slug, popularity_score, updated_at")
      .eq("published", true)
      .order("popularity_score", { ascending: false })
      .limit(30)
    if (explainedIds.length > 0) {
      techExplQuery = techExplQuery.not("id", "in", `(${explainedIds.join(",")})`)
    }
    const { data: techNoExplanation } = await techExplQuery

    for (const tech of techNoExplanation ?? []) {
      const sc = score({ hasExistingContent: false, hasGraphRelationship: false })
      candidates.push({
        topic: tech.name,
        title_suggestion: `${tech.name} — Add structured explanation`,
        content_type: "technology_page",
        audience: "developers",
        reason: `Technology page for ${tech.name} exists but has no explanation`,
        why_now: `${tech.name} has no layered explanation. Editors, beginners, and experts cannot understand it at their level.`,
        gap_type: "underdeveloped",
        priority: toPriority(sc),
        source: "knowledge_gap",
        related_entity_type: "technology",
        related_entity_id: tech.id,
        related_entity_name: tech.name,
        created_by_type: "system",
        _score: sc,
      })
    }

    // --- Technologies with no related tools ---
    // Step 1: get tech IDs that already have tool relationships
    const { data: techWithToolRels } = await db
      .from("entity_relationships")
      .select("source_entity_id")
      .eq("source_entity_type", "technology")
      .in("relationship_type", ["USES", "IMPLEMENTS", "RELATED_TO"])
      .eq("target_entity_type", "tool")
    const techWithToolIds = (techWithToolRels ?? []).map((r: { source_entity_id: string }) => r.source_entity_id).filter(Boolean)

    // Step 2: fetch published techs not in that list
    let techNoToolQuery = db
      .from("technologies")
      .select("id, name, slug, popularity_score")
      .eq("published", true)
      .order("popularity_score", { ascending: false })
      .limit(20)
    if (techWithToolIds.length > 0) {
      techNoToolQuery = techNoToolQuery.not("id", "in", `(${techWithToolIds.join(",")})`)
    }
    const { data: techNoTools } = await techNoToolQuery

    for (const tech of techNoTools ?? []) {
      const sc = score({ hasGraphRelationship: false })
      candidates.push({
        topic: tech.name,
        title_suggestion: `${tech.name} — Connect related tools`,
        content_type: "update_existing_content",
        audience: "editors",
        reason: `${tech.name} has no tool relationships in the knowledge graph`,
        why_now: `Users exploring ${tech.name} cannot discover relevant tools from the tech page.`,
        gap_type: "disconnected",
        priority: toPriority(sc),
        source: "knowledge_gap",
        related_entity_type: "technology",
        related_entity_id: tech.id,
        related_entity_name: tech.name,
        created_by_type: "system",
        _score: sc,
      })
    }

    // --- Tools with no comparison ---
    // Step 1: get tool IDs that already have comparison relationships
    const { data: toolsWithComparison } = await db
      .from("entity_relationships")
      .select("source_entity_id")
      .eq("source_entity_type", "tool")
      .in("relationship_type", ["COMPARED_WITH", "ALTERNATIVE_TO"])
    const toolsWithCompIds = (toolsWithComparison ?? []).map((r: { source_entity_id: string }) => r.source_entity_id).filter(Boolean)

    // Step 2: fetch published tools not in that list
    let toolNoCompQuery = db
      .from("tools")
      .select("id, name, slug, rating_count")
      .eq("published", true)
      .order("rating_count", { ascending: false })
      .limit(20)
    if (toolsWithCompIds.length > 0) {
      toolNoCompQuery = toolNoCompQuery.not("id", "in", `(${toolsWithCompIds.join(",")})`)
    }
    const { data: toolsNoComparison } = await toolNoCompQuery

    for (const tool of toolsNoComparison ?? []) {
      const sc = score({ hasGraphRelationship: false })
      candidates.push({
        topic: `${tool.name} comparison`,
        title_suggestion: `${tool.name} vs. alternatives`,
        content_type: "comparison",
        audience: "developers evaluating tools",
        reason: `${tool.name} has no comparison page and no comparison relationships`,
        why_now: `Developers evaluating ${tool.name} have no structured comparison on NeuGravity.`,
        gap_type: "missing",
        priority: toPriority(sc),
        source: "knowledge_gap",
        related_entity_type: "tool",
        related_entity_id: tool.id,
        related_entity_name: tool.name,
        created_by_type: "system",
        _score: sc,
      })
    }
  } catch {
    // Never throw
  }

  return candidates
}

// ============================================================
// C. NEWS SIGNALS
// ============================================================
export async function analyzeNewsSignals(): Promise<OpportunityCandidate[]> {
  const candidates: OpportunityCandidate[] = []

  try {
    const db = createAdminClient()
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    // Recent published news linked to technologies
    const { data: recentNews } = await db
      .from("news_items")
      .select("id, title, entity_type, entity_id, published_at")
      .eq("status", "published")
      .gte("published_at", since)
      .not("entity_type", "is", null)
      .not("entity_id", "is", null)
      .order("published_at", { ascending: false })
      .limit(50)

    if (!recentNews || recentNews.length === 0) return candidates

    const techIds = [
      ...new Set(
        recentNews
          .filter((n: { entity_type: string; entity_id: string }) => n.entity_type === "technology" && n.entity_id)
          .map((n: { entity_id: string }) => n.entity_id)
      ),
    ]

    if (techIds.length === 0) return candidates

    // Step 1: get tech IDs that already have explanations (from the subset in news)
    const { data: explainedRows } = await db
      .from("technology_explanations")
      .select("technology_id")
      .in("technology_id", techIds)
    const explainedIds = (explainedRows ?? []).map((r: { technology_id: string }) => r.technology_id)

    // Step 2: fetch the news-linked techs that have no explanation
    let noExplQuery = db
      .from("technologies")
      .select("id, name, slug")
      .in("id", techIds)
    if (explainedIds.length > 0) {
      noExplQuery = noExplQuery.not("id", "in", `(${explainedIds.join(",")})`)
    }
    const { data: noExplanationTechs } = await noExplQuery

    const newsMap = new Map<string, string>()
    for (const n of recentNews as { entity_id?: string; title: string }[]) {
      if (n.entity_id) newsMap.set(n.entity_id, n.title)
    }

    for (const tech of noExplanationTechs ?? []) {
      const newsTitle = newsMap.get(tech.id) ?? "recent news activity"
      const sc = score({ hasNews: true, hasExistingContent: false })
      candidates.push({
        topic: tech.name,
        title_suggestion: `${tech.name} explained — What the news means`,
        content_type: "article",
        audience: "developers following trends",
        reason: `${tech.name} is in recent news but has no explanation on NeuGravity`,
        why_now: `Recent news: "${newsTitle}". ${tech.name} lacks a structured explainer — readers need context, not just the story.`,
        gap_type: "missing",
        priority: toPriority(sc),
        source: "news_signal",
        related_entity_type: "technology",
        related_entity_id: tech.id,
        related_entity_name: tech.name,
        created_by_type: "system",
        _score: sc,
      })
    }
  } catch {
    // Never throw
  }

  return candidates
}

// ============================================================
// D. TOOL GAPS
// ============================================================
export async function analyzeToolGaps(): Promise<OpportunityCandidate[]> {
  const candidates: OpportunityCandidate[] = []

  try {
    const db = createAdminClient()

    // Stale tools (last_verified_at more than 90 days ago)
    const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
    const { data: staleTools } = await db
      .from("tools")
      .select("id, name, slug, last_verified_at")
      .eq("published", true)
      .not("last_verified_at", "is", null)
      .lt("last_verified_at", cutoff)
      .order("last_verified_at", { ascending: true })
      .limit(15)

    for (const tool of staleTools ?? []) {
      const sc = score({ isStale: true })
      candidates.push({
        topic: `${tool.name} update`,
        title_suggestion: `${tool.name} — Verify and update tool data`,
        content_type: "update_existing_content",
        audience: "editors",
        reason: `${tool.name} was last verified more than 90 days ago`,
        why_now: `Tool data for ${tool.name} may be outdated. Pricing, features, and availability should be reverified.`,
        gap_type: "stale",
        priority: toPriority(sc),
        source: "tool_gap",
        related_entity_type: "tool",
        related_entity_id: tool.id,
        related_entity_name: tool.name,
        metadata: { last_verified_at: tool.last_verified_at },
        created_by_type: "system",
        _score: sc,
      })
    }

    // Highly-rated tools with no comparison — two-step fetch
    // Step 1: get tool IDs that have comparison relationships
    const { data: toolsWithComparison } = await db
      .from("entity_relationships")
      .select("source_entity_id")
      .eq("source_entity_type", "tool")
      .in("relationship_type", ["COMPARED_WITH", "ALTERNATIVE_TO", "COMPETES_WITH"])
    const toolsWithCompIds = (toolsWithComparison ?? []).map((r: { source_entity_id: string }) => r.source_entity_id).filter(Boolean)

    // Step 2: popular tools not in that list
    let popularToolsQuery = db
      .from("tools")
      .select("id, name, slug, rating_count, rating_average")
      .eq("published", true)
      .gte("rating_count", 100)
      .order("rating_count", { ascending: false })
      .limit(10)
    if (toolsWithCompIds.length > 0) {
      popularToolsQuery = popularToolsQuery.not("id", "in", `(${toolsWithCompIds.join(",")})`)
    }
    const { data: popularToolsNoComparison } = await popularToolsQuery

    for (const tool of popularToolsNoComparison ?? []) {
      const sc = score({ hasGraphRelationship: false, searchCount: tool.rating_count })
      candidates.push({
        topic: `${tool.name} vs alternatives`,
        title_suggestion: `${tool.name} vs. top alternatives — Which should you use?`,
        content_type: "comparison",
        audience: "developers evaluating tools",
        reason: `${tool.name} has ${tool.rating_count} ratings but no comparison page`,
        why_now: `Users researching ${tool.name} have no direct alternative comparison on NeuGravity.`,
        gap_type: "missing",
        priority: toPriority(sc),
        source: "tool_gap",
        related_entity_type: "tool",
        related_entity_id: tool.id,
        related_entity_name: tool.name,
        created_by_type: "system",
        _score: sc,
      })
    }
  } catch {
    // Never throw
  }

  return candidates
}

// ============================================================
// E. LEARNING GAPS
// Two-step fetch pattern for subquery exclusions.
// ============================================================
export async function analyzeLearningGaps(): Promise<OpportunityCandidate[]> {
  const candidates: OpportunityCandidate[] = []

  try {
    const db = createAdminClient()

    // --- Technologies with no course/lesson ---
    // Step 1: get tech IDs that have course relationships
    const { data: techWithCourseRels } = await db
      .from("entity_relationships")
      .select("source_entity_id")
      .eq("source_entity_type", "technology")
      .in("relationship_type", ["COVERED_BY", "EXPLAINED_BY"])
      .eq("target_entity_type", "course")
    const techWithCourseIds = (techWithCourseRels ?? []).map((r: { source_entity_id: string }) => r.source_entity_id).filter(Boolean)

    // Step 2: published techs without course relationships
    let techNoCourseQuery = db
      .from("technologies")
      .select("id, name, slug, popularity_score")
      .eq("published", true)
      .order("popularity_score", { ascending: false })
      .limit(20)
    if (techWithCourseIds.length > 0) {
      techNoCourseQuery = techNoCourseQuery.not("id", "in", `(${techWithCourseIds.join(",")})`)
    }
    const { data: techNoCourse } = await techNoCourseQuery

    for (const tech of techNoCourse ?? []) {
      const sc = score({ hasExistingContent: false, searchCount: tech.popularity_score * 10 })
      candidates.push({
        topic: tech.name,
        title_suggestion: `Learn ${tech.name} — Course or lesson`,
        content_type: "course",
        audience: "learners, developers",
        reason: `${tech.name} has no course or lesson on NeuGravity`,
        why_now: `${tech.name} has a popularity score of ${tech.popularity_score} but no learning content.`,
        gap_type: "missing",
        priority: toPriority(sc),
        source: "learning_gap",
        related_entity_type: "technology",
        related_entity_id: tech.id,
        related_entity_name: tech.name,
        created_by_type: "system",
        _score: sc,
      })
    }

    // --- Learning paths with fewer than 3 steps ---
    const { data: thinPaths } = await db
      .from("learning_paths")
      .select("id, title, step_count")
      .eq("status", "published")
      .lt("step_count", 3)
      .limit(10)

    for (const path of thinPaths ?? []) {
      const sc = score({})
      candidates.push({
        topic: `${path.title} — expand learning path`,
        title_suggestion: `${path.title} — Add prerequisite and advanced steps`,
        content_type: "learning_path",
        audience: "learners",
        reason: `Learning path "${path.title}" has only ${path.step_count} step(s) — insufficient progression`,
        why_now: `Thin learning paths create poor learner outcomes. This path needs more prerequisite and advanced content.`,
        gap_type: "underdeveloped",
        priority: toPriority(sc),
        source: "learning_gap",
        metadata: { path_step_count: path.step_count },
        created_by_type: "system",
        _score: sc,
      })
    }
  } catch {
    // Never throw
  }

  return candidates
}

// ============================================================
// F. CONTENT DECAY — stale published content
// ============================================================
export async function detectContentDecay(): Promise<OpportunityCandidate[]> {
  const candidates: OpportunityCandidate[] = []

  try {
    const db = createAdminClient()
    const cutoff180 = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()

    // Technologies not verified in 6 months
    const { data: staleTechs } = await db
      .from("technologies")
      .select("id, name, slug, last_verified_at, updated_at")
      .eq("published", true)
      .not("last_verified_at", "is", null)
      .lt("last_verified_at", cutoff180)
      .order("last_verified_at", { ascending: true })
      .limit(20)

    for (const tech of staleTechs ?? []) {
      const sc = score({ isStale: true })
      candidates.push({
        topic: `${tech.name} — review and update`,
        title_suggestion: `${tech.name} page — verify accuracy`,
        content_type: "update_existing_content",
        audience: "editors",
        reason: `Technology page for ${tech.name} has not been verified in 6+ months`,
        why_now: `Last verified: ${tech.last_verified_at}. The technology may have evolved significantly.`,
        gap_type: "stale",
        priority: toPriority(sc),
        source: "knowledge_gap",
        related_entity_type: "technology",
        related_entity_id: tech.id,
        related_entity_name: tech.name,
        metadata: { last_verified_at: tech.last_verified_at },
        created_by_type: "system",
        _score: sc,
      })
    }
  } catch {
    // Never throw
  }

  return candidates
}

// ============================================================
// MAIN: run all analyses and return deduplicated candidates
// ============================================================
export async function runFullGapAnalysis(): Promise<OpportunityCandidate[]> {
  const [search, graph, news, tools, learning, decay] = await Promise.all([
    analyzeSearchSignals(),
    analyzeKnowledgeGraphGaps(),
    analyzeNewsSignals(),
    analyzeToolGaps(),
    analyzeLearningGaps(),
    detectContentDecay(),
  ])

  const all = [...search, ...graph, ...news, ...tools, ...learning, ...decay]

  // Deduplicate by [normalized topic + content_type + entity] before returning
  const seen = new Set<string>()
  const deduped: OpportunityCandidate[] = []
  for (const c of all) {
    const key =
      c.topic.toLowerCase().replace(/[^a-z0-9]/g, "") +
      ":" +
      c.content_type +
      ":" +
      (c.related_entity_type ?? "") +
      ":" +
      (c.related_entity_id ?? "")
    if (!seen.has(key)) {
      seen.add(key)
      deduped.push(c)
    }
  }

  return deduped.sort((a, b) => b._score - a._score)
}
