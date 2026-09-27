/**
 * Convert an opportunity into a structured content brief.
 *
 * This NEVER publishes content. It generates a draft brief object
 * and updates the opportunity's brief field. The editor then takes
 * the brief to the appropriate content creation workflow.
 */
import { NextRequest, NextResponse } from "next/server"
import { requireAdminAuth } from "@/lib/auth/admin-auth"
import { OpportunityService } from "@/lib/services/opportunity.service"
import type { VideoBrief, ArticleBrief, TechnologyBrief } from "@/types"

export const dynamic = "force-dynamic"

function buildVideoBrief(opportunity: {
  topic: string
  title_suggestion: string | null
  audience: string | null
  reason: string | null
  why_now: string | null
}): VideoBrief {
  return {
    working_title: opportunity.title_suggestion ?? `${opportunity.topic} — Deep Dive`,
    hook: `Why does ${opportunity.topic} matter right now? ${opportunity.why_now ?? ""}`.trim(),
    audience: opportunity.audience ?? "developers and technologists",
    problem: opportunity.reason ?? `Understanding ${opportunity.topic} deeply`,
    key_questions: [
      `What is ${opportunity.topic} and why should you care?`,
      `How does ${opportunity.topic} work under the hood?`,
      `What are the trade-offs and when should you use it?`,
      `What does the future look like for ${opportunity.topic}?`,
    ],
    story_angle: `Practical explanation of ${opportunity.topic} for working developers`,
    analogy_opportunities: [
      `Compare ${opportunity.topic} to something from everyday life`,
      `Use a before/after scenario to show the problem it solves`,
    ],
    visual_opportunities: [
      `Architecture diagram showing how ${opportunity.topic} fits in the stack`,
      `Timeline of key milestones`,
    ],
    screen_demo_opportunities: [
      `Live demo of ${opportunity.topic} in action`,
      `Side-by-side comparison with alternatives`,
    ],
    chapters: [
      { title: "Introduction & hook", duration_estimate: "0:00 – 1:00", description: "Set up the problem" },
      { title: "What is it?", duration_estimate: "1:00 – 4:00", description: "Core concept explanation" },
      { title: "How it works", duration_estimate: "4:00 – 9:00", description: "Mechanism and architecture" },
      { title: "Demo / walkthrough", duration_estimate: "9:00 – 14:00", description: "Show it in practice" },
      { title: "Trade-offs & when to use", duration_estimate: "14:00 – 17:00", description: "Honest evaluation" },
      { title: "Summary & CTA", duration_estimate: "17:00 – 18:00", description: "Recap and next steps" },
    ],
    related_neugravity_entities: [],
    suggested_shorts: [
      {
        hook: `${opportunity.topic} in 60 seconds`,
        concept: `Quick explainer of what ${opportunity.topic} is and why it matters`,
      },
      {
        hook: `The one thing most people get wrong about ${opportunity.topic}`,
        concept: `Common misconception corrected with the correct mental model`,
      },
    ],
  }
}

function buildArticleBrief(opportunity: {
  topic: string
  title_suggestion: string | null
  audience: string | null
  reason: string | null
}): ArticleBrief {
  return {
    working_title: opportunity.title_suggestion ?? opportunity.topic,
    search_intent: `Understand what ${opportunity.topic} is, how it works, and when to use it`,
    audience: opportunity.audience ?? "developers, technologists",
    key_questions: [
      `What is ${opportunity.topic}?`,
      `How does ${opportunity.topic} work?`,
      `What are real use cases?`,
      `What are the alternatives?`,
    ],
    existing_neugravity_content: [],
    source_requirements: [
      "Official documentation",
      "Authoritative technical source",
      "Real-world usage example",
    ],
    technology_entities: [],
    tool_relationships: [],
    comparison_relationships: [],
    outline: [
      { heading: "Introduction", notes: "Define the problem and why the topic matters" },
      { heading: "Core Concept", notes: "Explain what it is in plain language" },
      { heading: "How It Works", notes: "Mechanism, architecture, or workflow" },
      { heading: "Use Cases", notes: "When and why you would use it" },
      { heading: "Trade-offs", notes: "What it does not do well; alternatives" },
      { heading: "Getting Started", notes: "First practical step" },
      { heading: "Further Reading", notes: "Link to NeuGravity related content" },
    ],
  }
}

function buildTechnologyBrief(opportunity: {
  topic: string
  title_suggestion: string | null
}): TechnologyBrief {
  return {
    working_title: opportunity.title_suggestion ?? `${opportunity.topic} — Technology Page`,
    definition: `${opportunity.topic} is a [category] that [core value proposition]. Add verified definition here.`,
    explanation_modes: ["quick", "simple", "beginner", "technical", "architect"],
    prerequisites: ["Add prerequisite technologies or concepts here"],
    related_concepts: ["Add related NeuGravity technology concepts here"],
    related_tools: ["Add tools that implement or use this technology"],
    related_companies: ["Add companies that build or maintain this technology"],
    recent_news: ["Check NeuGravity news for recent items related to this technology"],
    suggested_courses: ["Identify or create a course that covers this technology"],
  }
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminAuth(["admin", "super_admin", "editor"])
  if (authResult instanceof NextResponse) return authResult
  const { userId, email } = authResult

  const { id } = await params
  const opportunity = await OpportunityService.getById(id)
  if (!opportunity) {
    return NextResponse.json({ error: "Opportunity not found" }, { status: 404 })
  }

  // Build brief based on content type
  let brief: VideoBrief | ArticleBrief | TechnologyBrief | Record<string, unknown>

  switch (opportunity.content_type) {
    case "youtube_video":
    case "short":
      brief = buildVideoBrief(opportunity)
      break
    case "article":
    case "newsletter":
      brief = buildArticleBrief(opportunity)
      break
    case "technology_page":
      brief = buildTechnologyBrief(opportunity)
      break
    case "tool_page":
      brief = {
        working_title: opportunity.title_suggestion ?? opportunity.topic,
        fields_to_populate: ["name", "tagline", "description", "tool_type", "pricing_model", "website_url", "github_url", "docs_url", "features", "platforms"],
        source_requirements: ["Official website", "GitHub repository", "Pricing page"],
        notes: "Verify all data against official sources before publishing",
      }
      break
    case "comparison":
      brief = {
        working_title: opportunity.title_suggestion ?? `${opportunity.topic} — Comparison`,
        tools_to_compare: [opportunity.related_entity_name ?? opportunity.topic, "Add second tool"],
        comparison_dimensions: ["Pricing", "Features", "Performance", "Ease of use", "Community", "Documentation"],
        audience: opportunity.audience ?? "developers evaluating tools",
        source_requirements: ["Official documentation for each tool", "Verified pricing pages"],
        notes: "Do not fabricate benchmark numbers. Use only verified data.",
      }
      break
    case "course":
    case "learning_path":
      brief = {
        working_title: opportunity.title_suggestion ?? `Learn ${opportunity.topic}`,
        audience: opportunity.audience ?? "beginners to intermediate developers",
        prerequisites: ["Add prerequisites here"],
        learning_outcomes: [`Understand what ${opportunity.topic} is`, `Build something with ${opportunity.topic}`, `Know when to use ${opportunity.topic}`],
        suggested_modules: [
          { title: "Introduction", lesson_count: 2 },
          { title: "Core Concepts", lesson_count: 4 },
          { title: "Hands-on Practice", lesson_count: 3 },
          { title: "Real-world Application", lesson_count: 2 },
        ],
        related_technologies: [],
        notes: "Courses must not auto-publish. Submit to editorial review before launch.",
      }
      break
    case "interview":
      brief = {
        working_title: opportunity.title_suggestion ?? `Interview: ${opportunity.topic}`,
        suggested_guest_profile: "Add specific guest suggestion here",
        technology_topics: [opportunity.related_entity_name ?? opportunity.topic],
        suggested_questions: [
          `How did you first encounter ${opportunity.topic}?`,
          `What problems does ${opportunity.topic} solve in your work?`,
          `What do most people misunderstand about ${opportunity.topic}?`,
          `What advice would you give someone starting with ${opportunity.topic} today?`,
        ],
        related_articles: [],
        related_technologies: [],
        notes: "Do not invent guest information. Identify real candidates before proceeding.",
      }
      break
    default:
      brief = {
        working_title: opportunity.title_suggestion ?? opportunity.topic,
        notes: `Content brief for ${opportunity.content_type}. Customize before starting production.`,
        reason: opportunity.reason,
        why_now: opportunity.why_now,
      }
  }

  const ok = await OpportunityService.updateBrief(id, brief as Record<string, unknown>, { id: userId, email })
  if (!ok) {
    return NextResponse.json({ error: "Failed to save brief" }, { status: 500 })
  }

  return NextResponse.json({ ok: true, brief, content_type: opportunity.content_type })
}
