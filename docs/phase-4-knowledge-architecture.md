# Phase 4.1 — Knowledge Graph + Understand Engine Architecture

## Objective

Make NeuGravity the best place to understand technology. Phase 4.1 builds the intelligence layer connecting technologies, concepts, tools, companies, people, news, articles, comparisons, and interviews.

---

## What Already Exists (Phase 1–3)

### Entity Tables
| Table | Key Fields | Notes |
|-------|-----------|-------|
| `technologies` | name, slug, type, description, long_description, creator, maintained_by, difficulty, status, published | Core entity — extended in Phase 4.1 |
| `tools` | name, slug, company_id, tool_type, pricing_model, published | 31 real tools seeded |
| `companies` | name, slug, company_type, published | |
| `people` | name, slug, current_company_id, published | |
| `articles` | title, slug, body, status | |
| `news_items` | headline, slug, summary, status | Live via ingestion pipeline |
| `comparisons` | title, slug, status | |
| `interviews` | title, slug, guest_id, status | |
| `courses` | title, slug, status | Reserved for Phase 4.2+ |

### Existing Relationship Tables (Phase 1)
| Table | Scope | Limitation |
|-------|-------|-----------|
| `technology_relationships` | technology → technology | Limited types, no provenance |
| `company_technologies` | company → technology | Fixed relationship types |
| `tool_technologies` | tool → technology | Junction only |
| `news_entities` | news → (technology/tool/company/person) | No reverse query optimization |
| `article_entities` | article → entity | |
| `comparison_entities` | comparison → entity | |
| `interview_entities` | interview → entity | |

### Search
PostgreSQL full-text search (tsvector) + trigram (pg_trgm) across technologies, tools, companies, articles, news, courses. No alias resolution.

---

## What Phase 4.1 Adds

### New Tables

#### `entity_relationships` — Universal Cross-Entity Graph
Replaces and extends the patchwork of per-entity junction tables. Supports any entity type → any entity type with:
- 17 named relationship types (DEPENDS_ON, USES, BUILT_BY, etc.)
- Provenance: source, source_url, created_by, created_by_type (editor/system/ai)
- Quality: weight (importance), confidence (certainty), verified boolean
- AI suggestions land as `verified=false, created_by_type='ai'` and require editorial approval

#### `entity_aliases` — Alias Resolution
Maps abbreviations and alternate names to canonical entities:
- K8s → Kubernetes
- LLM → Large Language Models
- RAG → Retrieval-Augmented Generation
- Used by search and ingestion entity matching

#### `technology_explanations` — Structured Explanation Content
Pre-generated, editorially reviewed explanations at 5 depth levels:
- `quick` — 30-second definition + problem solved
- `simple` — Analogy-first, non-technical
- `beginner` — Problem → Concept → How it works → Example
- `technical` — Architecture, components, data flow, implementation
- `architect` — Trade-offs, scaling, security, failure modes, alternatives

Editorial workflow: AI draft → human review → approved → published. Never auto-published.

#### `user_saved_entities` — Bookmarking Foundation
Simple user_id + entity_type + entity_id store for future personalization.

### Extensions to `technologies`
| Column | Type | Purpose |
|--------|------|---------|
| `short_definition` | TEXT | 1–2 sentence precise definition for header display |
| `maturity` | TEXT | emerging/growing/mature/declining/legacy |
| `is_demo` | BOOLEAN | Demo data isolation (matches pattern from other tables) |

---

## Relationship System

### Relationship Types
```
RELATED_TO       — General association
DEPENDS_ON       — X requires Y to function (prerequisite)
PART_OF          — X is a component of Y
USES             — X employs Y
IMPLEMENTS       — X is a concrete implementation of Y
ALTERNATIVE_TO   — X can replace Y
COMPETES_WITH    — X and Y address the same problem
BUILT_BY         — X was created by Y (company/person)
MAINTAINED_BY    — X is currently maintained by Y
CREATED_BY       — X was originally created by Y (person)
INTEGRATES_WITH  — X and Y work together natively
USED_BY          — X is consumed by Y
MENTIONED_IN     — X appears in Y (news/article)
EXPLAINED_BY     — X is explained in Y (article)
COVERED_BY       — X is covered by Y (source)
COMPARED_WITH    — X is compared to Y in a comparison page
RELEVANT_TO      — X is contextually relevant to Y
```

### Directionality Convention
```
source_entity → relationship_type → target_entity

Examples:
  technology:ai-agents  DEPENDS_ON    technology:large-language-models
  technology:kubernetes  BUILT_BY      company:google
  technology:kubernetes  MAINTAINED_BY company:cncf
  news:article-id        MENTIONED_IN  technology:kubernetes
```

### AI Suggestion Flow
1. Ingestion pipeline or AI task emits a relationship suggestion
2. Stored as `verified=false, created_by_type='ai'`
3. Visible in `/admin/knowledge` under "Pending AI Review"
4. Editor approves (sets `verified=true`) or rejects (deletes)
5. Only verified relationships surface on public pages

---

## Explanation System

### Depth Levels
| Tab Label | `explanation_type` | Audience |
|-----------|-------------------|---------|
| 30 Sec | `quick` | Everyone |
| Simple | `simple` | Non-technical |
| Beginner | `beginner` | Early learner |
| Engineer | `technical` | Practitioner |
| Architect | `architect` | Senior/architect |

### Editorial Workflow
```
Generate Draft (AI) → status: draft, generated_by: ai
    ↓
Editor Edits/Reviews → status: in_review
    ↓
Approve → status: approved
    ↓
Publish → status: published, published_at: now()
    ↓
Archive → status: archived
```

AI-generated drafts NEVER auto-publish. All publishing requires explicit editorial action.

### Versioning
Each explanation row has a `version` int. When a published explanation is edited, a new row is created rather than updating in place, preserving history.

---

## Alias System

### Normalization
`normalized_alias = alias.trim().toLowerCase()`

### Lookup Flow (Search Enhancement)
```
User types: "K8s"
    ↓
Normalize: "k8s"
    ↓
entity_aliases WHERE normalized_alias = 'k8s'
    ↓
Found: entity_type='technology', entity_id='30000000-...'
    ↓
Fetch technology record directly → return as top result
```

---

## Five Flagship Technologies

| Technology | Slug | Maturity | Source UUID |
|------------|------|---------|-------------|
| Kubernetes | `kubernetes` | mature | 30000000-0000-0000-0000-000000000001 (existing) |
| Large Language Models | `large-language-models` | growing | 41000000-0000-0000-0000-000000000001 (new) |
| AI Agents | `ai-agents` | emerging | 41000000-0000-0000-0000-000000000002 (new) |
| Retrieval-Augmented Generation | `retrieval-augmented-generation` | growing | 41000000-0000-0000-0000-000000000003 (new) |
| APIs | `apis` | mature | 41000000-0000-0000-0000-000000000004 (new) |

Each flagship has: short_definition, all 5 explanation types (published), entity_aliases, entity_relationships to each other and to tools/companies.

---

## Public Page Architecture — /tech/[slug]

### Rendering Strategy
All explanation content is **server-rendered** (Next.js Server Component). A lightweight `"use client"` component (`UnderstandTabs`) manages which tab is visually active via CSS, without re-fetching data.

This provides:
- **SEO**: All 5 explanation tabs in the initial HTML
- **Performance**: No client-side fetches for explanations
- **UX**: Instant tab switching

### Data Fetching
Single `TechnologyService.getTechnologyWithRelations(slug)` call fetches:
- Technology record + extensions
- All published explanations (all 5 types in one query)
- Prerequisites (DEPENDS_ON relationships → technology records)
- Related tools (USES/INTEGRATES_WITH → tool records)
- Related companies (BUILT_BY/MAINTAINED_BY/CREATED_BY → company records)
- Related news (news_entities join → published news_items, limit 5)
- Related comparisons (comparison_entities → published comparisons)
- Related technologies (entity_relationships, verified only)

No N+1 queries. All joins happen server-side.

### Visual Flow Diagrams
Curated flow data in `src/lib/knowledge/tech-flows.ts` — not stored in DB. Rendered as pure CSS/SVG `ConceptFlow` components. Mobile-safe.

---

## Admin Workflow

### /admin/knowledge
- List all entity_relationships (pending AI suggestions first)
- Filter by: All | Verified | Pending Review
- Add new relationship (form)
- Approve/reject AI suggestions

### /admin/knowledge/[slug]/explanations
- Per-technology explanation editor
- 5 tabs (one per explanation type)
- Generate Draft → Edit → Publish workflow
- Completion checklist sidebar

### RBAC
Knowledge admin accessible to: `admin`, `editor`, `author` (via requireAdminAuth)
Publishing explanations requires: `admin`, `editor`

---

## Search Enhancement

Alias resolution runs before the main FTS search:
1. Normalize query
2. Check `entity_aliases`
3. If matched, fetch canonical entity → prepend to results
4. Run regular FTS search for remaining results

---

## Future Integration Points

- **Learning Paths** (Phase 4.2): `DEPENDS_ON` relationships power prerequisite chains
- **Course linking**: `explanation_type` courses section shows enrolled courses
- **Entity mentions in ingestion**: `process-news` worker can call `KnowledgeService.resolveAlias()` to link news items to entities automatically
- **Career roles** (Phase 4.3): `career_role` entity type can be added to entity_relationships
