# Content Intelligence — NeuGravity

The NeuGravity Content Intelligence system helps the editorial team decide:

- **WHAT** to create
- **WHY** it matters now
- **WHO** it's for
- **WHICH** format fits best
- **WHAT** existing content it connects to
- **WHAT** is missing from the knowledge graph

The goal is not maximum content volume. The goal is:

> RIGHT TOPIC + RIGHT FORMAT + RIGHT TIME + HIGH VALUE

---

## Signals

The system detects content opportunities from six signal types:

### 1. Internal Search Signal

Source: `search_query_log` table, populated every time a user searches NeuGravity.

Detects:
- **Zero-result queries** — users searched for something and found nothing
- **Weak-result queries** — users searched and found fewer than 3 results

**All search metrics are NeuGravity internal search activity.** No external SEO data, Google volume, or traffic estimates are used or implied.

### 2. Knowledge Graph Gaps

Source: `entity_relationships` and `technology_explanations` tables.

Detects:
- Technologies with no layered explanation
- Technologies with no related tools in the graph
- Tools with no comparison relationships

Only meaningful structural gaps are surfaced — not every missing relationship.

### 3. News Signals

Source: `news_items` table (recent published news).

Detects:
- Recent news about a technology that has no structured explainer on NeuGravity

Signal: **Update explainer** or **Create explainer** — never reproduce the news story.

### 4. Tool Gaps

Source: `tools` table, `entity_relationships`.

Detects:
- Tools not verified in 90+ days (stale data)
- Popular tools (rating_count ≥ 100) with no comparison page

### 5. Learning Gaps

Source: `technologies`, `entity_relationships`, `learning_paths`.

Detects:
- Technologies with high popularity but no course or lesson
- Learning paths with fewer than 3 steps (thin progression)

### 6. Content Decay

Source: `technologies.last_verified_at`.

Detects:
- Technology pages not verified in 180+ days

---

## Priority Signals

Each opportunity gets an internal priority (`high`, `medium`, `low`) based on:

- Search frequency (NeuGravity internal)
- Content gap severity (missing vs. weak vs. stale)
- News relevance
- Graph relationship coverage
- Technology popularity score

**These are internal editorial signals — not objective popularity rankings or SEO scores.**

---

## Gap Types

| Type | Meaning |
|------|---------|
| `missing` | No content exists for this topic |
| `weak` | Content exists but lacks depth or coverage |
| `stale` | Content exists but has outdated information |
| `disconnected` | Content exists but has no knowledge graph relationships |
| `underdeveloped` | Content exists but is incomplete (e.g., tech page with no explanation) |
| `duplicate_candidate` | May already be covered by existing content |

---

## Content Types

Opportunities can suggest the following formats:

| Type | Description |
|------|-------------|
| `youtube_video` | Long-form YouTube video |
| `short` | YouTube Short or social clip |
| `article` | Written article or explainer |
| `technology_page` | New or improved technology entity page |
| `tool_page` | New or improved tool entity page |
| `comparison` | Tool vs. tool or technology comparison |
| `interview` | Guest interview (tech person, company) |
| `course` | Full course |
| `learning_path` | Curated learning path |
| `newsletter` | Newsletter edition |
| `update_existing_content` | Update existing page rather than create new |

---

## Deduplication

The system prevents duplicate opportunities via:

1. **In-memory deduplication** — within each analysis run, candidates with the same `[normalized_topic + content_type + entity]` are merged.
2. **Database deduplication** — before inserting, `OpportunityService.isDuplicate()` checks the `dedup_key` column against active (non-dismissed, non-completed) opportunities.

An opportunity is not a duplicate if the topic is the same but:
- The content type is different (article vs. video)
- The related entity is different

---

## Scheduling

The full gap analysis runs daily at 3:00 AM UTC via `/api/cron/analyze-opportunities`.

Editors can also trigger analysis manually from `/admin/content-opportunities` → "Analyze Gaps".

---

## Editorial Workflow

```
new → review → approved → assigned → in_progress → completed
                              ↘
                            dismissed
```

- **Opportunities never auto-publish content.**
- The "Generate Brief" action produces a structured starting point — editors take it from there.
- All status changes are recorded in `audit_logs`.

---

## What This System Is NOT

- Not an AI writing assistant
- Not an SEO keyword planner (no external data)
- Not a project management tool
- Not a publishing queue
- Not a community or social feature
