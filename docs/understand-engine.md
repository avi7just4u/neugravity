# Understand Engine — Explanation System

Phase 4.1 introduces multi-level technology explanations with a full editorial workflow.

## Five Explanation Modes

Each technology can have up to 5 explanations, targeting different audiences:

| Mode | Key | Audience | Length |
|---|---|---|---|
| 30 Sec | `quick` | Anyone | 2–4 sentences |
| Simple | `simple` | Non-technical | 3–5 short paragraphs with analogies |
| Beginner | `beginner` | New to the field | 400–600 words, structured sections |
| Engineer | `technical` | Working engineers | 500–800 words, architecture focus |
| Architect | `architect` | Senior engineers | 600–900 words, trade-offs, failure modes |

## Database Table

`technology_explanations` — one row per (technology, explanation_type)

| Column | Type | Description |
|---|---|---|
| technology_id | uuid | FK to technologies |
| explanation_type | text | `quick`, `simple`, `beginner`, `technical`, `architect` |
| title | text | Optional explanation title |
| content | text | Markdown-compatible content |
| status | text | Lifecycle state (see below) |
| version | int | Auto-increments on update |
| generated_by | text | `ai`, `editor`, or `import` |
| reviewed_by | uuid | Editor who approved/published |
| published_at | timestamptz | Set when published |

## Status Lifecycle

```
draft → in_review → approved → published → archived
```

- AI-generated content always enters as `draft`
- Only `admin` or `editor` roles can publish
- No content auto-publishes — editorial approval is always required

## ExplanationService

`src/lib/services/explanation.service.ts`

| Method | Description |
|---|---|
| `getExplanations(technologyId)` | All 5 types for a technology (any status) |
| `getPublishedExplanation(technologyId, type)` | Single published explanation |
| `getAllPublished(technologyId)` | All published explanations |
| `createDraft(input)` | Create a new draft |
| `updateExplanation(id, content, title?)` | Edit content |
| `submitForReview(id)` | Move to in_review |
| `approveExplanation(id, reviewerId)` | Move to approved |
| `publishExplanation(id)` | Move to published, set published_at |
| `archiveExplanation(id)` | Move to archived |
| `generateDraft(technologyId, type)` | AI-generate a draft (always status=draft) |

## AI Generation

`generateDraft()` calls the configured AI provider (Groq + Qwen by default) with:
- Technology facts: name, type, created_year, creator, description
- Verified relationships: prerequisites, built-by companies
- Mode-specific prompt instructing appropriate length and audience
- Explicit instruction: **do not fabricate statistics, dates, benchmarks, pricing, or user counts**

The result is always `status='draft'`, `generated_by='ai'`. It requires editorial review before publishing.

## Public Rendering

`/tech/[slug]` renders all published explanation tabs server-side in the initial HTML. A lightweight `UnderstandTabs` client component manages CSS visibility for tab switching.

This satisfies:
- **SEO**: All explanation content is in the initial HTML response
- **UX**: Instant tab switching with no re-fetch
- **Performance**: No client-side data fetching

## Admin UI

`/admin/knowledge/[slug]/explanations`
- Tab view for all 5 explanation modes
- Completion status indicator (published/draft/missing)
- Generate AI Draft → Edit → Publish workflow
- Archive published explanations

## API Routes

| Method | Route | Roles | Action |
|---|---|---|---|
| POST | `/api/admin/knowledge/explanations` | admin, editor, author | Create new draft |
| PUT | `/api/admin/knowledge/explanations/[id]` | admin, editor, author | Update content |
| POST | `/api/admin/knowledge/explanations/generate` | admin, editor, author | AI generate draft |
| POST | `/api/admin/knowledge/explanations/[id]/publish` | admin, editor | Approve + publish |
| POST | `/api/admin/knowledge/explanations/[id]/archive` | admin, editor | Archive |

## Future Integration

- Learning paths: sequences of explanations across technologies
- User progress tracking: which explanations viewed, completed
- Bookmarking: save explanations for later
- Course integration: Phase 4.2 will build structured courses on top of this content
