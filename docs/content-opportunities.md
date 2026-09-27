# Content Opportunities — Editor Guide

## What Is a Content Opportunity?

A Content Opportunity represents a potentially valuable piece of content NeuGravity could create or improve. Each opportunity explains:

- **Why this** — the content gap or signal that surfaced it
- **Why now** — what makes this timely or important
- **For whom** — the target audience
- **What format** — the suggested content type
- **What exists** — existing NeuGravity content in the same topic area

---

## Dashboard

Navigate to `/admin/content-opportunities`.

### Status Tabs

| Status | Meaning |
|--------|---------|
| New | Just surfaced — not yet reviewed |
| Review | Editor is evaluating |
| Approved | Approved for production |
| Assigned | Assigned to a specific person |
| In Progress | Brief generated, work underway |
| Completed | Content published or task done |
| Dismissed | Not relevant — removed from active view |

### Analyze Gaps

Click **Analyze Gaps** to trigger a fresh analysis of:
- Recent search queries with no or weak results
- Knowledge graph structural gaps
- News-linked topics needing explainers
- Tool data that is stale or missing comparisons
- Technologies with no learning content

Results appear as new opportunities (deduplicated automatically).

---

## Opportunity Card

Each card shows:
- **Priority** — HIGH / MEDIUM / LOW (internal editorial signal)
- **Content type** — e.g., youtube_video, article, comparison
- **Reason** — why this was surfaced
- **Gap type** — missing, weak, stale, etc.
- **Source signal** — search, knowledge graph, news, etc.
- **Created date**

Click any card to open the detail view.

---

## Opportunity Detail

The detail view shows the full context:

### Why This + Why Now

Read these sections to understand the editorial rationale. They explain the gap and why it matters now.

### Content Ecosystem

When a related entity exists (e.g., a technology), the ecosystem panel shows what NeuGravity content already covers that entity:

```
Technology ✅
News ✅
Tools ✅
Comparison ❌  ← gap
Course ❌       ← gap
Learning Path ✅
Interview ✅
```

### Signal Data

For search-signal opportunities: the search count and average results are shown. These are **NeuGravity internal search activity only** — not external SEO data.

---

## Actions

### Generate Brief

The "Generate Brief" button creates a structured content brief based on the opportunity type:

| Content Type | Brief Contains |
|-------------|---------------|
| YouTube Video | Hook, chapters, key questions, suggested shorts |
| Short | Hook, concept, source video reference |
| Article | Search intent, outline, source requirements |
| Technology Page | Definition, explanation modes, prerequisites |
| Tool Page | Fields to populate, source requirements |
| Comparison | Tools to compare, comparison dimensions |
| Course/Learning Path | Modules, learning outcomes |
| Interview | Guest profile, question bank |

**Briefs are never published automatically.** They are starting points for the editorial production process.

### Mark Complete

After content has been created and published, mark the opportunity as **Complete** to remove it from the active queue.

### Dismiss

Dismiss opportunities that are:
- Already covered by existing content
- Not aligned with NeuGravity's editorial direction
- Duplicates of something already in production

Dismissed opportunities are hidden from the active view but remain in the database.

---

## Content Calendar

Navigate to `/admin/content-calendar`.

The calendar shows opportunities that have a **Target Publish Date** set. To add an opportunity to the calendar:

1. Open the opportunity detail
2. Set a `target_publish_date` via the PATCH API or by editing the record

The calendar view groups opportunities by month.

---

## Creating Opportunities Manually

Editors can create opportunities manually for:
- YouTube video ideas from editorial brainstorming
- Interview prospects identified by the team
- Newsletter topics
- Any content the system would not detect automatically

Use the **New** button on the opportunities dashboard.

Required fields:
- **Topic** — the subject
- **Content type** — which format

Optional but recommended:
- Title suggestion
- Audience
- Reason / Why now
- Gap type
- Related entity (links to an existing technology, tool, or company)
- Target publish date

---

## Enterprise Relevance

Each opportunity can be tagged with `enterprise_relevance: low | medium | high`.

This is an **internal editorial signal** — not shown publicly and not an objective ranking.

High enterprise relevance helps the team identify content that may also serve future enterprise positioning.

---

## Data Integrity Notes

- Search counts shown in opportunity cards reflect **NeuGravity internal search activity only**
- No Google search volume, external traffic data, or SEO rankings are used
- Priority scores are internal editorial signals — they reflect gap severity and search interest, not external popularity
- Opportunities are never automatically published — all content goes through the normal editorial review process
