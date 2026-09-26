# Content Sources — Operational Guide

## Overview

NeuGravity ingests content from curated sources through an automated pipeline. All content passes through:

**Discovery → Normalization → Deduplication → AI Enrichment → Editorial Queue → Human Review → Publish**

No content auto-publishes. Every item requires human approval before appearing on public pages.

---

## How Sources Work

### Discovery
The poller fetches each source's RSS/Atom feed (or API endpoint) on a schedule defined by `poll_interval_seconds`. New items are written to the raw ingestion table with their original metadata intact.

### Normalization
Each item is mapped to a common schema: `title`, `description`, `canonical_url`, `source_published_at`, `author`, `image_url`. Source-specific quirks (date formats, encoding, missing fields) are handled per source type.

### Deduplication
Before persisting, the pipeline checks whether the item already exists. Three deduplication signals are checked in order: canonical URL match, `external_id` match within the same source, and high content-similarity score. Duplicates are discarded — they do not appear in the editorial queue.

### AI Enrichment
Each new item is passed to an AI model for structured enrichment: summary generation, category classification, entity extraction (companies, people, technologies), tag suggestions, and headline rewriting. AI output is always stored as suggestions — editors may accept, modify, or discard each field.

### Editorial Queue
Enriched items appear in `/admin/editorial/news` with status `draft`. Editors review AI suggestions, edit content, set priority, and assign to categories.

### Human Review
An editor must explicitly approve (`approved`) and schedule or publish each item. Items do not advance through the content lifecycle (`draft → in_review → approved → scheduled → published → archived`) without human action.

### Publish
Approved and scheduled items appear on public pages at their scheduled time. Published items show source attribution linking back to the original canonical URL.

---

## Source Quality Standards

A source is acceptable for NeuGravity if it meets all of the following:

- **Valid feed:** RSS or Atom feed URL returns well-formed XML
- **Timestamped items:** Each item includes a `pubDate` or `dc:date` that maps to a real publication time (not the fetch time, not epoch)
- **Active publication:** At least one item published in the last 30 days
- **Original or attributed content:** Source either produces original content or clearly attributes its origin
- **Trust alignment:** The declared `trust_level_label` matches the source's actual editorial standards and independence
- **Stable feed URL:** Feed URL does not rotate, require authentication, or return paywalled content

Sources that publish AI-generated content without editorial oversight, aggregate without attribution, or have a track record of misinformation are not eligible regardless of traffic.

---

## Category Strategy

Categories are used to route content to the correct editorial workflow and power the public-facing topic filters. Each source should have exactly one primary category. When a source covers multiple areas (e.g., Wired covers general tech broadly), assign the most specific category that fits the majority of its content.

**Why categories matter for editorial workflow:**
- Editors can filter the queue by category to work their area of expertise
- AI enrichment uses source category as a prior for classification
- Public pages use category to drive personalization and topic subscriptions
- Story clustering uses category as a first-pass grouping signal

**NULL categories are a data quality issue.** Six sources in the registry currently have no category set (all in the disabled/demo group). These must be assigned a category before activation.

---

## Monitoring Sources

**Where to view source health:** `/admin/sources`

### health_status values

| Value | Meaning |
|-------|---------|
| `healthy` | Last fetch succeeded, items returned and processed normally |
| `failed` | Last fetch attempt returned an error or produced no parseable content |
| `unknown` | Source has never been polled (inactive, or not yet enabled) |

### When to investigate

- `health_status = failed` on any previously healthy source — check `last_error_at` and `failure_count`
- `failure_count > 3` on an active source — the source may have changed its feed URL or introduced auth
- `last_success_at` more than 2× the `poll_interval_seconds` in the past — poller may be stuck
- `items_discovered = 0` after 24h of being active — feed is reachable but returning no items (check date filtering logic)
- Active source with no `last_success_at` — source was activated but has never successfully polled

### Failure escalation

| failure_count | Action |
|---------------|--------|
| 1-2 | Monitor; transient network errors are common |
| 3-5 | Investigate feed URL; check if site is blocking the poller user-agent |
| 6+ | Disable source; add note explaining failure; attempt manual verification |

---

## Adding a New Source

1. **Verify the feed manually:** `curl -L "<feed_url>" | head -100` — confirm it returns `<rss` or `<feed` XML with recent items.
2. **Check timestamps:** Confirm items have `<pubDate>` or `<dc:date>` in a standard format.
3. **Create the source record** via `/admin/sources` (UI) or direct DB insert:
   - Set `active = false` initially
   - Set `health_status = 'unknown'`
   - Set `is_demo = false`
   - Populate: `name`, `domain`, `source_type`, `category`, `trust_level_label`, `trust_level`, `feed_url`, `base_url`, `poll_interval_seconds`, `notes`
4. **Run a test ingestion:** Trigger a manual poll via the admin UI or API endpoint. Review the raw items returned.
5. **Review normalized output:** Confirm `title`, `description`, `canonical_url`, `source_published_at` are all populated correctly.
6. **Check the editorial queue:** Verify enriched items appear correctly under `/admin/editorial/news`.
7. **Complete the [activation checklist](source-registry.md#source-activation-checklist).**
8. **Set `active = true`** only after all checklist items pass.

**Poll interval guidelines:**

| Source type | Recommended interval |
|-------------|---------------------|
| Breaking news (trust 7-9) | 30m – 1h |
| Engineering / official blogs | 1h – 2h |
| Status pages | 5m – 15m |
| Low-frequency publications | 6h – 24h |

---

## Source Retirement Process

Retire a source when:
- Feed URL has been dead for 7+ days with no replacement found
- Source has changed editorial standards and no longer meets quality criteria
- Source has been acquired and merged into another registered source
- Source has gone behind a paywall

**Retirement steps:**
1. Set `active = false`
2. Add a note to the `notes` field explaining why and the date
3. Do **not** delete the source record — preserve history and `items_discovered` count
4. Check if any published items reference this source; update attribution if the canonical URLs are broken

---

## Deduplication

The pipeline prevents the same content from appearing multiple times, whether from a single source or across multiple sources covering the same story.

**Three deduplication signals (checked in order):**

1. **Canonical URL match** — If two items share the same `canonical_url`, the second is a duplicate regardless of source. This catches syndicated content.
2. **External ID match within source** — If a source re-publishes an item with the same `external_id` (typically the RSS `<guid>`), it is treated as an update to the existing item, not a new item.
3. **Content similarity** — High cosine similarity between item embeddings flags a potential duplicate for editorial review. These are not auto-discarded — an editor decides whether items are truly duplicates or separate takes on the same story.

**Re-fetch behavior:** Fetching a source that has already been polled should produce zero new items if no new content has been published. If re-fetches consistently produce duplicate new items, investigate the `external_id` extraction logic for that source type.

---

## Story Clustering

Multiple sources may independently cover the same event (e.g., a major product launch, a security breach). NeuGravity clusters these into a single story to avoid editorial fragmentation.

**How clustering works:**
- Items within the same category and a similar time window are candidate clusters
- Shared entity mentions (company names, product names, CVE IDs) strengthen the cluster signal
- Content similarity score above threshold triggers a cluster suggestion

**Editorial workflow for clusters:**
- Clustered items appear linked in the editorial queue
- Editors may: (a) merge into a single story with one canonical article, (b) keep as separate items if the angle is distinct, or (c) dismiss the cluster suggestion if items are unrelated
- The cluster with the highest-trust source becomes the canonical story anchor by default

---

## AI Enrichment

Every ingested item is enriched before appearing in the editorial queue. AI adds:

| Field | Description |
|-------|-------------|
| Summary | 2-3 sentence neutral summary of the item |
| Category | Suggested category (may differ from source category) |
| Entities | Named companies, people, products extracted from content |
| Technologies | Technology names mentioned (languages, frameworks, platforms) |
| Companies | Company names specifically mentioned |
| Tags | Free-form topic tags for search and filtering |
| Suggested headline | Rewritten headline optimized for clarity (original is preserved) |

**Important constraints:**
- AI output is always stored as suggestions, never as final values
- Every AI-generated field is editable in the editorial UI
- All AI suggestions are subject to human review before publish
- AI does not make publish/reject decisions — only editors do

---

## Content Freshness

Sources are monitored for publication activity independent of their health status.

| Content type | Freshness threshold | Action if stale |
|--------------|--------------------|-----------------| 
| News (RSS) | 24h without new items from an otherwise active source | Warning in admin UI; check if source paused publishing |
| Tool/product listings | 30 days since last verification | Flag for manual re-verification |
| Status pages | Polled every 5-15 minutes | Alert if poll fails twice consecutively |

A source can be `healthy` (feed is reachable) but produce no new items — this is expected for low-frequency sources (weekly or monthly blogs). Freshness warnings apply to sources whose declared category and trust level imply regular publication (daily/hourly news sources).

---

## Editorial Priorities

Items enter the editorial queue with a default priority. Priority controls queue ordering and determines which items surface first for editorial attention.

| Priority | Trigger |
|----------|---------|
| `high` | Source `trust_level >= 9`, or item manually elevated by an editor |
| `medium` | Default for all other items |
| `low` | Community sources, sources with `trust_level <= 6` |

Editors may manually override priority on any item. Priority does not affect publish scheduling — it only affects queue ordering and internal triage.

---

## Demo Data Isolation

Sources and content items created during platform setup carry `is_demo = true`. This flag ensures demo content is never shown on public pages during development and staging.

**How isolation works:**
- The `FILTER_DEMO_DATA=true` environment variable activates demo filtering in all service queries
- When active, any query against `sources`, `news_items`, or related tables automatically appends `AND is_demo = false` or `AND is_demo IS DISTINCT FROM true`
- This filtering is applied at the service layer, not in RLS — it is a convenience filter, not a security boundary

**Before going to production:**
- Audit all source records and set `is_demo = false` on any source that should be live
- Confirm `FILTER_DEMO_DATA` is set appropriately for each environment (should be `false` in production once real data is present)
- Do not rely on `is_demo` as the only mechanism separating demo from real content — also verify `active`, `health_status`, and `items_discovered` before treating a source as production-ready
