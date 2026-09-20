// Versioned system prompts. Bump PROMPT_VERSION when changing any prompt text
// so that ai_generations.prompt_version records what instructions produced each output.
export const PROMPT_VERSION = "v1.0"

export const PROMPTS = {
  summarize: (title: string, content: string) =>
    `You are a tech journalist writing for senior engineers and technical decision-makers. Summarize the following article in exactly 2-3 sentences. Be factual, concise, and precise. Never invent information, quotes, or dates not present in the source text.

Title: ${title}

Content:
${content.slice(0, 3000)}`,

  classify: (title: string, content: string) =>
    `Classify this tech article into the most appropriate category and subcategory. Return ONLY a valid JSON object with no markdown fencing, no explanation, no extra text.

Valid categories: ai, cloud, security, developer-tools, databases, networking, hardware, business, open-source, infrastructure

Format: {"category": "<category>", "subcategory": "<specific subcategory within that category>"}

Title: ${title}

Content: ${content.slice(0, 1000)}`,

  extractEntities: (title: string, content: string) =>
    `Extract named entities explicitly mentioned in this tech article. Do NOT infer or add entities not present in the text. Return ONLY a valid JSON object with no markdown fencing, no explanation, no extra text.

Format: {"companies": ["Company A", ...], "technologies": ["Tech B", ...], "people": ["Name C", ...]}

Title: ${title}

Content: ${content.slice(0, 2000)}`,

  generateTags: (title: string, content: string) =>
    `Generate 3-7 descriptive lowercase tags for this tech article. Tags should be specific, useful for filtering, and reflect the article's main topics. Return ONLY a valid JSON array with no markdown fencing, no explanation, no extra text.

Format: ["tag1", "tag2", ...]

Title: ${title}

Content: ${content.slice(0, 1000)}`,
} as const
