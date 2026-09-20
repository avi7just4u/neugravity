export const AI_CONFIG = {
  defaultModel: process.env.AI_DEFAULT_MODEL ?? "claude-haiku-4-5-20251001",
  summaryModel: process.env.AI_SUMMARY_MODEL ?? "claude-haiku-4-5-20251001",
  classificationModel: process.env.AI_CLASSIFICATION_MODEL ?? "claude-haiku-4-5-20251001",
  entityModel: process.env.AI_ENTITY_MODEL ?? "claude-haiku-4-5-20251001",
  openRouterModel: process.env.AI_OPENROUTER_MODEL ?? "google/gemini-flash-1.5",
  provider: process.env.AI_PROVIDER ?? "auto",
  maxTokens: {
    summary: 300,
    classification: 100,
    entityExtraction: 200,
    tagGeneration: 100,
  },
  temperature: {
    summary: 0.3,
    classification: 0.1,
    entityExtraction: 0.2,
    tagGeneration: 0.3,
  },
  isPlaceholderKey(): boolean {
    const key = process.env.ANTHROPIC_API_KEY ?? ""
    return !key || key.startsWith("sk-ant-placeholder") || key === "placeholder" || key === "sk-ant-..."
  },
  isConfigured(): boolean {
    const anthropic = process.env.ANTHROPIC_API_KEY ?? ""
    const openRouter = process.env.OPENROUTER_API_KEY ?? ""
    const anthropicReal = !!anthropic && !anthropic.startsWith("sk-ant-placeholder") && anthropic !== "placeholder" && anthropic !== "sk-ant-..."
    const openRouterReal = !!openRouter && openRouter !== "placeholder"
    return anthropicReal || openRouterReal
  },
  resolvedProvider(): "anthropic" | "openrouter" | null {
    const anthropic = process.env.ANTHROPIC_API_KEY ?? ""
    const openRouter = process.env.OPENROUTER_API_KEY ?? ""
    const anthropicReal = !!anthropic && !anthropic.startsWith("sk-ant-placeholder") && anthropic !== "placeholder" && anthropic !== "sk-ant-..."
    const openRouterReal = !!openRouter && openRouter !== "placeholder"
    const pref = process.env.AI_PROVIDER ?? "auto"

    if (pref === "anthropic") return anthropicReal ? "anthropic" : null
    if (pref === "openrouter") return openRouterReal ? "openrouter" : null
    // auto: prefer anthropic, fall back to openrouter
    if (anthropicReal) return "anthropic"
    if (openRouterReal) return "openrouter"
    return null
  },
}
