# NeuGravity — Database Reference

See `database/migrations/001_initial_schema.sql` for the authoritative schema.

## Extensions

| Extension | Purpose |
|---|---|
| `uuid-ossp` | `uuid_generate_v4()` for primary keys |
| `pg_trgm` | Trigram indexes for fuzzy text search |
| `unaccent` | Accent-insensitive text search |
| `pgcrypto` | Cryptographic functions |

---

## Table Reference

### users
Extends Supabase `auth.users`. One row per authenticated user.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | References auth.users(id) |
| username | text UNIQUE | Public handle |
| display_name | text | |
| bio | text | |
| avatar_url | text | |
| website_url | text | |
| twitter_handle | text | |
| linkedin_url | text | |
| role | text | user / author / reviewer / editor / course_manager / community_moderator / analyst / admin / super_admin |
| status | text | active / suspended / deleted |
| email_verified | boolean | |
| onboarding_completed | boolean | |
| created_at | timestamptz | |
| updated_at | timestamptz | Auto-updated by trigger |

**RLS**: Users can SELECT/UPDATE only their own row.

---

### authors
Public author profiles. Decoupled from users so content can be attributed to external contributors.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | FK → users(id), nullable for external authors |
| name | text NOT NULL | |
| slug | text UNIQUE NOT NULL | Stable URL segment |
| bio | text | |
| avatar_url | text | |
| website_url | text | |
| twitter_handle | text | |
| linkedin_url | text | |
| expertise | text[] | Array of expertise tags |
| featured | boolean | |
| article_count | int | Denormalized count |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

### categories
Hierarchical content categories.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text NOT NULL | |
| slug | text UNIQUE NOT NULL | |
| description | text | |
| parent_id | uuid | FK → categories(id), self-referential |
| icon | text | Icon name / emoji |
| color | text | Hex color |
| sort_order | int | |
| created_at | timestamptz | |

---

### tags
Flat tag taxonomy. Used across articles, news, interviews, technologies.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text NOT NULL | |
| slug | text UNIQUE NOT NULL | |
| description | text | |
| usage_count | int | Denormalized, updated by trigger |
| created_at | timestamptz | |

---

### technologies
Core knowledge graph entities for technologies, frameworks, languages, platforms, and concepts.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text NOT NULL | |
| slug | text UNIQUE NOT NULL | e.g. `kubernetes` |
| tagline | text | One-line description |
| description | text | Short description |
| long_description | text | Full markdown content |
| type | text | language / framework / platform / protocol / concept / tool / database / cloud / ai / infrastructure / other |
| category_id | uuid | FK → categories(id) |
| icon_url | text | |
| logo_url | text | |
| hero_image_url | text | |
| website_url | text | |
| docs_url | text | |
| github_url | text | |
| wikipedia_url | text | |
| created_year | int | Year technology was created |
| creator | text | Original creator name |
| maintained_by | text | Current maintainer |
| license | text | e.g. Apache 2.0, MIT |
| open_source | boolean | |
| status | text | active / deprecated / experimental / archived |
| difficulty | text | beginner / intermediate / advanced / expert |
| popularity_score | int | 0–100 |
| trending_score | int | 0–100, time-decayed |
| seo_title | text | |
| seo_description | text | |
| published | boolean | |
| featured | boolean | |
| verified | boolean | Editorial verification |
| last_verified_at | timestamptz | |
| search_vector | tsvector | Auto-updated by trigger |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**Indexes**: slug, name, type, featured, published, search_vector (GIN)

---

### technology_relationships
Directed relationships between technologies.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| from_technology_id | uuid | FK → technologies(id) CASCADE |
| to_technology_id | uuid | FK → technologies(id) CASCADE |
| relationship_type | text | related_to / competes_with / built_on / integrates_with / successor_of / predecessor_of / part_of / used_with |
| strength | int | 1–10 |
| created_at | timestamptz | |

**Unique**: (from_technology_id, to_technology_id, relationship_type)

---

### technology_tags
Junction: technologies ↔ tags.

| Column | Type |
|---|---|
| technology_id | uuid PK FK → technologies(id) CASCADE |
| tag_id | uuid PK FK → tags(id) CASCADE |

---

### companies

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text NOT NULL | |
| slug | text UNIQUE NOT NULL | |
| description | text | |
| long_description | text | |
| logo_url | text | |
| hero_image_url | text | |
| website_url | text | |
| founded_year | int | |
| headquarters | text | |
| employee_count_range | text | e.g. `1000-5000` |
| company_type | text | public / private / nonprofit / government / open_source |
| stock_symbol | text | |
| linkedin_url | text | |
| twitter_handle | text | |
| github_url | text | |
| category_id | uuid | FK → categories(id) |
| status | text | active / acquired / dissolved |
| featured | boolean | |
| verified | boolean | |
| published | boolean | |
| seo_title | text | |
| seo_description | text | |
| last_verified_at | timestamptz | |
| search_vector | tsvector | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

### company_technologies
Junction: companies ↔ technologies with relationship type.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| company_id | uuid | FK → companies(id) CASCADE |
| technology_id | uuid | FK → technologies(id) CASCADE |
| relationship_type | text | builds / uses / owns / acquires / open_sources / invests_in |
| created_at | timestamptz | |

---

### people

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text NOT NULL | |
| slug | text UNIQUE NOT NULL | |
| bio | text | |
| avatar_url | text | |
| website_url | text | |
| twitter_handle | text | |
| linkedin_url | text | |
| github_handle | text | |
| current_company_id | uuid | FK → companies(id) |
| current_role | text | |
| known_for | text | |
| tags | text[] | |
| featured | boolean | |
| published | boolean | |
| verified | boolean | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

### tools

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text NOT NULL | |
| slug | text UNIQUE NOT NULL | |
| tagline | text | |
| description | text | |
| long_description | text | |
| icon_url | text | |
| logo_url | text | |
| hero_image_url | text | |
| website_url | text | |
| docs_url | text | |
| github_url | text | |
| app_store_url | text | |
| play_store_url | text | |
| category_id | uuid | FK → categories(id) |
| company_id | uuid | FK → companies(id) |
| tool_type | text | saas / open_source / desktop / mobile / api / library / framework / cli / browser_extension / plugin / platform / other |
| platforms | text[] | web / macos / windows / linux / ios / android |
| pricing_model | text | free / freemium / paid / open_source / enterprise / subscription / usage_based / one_time |
| has_free_tier | boolean | |
| has_api | boolean | |
| enterprise_available | boolean | |
| status | text | active / beta / deprecated / discontinued |
| featured | boolean | |
| verified | boolean | |
| published | boolean | |
| trending_score | int | |
| popularity_score | int | |
| rating_average | numeric(3,2) | |
| rating_count | int | |
| seo_title | text | |
| seo_description | text | |
| last_verified_at | timestamptz | |
| search_vector | tsvector | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

### tool_pricing
Structured pricing plans. Each row is one pricing tier.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| tool_id | uuid | FK → tools(id) CASCADE |
| plan_name | text NOT NULL | e.g. `Free`, `Pro`, `Enterprise` |
| price_monthly | numeric(10,2) | null = contact sales |
| price_annual | numeric(10,2) | |
| price_currency | text | Default USD |
| features | text[] | Features in this plan |
| limits | jsonb | Structured limits (requests/day, seats, etc.) |
| is_free | boolean | |
| is_most_popular | boolean | |
| source_url | text | Where pricing was retrieved |
| last_verified_at | timestamptz | |
| created_at | timestamptz | |

---

### tool_features, tool_integrations, tool_technologies
See schema for details. Junction and attribute tables for tools.

---

### articles

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| title | text NOT NULL | |
| slug | text UNIQUE NOT NULL | |
| subtitle | text | |
| excerpt | text | |
| body | text | Markdown/MDX |
| hero_image_url | text | |
| author_id | uuid | FK → authors(id) |
| category_id | uuid | FK → categories(id) |
| status | text | draft / in_review / approved / scheduled / published / archived |
| published_at | timestamptz | |
| scheduled_publish_at | timestamptz | |
| seo_title | text | |
| seo_description | text | |
| canonical_url | text | |
| reading_time_minutes | int | Computed |
| featured | boolean | |
| featured_order | int | For homepage ordering |
| allow_comments | boolean | |
| view_count | int | |
| share_count | int | |
| seo_score | int | 0–100 editorial checklist score |
| structured_data | jsonb | JSON-LD |
| search_vector | tsvector | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**RLS**: anon can SELECT where status = 'published'; editors+ can SELECT all.

---

### sources
Configured news/content sources.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text NOT NULL | |
| domain | text UNIQUE NOT NULL | |
| source_type | text | official_company / official_blog / rss / api / news / youtube / manual / community |
| rss_url | text | |
| api_endpoint | text | |
| feed_enabled | boolean | |
| trust_level | int | 1–10 |
| active | boolean | |
| last_fetched_at | timestamptz | |
| fetch_frequency_minutes | int | |
| robots_status | text | unknown / allowed / disallowed / restricted |
| notes | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

### source_items
Raw items ingested from sources before editorial processing.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| source_id | uuid | FK → sources(id) |
| raw_url | text NOT NULL | Original URL |
| canonical_url | text | Normalized URL |
| title | text | |
| content_hash | text | SHA-256 of content for dedup |
| raw_content | text | Original extracted content |
| metadata | jsonb | Author, published_at, etc. |
| discovered_at | timestamptz | |
| fetched_at | timestamptz | |
| status | text | pending / processing / processed / duplicate / rejected / failed |
| duplicate_of | uuid | FK → source_items(id) |
| error_message | text | |
| created_at | timestamptz | |

---

### story_clusters
Groups related source_items about the same event/story. Used for deduplication.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| title | text | Working title |
| slug | text UNIQUE | |
| primary_source_item_id | uuid | FK → source_items(id) |
| importance | int | 1–10 |
| status | text | pending / draft / review / approved / published / rejected |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

### news_items

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| headline | text NOT NULL | NeuGravity-authored headline |
| slug | text UNIQUE NOT NULL | |
| summary | text | One-paragraph summary |
| body | text | Full article body |
| hero_image_url | text | |
| author_id | uuid | FK → authors(id) |
| cluster_id | uuid | FK → story_clusters(id) |
| category_id | uuid | FK → categories(id) |
| status | text | draft / in_review / approved / scheduled / published / archived |
| importance | int | 1–10 |
| published_at | timestamptz | |
| scheduled_publish_at | timestamptz | |
| source_published_at | timestamptz | When source published it |
| discovered_at | timestamptz | When ingestion found it |
| last_verified_at | timestamptz | |
| seo_title | text | |
| seo_description | text | |
| canonical_url | text | |
| view_count | int | |
| featured | boolean | |
| needs_verification | boolean | Flag for time-sensitive content |
| seo_score | int | |
| structured_data | jsonb | |
| search_vector | tsvector | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

### news_sources
Attribution for news items. Each news item can have multiple sources.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| news_item_id | uuid | FK → news_items(id) CASCADE |
| source_id | uuid | FK → sources(id) |
| source_url | text NOT NULL | |
| source_title | text | |
| source_published_at | timestamptz | |
| retrieved_at | timestamptz | |
| is_primary | boolean | |

---

### claims
Factual claim provenance for important editorial content.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| content_type | text | Which table this claim is for |
| content_id | uuid | ID in that table |
| claim_text | text NOT NULL | The specific factual claim |
| source_url | text NOT NULL | |
| source_name | text | |
| published_at | timestamptz | When source published |
| retrieved_at | timestamptz | When we retrieved it |
| confidence | text | high / medium / low / uncertain |
| editor_verified | boolean | |
| verified_by | uuid | FK → users(id) |
| verified_at | timestamptz | |
| created_at | timestamptz | |

---

### ingestion_jobs

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| type | text NOT NULL | Job type enum |
| status | text | pending / running / completed / failed / retrying / cancelled / dead_letter |
| payload | jsonb | Job parameters |
| attempts | int | |
| max_attempts | int | Default 3 |
| priority | int | 1–10 |
| created_at | timestamptz | |
| started_at | timestamptz | |
| completed_at | timestamptz | |
| next_retry_at | timestamptz | |
| error_message | text | |
| error_details | jsonb | Stack trace etc. |
| created_by | uuid | FK → users(id) |

---

### ai_generations
Audit log of all AI-generated content.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| content_type | text | |
| content_id | uuid | |
| generation_type | text | summary / headline / tags / entities / draft / explanation / seo / embedding / categorization |
| prompt_tokens | int | |
| completion_tokens | int | |
| model | text | e.g. `gpt-4o` |
| provider | text | Default `openai` |
| generated_content | jsonb | Full output |
| approved | boolean | null = not reviewed |
| approved_by | uuid | FK → users(id) |
| approved_at | timestamptz | |
| created_at | timestamptz | |

---

### comparisons, comparison_entities, comparison_dimensions, comparison_values
See schema. Structured comparison tables that avoid unstructured article-only comparisons.

---

### courses, course_modules, lessons, quizzes, quiz_questions
Hierarchical learning content. Course → Modules → Lessons → Quizzes → Questions.

---

### course_enrollments, lesson_progress
User learning state. RLS-protected: users see only their own rows.

---

### learning_paths, learning_path_courses
Curated sequences of courses for specific career/learning outcomes.

---

### interviews

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| title | text NOT NULL | |
| slug | text UNIQUE NOT NULL | |
| description | text | |
| guest_id | uuid | FK → people(id) |
| guest_company_id | uuid | FK → companies(id) |
| guest_role | text | Role at time of interview |
| video_url | text | |
| youtube_video_id | text | |
| thumbnail_url | text | |
| transcript | text | Full transcript |
| published_at | timestamptz | |
| duration_seconds | int | |
| status | text | draft / published / archived |
| featured | boolean | |
| view_count | int | |
| seo_title | text | |
| seo_description | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

### status_providers, status_services, status_incidents
Technology status monitoring. Incidents record what happened, when, severity, and source. Never claim operational status without a checked_at timestamp and source_url.

---

### community_posts, comments, votes, reports
Community content. `community_posts.allow_indexed` controls whether Google can index the post (default false for community content).

---

### newsletter_subscribers
Email list. `consent` must be true before any email is sent. `consent_at` records when consent was given.

---

### enterprise_leads
Inbound sales leads. Status tracks pipeline stage. Never exposed publicly.

---

### revisions
Immutable revision history for all published content. Stores full JSON snapshot. Never delete revision rows.

---

### redirects
URL redirect rules applied by Next.js middleware or `next.config.ts`. Created whenever a slug changes after publication.

---

### seo_metadata
Overrides for SEO fields on specific paths. Admin can set custom title/description/robots for any path.

---

### analytics_events
Internal analytics event log. No PII beyond user_id. Session_id is a random UUID per session.

---

## Full-Text Search

Tables with `search_vector` column (tsvector, GIN indexed):
- `articles` — title + subtitle + excerpt + body
- `news_items` — headline + summary + body
- `technologies` — name + description + long_description
- `tools` — name + tagline + description
- `companies` — name + description

Vectors are updated automatically by `BEFORE UPDATE OR INSERT` triggers using `to_tsvector('english', ...)`.

For fuzzy matching, pg_trgm GIN indexes are created on name/title columns.

---

## Key Indexes

```sql
-- slugs (unique lookups)
CREATE UNIQUE INDEX ON technologies(slug);
CREATE UNIQUE INDEX ON tools(slug);
CREATE UNIQUE INDEX ON companies(slug);
CREATE UNIQUE INDEX ON articles(slug);
CREATE UNIQUE INDEX ON news_items(slug);

-- published content queries
CREATE INDEX ON articles(status, published_at DESC);
CREATE INDEX ON news_items(status, published_at DESC, importance DESC);

-- source dedup
CREATE INDEX ON source_items(canonical_url);
CREATE INDEX ON source_items(content_hash);

-- job queue
CREATE INDEX ON ingestion_jobs(status, priority DESC, created_at);
CREATE INDEX ON ingestion_jobs(type, status);
```
