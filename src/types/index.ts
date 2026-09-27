// Core entity types for NeuGravity platform

export type ContentStatus = "draft" | "in_review" | "approved" | "scheduled" | "published" | "archived"
export type UserRole = "user" | "author" | "reviewer" | "editor" | "course_manager" | "community_moderator" | "analyst" | "admin" | "super_admin"
export type EntityType = "technology" | "tool" | "company" | "person" | "article" | "news" | "course" | "comparison" | "interview"

export interface User {
  id: string
  username: string | null
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  website_url: string | null
  twitter_handle: string | null
  linkedin_url: string | null
  role: UserRole
  status: "active" | "suspended" | "deleted"
  email_verified: boolean
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface Author {
  id: string
  user_id: string | null
  name: string
  slug: string
  bio: string | null
  avatar_url: string | null
  website_url: string | null
  twitter_handle: string | null
  linkedin_url: string | null
  expertise: string[]
  featured: boolean
  article_count: number
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  parent_id: string | null
  icon: string | null
  color: string | null
  sort_order: number
  created_at: string
}

export interface Tag {
  id: string
  name: string
  slug: string
  description: string | null
  usage_count: number
  created_at: string
}

export type TechnologyType = "language" | "framework" | "platform" | "protocol" | "concept" | "tool" | "database" | "cloud" | "ai" | "infrastructure" | "other"
export type DifficultyLevel = "beginner" | "intermediate" | "advanced" | "expert"

export interface Technology {
  id: string
  name: string
  slug: string
  tagline: string | null
  description: string | null
  long_description: string | null
  type: TechnologyType
  category_id: string | null
  icon_url: string | null
  logo_url: string | null
  hero_image_url: string | null
  website_url: string | null
  docs_url: string | null
  github_url: string | null
  wikipedia_url: string | null
  created_year: number | null
  creator: string | null
  maintained_by: string | null
  license: string | null
  open_source: boolean | null
  status: "active" | "deprecated" | "experimental" | "archived"
  difficulty: DifficultyLevel | null
  popularity_score: number
  trending_score: number
  seo_title: string | null
  seo_description: string | null
  short_definition: string | null
  maturity: "emerging" | "growing" | "mature" | "declining" | "legacy" | null
  published: boolean
  featured: boolean
  verified: boolean
  last_verified_at: string | null
  created_at: string
  updated_at: string
  // Relations
  category?: Category | null
  tags?: Tag[]
  related_technologies?: Technology[]
}

export interface Company {
  id: string
  name: string
  slug: string
  description: string | null
  long_description: string | null
  logo_url: string | null
  hero_image_url: string | null
  website_url: string | null
  founded_year: number | null
  headquarters: string | null
  employee_count_range: string | null
  company_type: "public" | "private" | "nonprofit" | "government" | "open_source" | null
  stock_symbol: string | null
  linkedin_url: string | null
  twitter_handle: string | null
  github_url: string | null
  category_id: string | null
  status: string
  featured: boolean
  verified: boolean
  published: boolean
  seo_title: string | null
  seo_description: string | null
  last_verified_at: string | null
  created_at: string
  updated_at: string
}

export interface Person {
  id: string
  name: string
  slug: string
  bio: string | null
  avatar_url: string | null
  website_url: string | null
  twitter_handle: string | null
  linkedin_url: string | null
  github_handle: string | null
  current_company_id: string | null
  current_role: string | null
  known_for: string | null
  tags: string[]
  featured: boolean
  published: boolean
  verified: boolean
  created_at: string
  updated_at: string
  // Relations
  current_company?: Company | null
}

export type PricingModel = "free" | "freemium" | "paid" | "open_source" | "enterprise" | "subscription" | "usage_based" | "one_time"
export type ToolType = "saas" | "open_source" | "desktop" | "mobile" | "api" | "library" | "framework" | "cli" | "browser_extension" | "plugin" | "platform" | "other"

export interface Tool {
  id: string
  name: string
  slug: string
  tagline: string | null
  description: string | null
  long_description: string | null
  icon_url: string | null
  logo_url: string | null
  hero_image_url: string | null
  website_url: string | null
  docs_url: string | null
  github_url: string | null
  app_store_url: string | null
  play_store_url: string | null
  category_id: string | null
  company_id: string | null
  tool_type: ToolType | null
  platforms: string[]
  pricing_model: PricingModel | null
  has_free_tier: boolean
  has_api: boolean
  enterprise_available: boolean
  status: "active" | "beta" | "deprecated" | "discontinued"
  featured: boolean
  verified: boolean
  published: boolean
  trending_score: number
  popularity_score: number
  rating_average: number | null
  rating_count: number
  seo_title: string | null
  seo_description: string | null
  last_verified_at: string | null
  created_at: string
  updated_at: string
  // Relations
  category?: Category | null
  company?: Company | null
  pricing?: ToolPricing[]
  features?: ToolFeature[]
}

export interface ToolPricing {
  id: string
  tool_id: string
  plan_name: string
  price_monthly: number | null
  price_annual: number | null
  price_currency: string
  features: string[]
  limits: Record<string, unknown> | null
  is_free: boolean
  is_most_popular: boolean
  source_url: string | null
  last_verified_at: string | null
  created_at: string
}

export interface ToolFeature {
  id: string
  tool_id: string
  feature_name: string
  description: string | null
  category: string | null
  available_on_free: boolean
  sort_order: number
}

export interface Article {
  id: string
  title: string
  slug: string
  subtitle: string | null
  excerpt: string | null
  body: string | null
  hero_image_url: string | null
  author_id: string | null
  category_id: string | null
  status: ContentStatus
  published_at: string | null
  scheduled_publish_at: string | null
  seo_title: string | null
  seo_description: string | null
  canonical_url: string | null
  reading_time_minutes: number | null
  featured: boolean
  featured_order: number | null
  allow_comments: boolean
  view_count: number
  share_count: number
  seo_score: number | null
  structured_data: Record<string, unknown> | null
  created_at: string
  updated_at: string
  // Relations
  author?: Author | null
  category?: Category | null
  tags?: Tag[]
}

export interface NewsItem {
  id: string
  headline: string
  slug: string
  summary: string | null
  body: string | null
  hero_image_url: string | null
  author_id: string | null
  cluster_id: string | null
  category_id: string | null
  status: ContentStatus
  importance: number
  published_at: string | null
  scheduled_publish_at: string | null
  source_published_at: string | null
  discovered_at: string
  last_verified_at: string | null
  seo_title: string | null
  seo_description: string | null
  canonical_url: string | null
  view_count: number
  featured: boolean
  needs_verification: boolean
  created_at: string
  updated_at: string
  // Relations
  author?: Author | null
  category?: Category | null
  tags?: Tag[]
  sources?: NewsSource[]
}

export interface NewsSource {
  id: string
  news_item_id: string
  source_id: string | null
  source_url: string
  source_title: string | null
  source_published_at: string | null
  retrieved_at: string
  is_primary: boolean
}

export interface Source {
  id: string
  name: string
  domain: string
  source_type: "official_company" | "official_blog" | "rss" | "api" | "news" | "youtube" | "manual" | "community" | "status" | "graphql"
  base_url: string | null
  feed_url: string | null
  rss_url: string | null
  api_url: string | null
  api_endpoint: string | null
  parser_key: string | null
  feed_enabled: boolean
  trust_level: number
  active: boolean
  last_fetched_at: string | null
  fetch_frequency_minutes: number
  poll_interval_seconds: number
  last_polled_at: string | null
  next_poll_at: string | null
  last_success_at: string | null
  last_error_at: string | null
  last_error: string | null
  failure_count: number
  items_discovered: number
  health_status: "healthy" | "warning" | "failed" | "disabled" | "unknown"
  robots_status: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Comparison {
  id: string
  title: string
  slug: string
  description: string | null
  status: "draft" | "published" | "archived"
  featured: boolean
  view_count: number
  seo_title: string | null
  seo_description: string | null
  last_verified_at: string | null
  published_at: string | null
  created_at: string
  updated_at: string
  // Relations
  entities?: ComparisonEntity[]
  dimensions?: ComparisonDimension[]
  values?: ComparisonValue[]
}

export interface ComparisonEntity {
  id: string
  comparison_id: string
  entity_type: "tool" | "technology" | "company"
  entity_id: string
  sort_order: number
}

export interface ComparisonDimension {
  id: string
  name: string
  slug: string
  description: string | null
  dimension_type: "boolean" | "text" | "rating" | "list" | "price"
  category: string | null
  sort_order: number
}

export interface ComparisonValue {
  id: string
  comparison_id: string
  entity_id: string
  dimension_id: string
  value_text: string | null
  value_boolean: boolean | null
  value_rating: number | null
  value_list: string[] | null
  source_url: string | null
  last_verified_at: string | null
  created_at: string
  updated_at: string
}

export type CourseStatus = "draft" | "review" | "approved" | "published" | "archived"
export type LessonType = "video" | "article" | "interactive" | "quiz" | "assignment" | "project"
export type CourseEntityRelationship = "TEACHES" | "COVERS" | "PREREQUISITE" | "APPLIES"

export interface Course {
  id: string
  title: string
  slug: string
  subtitle: string | null
  description: string | null
  short_description: string | null
  long_description: string | null
  outcome: string | null
  learning_outcomes: string[] | null
  audience: string | null
  thumbnail_url: string | null
  hero_image_url: string | null
  instructor_id: string | null
  category_id: string | null
  difficulty: DifficultyLevel | null
  estimated_hours: number | null
  price: number | null
  price_currency: string
  status: CourseStatus
  featured: boolean
  is_demo: boolean
  published_at: string | null
  seo_title: string | null
  seo_description: string | null
  view_count: number
  enrollment_count: number
  rating_average: number | null
  rating_count: number
  created_at: string
  updated_at: string
  // Relations
  instructor?: Author | null
  category?: Category | null
  modules?: CourseModule[]
  entities?: CourseEntity[]
}

export interface CourseModule {
  id: string
  course_id: string
  title: string
  description: string | null
  sort_order: number
  created_at: string
  updated_at: string
  lessons?: Lesson[]
}

export interface Lesson {
  id: string
  module_id: string
  title: string
  description: string | null
  lesson_type: LessonType
  content: string | null
  video_url: string | null
  video_duration_seconds: number | null
  learning_outcomes: string[] | null
  sort_order: number
  is_preview: boolean
  status: "draft" | "review" | "published" | "archived"
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface LearningPath {
  id: string
  title: string
  slug: string
  description: string | null
  short_description: string | null
  outcome: string | null
  hero_image_url: string | null
  thumbnail_url: string | null
  difficulty: DifficultyLevel | null
  estimated_hours: number | null
  career_outcomes: string[] | null
  featured: boolean
  is_demo: boolean
  status: "draft" | "review" | "approved" | "published" | "archived"
  published: boolean
  created_at: string
  updated_at: string
  // Relations
  steps?: LearningPathCourse[]
}

export interface LearningPathCourse {
  id: string
  learning_path_id: string
  course_id: string
  sort_order: number
  is_required: boolean
  description: string | null
  created_at: string
  // Relations
  course?: Course | null
}

export interface CourseEntity {
  id: string
  course_id: string
  entity_type: "technology" | "concept" | "tool" | "company" | "person"
  entity_id: string
  relationship_type: CourseEntityRelationship
  sort_order: number
  created_at: string
}

export interface CourseEnrollment {
  id: string
  user_id: string
  course_id: string
  status: "active" | "completed" | "refunded" | "paused"
  enrolled_at: string
  completed_at: string | null
  payment_id: string | null
}

export interface LessonProgress {
  id: string
  user_id: string
  lesson_id: string
  status: "not_started" | "in_progress" | "completed"
  progress_percent: number
  video_position_seconds: number
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface CourseProgress {
  course_id: string
  total_lessons: number
  completed_lessons: number
  percent: number
  last_lesson_id: string | null
}

export interface CourseProject {
  id: string
  course_id: string
  module_id: string | null
  title: string
  description: string | null
  instructions: string | null
  submission_type: "text" | "url" | "github" | "file"
  technology_ids: string[] | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface QuizAttempt {
  id: string
  user_id: string
  quiz_id: string
  lesson_id: string
  answers: Record<string, unknown>
  score: number
  passed: boolean
  started_at: string
  completed_at: string | null
  created_at: string
}

export interface QuizQuestion {
  id: string
  quiz_id: string
  question_text: string
  question_type: "single_choice" | "multiple_choice" | "true_false" | "short_answer"
  options: Array<{ id: string; text: string }> | null
  explanation: string | null
  points: number
  sort_order: number
}

export interface Quiz {
  id: string
  lesson_id: string
  title: string
  passing_score: number
  time_limit_minutes: number | null
  created_at: string
}

export interface ProjectSubmission {
  id: string
  user_id: string
  project_id: string
  course_id: string
  submission_type: "text" | "url" | "github" | "file"
  content: string | null
  url: string | null
  submitted_at: string
  created_at: string
}

export interface Interview {
  id: string
  title: string
  slug: string
  description: string | null
  guest_id: string | null
  guest_company_id: string | null
  guest_role: string | null
  video_url: string | null
  youtube_video_id: string | null
  thumbnail_url: string | null
  transcript: string | null
  published_at: string | null
  duration_seconds: number | null
  status: "draft" | "published" | "archived"
  featured: boolean
  view_count: number
  seo_title: string | null
  seo_description: string | null
  created_at: string
  updated_at: string
  // Relations
  guest?: Person | null
  guest_company?: Company | null
  topics?: Tag[]
}

export interface StatusProvider {
  id: string
  name: string
  slug: string
  category: "ai" | "cloud" | "developer" | "infrastructure" | "payments" | "productivity" | "other"
  website_url: string | null
  official_status_url: string | null
  logo_url: string | null
  active: boolean
  created_at: string
}

export interface StatusIncident {
  id: string
  provider_id: string
  service_id: string | null
  title: string
  description: string | null
  status: "investigating" | "identified" | "monitoring" | "resolved" | "postmortem"
  severity: "minor" | "major" | "critical" | null
  started_at: string
  resolved_at: string | null
  source_url: string | null
  source_name: string | null
  checked_at: string
  created_at: string
  updated_at: string
}

export interface CommunityPost {
  id: string
  title: string
  slug: string
  body: string
  post_type: "question" | "discussion" | "show_and_tell" | "career" | "architecture" | "tool_recommendation"
  author_id: string | null
  category_id: string | null
  status: "draft" | "published" | "removed" | "flagged"
  view_count: number
  vote_count: number
  comment_count: number
  is_pinned: boolean
  is_featured: boolean
  allow_indexed: boolean
  created_at: string
  updated_at: string
}

export interface NewsletterSubscriber {
  id: string
  email: string
  first_name: string | null
  topics: string[]
  frequency: "daily" | "weekly" | "monthly"
  status: "active" | "unsubscribed" | "bounced"
  source: string | null
  consent: boolean
  consent_at: string | null
  created_at: string
  updated_at: string
}

export interface EnterpriseLead {
  id: string
  first_name: string
  last_name: string
  email: string
  company: string
  role: string | null
  company_size: string | null
  phone: string | null
  service: string | null
  message: string | null
  status: "new" | "contacted" | "qualified" | "proposal" | "won" | "lost"
  assigned_to: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface IngestionJob {
  id: string
  type: string
  status: "pending" | "running" | "completed" | "failed" | "retrying" | "cancelled" | "dead_letter"
  payload: Record<string, unknown>
  attempts: number
  max_attempts: number
  priority: number
  created_at: string
  started_at: string | null
  completed_at: string | null
  next_retry_at: string | null
  error_message: string | null
  error_details: Record<string, unknown> | null
  created_by: string | null
}

// Search types
export interface SearchResult {
  id: string
  type: EntityType
  title: string
  description: string | null
  slug: string
  url: string
  icon_url?: string | null
  metadata?: Record<string, unknown>
  score?: number
}

export interface SearchResponse {
  results: SearchResult[]
  total: number
  query: string
  took_ms: number
  grouped?: Record<string, SearchResult[]>
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

// Phase 4.1 — Knowledge Graph + Understand Engine

export type ExplanationType = 'quick' | 'simple' | 'beginner' | 'technical' | 'architect'

export type RelationshipType =
  | 'RELATED_TO' | 'DEPENDS_ON' | 'PART_OF' | 'USES' | 'IMPLEMENTS'
  | 'ALTERNATIVE_TO' | 'COMPETES_WITH' | 'BUILT_BY' | 'MAINTAINED_BY' | 'CREATED_BY'
  | 'INTEGRATES_WITH' | 'USED_BY' | 'MENTIONED_IN' | 'EXPLAINED_BY' | 'COVERED_BY'
  | 'COMPARED_WITH' | 'RELEVANT_TO'

export interface TechnologyExplanation {
  id: string
  technology_id: string
  explanation_type: ExplanationType
  title: string | null
  content: string
  status: 'draft' | 'in_review' | 'approved' | 'published' | 'archived'
  version: number
  generated_by: 'ai' | 'editor' | 'import' | null
  reviewed_by: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface EntityRelationship {
  id: string
  source_entity_type: string
  source_entity_id: string
  target_entity_type: string
  target_entity_id: string
  relationship_type: RelationshipType
  weight: number
  confidence: number
  source: string | null
  source_url: string | null
  created_by: string | null
  created_by_type: 'editor' | 'system' | 'ai' | null
  verified: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export interface EntityAlias {
  id: string
  entity_type: string
  entity_id: string
  alias: string
  normalized_alias: string
  created_at: string
}

export interface TechnologyWithRelations extends Technology {
  explanations: Partial<Record<ExplanationType, TechnologyExplanation>>
  prerequisites: Technology[]
  next_concepts: Technology[]
  related_tools: Tool[]
  related_companies: Company[]
  related_news: NewsItem[]
  related_comparisons: Comparison[]
}

export interface EntitySearchResult {
  id: string
  entity_type: string
  name: string
  slug: string
  description: string | null
  url: string
}

// SEO
export interface SEOMeta {
  title: string
  description: string
  canonical?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  noIndex?: boolean
  structuredData?: Record<string, unknown>
}

// Revision
export interface Revision {
  id: string
  content_type: string
  content_id: string
  version: number
  snapshot: Record<string, unknown>
  change_summary: string | null
  created_by: string | null
  created_at: string
}


// Phase 3 types

export interface Job {
  id: string
  queue_name: string
  job_type: string
  payload: Record<string, unknown>
  status: "queued" | "running" | "completed" | "retrying" | "failed" | "dead_lettered" | "cancelled"
  priority: number
  attempts: number
  max_attempts: number
  idempotency_key: string | null
  scheduled_at: string
  started_at: string | null
  completed_at: string | null
  failed_at: string | null
  error_code: string | null
  error_message: string | null
  last_error: string | null
  created_by: string | null
  created_at: string
}

export interface JobAttempt {
  id: string
  job_id: string
  attempt_number: number
  started_at: string
  completed_at: string | null
  status: "running" | "completed" | "failed"
  error: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface SourceItem {
  id: string
  source_id: string
  external_id: string | null
  raw_url: string | null
  canonical_url: string | null
  title: string | null
  description: string | null
  content: string | null
  author: string | null
  content_hash: string | null
  raw_content: string | null
  source_published_at: string | null
  content_type: "news" | "tool" | "technology" | "company" | "interview" | "article" | "status" | "other"
  processing_status: "discovered" | "normalized" | "duplicate" | "enriching" | "ready_for_review" | "processed" | "failed"
  raw_payload: Record<string, unknown> | null
  metadata: Record<string, unknown> | null
  discovered_at: string
  duplicate_of: string | null
  editorial_priority: "high" | "medium" | "low" | null
  error_message: string | null
  created_at: string
  updated_at: string
}

export interface ToolChangeEvent {
  id: string
  tool_id: string
  field_name: string
  old_value: string | null
  new_value: string | null
  source_id: string | null
  detected_at: string
  verified_at: string | null
  verification_status: "pending" | "verified" | "rejected" | "auto_accepted"
  verified_by: string | null
  auto_applied: boolean
  created_at: string
}

export interface RefreshPolicy {
  id: string
  entity_type: string
  field_group: string
  refresh_interval_seconds: number
  priority: number
  enabled: boolean
  created_at: string
  updated_at: string
}

export interface ContentRevision {
  id: string
  content_type: string
  content_id: string
  version: number
  snapshot: Record<string, unknown>
  change_summary: string | null
  created_by: string | null
  created_at: string
}

export interface Notification {
  id: string
  rule_id: string | null
  user_id: string
  title: string
  body: string | null
  event_type: string
  entity_type: string | null
  entity_id: string | null
  read_at: string | null
  created_at: string
}

export interface NotificationRule {
  id: string
  name: string
  event_type: string
  conditions: Record<string, unknown>
  channels: string[]
  enabled: boolean
  created_at: string
  updated_at: string
}

export interface StatusUpdate {
  id: string
  incident_id: string
  external_update_id: string | null
  status: string
  message: string
  published_at: string | null
  raw_payload: Record<string, unknown> | null
  created_at: string
}
