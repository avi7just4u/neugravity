import { createAdminClient } from "@/lib/supabase/server"

const MODEL = "claude-haiku-4-5-20251001"

function isPlaceholderKey(): boolean {
  const key = process.env.ANTHROPIC_API_KEY ?? ""
  return !key || key.startsWith("sk-ant-placeholder")
}

async function callClaude(prompt: string, task: string): Promise<string> {
  const Anthropic = (await import("@anthropic-ai/sdk")).default
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  })
  const text = message.content.find((b) => b.type === "text")?.text ?? ""
  return text
}

async function logGeneration(opts: {
  task: string
  input_reference: string
  output: string
  latency_ms: number
  token_usage?: { input: number; output: number }
  status: "success" | "error"
  error?: string
}) {
  try {
    const db = createAdminClient()
    await db.from("ai_generations").insert({
      model: MODEL,
      task: opts.task,
      input_reference: opts.input_reference,
      output: opts.output,
      latency_ms: opts.latency_ms,
      token_usage: opts.token_usage ?? null,
      status: opts.status,
      error: opts.error ?? null,
    })
  } catch {
    // non-critical logging — swallow errors
  }
}

export const AIService = {
  async generateSummary(title: string, content: string, sourceItemId: string): Promise<string> {
    if (isPlaceholderKey()) {
      return `${title}. ${content.slice(0, 200)}...`
    }
    const prompt = `Summarize the following article in 2-3 sentences for a tech professional audience. Be concise and factual.\n\nTitle: ${title}\n\nContent:\n${content.slice(0, 3000)}`
    const t0 = Date.now()
    try {
      const result = await callClaude(prompt, "summarize")
      const latency_ms = Date.now() - t0
      await logGeneration({ task: "summarize", input_reference: sourceItemId, output: result, latency_ms, status: "success" })
      return result
    } catch (err) {
      const latency_ms = Date.now() - t0
      const error = err instanceof Error ? err.message : String(err)
      await logGeneration({ task: "summarize", input_reference: sourceItemId, output: "", latency_ms, status: "error", error })
      return `${title}. ${content.slice(0, 200)}...`
    }
  },

  async classify(title: string, content: string, sourceItemId: string): Promise<{ category: string; subcategory: string }> {
    if (isPlaceholderKey()) {
      return { category: "technology", subcategory: "general" }
    }
    const prompt = `Classify this tech article into a category and subcategory. Return ONLY valid JSON: {"category": "...", "subcategory": "..."}\n\nCategories: ai, cloud, security, developer-tools, databases, networking, hardware, business, open-source\n\nTitle: ${title}\n\nContent: ${content.slice(0, 1000)}`
    const t0 = Date.now()
    try {
      const result = await callClaude(prompt, "classify")
      const latency_ms = Date.now() - t0
      const parsed = JSON.parse(result.match(/\{[^}]+\}/)?.[0] ?? '{"category":"technology","subcategory":"general"}')
      await logGeneration({ task: "classify", input_reference: sourceItemId, output: result, latency_ms, status: "success" })
      return parsed
    } catch (err) {
      const latency_ms = Date.now() - t0
      const error = err instanceof Error ? err.message : String(err)
      await logGeneration({ task: "classify", input_reference: sourceItemId, output: "", latency_ms, status: "error", error })
      return { category: "technology", subcategory: "general" }
    }
  },

  async extractEntities(title: string, content: string, sourceItemId: string): Promise<{ companies: string[]; technologies: string[]; people: string[] }> {
    if (isPlaceholderKey()) {
      return { companies: [], technologies: [], people: [] }
    }
    const prompt = `Extract named entities from this tech article. Return ONLY valid JSON: {"companies": [...], "technologies": [...], "people": [...]}\n\nTitle: ${title}\n\nContent: ${content.slice(0, 2000)}`
    const t0 = Date.now()
    try {
      const result = await callClaude(prompt, "extract_entities")
      const latency_ms = Date.now() - t0
      const parsed = JSON.parse(result.match(/\{[\s\S]*\}/)?.[0] ?? '{"companies":[],"technologies":[],"people":[]}')
      await logGeneration({ task: "extract_entities", input_reference: sourceItemId, output: result, latency_ms, status: "success" })
      return parsed
    } catch (err) {
      const latency_ms = Date.now() - t0
      const error = err instanceof Error ? err.message : String(err)
      await logGeneration({ task: "extract_entities", input_reference: sourceItemId, output: "", latency_ms, status: "error", error })
      return { companies: [], technologies: [], people: [] }
    }
  },

  async generateTags(title: string, content: string, sourceItemId: string): Promise<string[]> {
    if (isPlaceholderKey()) {
      return []
    }
    const prompt = `Generate 3-7 tags for this tech article. Return ONLY a JSON array of lowercase tag strings: ["tag1", "tag2", ...]\n\nTitle: ${title}\n\nContent: ${content.slice(0, 1000)}`
    const t0 = Date.now()
    try {
      const result = await callClaude(prompt, "generate_tags")
      const latency_ms = Date.now() - t0
      const parsed = JSON.parse(result.match(/\[[\s\S]*\]/)?.[0] ?? "[]")
      await logGeneration({ task: "generate_tags", input_reference: sourceItemId, output: result, latency_ms, status: "success" })
      return Array.isArray(parsed) ? parsed.slice(0, 7) : []
    } catch (err) {
      const latency_ms = Date.now() - t0
      const error = err instanceof Error ? err.message : String(err)
      await logGeneration({ task: "generate_tags", input_reference: sourceItemId, output: "", latency_ms, status: "error", error })
      return []
    }
  },

  async detectDuplicate(title: string, recentTitles: string[], sourceItemId: string): Promise<{ isDuplicate: boolean; duplicateOf?: string }> {
    if (isPlaceholderKey() || recentTitles.length === 0) {
      return { isDuplicate: false }
    }
    const list = recentTitles.slice(0, 20).map((t, i) => `${i + 1}. ${t}`).join("\n")
    const prompt = `Is the following article a duplicate or near-duplicate of any article in the list? Return ONLY valid JSON: {"isDuplicate": true/false, "duplicateOf": "matching title or null"}\n\nNew article: "${title}"\n\nRecent articles:\n${list}`
    const t0 = Date.now()
    try {
      const result = await callClaude(prompt, "detect_duplicate")
      const latency_ms = Date.now() - t0
      const parsed = JSON.parse(result.match(/\{[^}]+\}/)?.[0] ?? '{"isDuplicate":false}')
      await logGeneration({ task: "detect_duplicate", input_reference: sourceItemId, output: result, latency_ms, status: "success" })
      return parsed
    } catch {
      return { isDuplicate: false }
    }
  },
}
