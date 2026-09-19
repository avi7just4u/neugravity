# Phase 3 Production Audit

**Date:** 2026-09-19
**Auditor:** Claude Code (automated static analysis)

---

## Executive Summary

Phase 3 services and workers are implemented but contain several critical bugs that would cause runtime failures in production. No background jobs have ever executed (no active sources, missing WORKER_SECRET env var, only one cron scheduled in vercel.json). The status page shows hardcoded "Operational" for demo providers — factually wrong. AI enrichment runs in mock mode (placeholder API key). Multiple workers have schema mismatches that would cause DB insert failures.

---

## Feature Status Table

| Feature | Status | Evidence | Remaining Work |
|---------|--------|----------|----------------|
| Job queue (DB-based, SKIP LOCKED) | IMPLEMENTED+NOT_VERIFIED | `jobs` table created in 005, `claim_next_job` RPC in 006, `job.service.ts` correct | Run end-to-end test |
| Source connectors (RSS/Atom) | IMPLEMENTED+NOT_VERIFIED | `rss.connector.ts` fully implemented, parses RSS+Atom | No active sources in DB; enable at least one |
| Content deduplication (4-strategy) | IMPLEMENTED+NOT_VERIFIED | `deduplication.service.ts`: URL, external_id, hash, title similarity all implemented | Unit tests |
| AI enrichment (Claude Haiku) | MOCK | `ai.service.ts` correctly mocks when key is placeholder; ANTHROPIC_API_KEY=sk-ant-placeholder | Set real API key |
| News editorial pipeline | PARTIAL | Worker code exists; **news_items schema mismatch** (wrong column names) | Fix process-news worker |
| Content publish worker | BROKEN | `publish-content` inserts `title/content/summary/metadata` into `content_revisions` — columns don't exist (schema only has `snapshot jsonb`) | Fix insert |
| Tool refresh system | IMPLEMENTED+NOT_VERIFIED | `tool-refresh.service.ts` complete; worker does heuristic HTML scrape | No active tool sources; no cron scheduled |
| Status monitoring | BROKEN | `status.service.ts` tries to access `provider.feed_url` but `status_providers` has no such column; `upsertIncident` dedup uses `source_url` instead of `external_incident_id` | Fix service + add real connectors |
| Status page (public) | BROKEN | Falls back to DEMO_PROVIDERS hardcoded as "Operational" — no actual status check | Remove hardcoded fallback; show "Monitoring not configured" |
| Freshness engine | IMPLEMENTED+NOT_VERIFIED | `freshness.service.ts` queries correct tables | No cron scheduled in vercel.json |
| Search indexing | BROKEN | `search-indexing.service.ts` and `search-index/route.ts` both use `"news_articles"` table — actual table is `news_items` | Fix table name |
| Notification service | PARTIAL | Service implemented; `markFailed` is a no-op; no `channel`/`status` column on notifications table | Acceptable for now; markFailed logs nothing |
| Content revisions | IMPLEMENTED+NOT_VERIFIED | `revision.service.ts` correct schema; `publish-content` worker has wrong insert | Fix publish-content |
| Admin job monitor | IMPLEMENTED+NOT_VERIFIED | `/admin/system/jobs` page exists | Verify UI renders correctly |
| Admin freshness | IMPLEMENTED+NOT_VERIFIED | `/admin/freshness` page exists | Verify |
| Admin health | IMPLEMENTED+NOT_VERIFIED | `/admin/system/health` page exists | Verify |
| Admin editorial queue | IMPLEMENTED+NOT_VERIFIED | `/admin/editorial` and news editor exist | Verify |
| Admin source management | IMPLEMENTED+NOT_VERIFIED | `/admin/sources` exists | Verify |
| Cron scheduling | PARTIAL | Only `poll-sources` in vercel.json; `poll-status`, `refresh-tools`, `check-freshness` have NO cron entry | Add to vercel.json |
| Real status connectors | NOT_IMPLEMENTED | No connector abstraction exists; service does raw RSS fetch | Built in this audit |
| AI model centralization | NOT_IMPLEMENTED | Model hardcoded as `"claude-haiku-4-5-20251001"` directly in ai.service.ts | Built in this audit |

---

## Background Job Pipeline

### Source Polling
- **Scheduler**: `vercel.json` → `/api/cron/poll-sources` at `0 6 * * *` (6am daily) ✅
- **Auth**: Checks `Authorization: Bearer {CRON_SECRET}` ✅
- **Worker**: `/api/worker/source-fetch` with `x-worker-secret` auth ✅
- **Queue**: enqueues `FETCH_SOURCE` jobs — but cron directly calls `IngestionService.processSource()` without using the queue ⚠️
- **DB update**: `SourceService.recordSuccess/recordFailure` ✅
- **Status**: NEVER RUN — all sources are inactive in DB

### Content Enrichment
- **Trigger**: enqueued by source-fetch worker as `ENRICH_SOURCE_ITEM` ✅
- **Worker**: `/api/worker/enrich-content` — dedup + AI enrichment — ✅
- **AI**: MOCK mode (placeholder key)
- **Status**: NEVER RUN — no active sources → no source_items → no enrichment jobs

### News Processing
- **Trigger**: enqueued by enrich-content as `PROCESS_NEWS_ITEM`
- **Worker**: `/api/worker/process-news` — **BROKEN** — inserts `title/content/source_id/source_item_id/tags/category/metadata` into `news_items` but actual schema uses `headline/body/canonical_url` with no `source_item_id`/`source_id`/`tags`/`category`/`metadata` columns

### Content Publishing
- **Worker**: `/api/worker/publish-content` — **BROKEN** — inserts into `content_revisions` with `title/content/summary/metadata` but schema only has `snapshot jsonb`

### Tool Refresh
- **Cron**: NOT IN vercel.json
- **Worker**: `/api/worker/tool-refresh` — heuristic HTML scrape — functional but weak signal
- **Status**: NEVER RUN

### Status Monitoring
- **Cron**: NOT IN vercel.json
- **Worker**: `/api/worker/status-monitor` — calls `StatusService.pollProvider()` — **BROKEN** (schema mismatch on status_providers)
- **Status**: NEVER RUN

### Freshness Checks
- **Cron**: NOT IN vercel.json
- **Worker**: no dedicated worker; cron calls `FreshnessService.scheduleOverdueRefreshes()` which enqueues jobs
- **Status**: NEVER RUN

### Search Indexing
- **Worker**: `/api/worker/search-index` — **BROKEN** — uses `news_articles` table (actual: `news_items`)

### Notifications
- **Worker**: `/api/worker/send-notification` — functional for webhook/slack; email is no-op ✅
- **Status**: NEVER RUN (no trigger events)

---

## Data Quality Assessment

### Seeded/Demo Data in Production

| Type | Table | Count | Note |
|------|-------|-------|------|
| Technologies | technologies | 28 | Seed data from migration 004; displayed on /tech |
| Tools | tools | 18 | Seed data; displayed on /tools |
| Companies | companies | 15 | Seed data; displayed on /companies |
| News items | news_items | 12 | Seed data; displayed on /news — timestamps may be stale |
| Articles | articles | 6 | Seed data |
| Comparisons | comparisons | 4 | Seed data |
| Courses | courses | 4 | Seed data |
| Sources | sources | 4 | Hacker News, AWS Status, GitHub Status, Vercel Status — ALL inactive |
| Status providers | status_providers | 0 | None in DB; page falls back to hardcoded demo list |

### Hardcoded Demo Data in UI
- `src/app/news/page.tsx`: `trendingTopics` array is hardcoded — "Model Context Protocol", "AI Agents", etc.
- `src/app/status/page.tsx`: `DEMO_PROVIDERS` array shows 10 providers as "Operational" with no actual check when DB has no providers

### Real Data
- None — all public-facing data is seeded from migrations or hardcoded

---

## Environment Variables

| Variable | Set Locally | Value | Verdict |
|----------|-------------|-------|---------|
| NEXT_PUBLIC_SUPABASE_URL | ✅ | Real URL | OK |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | ✅ | Real key | OK |
| SUPABASE_SERVICE_ROLE_KEY | ✅ | Real key | OK |
| NEXT_PUBLIC_SITE_URL | ✅ | Production URL | OK |
| NEXTAUTH_SECRET | ✅ | Weak dev value | Change for production |
| CRON_SECRET | ✅ | `neugravity-cron-secret` | Weak; acceptable for now |
| ADMIN_EMAIL | ✅ | avisinha@adobe.com | OK |
| ANTHROPIC_API_KEY | ✅ | `sk-ant-placeholder` | **PLACEHOLDER — AI runs in mock mode** |
| WORKER_SECRET | ❌ | NOT SET | **All workers return 401** |

---

## Critical Issues (Ordered by Severity)

1. **WORKER_SECRET missing** — every worker call returns 401 Unauthorized. No background processing is possible.
2. **process-news BROKEN** — wrong column names for news_items insert (title→headline, content→body; source_item_id/tags/category/metadata don't exist).
3. **publish-content BROKEN** — inserts non-existent columns into content_revisions.
4. **search-index BROKEN** — wrong table name "news_articles" (actual: "news_items").
5. **SearchIndexingService BROKEN** — same wrong table name in markIndexed().
6. **Status page hardcoded "Operational"** — 10 providers shown as operational with no actual check.
7. **Status service schema mismatch** — `status_providers` has no `feed_url` column; `upsertIncident` deduplicates on `source_url` not `external_incident_id`.
8. **poll-status/refresh-tools/check-freshness not in vercel.json** — these crons never fire.
9. **ANTHROPIC_API_KEY placeholder** — all AI enrichment produces placeholder output.
10. **All sources inactive** — no content ingestion ever happens.

---

## Verified Working (Static Analysis)

- DB schema for jobs, job_attempts, tool_change_events, status_updates, refresh_policies, content_revisions is correct
- claim_next_job RPC logic is correct
- JobService enqueue/complete/fail/retry logic is correct
- DeduplicationService 4-strategy implementation is logically correct
- SourceService upsertSourceItem dedup is correct
- AdminSidebar navigation structure correct
- Editorial approve/reject/publish API routes are wired correctly
- ToolRefreshService change detection logic is correct
- FreshnessService overdue calculation is correct
- RevisionService rollback logic is correct
- NotificationService evaluate/dispatch flow is correct (except markFailed no-op)
- RSSConnector RSS+Atom parsing is functional

---

## Not Verified / Broken

- process-news worker (schema mismatch)
- publish-content worker (schema mismatch)
- search-index worker (wrong table)
- Status page real-time data (no providers, hardcoded fallback)
- Any end-to-end job execution (WORKER_SECRET missing)
- AI enrichment (placeholder key)
- Cron execution for status/tools/freshness (not scheduled)

---

## Phase 3 Readiness Assessment

**NOT ready for Phase 4.**

Three workers are outright broken and would throw DB errors on any execution. The status page shows invented data. No background jobs have ever run. The complete content pipeline (source → discover → enrich → review → publish) cannot be tested end-to-end until WORKER_SECRET is set and process-news/publish-content are fixed.

**Minimum to call Phase 3 production-ready:**
1. Fix 5 broken files (process-news, publish-content, search-index, status.service, search-indexing.service)
2. Set WORKER_SECRET in Vercel
3. Add 3 missing cron jobs to vercel.json
4. Fix status page to not show invented Operational status
5. Add real status connectors
6. Enable at least one real source (e.g., Hacker News RSS)
