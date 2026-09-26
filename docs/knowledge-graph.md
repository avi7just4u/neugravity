# Knowledge Graph — Entity Model

Phase 4.1 introduces a universal entity relationship graph connecting all content types in NeuGravity.

## Tables

### `entity_relationships`

Stores directed relationships between any two entities.

| Column | Type | Description |
|---|---|---|
| source_entity_type | text | `technology`, `tool`, `company`, `person`, `article`, `news`, `comparison`, `interview` |
| source_entity_id | uuid | ID in the source entity table |
| target_entity_type | text | Same set as source |
| target_entity_id | uuid | ID in the target entity table |
| relationship_type | text | One of 17 types (see below) |
| weight | numeric(4,2) | Relationship strength 0–1 |
| confidence | numeric(4,2) | Confidence score 0–1 |
| verified | boolean | `true` = editor-approved; `false` = AI suggestion pending review |
| created_by_type | text | `editor`, `system`, or `ai` |

**Unique constraint**: `(source_entity_type, source_entity_id, target_entity_type, target_entity_id, relationship_type)`

#### Relationship Types

| Type | Meaning |
|---|---|
| `DEPENDS_ON` | A requires B to function (prerequisites) |
| `USES` | A uses B as a component |
| `IMPLEMENTS` | A is an implementation of B (protocol/spec) |
| `INTEGRATES_WITH` | A and B work together |
| `ALTERNATIVE_TO` | A can substitute B |
| `COMPETES_WITH` | A and B serve the same market |
| `RELATED_TO` | General semantic relationship |
| `PART_OF` | A is a sub-component of B |
| `BUILT_BY` | A was built by company/person B |
| `MAINTAINED_BY` | A is currently maintained by B |
| `CREATED_BY` | A was originally created by B |
| `USED_BY` | A is used by B (reverse of USES) |
| `MENTIONED_IN` | A is mentioned in article/news B |
| `EXPLAINED_BY` | A is explained in article B |
| `COVERED_BY` | A is covered by news item B |
| `COMPARED_WITH` | A is compared to B in a comparison |
| `RELEVANT_TO` | General topic relevance |

### `entity_aliases`

Normalized alias lookup for search enhancement.

| Column | Type | Description |
|---|---|---|
| entity_type | text | Entity type |
| entity_id | uuid | Canonical entity ID |
| alias | text | Original alias string |
| normalized_alias | text | `alias.trim().toLowerCase()` |

**Unique constraint**: `(entity_type, normalized_alias)`

**Seeded aliases** (migration 017):
- `k8s` → Kubernetes
- `llm`, `llms`, `large language model` → Large Language Models
- `ai agent`, `agentic ai`, `llm agent` → AI Agents
- `rag`, `retrieval augmented generation` → RAG

## KnowledgeService

`src/lib/services/knowledge.service.ts`

| Method | Description |
|---|---|
| `getRelationships(opts)` | Get relationships from an entity |
| `getRelationshipsTo(opts)` | Get relationships to an entity |
| `addRelationship(rel)` | Create relationship (AI: verified=false, editor: verified=true) |
| `approveRelationship(id)` | Set verified=true |
| `rejectRelationship(id)` | Delete AI suggestion |
| `getPendingAISuggestions(limit?)` | Unverified AI relationships |
| `resolveAlias(alias, entityType?)` | Normalize and look up alias |
| `getPrerequisites(technologyId)` | Technologies via DEPENDS_ON |
| `getRelatedTools(technologyId)` | Tools via USES/INTEGRATES_WITH |
| `getRelatedCompanies(technologyId)` | Companies via BUILT_BY/MAINTAINED_BY/CREATED_BY |

## Admin UI

`/admin/knowledge` — relationship management

- View all relationships with filter (All / Verified / Pending AI Review)
- Approve AI suggestions
- Reject AI suggestions
- Delete verified relationships

`/admin/knowledge/[slug]/explanations` — per-technology explanation editor

## Security

- All verified relationships are publicly readable (RLS)
- Only admin/editor/author can create relationships
- Only admin/editor can approve/reject/delete
- AI suggestions land as `verified=false` — never auto-approved
