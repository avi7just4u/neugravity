import { createAdminClient } from "@/lib/supabase/server"
import { AI_CONFIG } from "@/lib/config/ai.config"
import { PROMPTS, PROMPT_VERSION } from "@/lib/ai/prompts"

export class AINotConfiguredError extends Error {
  constructor() {
    super("AI_NOT_CONFIGURED: No AI provider is configured. Set ANTHROPIC_API_KEY or OPENROUTER_API_KEY.")
    this.name = "AINotConfiguredError"
  }
}

function assertConfigured(): void {
  if (!AI_CONFIG.isConfigured()) {
    throw new AINotConfiguredError()
  }
}

async function callClaude(
  prompt: string,
  task: keyof typeof AI_CONFIG.maxTokens,
  model: string
): Promise<{ text: string; inputTokens: number; outputTokens: number }> {
  const provider = AI_CONFIG.resolvedProvider()
  if (!provider) throw new AINotConfiguredError()

  const maxTokens = AI_CONFIG.maxTokens[task] ?? 512

  if (provider === "openrouter") {
    const openRouterModel = AI_CONFIG.openRouterModel
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://neugravity.vercel.app",
        "X-Title": "NeuGravity",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: openRouterModel,
        messages: [
          { role: "system", content: "You are a helpful AI assistant for NeuGravity, a tech intelligence platform." },
          { role: "user", content: prompt },
        ],
        max_tokens: maxTokens,
      }),
    })
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`OpenRouter error ${res.status}: ${body}`)
    }
    const json = await res.json()
    const text: string = json.choices?.[0]?.message?.content ?? ""
    const usage = json.usage ?? {}
    return {
      text,
      inputTokens: usage.prompt_tokens ?? 0,
      outputTokens: usage.completion_tokens ?? 0,
    }
  }

  // Anthropic
  const Anthropic = (await import("@anthropic-ai/sdk")).default
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const message = await client.messages.create({
    model,
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }],
  })
  const text = message.content.find((b) => b.type === "text")?.text ?? ""
  return {
    text,
    inputTokens: message.usage.input_tokens,
    outputTokens: message.usage.output_tokens,
  }
}

async function parseJsonWithRetry<T>(
  raw: string,
  extractPattern: RegExp,
  fallback: T,
  maxAttempts = 2
): Promise<T> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const match = raw.match(extractPattern)
      if (match) return JSON.parse(match[0]) as T
    } catch {
      // try next attempt
    }
  }
  return fallback
}

async function logGeneration(opts: {
  task: string
  input_reference: string
  output: string
  latency_ms: number
  token_usage?: { input: number; output: number }
  status: "completed" | "failed"
  error?: string
  model: string
  prompt_version: string
}) {
  try {
    const db = createAdminClient()
    await db.from("ai_generations").insert({
      model: opts.model,
      task: opts.task,
      input_reference: opts.input_reference,
      output: opts.output,
      latency_ms: opts.latency_ms,
      token_usage: opts.token_usage ? { input: opts.token_usage.input, output: opts.token_usage.output } : null,
      status: opts.status,
      error: opts.error ?? null,
      prompt_version: opts.prompt_version,
    })
  } catch {
    // non-critical
  }
}

export const AIService = {
  async generateSummary(title: string, content: string, sourceItemId: string): Promise<string> {
    assertConfigured()
    const model = AI_CONFIG.summaryModel
    const prompt = PROMPTS.summarize(title, content)
    const t0 = Date.now()
    try {
      const { text, inputTokens, outputTokens } = await callClaude(prompt, "summary", model)
      await logGeneration({
        task: "summarize",
        input_reference: sourceItemId,
        output: text,
        latency_ms: Date.now() - t0,
        token_usage: { input: inputTokens, output: outputTokens },
        status: "completed",
        model,
        prompt_version: PROMPT_VERSION,
      })
      return text
    } catch (err) {
      if (err instanceof AINotConfiguredError) throw err
      const error = err instanceof Error ? err.message : String(err)
      await logGeneration({ task: "summarize", input_reference: sourceItemId, output: "", latency_ms: Date.now() - t0, status: "failed", error, model, prompt_version: PROMPT_VERSION })
      throw err
    }
  },

  async classify(
    title: string,
    content: string,
    sourceItemId: string
  ): Promise<{ category: string; subcategory: string }> {
    assertConfigured()
    const model = AI_CONFIG.classificationModel
    const prompt = PROMPTS.classify(title, content)
    const t0 = Date.now()
    const fallback = { category: "technology", subcategory: "general" }
    try {
      const { text, inputTokens, outputTokens } = await callClaude(prompt, "classification", model)
      const parsed = await parseJsonWithRetry<{ category: string; subcategory: string }>(
        text,
        /\{[^}]+\}/,
        fallback
      )
      await logGeneration({
        task: "classify",
        input_reference: sourceItemId,
        output: text,
        latency_ms: Date.now() - t0,
        token_usage: { input: inputTokens, output: outputTokens },
        status: "completed",
        model,
        prompt_version: PROMPT_VERSION,
      })
      return parsed
    } catch (err) {
      if (err instanceof AINotConfiguredError) throw err
      const error = err instanceof Error ? err.message : String(err)
      await logGeneration({ task: "classify", input_reference: sourceItemId, output: "", latency_ms: Date.now() - t0, status: "failed", error, model, prompt_version: PROMPT_VERSION })
      throw err
    }
  },

  async extractEntities(
    title: string,
    content: string,
    sourceItemId: string
  ): Promise<{ companies: string[]; technologies: string[]; people: string[] }> {
    assertConfigured()
    const model = AI_CONFIG.entityModel
    const prompt = PROMPTS.extractEntities(title, content)
    const t0 = Date.now()
    const fallback = { companies: [], technologies: [], people: [] }
    try {
      const { text, inputTokens, outputTokens } = await callClaude(prompt, "entityExtraction", model)
      const parsed = await parseJsonWithRetry<{ companies: string[]; technologies: string[]; people: string[] }>(
        text,
        /\{[\s\S]*\}/,
        fallback
      )
      await logGeneration({
        task: "extract_entities",
        input_reference: sourceItemId,
        output: text,
        latency_ms: Date.now() - t0,
        token_usage: { input: inputTokens, output: outputTokens },
        status: "completed",
        model,
        prompt_version: PROMPT_VERSION,
      })
      return parsed
    } catch (err) {
      if (err instanceof AINotConfiguredError) throw err
      const error = err instanceof Error ? err.message : String(err)
      await logGeneration({ task: "extract_entities", input_reference: sourceItemId, output: "", latency_ms: Date.now() - t0, status: "failed", error, model, prompt_version: PROMPT_VERSION })
      throw err
    }
  },

  async generateTags(title: string, content: string, sourceItemId: string): Promise<string[]> {
    assertConfigured()
    const model = AI_CONFIG.defaultModel
    const prompt = PROMPTS.generateTags(title, content)
    const t0 = Date.now()
    try {
      const { text, inputTokens, outputTokens } = await callClaude(prompt, "tagGeneration", model)
      const parsed = await parseJsonWithRetry<string[]>(text, /\[[\s\S]*\]/, [])
      await logGeneration({
        task: "generate_tags",
        input_reference: sourceItemId,
        output: text,
        latency_ms: Date.now() - t0,
        token_usage: { input: inputTokens, output: outputTokens },
        status: "completed",
        model,
        prompt_version: PROMPT_VERSION,
      })
      return Array.isArray(parsed) ? parsed.slice(0, 7) : []
    } catch (err) {
      if (err instanceof AINotConfiguredError) throw err
      const error = err instanceof Error ? err.message : String(err)
      await logGeneration({ task: "generate_tags", input_reference: sourceItemId, output: "", latency_ms: Date.now() - t0, status: "failed", error, model, prompt_version: PROMPT_VERSION })
      throw err
    }
  },
}
