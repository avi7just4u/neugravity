# Phase 4.5 — Content Intelligence + Editorial Opportunity Engine

## Audit Baseline

**Conducted:** 2026-09-27  
**Scope:** All existing infrastructure relevant to content intelligence

---

## Existing Infrastructure (Do Not Duplicate)

### Analytics

| Component | Status | Notes |
|-----------|--------|-------|
| `analytics_events` table | ✅ Exists | event_type, session_id, user_id, page_path, entity_type, entity_id, properties |
| `AnalyticsService.track()` | ✅ Exists | Fire-and-forget insert, never throws |
| `/api/analytics/track` | ✅ Exists | POST endpoint |
| Search query tracking | ❌ Not implemented | Added in Phase 4.5 via `search_query_log` |

### Search

| Component | Status | Notes |
|-----------|--------|-------|
| `/api/search` | ✅ Exists | GET with `q`, `types`, `limit` params |
| `SearchService.search()` | ✅ Exists | PostgreSQL FTS + alias resolution |
| `SearchService.autocomplete()` | ✅ Exists | Delegates to search() |
| Query tracking | ❌ Not implemented | Added in Phase 4.5 |
| Zero-result detection | ❌ Not implemented | Derived from `search_query_log` |

### Job Queue

| Component | Status |
|-----------|--------|
| `jobs` table | ✅ Exists |
| `JobService.enqueue()` | ✅ Exists — idempotency_key support |
| `JobService.claimNext()` | ✅ Exists — atomic RPC |
| `JobService.complete()` | ✅ Exists |
| `JobService.fail()` | ✅ Exists |
| Cron infrastructure (`/api/cron/*`) | ✅ Exists |

Existing queues: `source-fetch`, `content-normalization`, `deduplication`, `content-enrichment`, `news-processing`, `tool-refresh`, `status-monitor`, `search-indexing`, `embedding-generation`, `publishing`, `notifications`

Phase 4.5 added: `opportunity-generation`

### Knowledge Graph

| Component | Status |
|-----------|--------|
| `entity_relationships` table | ✅ Exists |
| `entity_aliases` table | ✅ Exists |
| `technology_explanations` table | ✅ Exists |
| `KnowledgeService` | ✅ Exists |
| `/admin/knowledge/` | ✅ Exists |

Entity types supported: `technology`, `concept`, `tool`, `company`, `person`, `article`, `news`, `comparison`, `interview`

Relationship types: `RELATED_TO`, `DEPENDS_ON`, `PART_OF`, `USES`, `IMPLEMENTS`, `ALTERNATIVE_TO`, `COMPETES_WITH`, `BUILT_BY`, `MAINTAINED_BY`, `CREATED_BY`, `INTEGRATES_WITH`, `USED_BY`, `MENTIONED_IN`, `EXPLAINED_BY`, `COVERED_BY`, `COMPARED_WITH`, `RELEVANT_TO`

### Content Services

All services exist in `src/lib/services/`:
- `TechnologyService` — `getTechnologies()`, `getTechnologyBySlug()`, etc.
- `ToolService` — `getTools()`, `getToolBySlug()`, etc.
- `CompanyService`, `ComparisonService`, `ContentService`, `InterviewService`, `CourseService`
- `FreshnessService` — stale content detection
- `AuditService` — audit logging (existing, used by Phase 4.5)
- `JobService` — job queue (existing, used by Phase 4.5)

### RBAC

Roles: `user`, `author`, `reviewer`, `editor`, `course_manager`, `community_moderator`, `analyst`, `admin`, `super_admin`

Phase 4.5 uses:
- **Manage opportunities:** `editor`, `admin`, `super_admin`
- **Read opportunities:** above + `analyst`, `author`, `reviewer`

---

## Phase 4.5 Additions

### New Database Tables

**`content_opportunities`** (migration 022)
- Core model for the editorial intelligence system
- Includes `dedup_key` generated column for automatic deduplication
- RLS: editor/admin/analyst roles only — never exposed to public

**`search_query_log`** (migration 022)
- Tracks every search query with results_count and has_results
- Used by gap analysis to detect zero-result and weak-result searches
- Data labeled as "NeuGravity internal search activity" in all UI

### New Services

**`OpportunityService`** (`src/lib/services/opportunity.service.ts`)
- `list(filters)` — paginated list with status/priority/type/source filters
- `getById(id)` — single opportunity
- `isDuplicate(topic, content_type, entity_type?, entity_id?)` — deduplication check
- `create(input, actor?)` — create with auto-deduplicate
- `updateStatus(id, status, actor?, opts?)` — lifecycle transitions
- `update(id, patch, actor?)` — field updates
- `updateBrief(id, brief, actor?)` — save generated brief, set in_progress
- `getSummaryCounts()` — counts by status for dashboard
- `getHighPriority(limit)` — top high-priority active opportunities
- `refreshStale()` — auto-dismiss 90+ day old new opportunities
- `getSearchSignals(opts)` — aggregated search query stats

**`GapAnalysisService`** (`src/lib/services/gap-analysis.service.ts`)
- `analyzeSearchSignals()` — zero/weak result detection from `search_query_log`
- `analyzeKnowledgeGraphGaps()` — tech with no explanation, no tools, tools with no comparison
- `analyzeNewsSignals()` — recent news linked to tech with no explainer
- `analyzeToolGaps()` — stale tools, popular tools with no comparison
- `analyzeLearningGaps()` — tech with no course, thin learning paths
- `detectContentDecay()` — tech not verified in 6+ months
- `runFullGapAnalysis()` — runs all analyses in parallel, deduplicates candidates

### New API Routes

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/admin/opportunities` | GET | editor/analyst | List with filters + pagination |
| `/api/admin/opportunities` | POST | editor/admin | Create opportunity |
| `/api/admin/opportunities/[id]` | GET | editor/analyst | Get opportunity |
| `/api/admin/opportunities/[id]` | PATCH | editor/admin | Update status or fields |
| `/api/admin/opportunities/[id]/dismiss` | POST | editor/admin | Dismiss |
| `/api/admin/opportunities/[id]/convert` | POST | editor/admin | Generate content brief |
| `/api/admin/opportunities/generate` | POST | editor/admin | Trigger gap analysis |
| `/api/worker/opportunity-analysis` | POST | x-worker-secret | Run gap analysis, persist opportunities |
| `/api/cron/analyze-opportunities` | GET | CRON_SECRET | Daily trigger (3am) |

### New Admin Pages

| Page | Roles |
|------|-------|
| `/admin/content-opportunities` | editor, admin, analyst, author, reviewer |
| `/admin/content-opportunities/[id]` | editor, admin, analyst, author, reviewer |
| `/admin/content-calendar` | editor, admin, analyst, author, reviewer |

### Modified Files

| File | Change |
|------|--------|
| `src/app/api/search/route.ts` | Added search query tracking → `search_query_log` |
| `src/components/layout/admin-sidebar.tsx` | Added EDITORIAL section with Opportunities + Calendar |
| `src/types/index.ts` | Added Phase 4.5 types |
| `src/types/database.ts` | Added `content_opportunities` + `search_query_log` stubs |
| `vercel.json` | Added `analyze-opportunities` cron at 3am daily |

---

## Opportunity Pipeline

```
signals (search / knowledge graph / news / tools / learning / decay)
        ↓
gap-analysis.service.ts (parallel analysis)
        ↓
runFullGapAnalysis() → deduplication by [topic + content_type + entity]
        ↓
/api/worker/opportunity-analysis (async, triggered by cron or manual)
        ↓
OpportunityService.create() (per-record deduplication vs DB)
        ↓
content_opportunities table (status: new)
        ↓
editor review (/admin/content-opportunities)
        ↓
convert → generate brief (never auto-publish)
        ↓
editor takes brief to content production workflow
        ↓
opportunity.status → completed
```

---

## Content Brief Types

| Content Type | Brief Schema |
|-------------|-------------|
| `youtube_video`, `short` | `VideoBrief` — hook, key_questions, chapters, suggested_shorts |
| `article`, `newsletter` | `ArticleBrief` — search_intent, outline, source_requirements |
| `technology_page` | `TechnologyBrief` — definition, explanation_modes, prerequisites |
| `tool_page` | Fields checklist + source requirements |
| `comparison` | Tool pair, comparison dimensions, data requirements |
| `course`, `learning_path` | Modules, learning outcomes, prerequisites |
| `interview` | Guest profile, question bank, related content |

**Briefs are never auto-published.** They are starting points for editorial production.

---

## Data Integrity Constraints

1. **Search data is labeled:** All search signal metadata includes `labeled_as: "NeuGravity internal search activity"`. No external SEO volumes are used or implied.
2. **No fake metrics:** Priority scores are internal signals, never presented as objective popularity rankings.
3. **No auto-publish:** `convert` endpoint sets status to `in_progress`, never `published`.
4. **Deduplication:** Double-checked at both the analysis layer (in-memory) and the service layer (DB dedup_key).
5. **RBAC enforced:** All endpoints use `requireAdminAuth()`. Opportunities are never exposed to public routes.

---

## ISR / Performance Notes

- Gap analysis runs asynchronously (job queue + worker route)
- Admin pages use `force-dynamic` (no ISR — requires auth + admin client)
- Opportunity list is paginated (25 per page default, max 100)
- Search query log inserts are fire-and-forget — never block the search response

---

## Known Gaps / Future Work

| Item | Notes |
|------|-------|
| Shorts extraction from existing videos | Requires interview/video entity data |
| Interview opportunity with guest suggestions | Do not invent guests — future feature |
| Content performance metrics | Need analytics event aggregation when data grows |
| External signal integration | No external SEO data — design clearly labels this constraint |
| `learning_paths.step_count` column | Gap analysis query assumes this column exists from education schema |
| News entity linking | Requires `entity_type` and `entity_id` on news_items — currently partial |
