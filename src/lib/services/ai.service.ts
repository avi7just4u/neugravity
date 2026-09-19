import { createAdminClient } from "@/lib/supabase/server"
import { AI_CONFIG } from "@/lib/config/ai.config"

async function callClaude(prompt: string, task: string, model?: string): Promise<string> {
  const Anthropic = (await import("@anthropic-ai/sdk")).default
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const message = await client.messages.create({
    model: model ?? AI_CONFIG.defaultModel,
    max_tokens: AI_CONFIG.maxTokens[task as keyof typeof AI_CONFIG.maxTokens] ?? 512,
    messages: [{ role: "user", content: prompt }],
  })
  return message.content.find((b) => b.type === "text")?.text ?? ""
}

async function logGeneration(opts: {
  task: string
  input_reference: string
  output: string
  latency_ms: number
  token_usage?: { input: number; output: number }
  status: "success" | "error"
  error?: string
  model: string
}) {
  try {
    const db = createAdminClient()
    await db.from("ai_generations").insert({
      model: opts.model,
      task: opts.task,
      input_reference: opts.input_reference,
      output: opts.output,
      latency_ms: opts.latency_ms,
      token_usage: opts.token_usage ?? null,
      status: opts.status,
      error: opts.error ?? null,
    })
  } catch {
    // non-critical — swallow
  }
}

export const AIService = {
  async generateSummary(title: string, content: string, sourceItemId: string): Promise<string> {
    if (AI_CONFIG.isPlaceholderKey()) {
      return `${title}. ${content.slice(0, 200)}...`
    }
    const model = AI_CONFIG.summaryModel
    const prompt = `Summarize the following article in 2-3 sentences for a tech professional audience. Be concise and factual. Do not invent dates, quotes, or claims not present in the source.\n\nTitle: ${title}\n\nContent:\n${content.slice(0, 3000)}`
    const t0 = Date.now()
    try {
      const result = await callClaude(prompt, "summary", model)
      await logGeneration({ task: "summarize", input_reference: sourceItemId, output: result, latency_ms: Date.now() - t0, status: "success", model })
      return result
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err)
      await logGeneration({ task: "summarize", input_reference: sourceItemId, output: "", latency_ms: Date.now() - t0, status: "error", error, model })
      return `${title}. ${content.slice(0, 200)}...`
    }
  },

  async classify(title: string, content: string, sourceItemId: string): Promise<{ category: string; subcategory: string }> {
    if (AI_CONFIG.isPlaceholderKey()) {
      return { category: "technology", subcategory: "general" }
    }
    const model = AI_CONFIG.classificationModel
    const prompt = `Classify this tech article into a category and subcategory. Return ONLY valid JSON: {"category": "...", "subcategory": "..."}\n\nCategories: ai, cloud, security, developer-tools, databases, networking, hardware, business, open-source\n\nTitle: ${title}\n\nContent: ${content.slice(0, 1000)}`
    const t0 = Date.now()
    try {
      const result = await callClaude(prompt, "classification", model)
      const parsed = JSON.parse(result.match(/\{[^}]+\}/)?.[0] ?? '{"category":"technology","subcategory":"general"}')
      await logGeneration({ task: "classify", input_reference: sourceItemId, output: result, latency_ms: Date.now() - t0, status: "success", model })
      return parsed
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err)
      await logGeneration({ task: "classify", input_reference: sourceItemId, output: "", latency_ms: Date.now() - t0, status: "error", error, model })
      return { category: "technology", subcategory: "general" }
    }
  },

  async extractEntities(title: string, content: string, sourceItemId: string): Promise<{ companies: string[]; technologies: string[]; people: string[] }> {
    if (AI_CONFIG.isPlaceholderKey()) {
      return { companies: [], technologies: [], people: [] }
    }
    const model = AI_CONFIG.entityModel
    const prompt = `Extract named entities from this tech article. Only include entities explicitly mentioned — do not invent. Return ONLY valid JSON: {"companies": [...], "technologies": [...], "people": [...]}\n\nTitle: ${title}\n\nContent: ${content.slice(0, 2000)}`
    const t0 = Date.now()
    try {
      const result = await callClaude(prompt, "entityExtraction", model)
      const parsed = JSON.parse(result.match(/\{[\s\S]*\}/)?.[0] ?? '{"companies":[],"technologies":[],"people":[]}')
      await logGeneration({ task: "extract_entities", input_reference: sourceItemId, output: result, latency_ms: Date.now() - t0, status: "success", model })
      return parsed
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err)
      await logGeneration({ task: "extract_entities", input_reference: sourceItemId, output: "", latency_ms: Date.now() - t0, status: "error", error, model })
      return { companies: [], technologies: [], people: [] }
    }
  },

  async generateTags(title: string, content: string, sourceItemId: string): Promise<string[]> {
    if (AI_CONFIG.isPlaceholderKey()) {
      return []
    }
    const model = AI_CONFIG.defaultModel
    const prompt = `Generate 3-7 tags for this tech article. Return ONLY a JSON array of lowercase tag strings: ["tag1", "tag2", ...]\n\nTitle: ${title}\n\nContent: ${content.slice(0, 1000)}`
    const t0 = Date.now()
    try {
      const result = await callClaude(prompt, "tagGeneration", model)
      const parsed = JSON.parse(result.match(/\[[\s\S]*\]/)?.[0] ?? "[]")
      await logGeneration({ task: "generate_tags", input_reference: sourceItemId, output: result, latency_ms: Date.now() - t0, status: "success", model })
      return Array.isArray(parsed) ? parsed.slice(0, 7) : []
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err)
      await logGeneration({ task: "generate_tags", input_reference: sourceItemId, output: "", latency_ms: Date.now() - t0, status: "error", error, model })
      return []
    }
  },

  async detectDuplicate(title: string, recentTitles: string[], sourceItemId: string): Promise<{ isDuplicate: boolean; duplicateOf?: string }> {
    if (AI_CONFIG.isPlaceholderKey() || recentTitles.length === 0) {
      return { isDuplicate: false }
    }
    const model = AI_CONFIG.classificationModel
    const list = recentTitles.slice(0, 20).map((t, i) => `${i + 1}. ${t}`).join("\n")
    const prompt = `Is the following article a duplicate or near-duplicate of any article in the list? Return ONLY valid JSON: {"isDuplicate": true/false, "duplicateOf": "matching title or null"}\n\nNew article: "${title}"\n\nRecent articles:\n${list}`
    const t0 = Date.now()
    try {
      const result = await callClaude(prompt, "classification", model)
      const parsed = JSON.parse(result.match(/\{[^}]+\}/)?.[0] ?? '{"isDuplicate":false}')
      await logGeneration({ task: "detect_duplicate", input_reference: sourceItemId, output: result, latency_ms: Date.now() - t0, status: "success", model })
      return parsed
    } catch {
      return { isDuplicate: false }
    }
  },
}
