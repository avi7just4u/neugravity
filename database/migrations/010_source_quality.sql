-- ============================================================
-- MIGRATION 010 — SOURCE QUALITY METADATA
-- ============================================================

ALTER TABLE public.sources
  ADD COLUMN IF NOT EXISTS trust_level_label text DEFAULT 'reputable_secondary'
    CHECK (trust_level_label IN ('primary', 'official', 'reputable_secondary', 'community')),
  ADD COLUMN IF NOT EXISTS source_priority integer NOT NULL DEFAULT 5
    CHECK (source_priority BETWEEN 1 AND 10),
  ADD COLUMN IF NOT EXISTS category text
    CHECK (category IN ('ai', 'cloud', 'security', 'developer', 'infrastructure', 'enterprise', 'databases', 'open-source', 'productivity', 'hardware', 'general'));

CREATE INDEX IF NOT EXISTS idx_sources_active_next_poll
  ON public.sources(active, next_poll_at) WHERE active = true;

CREATE INDEX IF NOT EXISTS idx_sources_category
  ON public.sources(category) WHERE active = true;

SELECT 'Migration 010 complete' AS result;
