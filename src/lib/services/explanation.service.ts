import { createAdminClient, createAnonClient } from "@/lib/supabase/server"
import { AI_CONFIG } from "@/lib/config/ai.config"
import type { TechnologyExplanation, ExplanationType } from "@/types"

export interface CreateExplanationInput {
  technology_id: string
  explanation_type: ExplanationType
  title?: string
  content: string
  generated_by?: 'ai' | 'editor' | 'import'
}

const EXPLANATION_LABELS: Record<ExplanationType, string> = {
  quick:     '30-Second Explanation',
  simple:    'Simple Explanation',
  beginner:  'Beginner Explanation',
  technical: 'Technical Explanation',
  architect: 'Architect Explanation',
}

const EXPLANATION_INSTRUCTIONS: Record<ExplanationType, string> = {
  quick: `Write a 2-4 sentence 30-second explanation. Include: what it is, what problem it solves. Be precise. No fluff.`,
  simple: `Write a simple analogy-first explanation for a non-technical reader. Use an everyday analogy first, then explain the concept. 3-5 short paragraphs. No jargon without explanation.`,
  beginner: `Write a structured beginner explanation using these sections: The Problem, What [technology] Is, How It Works (step by step), A Concrete Example. Use markdown headers with **bold**. 400-600 words.`,
  technical: `Write a technical explanation for a software engineer. Cover: architecture/components, data flow, implementation concepts, key configuration/parameters, limitations. Use markdown headers. 500-800 words.`,
  architect: `Write an architect-level explanation covering: trade-offs, scaling considerations, security surface, failure modes, when to use, when not to use, alternatives. Use markdown headers. 600-900 words.`,
}

async function callLLM(prompt: string, maxTokens: number): Promise<string> {
  const provider = AI_CONFIG.resolvedProvider()
  if (!provider) throw new Error("AI_NOT_CONFIGURED")

  if (provider === "groq" || provider === "openrouter") {
    const isGroq = provider === "groq"
    const apiKey = isGroq ? process.env.GROQ_API_KEY : process.env.OPENROUTER_API_KEY
    const apiModel = isGroq ? AI_CONFIG.groqModel : AI_CONFIG.openRouterModel
    const baseUrl = isGroq
      ? "https://api.groq.com/openai/v1/chat/completions"
      : "https://openrouter.ai/api/v1/chat/completions"
    const headers: Record<string, string> = {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }
    if (!isGroq) {
      headers["HTTP-Referer"] = "https://neugravity.vercel.app"
      headers["X-Title"] = "NeuGravity"
    }
    const res = await fetch(baseUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: apiModel,
        messages: [
          {
            role: "system",
            content: "You are a technical writer for NeuGravity, a technology intelligence platform. Your explanations are clear, accurate, and grounded in facts. You never fabricate statistics, dates, pricing, benchmarks, or usage numbers. If you are uncertain about a fact, you omit it rather than guess.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: maxTokens,
      }),
    })
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`${provider} error ${res.status}: ${body}`)
    }
    const json = await res.json()
    return (json.choices?.[0]?.message?.content ?? "") as string
  }

  // Anthropic
  const Anthropic = (await import("@anthropic-ai/sdk")).default
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const message = await client.messages.create({
    model: AI_CONFIG.defaultModel,
    max_tokens: maxTokens,
    system: "You are a technical writer for NeuGravity. Your explanations are accurate, clear, and never include fabricated statistics, benchmarks, or pricing.",
    messages: [{ role: "user", content: prompt }],
  })
  return message.content.find((b) => b.type === "text")?.text ?? ""
}

export const ExplanationService = {
  async getExplanations(
    technologyId: string
  ): Promise<Record<ExplanationType, TechnologyExplanation | null>> {
    const empty: Record<ExplanationType, TechnologyExplanation | null> = {
      quick: null, simple: null, beginner: null, technical: null, architect: null,
    }
    try {
      const db = createAdminClient()
      const { data } = await db
        .from("technology_explanations")
        .select("*")
        .eq("technology_id", technologyId)
        .order("version", { ascending: false })

      for (const row of (data ?? [])) {
        const exp = row as TechnologyExplanation
        const key = exp.explanation_type
        if (!empty[key]) empty[key] = exp
      }
      return empty
    } catch {
      return empty
    }
  },

  async getPublishedExplanation(
    technologyId: string,
    type: ExplanationType
  ): Promise<TechnologyExplanation | null> {
    try {
      const db = createAnonClient()
      const { data } = await db
        .from("technology_explanations")
        .select("*")
        .eq("technology_id", technologyId)
        .eq("explanation_type", type)
        .eq("status", "published")
        .order("version", { ascending: false })
        .limit(1)

      return data?.[0] ? (data[0] as TechnologyExplanation) : null
    } catch {
      return null
    }
  },

  async getAllPublished(technologyId: string): Promise<TechnologyExplanation[]> {
    try {
      const db = createAnonClient()
      const { data } = await db
        .from("technology_explanations")
        .select("*")
        .eq("technology_id", technologyId)
        .eq("status", "published")
        .order("explanation_type")

      return (data ?? []) as TechnologyExplanation[]
    } catch {
      return []
    }
  },

  async createDraft(input: CreateExplanationInput): Promise<TechnologyExplanation> {
    const db = createAdminClient()
    const { data, error } = await db
      .from("technology_explanations")
      .insert({
        technology_id:    input.technology_id,
        explanation_type: input.explanation_type,
        title:            input.title ?? EXPLANATION_LABELS[input.explanation_type],
        content:          input.content,
        status:           'draft',
        generated_by:     input.generated_by ?? 'editor',
        version:          1,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as TechnologyExplanation
  },

  async updateExplanation(id: string, content: string, title?: string): Promise<void> {
    const db = createAdminClient()
    const update: Record<string, string> = { content }
    if (title) update.title = title
    await db.from("technology_explanations").update(update).eq("id", id)
  },

  async submitForReview(id: string): Promise<void> {
    const db = createAdminClient()
    await db.from("technology_explanations").update({ status: "in_review" }).eq("id", id)
  },

  async approveExplanation(id: string, reviewerId: string): Promise<void> {
    const db = createAdminClient()
    await db
      .from("technology_explanations")
      .update({ status: "approved", reviewed_by: reviewerId })
      .eq("id", id)
  },

  async publishExplanation(id: string): Promise<void> {
    const db = createAdminClient()
    await db
      .from("technology_explanations")
      .update({ status: "published", published_at: new Date().toISOString() })
      .eq("id", id)
  },

  async archiveExplanation(id: string): Promise<void> {
    const db = createAdminClient()
    await db.from("technology_explanations").update({ status: "archived" }).eq("id", id)
  },

  async getRevisionHistory(
    technologyId: string,
    type: ExplanationType
  ): Promise<TechnologyExplanation[]> {
    try {
      const db = createAdminClient()
      const { data } = await db
        .from("technology_explanations")
        .select("*")
        .eq("technology_id", technologyId)
        .eq("explanation_type", type)
        .order("version", { ascending: false })

      return (data ?? []) as TechnologyExplanation[]
    } catch {
      return []
    }
  },

  async generateDraft(
    technologyId: string,
    type: ExplanationType
  ): Promise<TechnologyExplanation> {
    if (!AI_CONFIG.isConfigured()) throw new Error("AI_NOT_CONFIGURED")

    const db = createAdminClient()

    // Fetch technology facts
    const { data: tech } = await db
      .from("technologies")
      .select("name,slug,short_definition,description,long_description,type,maturity,creator,maintained_by,created_year,open_source,license,website_url,docs_url")
      .eq("id", technologyId)
      .single()

    if (!tech) throw new Error("Technology not found")

    // Fetch verified relationships for context
    const { data: rels } = await db
      .from("entity_relationships")
      .select("relationship_type,target_entity_type,target_entity_id")
      .eq("source_entity_type", "technology")
      .eq("source_entity_id", technologyId)
      .eq("verified", true)
      .limit(10)

    const relContext = (rels ?? [])
      .map((r: Record<string, string>) => `${r.relationship_type} → ${r.target_entity_type}:${r.target_entity_id}`)
      .join(", ")

    const techFacts = `
Technology: ${tech.name as string}
Type: ${tech.type as string}
Maturity: ${tech.maturity as string ?? "unknown"}
Short definition: ${tech.short_definition as string ?? tech.description as string ?? "N/A"}
Creator: ${tech.creator as string ?? "N/A"}
Maintained by: ${tech.maintained_by as string ?? "N/A"}
Created year: ${tech.created_year as string ?? "N/A"}
Open source: ${String(tech.open_source ?? "N/A")}
License: ${tech.license as string ?? "N/A"}
Key relationships: ${relContext || "none listed"}
`.trim()

    const prompt = `You are writing a "${EXPLANATION_LABELS[type]}" for the technology "${tech.name as string}" on NeuGravity.

Verified facts about this technology:
${techFacts}

Instructions:
${EXPLANATION_INSTRUCTIONS[type]}

IMPORTANT RULES:
- Only use the facts provided above plus widely accepted public knowledge
- Do NOT fabricate adoption statistics, benchmark numbers, pricing, or user counts
- Do NOT invent dates, version numbers, or release information you are not certain of
- If uncertain about a specific fact, describe the concept without the specific number
- Write in clear, direct prose suitable for a technology intelligence platform

Write the explanation now:`

    const maxTokens = type === 'architect' ? 1500 : type === 'technical' ? 1200 : type === 'beginner' ? 1000 : 600
    const content = await callLLM(prompt, maxTokens)

    // Compute next version number
    const { data: existing } = await db
      .from("technology_explanations")
      .select("version")
      .eq("technology_id", technologyId)
      .eq("explanation_type", type)
      .order("version", { ascending: false })
      .limit(1)

    const nextVersion = existing?.[0] ? ((existing[0] as { version: number }).version + 1) : 1

    const { data: created, error } = await db
      .from("technology_explanations")
      .insert({
        technology_id:    technologyId,
        explanation_type: type,
        title:            EXPLANATION_LABELS[type],
        content,
        status:           'draft',
        generated_by:     'ai',
        version:          nextVersion,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return created as TechnologyExplanation
  },
}
