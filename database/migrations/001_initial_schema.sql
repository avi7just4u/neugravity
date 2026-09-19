-- NeuGravity Initial Schema
-- Migration: 001_initial_schema.sql
-- Description: Core database schema for the NeuGravity platform.
--              Run against a Supabase (PostgreSQL 15+) instance.

-- ============================================================
-- Extensions
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- Utility functions
-- ============================================================

-- Automatically update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================
-- USERS (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id                    uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username              text        UNIQUE,
  display_name          text,
  bio                   text,
  avatar_url            text,
  website_url           text,
  twitter_handle        text,
  linkedin_url          text,
  role                  text        NOT NULL DEFAULT 'user'
                          CHECK (role IN ('user','author','reviewer','editor','course_manager','community_moderator','analyst','admin','super_admin')),
  status                text        NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active','suspended','deleted')),
  email_verified        boolean     NOT NULL DEFAULT false,
  onboarding_completed  boolean     NOT NULL DEFAULT false,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- AUTHORS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.authors (
  id              uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         uuid        REFERENCES public.users(id) ON DELETE SET NULL,
  name            text        NOT NULL,
  slug            text        UNIQUE NOT NULL,
  bio             text,
  avatar_url      text,
  website_url     text,
  twitter_handle  text,
  linkedin_url    text,
  expertise       text[],
  featured        boolean     NOT NULL DEFAULT false,
  article_count   int         NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS authors_slug_idx ON public.authors(slug);
CREATE INDEX IF NOT EXISTS authors_user_id_idx ON public.authors(user_id);

CREATE TRIGGER authors_updated_at
  BEFORE UPDATE ON public.authors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        text        NOT NULL,
  slug        text        UNIQUE NOT NULL,
  description text,
  parent_id   uuid        REFERENCES public.categories(id) ON DELETE SET NULL,
  icon        text,
  color       text,
  sort_order  int         NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS categories_slug_idx ON public.categories(slug);
CREATE INDEX IF NOT EXISTS categories_parent_id_idx ON public.categories(parent_id);

-- ============================================================
-- TAGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tags (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        text        NOT NULL,
  slug        text        UNIQUE NOT NULL,
  description text,
  usage_count int         NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tags_slug_idx ON public.tags(slug);
CREATE INDEX IF NOT EXISTS tags_usage_count_idx ON public.tags(usage_count DESC);

-- ============================================================
-- COMPANIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.companies (
  id                  uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                text        NOT NULL,
  slug                text        UNIQUE NOT NULL,
  description         text,
  long_description    text,
  logo_url            text,
  hero_image_url      text,
  website_url         text,
  founded_year        int,
  headquarters        text,
  employee_count_range text,
  company_type        text        CHECK (company_type IN ('public','private','nonprofit','government','open_source')),
  stock_symbol        text,
  linkedin_url        text,
  twitter_handle      text,
  github_url          text,
  category_id         uuid        REFERENCES public.categories(id),
  status              text        NOT NULL DEFAULT 'active',
  featured            boolean     NOT NULL DEFAULT false,
  verified            boolean     NOT NULL DEFAULT false,
  published           boolean     NOT NULL DEFAULT false,
  seo_title           text,
  seo_description     text,
  last_verified_at    timestamptz,
  search_vector       tsvector,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS companies_slug_idx ON public.companies(slug);
CREATE INDEX IF NOT EXISTS companies_published_idx ON public.companies(published);
CREATE INDEX IF NOT EXISTS companies_featured_idx ON public.companies(featured);
CREATE INDEX IF NOT EXISTS companies_search_vector_idx ON public.companies USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS companies_name_trgm_idx ON public.companies USING GIN(name gin_trgm_ops);

CREATE TRIGGER companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Search vector trigger for companies
CREATE OR REPLACE FUNCTION companies_search_vector_update()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector = to_tsvector('english',
    coalesce(NEW.name, '') || ' ' ||
    coalesce(NEW.description, '') || ' ' ||
    coalesce(NEW.long_description, '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER companies_search_vector_trigger
  BEFORE INSERT OR UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION companies_search_vector_update();

-- ============================================================
-- PEOPLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.people (
  id                  uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                text        NOT NULL,
  slug                text        UNIQUE NOT NULL,
  bio                 text,
  avatar_url          text,
  website_url         text,
  twitter_handle      text,
  linkedin_url        text,
  github_handle       text,
  current_company_id  uuid        REFERENCES public.companies(id) ON DELETE SET NULL,
  current_role        text,
  known_for           text,
  tags                text[],
  featured            boolean     NOT NULL DEFAULT false,
  published           boolean     NOT NULL DEFAULT false,
  verified            boolean     NOT NULL DEFAULT false,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS people_slug_idx ON public.people(slug);
CREATE INDEX IF NOT EXISTS people_current_company_id_idx ON public.people(current_company_id);

CREATE TRIGGER people_updated_at
  BEFORE UPDATE ON public.people
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TECHNOLOGIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.technologies (
  id               uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             text        NOT NULL,
  slug             text        UNIQUE NOT NULL,
  tagline          text,
  description      text,
  long_description text,
  type             text        CHECK (type IN ('language','framework','platform','protocol','concept','tool','database','cloud','ai','infrastructure','other')),
  category_id      uuid        REFERENCES public.categories(id),
  icon_url         text,
  logo_url         text,
  hero_image_url   text,
  website_url      text,
  docs_url         text,
  github_url       text,
  wikipedia_url    text,
  created_year     int,
  creator          text,
  maintained_by    text,
  license          text,
  open_source      boolean,
  status           text        NOT NULL DEFAULT 'active'
                     CHECK (status IN ('active','deprecated','experimental','archived')),
  difficulty       text        CHECK (difficulty IN ('beginner','intermediate','advanced','expert')),
  popularity_score int         NOT NULL DEFAULT 0,
  trending_score   int         NOT NULL DEFAULT 0,
  seo_title        text,
  seo_description  text,
  published        boolean     NOT NULL DEFAULT false,
  featured         boolean     NOT NULL DEFAULT false,
  verified         boolean     NOT NULL DEFAULT false,
  last_verified_at timestamptz,
  search_vector    tsvector,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS technologies_slug_idx ON public.technologies(slug);
CREATE INDEX IF NOT EXISTS technologies_type_idx ON public.technologies(type);
CREATE INDEX IF NOT EXISTS technologies_status_idx ON public.technologies(status);
CREATE INDEX IF NOT EXISTS technologies_published_idx ON public.technologies(published);
CREATE INDEX IF NOT EXISTS technologies_featured_idx ON public.technologies(featured);
CREATE INDEX IF NOT EXISTS technologies_popularity_idx ON public.technologies(popularity_score DESC);
CREATE INDEX IF NOT EXISTS technologies_trending_idx ON public.technologies(trending_score DESC);
CREATE INDEX IF NOT EXISTS technologies_search_vector_idx ON public.technologies USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS technologies_name_trgm_idx ON public.technologies USING GIN(name gin_trgm_ops);

CREATE TRIGGER technologies_updated_at
  BEFORE UPDATE ON public.technologies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION technologies_search_vector_update()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector = to_tsvector('english',
    coalesce(NEW.name, '') || ' ' ||
    coalesce(NEW.tagline, '') || ' ' ||
    coalesce(NEW.description, '') || ' ' ||
    coalesce(NEW.long_description, '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER technologies_search_vector_trigger
  BEFORE INSERT OR UPDATE ON public.technologies
  FOR EACH ROW EXECUTE FUNCTION technologies_search_vector_update();

-- ============================================================
-- TECHNOLOGY RELATIONSHIPS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.technology_relationships (
  id                  uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_technology_id  uuid        NOT NULL REFERENCES public.technologies(id) ON DELETE CASCADE,
  to_technology_id    uuid        NOT NULL REFERENCES public.technologies(id) ON DELETE CASCADE,
  relationship_type   text        NOT NULL
                        CHECK (relationship_type IN ('related_to','competes_with','built_on','integrates_with','successor_of','predecessor_of','part_of','used_with')),
  strength            int         NOT NULL DEFAULT 5 CHECK (strength BETWEEN 1 AND 10),
  created_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE(from_technology_id, to_technology_id, relationship_type)
);

CREATE INDEX IF NOT EXISTS tech_rel_from_idx ON public.technology_relationships(from_technology_id);
CREATE INDEX IF NOT EXISTS tech_rel_to_idx ON public.technology_relationships(to_technology_id);

-- ============================================================
-- TECHNOLOGY TAGS (junction)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.technology_tags (
  technology_id uuid NOT NULL REFERENCES public.technologies(id) ON DELETE CASCADE,
  tag_id        uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (technology_id, tag_id)
);

-- ============================================================
-- COMPANY TECHNOLOGIES (junction)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.company_technologies (
  id                uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id        uuid        NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  technology_id     uuid        NOT NULL REFERENCES public.technologies(id) ON DELETE CASCADE,
  relationship_type text        CHECK (relationship_type IN ('builds','uses','owns','acquires','open_sources','invests_in')),
  created_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE(company_id, technology_id, relationship_type)
);

CREATE INDEX IF NOT EXISTS company_tech_company_idx ON public.company_technologies(company_id);
CREATE INDEX IF NOT EXISTS company_tech_tech_idx ON public.company_technologies(technology_id);

-- ============================================================
-- TOOLS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tools (
  id                   uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                 text        NOT NULL,
  slug                 text        UNIQUE NOT NULL,
  tagline              text,
  description          text,
  long_description     text,
  icon_url             text,
  logo_url             text,
  hero_image_url       text,
  website_url          text,
  docs_url             text,
  github_url           text,
  app_store_url        text,
  play_store_url       text,
  category_id          uuid        REFERENCES public.categories(id),
  company_id           uuid        REFERENCES public.companies(id),
  tool_type            text        CHECK (tool_type IN ('saas','open_source','desktop','mobile','api','library','framework','cli','browser_extension','plugin','platform','other')),
  platforms            text[],
  pricing_model        text        CHECK (pricing_model IN ('free','freemium','paid','open_source','enterprise','subscription','usage_based','one_time')),
  has_free_tier        boolean     NOT NULL DEFAULT false,
  has_api              boolean     NOT NULL DEFAULT false,
  enterprise_available boolean     NOT NULL DEFAULT false,
  status               text        NOT NULL DEFAULT 'active'
                         CHECK (status IN ('active','beta','deprecated','discontinued')),
  featured             boolean     NOT NULL DEFAULT false,
  verified             boolean     NOT NULL DEFAULT false,
  published            boolean     NOT NULL DEFAULT false,
  trending_score       int         NOT NULL DEFAULT 0,
  popularity_score     int         NOT NULL DEFAULT 0,
  rating_average       numeric(3,2),
  rating_count         int         NOT NULL DEFAULT 0,
  seo_title            text,
  seo_description      text,
  last_verified_at     timestamptz,
  search_vector        tsvector,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tools_slug_idx ON public.tools(slug);
CREATE INDEX IF NOT EXISTS tools_category_id_idx ON public.tools(category_id);
CREATE INDEX IF NOT EXISTS tools_company_id_idx ON public.tools(company_id);
CREATE INDEX IF NOT EXISTS tools_status_idx ON public.tools(status);
CREATE INDEX IF NOT EXISTS tools_published_idx ON public.tools(published);
CREATE INDEX IF NOT EXISTS tools_featured_idx ON public.tools(featured);
CREATE INDEX IF NOT EXISTS tools_pricing_model_idx ON public.tools(pricing_model);
CREATE INDEX IF NOT EXISTS tools_search_vector_idx ON public.tools USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS tools_name_trgm_idx ON public.tools USING GIN(name gin_trgm_ops);

CREATE TRIGGER tools_updated_at
  BEFORE UPDATE ON public.tools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION tools_search_vector_update()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector = to_tsvector('english',
    coalesce(NEW.name, '') || ' ' ||
    coalesce(NEW.tagline, '') || ' ' ||
    coalesce(NEW.description, '') || ' ' ||
    coalesce(NEW.long_description, '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER tools_search_vector_trigger
  BEFORE INSERT OR UPDATE ON public.tools
  FOR EACH ROW EXECUTE FUNCTION tools_search_vector_update();

-- ============================================================
-- TOOL PRICING
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tool_pricing (
  id               uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id          uuid        NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  plan_name        text        NOT NULL,
  price_monthly    numeric(10,2),
  price_annual     numeric(10,2),
  price_currency   text        NOT NULL DEFAULT 'USD',
  features         text[],
  limits           jsonb,
  is_free          boolean     NOT NULL DEFAULT false,
  is_most_popular  boolean     NOT NULL DEFAULT false,
  source_url       text,
  last_verified_at timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tool_pricing_tool_id_idx ON public.tool_pricing(tool_id);

-- ============================================================
-- TOOL FEATURES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tool_features (
  id                uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id           uuid        NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  feature_name      text        NOT NULL,
  description       text,
  category          text,
  available_on_free boolean     NOT NULL DEFAULT false,
  sort_order        int         NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS tool_features_tool_id_idx ON public.tool_features(tool_id);

-- ============================================================
-- TOOL INTEGRATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tool_integrations (
  id                   uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id              uuid        NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  integration_tool_id  uuid        REFERENCES public.tools(id),
  integration_name     text,
  integration_url      text,
  official             boolean     NOT NULL DEFAULT false,
  created_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tool_integrations_tool_id_idx ON public.tool_integrations(tool_id);

-- ============================================================
-- TOOL TECHNOLOGIES (junction)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tool_technologies (
  tool_id       uuid NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  technology_id uuid NOT NULL REFERENCES public.technologies(id) ON DELETE CASCADE,
  PRIMARY KEY (tool_id, technology_id)
);

-- ============================================================
-- ARTICLES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.articles (
  id                    uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title                 text        NOT NULL,
  slug                  text        UNIQUE NOT NULL,
  subtitle              text,
  excerpt               text,
  body                  text,
  hero_image_url        text,
  author_id             uuid        REFERENCES public.authors(id),
  category_id           uuid        REFERENCES public.categories(id),
  status                text        NOT NULL DEFAULT 'draft'
                           CHECK (status IN ('draft','in_review','approved','scheduled','published','archived')),
  published_at          timestamptz,
  scheduled_publish_at  timestamptz,
  seo_title             text,
  seo_description       text,
  canonical_url         text,
  reading_time_minutes  int,
  featured              boolean     NOT NULL DEFAULT false,
  featured_order        int,
  allow_comments        boolean     NOT NULL DEFAULT true,
  view_count            int         NOT NULL DEFAULT 0,
  share_count           int         NOT NULL DEFAULT 0,
  seo_score             int,
  structured_data       jsonb,
  search_vector         tsvector,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS articles_slug_idx ON public.articles(slug);
CREATE INDEX IF NOT EXISTS articles_status_published_idx ON public.articles(status, published_at DESC);
CREATE INDEX IF NOT EXISTS articles_author_id_idx ON public.articles(author_id);
CREATE INDEX IF NOT EXISTS articles_category_id_idx ON public.articles(category_id);
CREATE INDEX IF NOT EXISTS articles_featured_idx ON public.articles(featured, featured_order);
CREATE INDEX IF NOT EXISTS articles_search_vector_idx ON public.articles USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS articles_title_trgm_idx ON public.articles USING GIN(title gin_trgm_ops);

CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION articles_search_vector_update()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector = to_tsvector('english',
    coalesce(NEW.title, '') || ' ' ||
    coalesce(NEW.subtitle, '') || ' ' ||
    coalesce(NEW.excerpt, '') || ' ' ||
    coalesce(NEW.body, '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER articles_search_vector_trigger
  BEFORE INSERT OR UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION articles_search_vector_update();

-- ============================================================
-- ARTICLE TAGS (junction)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.article_tags (
  article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  tag_id     uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- ============================================================
-- ARTICLE ENTITIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.article_entities (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id  uuid        NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  entity_type text        NOT NULL
                CHECK (entity_type IN ('technology','tool','company','person','course','comparison')),
  entity_id   uuid        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS article_entities_article_id_idx ON public.article_entities(article_id);
CREATE INDEX IF NOT EXISTS article_entities_entity_idx ON public.article_entities(entity_type, entity_id);

-- ============================================================
-- SOURCES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.sources (
  id                      uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                    text        NOT NULL,
  domain                  text        UNIQUE NOT NULL,
  source_type             text        NOT NULL
                            CHECK (source_type IN ('official_company','official_blog','rss','api','news','youtube','manual','community')),
  rss_url                 text,
  api_endpoint            text,
  feed_enabled            boolean     NOT NULL DEFAULT true,
  trust_level             int         NOT NULL DEFAULT 5 CHECK (trust_level BETWEEN 1 AND 10),
  active                  boolean     NOT NULL DEFAULT true,
  last_fetched_at         timestamptz,
  fetch_frequency_minutes int         NOT NULL DEFAULT 60,
  robots_status           text        NOT NULL DEFAULT 'unknown'
                            CHECK (robots_status IN ('unknown','allowed','disallowed','restricted')),
  notes                   text,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sources_domain_idx ON public.sources(domain);
CREATE INDEX IF NOT EXISTS sources_active_idx ON public.sources(active);

CREATE TRIGGER sources_updated_at
  BEFORE UPDATE ON public.sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- SOURCE ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.source_items (
  id            uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id     uuid        REFERENCES public.sources(id),
  raw_url       text        NOT NULL,
  canonical_url text,
  title         text,
  content_hash  text,
  raw_content   text,
  metadata      jsonb,
  discovered_at timestamptz NOT NULL DEFAULT now(),
  fetched_at    timestamptz NOT NULL DEFAULT now(),
  status        text        NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','processing','processed','duplicate','rejected','failed')),
  duplicate_of  uuid        REFERENCES public.source_items(id),
  error_message text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS source_items_source_id_idx ON public.source_items(source_id);
CREATE INDEX IF NOT EXISTS source_items_status_idx ON public.source_items(status);
CREATE INDEX IF NOT EXISTS source_items_canonical_url_idx ON public.source_items(canonical_url);
CREATE INDEX IF NOT EXISTS source_items_content_hash_idx ON public.source_items(content_hash);
CREATE INDEX IF NOT EXISTS source_items_raw_url_idx ON public.source_items(raw_url);

-- ============================================================
-- STORY CLUSTERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.story_clusters (
  id                      uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title                   text,
  slug                    text        UNIQUE,
  primary_source_item_id  uuid        REFERENCES public.source_items(id),
  importance              int         NOT NULL DEFAULT 5 CHECK (importance BETWEEN 1 AND 10),
  status                  text        NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending','draft','review','approved','published','rejected')),
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS story_clusters_status_idx ON public.story_clusters(status);

CREATE TRIGGER story_clusters_updated_at
  BEFORE UPDATE ON public.story_clusters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- STORY CLUSTER SOURCES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.story_cluster_sources (
  id              uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  cluster_id      uuid        NOT NULL REFERENCES public.story_clusters(id) ON DELETE CASCADE,
  source_item_id  uuid        REFERENCES public.source_items(id),
  is_primary      boolean     NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS story_cluster_sources_cluster_id_idx ON public.story_cluster_sources(cluster_id);

-- ============================================================
-- NEWS ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.news_items (
  id                    uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  headline              text        NOT NULL,
  slug                  text        UNIQUE NOT NULL,
  summary               text,
  body                  text,
  hero_image_url        text,
  author_id             uuid        REFERENCES public.authors(id),
  cluster_id            uuid        REFERENCES public.story_clusters(id),
  category_id           uuid        REFERENCES public.categories(id),
  status                text        NOT NULL DEFAULT 'draft'
                           CHECK (status IN ('draft','in_review','approved','scheduled','published','archived')),
  importance            int         NOT NULL DEFAULT 5 CHECK (importance BETWEEN 1 AND 10),
  published_at          timestamptz,
  scheduled_publish_at  timestamptz,
  source_published_at   timestamptz,
  discovered_at         timestamptz NOT NULL DEFAULT now(),
  last_verified_at      timestamptz,
  seo_title             text,
  seo_description       text,
  canonical_url         text,
  view_count            int         NOT NULL DEFAULT 0,
  featured              boolean     NOT NULL DEFAULT false,
  needs_verification    boolean     NOT NULL DEFAULT false,
  seo_score             int,
  structured_data       jsonb,
  search_vector         tsvector,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS news_items_slug_idx ON public.news_items(slug);
CREATE INDEX IF NOT EXISTS news_items_status_published_idx ON public.news_items(status, published_at DESC);
CREATE INDEX IF NOT EXISTS news_items_importance_idx ON public.news_items(importance DESC);
CREATE INDEX IF NOT EXISTS news_items_featured_idx ON public.news_items(featured, published_at DESC);
CREATE INDEX IF NOT EXISTS news_items_cluster_id_idx ON public.news_items(cluster_id);
CREATE INDEX IF NOT EXISTS news_items_search_vector_idx ON public.news_items USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS news_items_headline_trgm_idx ON public.news_items USING GIN(headline gin_trgm_ops);

CREATE TRIGGER news_items_updated_at
  BEFORE UPDATE ON public.news_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION news_items_search_vector_update()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector = to_tsvector('english',
    coalesce(NEW.headline, '') || ' ' ||
    coalesce(NEW.summary, '') || ' ' ||
    coalesce(NEW.body, '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER news_items_search_vector_trigger
  BEFORE INSERT OR UPDATE ON public.news_items
  FOR EACH ROW EXECUTE FUNCTION news_items_search_vector_update();

-- ============================================================
-- NEWS SOURCES (provenance)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.news_sources (
  id                  uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  news_item_id        uuid        NOT NULL REFERENCES public.news_items(id) ON DELETE CASCADE,
  source_id           uuid        REFERENCES public.sources(id),
  source_url          text        NOT NULL,
  source_title        text,
  source_published_at timestamptz,
  retrieved_at        timestamptz NOT NULL DEFAULT now(),
  is_primary          boolean     NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS news_sources_news_item_id_idx ON public.news_sources(news_item_id);

-- ============================================================
-- NEWS ENTITIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.news_entities (
  id            uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  news_item_id  uuid        NOT NULL REFERENCES public.news_items(id) ON DELETE CASCADE,
  entity_type   text        NOT NULL CHECK (entity_type IN ('technology','tool','company','person')),
  entity_id     uuid,
  entity_name   text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS news_entities_news_item_id_idx ON public.news_entities(news_item_id);
CREATE INDEX IF NOT EXISTS news_entities_entity_idx ON public.news_entities(entity_type, entity_id);

-- ============================================================
-- NEWS TAGS (junction)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.news_tags (
  news_item_id uuid NOT NULL REFERENCES public.news_items(id) ON DELETE CASCADE,
  tag_id       uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (news_item_id, tag_id)
);

-- ============================================================
-- CLAIMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.claims (
  id              uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type    text        NOT NULL,
  content_id      uuid        NOT NULL,
  claim_text      text        NOT NULL,
  source_url      text        NOT NULL,
  source_name     text,
  published_at    timestamptz,
  retrieved_at    timestamptz NOT NULL DEFAULT now(),
  confidence      text        CHECK (confidence IN ('high','medium','low','uncertain')),
  editor_verified boolean     NOT NULL DEFAULT false,
  verified_by     uuid        REFERENCES public.users(id),
  verified_at     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS claims_content_idx ON public.claims(content_type, content_id);

-- ============================================================
-- INGESTION JOBS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ingestion_jobs (
  id             uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  type           text        NOT NULL
                   CHECK (type IN ('INGEST_SOURCE','FETCH_ITEM','EXTRACT_CONTENT','NORMALIZE_ITEM','DEDUP_ITEM','ENRICH_ITEM','GENERATE_SUMMARY','EXTRACT_ENTITIES','GENERATE_DRAFT','UPDATE_ENTITY','REFRESH_TOOL','CHECK_OUTAGE','GENERATE_EMBEDDING','UPDATE_SEARCH_INDEX','PUBLISH_CONTENT','INVALIDATE_CACHE')),
  status         text        NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','running','completed','failed','retrying','cancelled','dead_letter')),
  payload        jsonb       NOT NULL DEFAULT '{}',
  attempts       int         NOT NULL DEFAULT 0,
  max_attempts   int         NOT NULL DEFAULT 3,
  priority       int         NOT NULL DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  created_at     timestamptz NOT NULL DEFAULT now(),
  started_at     timestamptz,
  completed_at   timestamptz,
  next_retry_at  timestamptz,
  error_message  text,
  error_details  jsonb,
  created_by     uuid        REFERENCES public.users(id)
);

CREATE INDEX IF NOT EXISTS ingestion_jobs_status_priority_idx ON public.ingestion_jobs(status, priority DESC, created_at);
CREATE INDEX IF NOT EXISTS ingestion_jobs_type_status_idx ON public.ingestion_jobs(type, status);
CREATE INDEX IF NOT EXISTS ingestion_jobs_next_retry_idx ON public.ingestion_jobs(next_retry_at) WHERE status = 'retrying';

-- ============================================================
-- AI GENERATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_generations (
  id                uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type      text        NOT NULL,
  content_id        uuid,
  generation_type   text        NOT NULL
                      CHECK (generation_type IN ('summary','headline','tags','entities','draft','explanation','seo','embedding','categorization')),
  prompt_tokens     int,
  completion_tokens int,
  model             text        NOT NULL,
  provider          text        NOT NULL DEFAULT 'openai',
  generated_content jsonb       NOT NULL,
  approved          boolean,
  approved_by       uuid        REFERENCES public.users(id),
  approved_at       timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_generations_content_idx ON public.ai_generations(content_type, content_id);
CREATE INDEX IF NOT EXISTS ai_generations_approved_idx ON public.ai_generations(approved);

-- ============================================================
-- COMPARISONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.comparisons (
  id               uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            text        NOT NULL,
  slug             text        UNIQUE NOT NULL,
  description      text,
  status           text        NOT NULL DEFAULT 'draft'
                     CHECK (status IN ('draft','published','archived')),
  featured         boolean     NOT NULL DEFAULT false,
  view_count       int         NOT NULL DEFAULT 0,
  seo_title        text,
  seo_description  text,
  last_verified_at timestamptz,
  published_at     timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS comparisons_slug_idx ON public.comparisons(slug);
CREATE INDEX IF NOT EXISTS comparisons_status_idx ON public.comparisons(status);

CREATE TRIGGER comparisons_updated_at
  BEFORE UPDATE ON public.comparisons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- COMPARISON ENTITIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.comparison_entities (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  comparison_id  uuid NOT NULL REFERENCES public.comparisons(id) ON DELETE CASCADE,
  entity_type    text NOT NULL CHECK (entity_type IN ('tool','technology','company')),
  entity_id      uuid NOT NULL,
  sort_order     int  NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS comparison_entities_comparison_id_idx ON public.comparison_entities(comparison_id);

-- ============================================================
-- COMPARISON DIMENSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.comparison_dimensions (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           text UNIQUE NOT NULL,
  slug           text UNIQUE NOT NULL,
  description    text,
  dimension_type text CHECK (dimension_type IN ('boolean','text','rating','list','price')),
  category       text,
  sort_order     int  NOT NULL DEFAULT 0
);

-- ============================================================
-- COMPARISON VALUES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.comparison_values (
  id               uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  comparison_id    uuid        NOT NULL REFERENCES public.comparisons(id) ON DELETE CASCADE,
  entity_id        uuid        NOT NULL,
  dimension_id     uuid        NOT NULL REFERENCES public.comparison_dimensions(id) ON DELETE CASCADE,
  value_text       text,
  value_boolean    boolean,
  value_rating     int,
  value_list       text[],
  source_url       text,
  last_verified_at timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE(comparison_id, entity_id, dimension_id)
);

CREATE INDEX IF NOT EXISTS comparison_values_comparison_id_idx ON public.comparison_values(comparison_id);

CREATE TRIGGER comparison_values_updated_at
  BEFORE UPDATE ON public.comparison_values
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- COURSES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.courses (
  id               uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            text        NOT NULL,
  slug             text        UNIQUE NOT NULL,
  description      text,
  long_description text,
  outcome          text,
  thumbnail_url    text,
  instructor_id    uuid        REFERENCES public.authors(id),
  category_id      uuid        REFERENCES public.categories(id),
  difficulty       text        CHECK (difficulty IN ('beginner','intermediate','advanced','expert')),
  estimated_hours  numeric(6,2),
  price            numeric(10,2),
  price_currency   text        NOT NULL DEFAULT 'USD',
  status           text        NOT NULL DEFAULT 'draft'
                     CHECK (status IN ('draft','published','archived')),
  featured         boolean     NOT NULL DEFAULT false,
  published_at     timestamptz,
  seo_title        text,
  seo_description  text,
  view_count       int         NOT NULL DEFAULT 0,
  enrollment_count int         NOT NULL DEFAULT 0,
  rating_average   numeric(3,2),
  rating_count     int         NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS courses_slug_idx ON public.courses(slug);
CREATE INDEX IF NOT EXISTS courses_status_idx ON public.courses(status);
CREATE INDEX IF NOT EXISTS courses_featured_idx ON public.courses(featured);

CREATE TRIGGER courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- COURSE MODULES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.course_modules (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id   uuid        NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title       text        NOT NULL,
  description text,
  sort_order  int         NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS course_modules_course_id_idx ON public.course_modules(course_id);

-- ============================================================
-- LESSONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lessons (
  id                    uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id             uuid        NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  title                 text        NOT NULL,
  description           text,
  lesson_type           text        NOT NULL
                          CHECK (lesson_type IN ('video','article','interactive','quiz','assignment','project')),
  content               text,
  video_url             text,
  video_duration_seconds int,
  sort_order            int         NOT NULL DEFAULT 0,
  is_preview            boolean     NOT NULL DEFAULT false,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lessons_module_id_idx ON public.lessons(module_id);

CREATE TRIGGER lessons_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- QUIZZES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.quizzes (
  id                 uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id          uuid        NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  title              text        NOT NULL,
  passing_score      int         NOT NULL DEFAULT 70,
  time_limit_minutes int,
  created_at         timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- QUIZ QUESTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id            uuid    PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id       uuid    NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text text    NOT NULL,
  question_type text    CHECK (question_type IN ('single_choice','multiple_choice','true_false','short_answer')),
  options       jsonb,
  correct_answer jsonb,
  explanation   text,
  points        int     NOT NULL DEFAULT 1,
  sort_order    int     NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS quiz_questions_quiz_id_idx ON public.quiz_questions(quiz_id);

-- ============================================================
-- LEARNING PATHS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.learning_paths (
  id               uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            text        NOT NULL,
  slug             text        UNIQUE NOT NULL,
  description      text,
  difficulty       text        CHECK (difficulty IN ('beginner','intermediate','advanced','expert')),
  estimated_hours  numeric(6,2),
  career_outcomes  text[],
  thumbnail_url    text,
  featured         boolean     NOT NULL DEFAULT false,
  published        boolean     NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER learning_paths_updated_at
  BEFORE UPDATE ON public.learning_paths
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- LEARNING PATH COURSES (junction)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.learning_path_courses (
  id               uuid    PRIMARY KEY DEFAULT uuid_generate_v4(),
  learning_path_id uuid    NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  course_id        uuid    NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  sort_order       int     NOT NULL DEFAULT 0,
  is_required      boolean NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS lp_courses_path_id_idx ON public.learning_path_courses(learning_path_id);

-- ============================================================
-- COURSE ENROLLMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id           uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id    uuid        NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  status       text        NOT NULL DEFAULT 'active'
                 CHECK (status IN ('active','completed','refunded','paused')),
  enrolled_at  timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  payment_id   uuid,
  UNIQUE(user_id, course_id)
);

CREATE INDEX IF NOT EXISTS course_enrollments_user_id_idx ON public.course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS course_enrollments_course_id_idx ON public.course_enrollments(course_id);

-- ============================================================
-- LESSON PROGRESS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id                     uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lesson_id              uuid        NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  status                 text        NOT NULL DEFAULT 'not_started'
                           CHECK (status IN ('not_started','in_progress','completed')),
  progress_percent       int         NOT NULL DEFAULT 0,
  completed_at           timestamptz,
  video_position_seconds int         NOT NULL DEFAULT 0,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS lesson_progress_user_id_idx ON public.lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS lesson_progress_lesson_id_idx ON public.lesson_progress(lesson_id);

CREATE TRIGGER lesson_progress_updated_at
  BEFORE UPDATE ON public.lesson_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- INTERVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.interviews (
  id               uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            text        NOT NULL,
  slug             text        UNIQUE NOT NULL,
  description      text,
  guest_id         uuid        REFERENCES public.people(id),
  guest_company_id uuid        REFERENCES public.companies(id),
  guest_role       text,
  video_url        text,
  youtube_video_id text,
  thumbnail_url    text,
  transcript       text,
  published_at     timestamptz,
  duration_seconds int,
  status           text        NOT NULL DEFAULT 'draft'
                     CHECK (status IN ('draft','published','archived')),
  featured         boolean     NOT NULL DEFAULT false,
  view_count       int         NOT NULL DEFAULT 0,
  seo_title        text,
  seo_description  text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS interviews_slug_idx ON public.interviews(slug);
CREATE INDEX IF NOT EXISTS interviews_status_idx ON public.interviews(status, published_at DESC);

CREATE TRIGGER interviews_updated_at
  BEFORE UPDATE ON public.interviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- INTERVIEW TOPICS (junction)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.interview_topics (
  interview_id uuid NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
  tag_id       uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (interview_id, tag_id)
);

-- ============================================================
-- INTERVIEW ENTITIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.interview_entities (
  id                uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  interview_id      uuid        NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
  entity_type       text        NOT NULL,
  entity_id         uuid,
  entity_name       text,
  timestamp_seconds int,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS interview_entities_interview_id_idx ON public.interview_entities(interview_id);

-- ============================================================
-- STATUS PROVIDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.status_providers (
  id                  uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                text        NOT NULL,
  slug                text        UNIQUE NOT NULL,
  category            text        CHECK (category IN ('ai','cloud','developer','infrastructure','payments','productivity','other')),
  website_url         text,
  official_status_url text,
  logo_url            text,
  active              boolean     NOT NULL DEFAULT true,
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- STATUS SERVICES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.status_services (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id uuid NOT NULL REFERENCES public.status_providers(id) ON DELETE CASCADE,
  name        text NOT NULL,
  slug        text NOT NULL,
  description text,
  UNIQUE(provider_id, slug)
);

CREATE INDEX IF NOT EXISTS status_services_provider_id_idx ON public.status_services(provider_id);

-- ============================================================
-- STATUS INCIDENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.status_incidents (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id uuid        REFERENCES public.status_providers(id),
  service_id  uuid        REFERENCES public.status_services(id),
  title       text        NOT NULL,
  description text,
  status      text        NOT NULL
                CHECK (status IN ('investigating','identified','monitoring','resolved','postmortem')),
  severity    text        CHECK (severity IN ('minor','major','critical')),
  started_at  timestamptz NOT NULL,
  resolved_at timestamptz,
  source_url  text,
  source_name text,
  checked_at  timestamptz NOT NULL DEFAULT now(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS status_incidents_provider_id_idx ON public.status_incidents(provider_id);
CREATE INDEX IF NOT EXISTS status_incidents_status_idx ON public.status_incidents(status);
CREATE INDEX IF NOT EXISTS status_incidents_started_at_idx ON public.status_incidents(started_at DESC);

CREATE TRIGGER status_incidents_updated_at
  BEFORE UPDATE ON public.status_incidents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- COMMUNITY POSTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.community_posts (
  id            uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         text        NOT NULL,
  slug          text        UNIQUE NOT NULL,
  body          text        NOT NULL,
  post_type     text        CHECK (post_type IN ('question','discussion','show_and_tell','career','architecture','tool_recommendation')),
  author_id     uuid        REFERENCES public.users(id),
  category_id   uuid        REFERENCES public.categories(id),
  status        text        NOT NULL DEFAULT 'published'
                  CHECK (status IN ('draft','published','removed','flagged')),
  view_count    int         NOT NULL DEFAULT 0,
  vote_count    int         NOT NULL DEFAULT 0,
  comment_count int         NOT NULL DEFAULT 0,
  is_pinned     boolean     NOT NULL DEFAULT false,
  is_featured   boolean     NOT NULL DEFAULT false,
  allow_indexed boolean     NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS community_posts_status_idx ON public.community_posts(status, created_at DESC);
CREATE INDEX IF NOT EXISTS community_posts_author_id_idx ON public.community_posts(author_id);

CREATE TRIGGER community_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- COMMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.comments (
  id                uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type      text        NOT NULL
                      CHECK (content_type IN ('article','news','community_post','tool','comparison')),
  content_id        uuid        NOT NULL,
  parent_comment_id uuid        REFERENCES public.comments(id),
  author_id         uuid        REFERENCES public.users(id),
  body              text        NOT NULL,
  status            text        NOT NULL DEFAULT 'published'
                      CHECK (status IN ('published','removed','flagged')),
  vote_count        int         NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS comments_content_idx ON public.comments(content_type, content_id);
CREATE INDEX IF NOT EXISTS comments_author_id_idx ON public.comments(author_id);

CREATE TRIGGER comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- VOTES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.votes (
  id           uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content_type text        NOT NULL,
  content_id   uuid        NOT NULL,
  value        int         NOT NULL CHECK (value IN (-1, 1)),
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, content_type, content_id)
);

CREATE INDEX IF NOT EXISTS votes_content_idx ON public.votes(content_type, content_id);
CREATE INDEX IF NOT EXISTS votes_user_id_idx ON public.votes(user_id);

-- ============================================================
-- REPORTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reports (
  id           uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id  uuid        REFERENCES public.users(id),
  content_type text        NOT NULL,
  content_id   uuid        NOT NULL,
  reason       text        NOT NULL,
  description  text,
  status       text        NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','reviewed','actioned','dismissed')),
  reviewed_by  uuid        REFERENCES public.users(id),
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reports_status_idx ON public.reports(status);
CREATE INDEX IF NOT EXISTS reports_content_idx ON public.reports(content_type, content_id);

-- ============================================================
-- NEWSLETTER SUBSCRIBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id         uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  email      text        UNIQUE NOT NULL,
  first_name text,
  topics     text[],
  frequency  text        NOT NULL DEFAULT 'weekly'
               CHECK (frequency IN ('daily','weekly','monthly')),
  status     text        NOT NULL DEFAULT 'active'
               CHECK (status IN ('active','unsubscribed','bounced')),
  source     text,
  consent    boolean     NOT NULL DEFAULT false,
  consent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS newsletter_subscribers_status_idx ON public.newsletter_subscribers(status);

CREATE TRIGGER newsletter_subscribers_updated_at
  BEFORE UPDATE ON public.newsletter_subscribers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ENTERPRISE LEADS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.enterprise_leads (
  id           uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name   text        NOT NULL,
  last_name    text        NOT NULL,
  email        text        NOT NULL,
  company      text        NOT NULL,
  role         text,
  company_size text,
  phone        text,
  service      text,
  message      text,
  status       text        NOT NULL DEFAULT 'new'
                 CHECK (status IN ('new','contacted','qualified','proposal','won','lost')),
  assigned_to  uuid        REFERENCES public.users(id),
  notes        text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS enterprise_leads_status_idx ON public.enterprise_leads(status);
CREATE INDEX IF NOT EXISTS enterprise_leads_assigned_to_idx ON public.enterprise_leads(assigned_to);

CREATE TRIGGER enterprise_leads_updated_at
  BEFORE UPDATE ON public.enterprise_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- REVISIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.revisions (
  id             uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type   text        NOT NULL,
  content_id     uuid        NOT NULL,
  version        int         NOT NULL,
  snapshot       jsonb       NOT NULL,
  change_summary text,
  created_by     uuid        REFERENCES public.users(id),
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS revisions_content_idx ON public.revisions(content_type, content_id, version DESC);

-- ============================================================
-- REDIRECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.redirects (
  id               uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_path      text        UNIQUE NOT NULL,
  destination_path text        NOT NULL,
  status_code      int         NOT NULL DEFAULT 301
                     CHECK (status_code IN (301, 302, 307, 308)),
  active           boolean     NOT NULL DEFAULT true,
  created_by       uuid        REFERENCES public.users(id),
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS redirects_source_path_idx ON public.redirects(source_path);
CREATE INDEX IF NOT EXISTS redirects_active_idx ON public.redirects(active);

-- ============================================================
-- SEO METADATA
-- ============================================================
CREATE TABLE IF NOT EXISTS public.seo_metadata (
  id                uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  path              text        UNIQUE NOT NULL,
  title             text,
  description       text,
  canonical_url     text,
  robots_directive  text        NOT NULL DEFAULT 'index,follow',
  og_title          text,
  og_description    text,
  og_image_url      text,
  structured_data   jsonb,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER seo_metadata_updated_at
  BEFORE UPDATE ON public.seo_metadata
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ANALYTICS EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type  text        NOT NULL,
  session_id  text,
  user_id     uuid        REFERENCES public.users(id),
  page_path   text,
  entity_type text,
  entity_id   uuid,
  properties  jsonb       NOT NULL DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS analytics_events_event_type_idx ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS analytics_events_created_at_idx ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS analytics_events_entity_idx ON public.analytics_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS analytics_events_session_id_idx ON public.analytics_events(session_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_select_own ON public.users FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY users_update_own ON public.users FOR UPDATE TO authenticated USING (auth.uid() = id);
-- Admins/service role bypass RLS in server-side contexts

-- articles: public can read published
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY articles_select_published ON public.articles FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY articles_select_all_admin ON public.articles FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('editor','admin','super_admin','reviewer','author'))
);
CREATE POLICY articles_insert_author ON public.articles FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('author','editor','admin','super_admin'))
);
CREATE POLICY articles_update_editor ON public.articles FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('editor','admin','super_admin'))
);

-- news_items: public can read published
ALTER TABLE public.news_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY news_select_published ON public.news_items FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY news_select_all_admin ON public.news_items FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('editor','admin','super_admin','reviewer','author'))
);
CREATE POLICY news_manage_editor ON public.news_items FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('editor','admin','super_admin'))
);

-- course_enrollments: users see their own
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY enrollments_select_own ON public.course_enrollments FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY enrollments_insert_own ON public.course_enrollments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- lesson_progress: users see their own
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY progress_select_own ON public.lesson_progress FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY progress_insert_own ON public.lesson_progress FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY progress_update_own ON public.lesson_progress FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- votes: users manage their own
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY votes_select_own ON public.votes FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY votes_insert_own ON public.votes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY votes_delete_own ON public.votes FOR DELETE TO authenticated USING (user_id = auth.uid());

-- community_posts: published are readable, authors manage own
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY community_posts_select_published ON public.community_posts FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY community_posts_insert_auth ON public.community_posts FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
CREATE POLICY community_posts_update_own ON public.community_posts FOR UPDATE TO authenticated USING (author_id = auth.uid());

-- enterprise_leads: only admins/service role
ALTER TABLE public.enterprise_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY enterprise_leads_admin ON public.enterprise_leads FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin'))
);

-- newsletter_subscribers: service role only (no direct client access)
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
-- No public policies; accessed only via service role / API routes
