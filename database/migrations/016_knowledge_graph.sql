-- ============================================================
-- Migration 016: Knowledge Graph + Understand Engine Schema
-- Phase 4.1 — Additive only. No drops, no modifications to existing data.
-- ============================================================

-- ============================================================
-- EXTEND TECHNOLOGIES (additive columns only)
-- ============================================================
ALTER TABLE public.technologies ADD COLUMN IF NOT EXISTS short_definition TEXT;
ALTER TABLE public.technologies ADD COLUMN IF NOT EXISTS maturity TEXT
  CHECK (maturity IN ('emerging','growing','mature','declining','legacy'));
ALTER TABLE public.technologies ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT false;

-- ============================================================
-- ENTITY RELATIONSHIPS — Universal cross-entity knowledge graph
-- ============================================================
CREATE TABLE IF NOT EXISTS public.entity_relationships (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_entity_type  TEXT        NOT NULL
    CHECK (source_entity_type IN ('technology','concept','tool','company','person','article','news','comparison','interview')),
  source_entity_id    UUID        NOT NULL,
  target_entity_type  TEXT        NOT NULL
    CHECK (target_entity_type IN ('technology','concept','tool','company','person','article','news','comparison','interview')),
  target_entity_id    UUID        NOT NULL,
  relationship_type   TEXT        NOT NULL
    CHECK (relationship_type IN (
      'RELATED_TO','DEPENDS_ON','PART_OF','USES','IMPLEMENTS',
      'ALTERNATIVE_TO','COMPETES_WITH','BUILT_BY','MAINTAINED_BY','CREATED_BY',
      'INTEGRATES_WITH','USED_BY','MENTIONED_IN','EXPLAINED_BY','COVERED_BY',
      'COMPARED_WITH','RELEVANT_TO'
    )),
  weight              NUMERIC(4,2) NOT NULL DEFAULT 1.0,
  confidence          NUMERIC(4,2) NOT NULL DEFAULT 1.0,
  source              TEXT,
  source_url          TEXT,
  created_by          UUID,
  created_by_type     TEXT        CHECK (created_by_type IN ('editor','system','ai')),
  verified            BOOLEAN     NOT NULL DEFAULT false,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(source_entity_type, source_entity_id, target_entity_type, target_entity_id, relationship_type)
);

CREATE INDEX IF NOT EXISTS er_source_idx    ON public.entity_relationships(source_entity_type, source_entity_id);
CREATE INDEX IF NOT EXISTS er_target_idx    ON public.entity_relationships(target_entity_type, target_entity_id);
CREATE INDEX IF NOT EXISTS er_type_idx      ON public.entity_relationships(relationship_type);
CREATE INDEX IF NOT EXISTS er_verified_idx  ON public.entity_relationships(verified) WHERE verified = true;
CREATE INDEX IF NOT EXISTS er_pending_idx   ON public.entity_relationships(created_by_type, verified) WHERE created_by_type = 'ai' AND verified = false;

CREATE TRIGGER entity_relationships_updated_at
  BEFORE UPDATE ON public.entity_relationships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ENTITY ALIASES — Abbreviation / alternate name resolution
-- ============================================================
CREATE TABLE IF NOT EXISTS public.entity_aliases (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type      TEXT        NOT NULL
    CHECK (entity_type IN ('technology','concept','tool','company','person')),
  entity_id        UUID        NOT NULL,
  alias            TEXT        NOT NULL,
  normalized_alias TEXT        NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(entity_type, normalized_alias)
);

CREATE INDEX IF NOT EXISTS entity_aliases_entity_idx     ON public.entity_aliases(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS entity_aliases_normalized_idx ON public.entity_aliases(normalized_alias);

-- ============================================================
-- TECHNOLOGY EXPLANATIONS — Structured, depth-layered content
-- ============================================================
CREATE TABLE IF NOT EXISTS public.technology_explanations (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  technology_id    UUID        NOT NULL REFERENCES public.technologies(id) ON DELETE CASCADE,
  explanation_type TEXT        NOT NULL
    CHECK (explanation_type IN ('quick','simple','beginner','technical','architect')),
  title            TEXT,
  content          TEXT        NOT NULL,
  status           TEXT        NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','in_review','approved','published','archived')),
  version          INT         NOT NULL DEFAULT 1,
  generated_by     TEXT        CHECK (generated_by IN ('ai','editor','import')),
  reviewed_by      UUID,
  published_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tech_exp_tech_idx        ON public.technology_explanations(technology_id);
CREATE INDEX IF NOT EXISTS tech_exp_type_status_idx ON public.technology_explanations(explanation_type, status);
CREATE INDEX IF NOT EXISTS tech_exp_published_idx   ON public.technology_explanations(technology_id, explanation_type)
  WHERE status = 'published';

CREATE TRIGGER technology_explanations_updated_at
  BEFORE UPDATE ON public.technology_explanations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- USER SAVED ENTITIES — Bookmarking foundation
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_saved_entities (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID        NOT NULL,
  entity_type TEXT        NOT NULL,
  entity_id   UUID        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS user_saved_user_idx ON public.user_saved_entities(user_id);
CREATE INDEX IF NOT EXISTS user_saved_entity_idx ON public.user_saved_entities(entity_type, entity_id);

-- ============================================================
-- RLS — Public read on entity_relationships (verified only)
-- ============================================================
ALTER TABLE public.entity_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technology_explanations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_saved_entities ENABLE ROW LEVEL SECURITY;

-- Verified relationships are publicly readable
CREATE POLICY "entity_relationships_public_read" ON public.entity_relationships
  FOR SELECT USING (verified = true);

-- Aliases are publicly readable
CREATE POLICY "entity_aliases_public_read" ON public.entity_aliases
  FOR SELECT USING (true);

-- Published explanations are publicly readable
CREATE POLICY "technology_explanations_public_read" ON public.technology_explanations
  FOR SELECT USING (status = 'published');

-- Users can read their own saved entities
CREATE POLICY "user_saved_entities_own_read" ON public.user_saved_entities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_saved_entities_own_insert" ON public.user_saved_entities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_saved_entities_own_delete" ON public.user_saved_entities
  FOR DELETE USING (auth.uid() = user_id);
