# NeuGravity — Architecture

## System Overview

NeuGravity is a technology intelligence and learning platform. It functions as a structured knowledge graph connecting technologies, tools, companies, people, news, courses, comparisons, and editorial content. The architecture is designed around durable, structured data with human editorial oversight, AI assistance, and long-term SEO durability.

**Core philosophy:**
- Every entity is interconnected; no content exists in isolation
- AI discovers and enriches; humans approve and publish
- Structured data first; rich text is a last resort
- SEO is architectural, not bolted on
- Service abstractions prevent vendor lock-in

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| UI Components | Radix UI primitives + custom design system |
| Database | PostgreSQL 15+ (via Supabase) |
| Auth | Supabase Auth (JWT + RLS) |
| Storage | Supabase Storage (S3-compatible) |
| Background Jobs | Cloudflare Workers + Queues (abstracted behind JobService) |
| Search | Postgres FTS + pgvector (abstracted behind SearchService) |
| AI | OpenAI (abstracted behind AIService) |
| Email | Resend / Postmark (abstracted behind EmailService) |
| Payments | Stripe (abstracted behind PaymentService) |
| Analytics | PostHog / custom (abstracted behind AnalyticsService) |

---

## Directory Structure

```
/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (public)/                 # Public routes group
│   │   │   ├── page.tsx              # Homepage
│   │   │   ├── tech/                 # /tech routes
│   │   │   ├── tools/                # /tools routes
│   │   │   ├── companies/            # /companies routes
│   │   │   ├── news/                 # /news routes
│   │   │   ├── articles/             # /articles routes
│   │   │   ├── compare/              # /compare routes
│   │   │   ├── learn/                # /learn routes
│   │   │   ├── courses/              # /courses routes
│   │   │   ├── interviews/           # /interviews routes
│   │   │   ├── work/                 # /work routes
│   │   │   ├── community/            # /community routes
│   │   │   ├── enterprise/           # /enterprise routes
│   │   │   ├── status/               # /status routes
│   │   │   ├── search/               # /search route
│   │   │   └── about/                # /about, /contact, /privacy, /terms
│   │   ├── (auth)/                   # Auth routes group
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── callback/
│   │   ├── (admin)/                  # Admin routes group (server-auth guarded)
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx          # Dashboard
│   │   │   │   ├── content/
│   │   │   │   ├── ingestion/
│   │   │   │   ├── editorial/
│   │   │   │   ├── community/
│   │   │   │   ├── commerce/
│   │   │   │   ├── users/
│   │   │   │   ├── seo/
│   │   │   │   ├── analytics/
│   │   │   │   └── settings/
│   │   ├── api/                      # API routes
│   │   │   ├── search/
│   │   │   ├── technologies/
│   │   │   ├── tools/
│   │   │   ├── news/
│   │   │   ├── webhooks/
│   │   │   └── jobs/
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                       # Design system primitives
│   │   ├── layout/                   # Nav, Footer, Sidebar
│   │   └── shared/                   # Composite components
│   ├── lib/
│   │   ├── supabase/                 # Supabase client config
│   │   ├── services/                 # Domain services
│   │   │   ├── TechnologyService.ts
│   │   │   ├── ToolService.ts
│   │   │   ├── ArticleService.ts
│   │   │   ├── NewsService.ts
│   │   │   ├── CourseService.ts
│   │   │   ├── ComparisonService.ts
│   │   │   ├── CompanyService.ts
│   │   │   ├── InterviewService.ts
│   │   │   ├── SearchService.ts
│   │   │   ├── IngestionService.ts
│   │   │   ├── AIService.ts
│   │   │   ├── AnalyticsService.ts
│   │   │   └── UserService.ts
│   │   ├── repositories/             # Data access layer
│   │   ├── ai/                       # AI provider abstraction
│   │   ├── search/                   # Search abstraction
│   │   ├── ingestion/                # Connectors + pipeline
│   │   ├── content/                  # Content utilities
│   │   ├── seo/                      # SEO utilities
│   │   ├── auth/                     # Auth helpers
│   │   ├── payments/                 # Payment abstraction
│   │   ├── analytics/                # Analytics abstraction
│   │   └── utils/                    # Shared utilities
│   └── types/                        # TypeScript interfaces
├── database/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   └── 002_seed_data.sql
│   └── schema/                       # Schema reference docs
├── workers/                          # Background worker definitions
├── docs/
│   ├── architecture.md               # This file
│   ├── database.md
│   ├── content-model.md
│   ├── ingestion.md
│   ├── ai-pipeline.md
│   ├── admin.md
│   ├── search.md
│   ├── seo.md
│   ├── deployment.md
│   └── security.md
├── public/
├── .env.example
└── PROJECT_STATUS.md
```

---

## Data Model and Entity Relationships

### Core Entity Graph

```
Technology ──── technology_relationships ──── Technology
     │
     ├── technology_tags ──── Tag
     ├── company_technologies ──── Company
     ├── tool_technologies ──── Tool
     ├── article_entities ──── Article
     └── news_entities ──── NewsItem

Company ──── People
        ──── Tools
        ──── Technologies (via company_technologies)

Tool ──── Company
     ──── Category
     ──── tool_pricing
     ──── tool_features
     ──── tool_integrations
     ──── tool_technologies

Article ──── Author
        ──── Category
        ──── article_tags ──── Tag
        ──── article_entities (Technology | Tool | Company | Person | Course | Comparison)

NewsItem ──── Author
         ──── StoryCluster
         ──── Category
         ──── news_sources ──── Source
         ──── news_entities
         ──── news_tags

StoryCluster ──── story_cluster_sources ──── SourceItem ──── Source

Comparison ──── comparison_entities (Tool | Technology | Company)
           ──── comparison_values ──── comparison_dimensions

Course ──── Author (instructor)
       ──── course_modules ──── lessons ──── quizzes ──── quiz_questions
       ──── course_enrollments ──── User
       ──── lesson_progress ──── User

LearningPath ──── learning_path_courses ──── Course

Interview ──── Person (guest)
          ──── Company (guest_company)
          ──── interview_topics ──── Tag
          ──── interview_entities
```

---

## Service Layer Pattern

UI components never query the database directly. They call services. Services encapsulate domain logic and call repositories for data access.

```
UI Component
    → Service (e.g., ArticleService.getPublished())
        → Repository (e.g., ArticleRepository.findPublished())
            → Supabase client
                → PostgreSQL
```

**Service interface example:**

```typescript
interface IArticleService {
  getPublished(options: PaginationOptions): Promise<PaginatedResult<Article>>
  getBySlug(slug: string): Promise<Article | null>
  create(data: CreateArticleInput, userId: string): Promise<Article>
  publish(id: string, userId: string): Promise<Article>
  schedule(id: string, publishAt: Date, userId: string): Promise<Article>
  archive(id: string, userId: string): Promise<void>
  createRevision(id: string, userId: string, summary: string): Promise<Revision>
}
```

Services never expose Supabase query objects to callers. The database layer is fully encapsulated.

---

## Search Architecture

Search is abstracted behind `SearchService` so the underlying engine can change without application changes.

### Current implementation: Postgres FTS

```sql
-- tsvector columns on searchable tables
-- GIN indexes for performance
-- pg_trgm for fuzzy matching
-- unaccent for accent-insensitive search
```

### SearchService interface

```typescript
interface ISearchService {
  search(query: string, options: SearchOptions): Promise<SearchResult[]>
  autocomplete(query: string): Promise<AutocompleteResult[]>
  semanticSearch(query: string, options: SearchOptions): Promise<SearchResult[]>
  index(entity: IndexableEntity): Promise<void>
  remove(entityType: string, entityId: string): Promise<void>
}
```

### Search result shape

```typescript
interface SearchResult {
  id: string
  entityType: 'technology' | 'tool' | 'company' | 'article' | 'news' | 'course' | 'person' | 'comparison'
  title: string
  slug: string
  excerpt?: string
  score: number
  metadata: Record<string, unknown>
}
```

### Autocomplete grouping

Results are grouped by entity type for the dropdown:
- Technologies
- Tools
- Companies
- Articles
- Courses
- People
- News

### Future: vector/semantic search

When pgvector is enabled, `semanticSearch()` generates an embedding for the query and returns results by cosine similarity. The `search()` method can hybridize: FTS for recall + semantic for ranking.

---

## Ingestion Pipeline Architecture

```
Source (RSS / API / YouTube / Manual)
    │
    ↓
SourceConnector.fetch()
    │
    ↓
SourceItem (raw, stored in source_items)
    │
    ↓
Normalizer (canonical URL, title, metadata)
    │
    ↓
DedupService (URL hash → content hash → similarity)
    │
    ├── DUPLICATE → mark source_item.status = 'duplicate', link to duplicate_of
    │
    └── NEW → ContentExtractor.extract()
                    │
                    ↓
              EntityExtractor.extract()
                    │
                    ↓
              AIEnrichmentService.enrich()
                    │
                    ↓
              StoryCluster (created or merged)
                    │
                    ↓
              NewsItem draft (status = 'draft')
                    │
                    ↓
              Editorial review queue
                    │
                    ├── Approved → publish
                    └── Rejected → archived
```

### SourceConnector interface

```typescript
interface SourceConnector {
  fetch(): Promise<RawItem[]>
  normalize(raw: RawItem): NormalizedItem
  getCanonicalUrl(raw: RawItem): string
  getPublishedAt(raw: RawItem): Date | null
  getAuthor(raw: RawItem): string | null
  getMetadata(raw: RawItem): Record<string, unknown>
}
```

Connectors: `RSSConnector`, `YouTubeConnector`, `OfficialAPIConnector`, `ManualConnector`.

---

## AI Enrichment Pipeline

AI assists editorial staff. It never publishes autonomously.

For each ingested candidate, AIService generates:

```typescript
interface AIEnrichmentResult {
  summary_sentence: string
  summary_paragraph: string
  suggested_headline: string
  suggested_seo_headline: string
  category: string
  subcategory: string
  tags: string[]
  entities: {
    companies: string[]
    technologies: string[]
    people: string[]
    products: string[]
  }
  geographic_relevance: string[]
  importance_score: number        // 1-10
  novelty_score: number           // 1-10
  duplicate_likelihood: number    // 0-1
  source_quality: number          // 1-10
  what_happened: string
  why_it_matters: string
  what_you_should_know: string
  related_technologies: string[]
  suggested_related_content: string[]
}
```

Every AI generation is recorded in `ai_generations` with model, token counts, and output. Editors must approve before content is published.

### AIService interface

```typescript
interface IAIService {
  enrichNewsCandidate(item: NormalizedItem): Promise<AIEnrichmentResult>
  generateSummary(content: string, style: SummaryStyle): Promise<string>
  suggestHeadline(content: string): Promise<string[]>
  extractEntities(content: string): Promise<ExtractedEntities>
  generateEmbedding(text: string): Promise<number[]>
  explainTechnology(slug: string, mode: ExplainMode): Promise<string>
  suggestTags(content: string): Promise<string[]>
  suggestInternalLinks(content: string): Promise<SuggestedLink[]>
}
```

---

## Authentication and Authorization

### Supabase Auth

- Email/password + OAuth (Google, GitHub)
- JWT tokens managed by Supabase
- Session handled via SSR cookies using `@supabase/ssr`

### Server-side auth check

```typescript
// In server components and route handlers:
const supabase = createServerClient(...)
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/login')
```

### Row Level Security (RLS)

RLS policies enforce authorization at the database layer. This means even if application code has a bug, the database rejects unauthorized operations.

Key policies:
- `users`: authenticated users can only SELECT/UPDATE their own row
- `articles`: anon can SELECT published only; authenticated editors/admins can SELECT all
- `news_items`: same as articles
- `course_enrollments`: users can only SELECT their own enrollments
- `lesson_progress`: users can only SELECT/INSERT/UPDATE their own progress
- `community_posts`: anon can SELECT published; authors can manage their own
- `votes`: users can only manage their own votes

### Role hierarchy

```
super_admin > admin > editor > author/reviewer > user
community_moderator (parallel branch)
course_manager (parallel branch)
analyst (read-only admin)
```

Role is stored in `public.users.role`. Middleware reads it server-side.

---

## Content Lifecycle

```
draft → in_review → approved → scheduled → published → archived
                                                    ↑
                                            needs_verification (flag, not state)
```

| State | Who can set | Visible to public |
|---|---|---|
| draft | author, editor | No |
| in_review | author | No |
| approved | editor, admin | No |
| scheduled | editor, admin | No |
| published | editor, admin | Yes |
| archived | editor, admin | No |

Revision snapshots are created on every state transition and on manual save.

---

## SEO Architecture

### Per-page requirements

Every public page renders:
- `<title>` — unique, keyword-relevant, under 60 chars
- `<meta name="description">` — unique, under 160 chars
- `<link rel="canonical">`
- Open Graph: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`
- Twitter: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- JSON-LD structured data (type depends on page)
- Breadcrumbs (BreadcrumbList schema)

### Sitemaps

- `/sitemap.xml` — master sitemap index
- `/news-sitemap.xml` — Google News sitemap (last 48h published news)
- `/tools-sitemap.xml`
- `/courses-sitemap.xml`
- `/tech-sitemap.xml`

### Structured data by page type

| Page type | Schema.org type |
|---|---|
| Article | `Article` |
| News | `NewsArticle` |
| Course | `Course` |
| Tool | `SoftwareApplication` |
| Person | `Person` |
| Company | `Organization` |
| Interview (video) | `VideoObject` |
| FAQ section | `FAQPage` |
| Comparison | `ItemList` |
| Homepage | `WebSite` + `Organization` |

### robots.txt

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /auth/

Sitemap: https://neugravity.com/sitemap.xml
```

AI crawler rules are configurable in admin settings.

---

## Performance Strategy

### Rendering modes by page type

| Page | Rendering | Revalidation |
|---|---|---|
| Homepage | ISR | 60s |
| Technology detail | ISR | 5 min |
| Article detail | ISR | 5 min |
| News detail | ISR | 60s |
| Tool detail | ISR | 5 min |
| Comparison | ISR | 10 min |
| Search | SSR | — |
| Admin | SSR | — |
| Community | SSR | — |
| Status | SSR | — |

### Caching strategy

- Database queries cached at service layer with appropriate TTLs
- Edge caching for public ISR pages
- Search results cached with short TTL (30s)
- No caching for authenticated/personalized content

### Performance targets

- LCP < 2.5s
- FID < 100ms
- CLS < 0.1
- Images served via Next.js `<Image>` with responsive sizing
- Minimal client-side JS bundle (server components by default)

---

## Queue / Background Job Architecture

Jobs are defined in `ingestion_jobs` table. Workers poll or are triggered by queue messages.

### Job types

```
INGEST_SOURCE       — Trigger fetch for a source
FETCH_ITEM          — Fetch a single URL
EXTRACT_CONTENT     — Extract clean content from raw HTML
NORMALIZE_ITEM      — Normalize item metadata
DEDUP_ITEM          — Check for duplicates
ENRICH_ITEM         — Run AI enrichment
GENERATE_SUMMARY    — Generate AI summary
EXTRACT_ENTITIES    — Extract named entities
GENERATE_DRAFT      — Create editorial draft
UPDATE_ENTITY       — Refresh entity data (tool pricing, etc.)
REFRESH_TOOL        — Re-verify tool information
CHECK_OUTAGE        — Check status provider
GENERATE_EMBEDDING  — Generate vector embedding
UPDATE_SEARCH_INDEX — Re-index entity in search
PUBLISH_CONTENT     — Scheduled publish worker
INVALIDATE_CACHE    — Bust ISR cache for entity
```

### Job lifecycle

```
pending → running → completed
                 → failed → retrying (with backoff) → dead_letter
```

### Retry policy

- Max 3 attempts by default (configurable per job type)
- Exponential backoff: 30s, 5m, 30m
- Dead letter jobs visible in admin for manual retry

---

## Security Model

- **Secrets**: all secrets in environment variables, never in client bundles
- **RLS**: enforced at database layer for all user-scoped data
- **CSRF**: Next.js server actions include built-in CSRF protection
- **Input validation**: Zod schemas on all API route inputs
- **HTML sanitization**: user-generated content sanitized before storage and render
- **Rate limiting**: API routes rate-limited by IP
- **Audit log**: admin actions logged with user_id, timestamp, action, entity
- **File validation**: uploaded files validated for type and size before storage
- **SQL injection**: impossible via Supabase parameterized queries
- **XSS**: React escapes by default; `dangerouslySetInnerHTML` never used on user content
- **Authorization**: checked server-side in every admin route; never trust client-provided role

---

## Key Design Decisions

1. **App Router throughout** — Server components reduce client JS. Streaming improves TTFB.
2. **Supabase for auth + DB + storage** — Reduces infrastructure complexity at early stage. Supabase is replaceable; the service layer abstracts it.
3. **RLS as defense-in-depth** — Application auth can have bugs. Database policies cannot be bypassed.
4. **No auto-publish** — All AI output requires human approval. This is a product principle, not just a technical decision.
5. **Slug stability** — Slugs are immutable after publication. Changes require a redirect entry. This protects SEO.
6. **Service abstractions** — AI, search, email, payment, analytics are all behind interfaces. Providers can be swapped without touching UI.
7. **Structured data over unstructured** — Pricing, features, comparisons are structured fields with provenance. They are not buried in article bodies.
8. **Content provenance** — Every factual claim has a traceable source. The `claims` table enables this for important content.
