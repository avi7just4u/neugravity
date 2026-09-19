export const AI_CONFIG = {
  defaultModel: process.env.AI_DEFAULT_MODEL ?? "claude-haiku-4-5-20251001",
  summaryModel: process.env.AI_SUMMARY_MODEL ?? "claude-haiku-4-5-20251001",
  classificationModel: process.env.AI_CLASSIFICATION_MODEL ?? "claude-haiku-4-5-20251001",
  entityModel: process.env.AI_ENTITY_MODEL ?? "claude-haiku-4-5-20251001",
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
}
