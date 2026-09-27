-- ============================================================
-- Migration 022: Content Opportunities — Phase 4.5
-- Editorial intelligence layer. Additive only.
-- No DROP TABLE, TRUNCATE, or destructive operations.
-- Safe to re-run (all CREATE statements use IF NOT EXISTS;
--   trigger and policies use DROP IF EXISTS before re-create).
-- ============================================================

-- ============================================================
-- CONTENT_OPPORTUNITIES — core model
-- ============================================================
CREATE TABLE IF NOT EXISTS public.content_opportunities (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  topic                 TEXT        NOT NULL,
  title_suggestion      TEXT,
  content_type          TEXT        NOT NULL
    CHECK (content_type IN (
      'youtube_video','short','article','technology_page','tool_page',
      'comparison','interview','course','learning_path','newsletter',
      'update_existing_content'
    )),
  audience              TEXT,
  reason                TEXT,
  why_now               TEXT,
  gap_type              TEXT
    CHECK (gap_type IN ('missing','weak','stale','disconnected','underdeveloped','duplicate_candidate')),
  priority              TEXT        NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('high','medium','low')),
  status                TEXT        NOT NULL DEFAULT 'new'
    CHECK (status IN ('new','review','approved','assigned','in_progress','completed','dismissed')),
  source                TEXT
    CHECK (source IN ('search_signal','knowledge_gap','news_signal','tool_gap','learning_gap','youtube','manual')),
  related_entity_type   TEXT,
  related_entity_id     UUID,
  related_entity_name   TEXT,
  enterprise_relevance  TEXT        DEFAULT 'low'
    CHECK (enterprise_relevance IN ('low','medium','high')),
  target_publish_date   DATE,
  assigned_to           UUID        REFERENCES public.users(id) ON DELETE SET NULL,
  brief                 JSONB       NOT NULL DEFAULT '{}',
  metadata              JSONB       NOT NULL DEFAULT '{}',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at           TIMESTAMPTZ,
  completed_at          TIMESTAMPTZ,
  dismissed_at          TIMESTAMPTZ,
  created_by            UUID        REFERENCES public.users(id) ON DELETE SET NULL,
  created_by_type       TEXT        CHECK (created_by_type IN ('editor','system','ai')),
  -- deduplication fingerprint: normalized topic + content_type + related_entity
  dedup_key             TEXT        GENERATED ALWAYS AS (
    lower(regexp_replace(topic, '[^a-z0-9]', '', 'gi'))
    || ':' || content_type
    || ':' || coalesce(related_entity_type, '')
    || ':' || coalesce(related_entity_id::text, '')
  ) STORED
);

CREATE INDEX IF NOT EXISTS co_status_idx       ON public.content_opportunities(status);
CREATE INDEX IF NOT EXISTS co_priority_idx     ON public.content_opportunities(priority);
CREATE INDEX IF NOT EXISTS co_content_type_idx ON public.content_opportunities(content_type);
CREATE INDEX IF NOT EXISTS co_source_idx       ON public.content_opportunities(source);
CREATE INDEX IF NOT EXISTS co_entity_idx       ON public.content_opportunities(related_entity_type, related_entity_id);
CREATE INDEX IF NOT EXISTS co_assigned_idx     ON public.content_opportunities(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS co_dedup_idx        ON public.content_opportunities(dedup_key);
CREATE INDEX IF NOT EXISTS co_created_at_idx   ON public.content_opportunities(created_at DESC);
CREATE INDEX IF NOT EXISTS co_updated_at_idx   ON public.content_opportunities(updated_at DESC);

-- Trigger: idempotent (drop then recreate)
DROP TRIGGER IF EXISTS content_opportunities_updated_at ON public.content_opportunities;
CREATE TRIGGER content_opportunities_updated_at
  BEFORE UPDATE ON public.content_opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- RLS — only editors/admins/analysts can see opportunities
-- ============================================================
ALTER TABLE public.content_opportunities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS co_editor_select ON public.content_opportunities;
CREATE POLICY co_editor_select ON public.content_opportunities
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('editor','admin','super_admin','analyst','author','reviewer')
    )
  );

DROP POLICY IF EXISTS co_editor_insert ON public.content_opportunities;
CREATE POLICY co_editor_insert ON public.content_opportunities
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('editor','admin','super_admin')
    )
  );

DROP POLICY IF EXISTS co_editor_update ON public.content_opportunities;
CREATE POLICY co_editor_update ON public.content_opportunities
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('editor','admin','super_admin')
    )
  );

-- ============================================================
-- SEARCH QUERY LOG — track search queries for signal analysis
-- Separate from analytics_events for efficient aggregation.
--
-- Security note: All inserts happen via service-role key from
-- the server-side search API route. No direct anon inserts are
-- permitted — the anon client can read nothing here.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.search_query_log (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  query         TEXT        NOT NULL CHECK (length(query) <= 500),
  normalized    TEXT        NOT NULL CHECK (length(normalized) <= 200),
  results_count INTEGER     NOT NULL DEFAULT 0 CHECK (results_count >= 0),
  has_results   BOOLEAN     NOT NULL GENERATED ALWAYS AS (results_count > 0) STORED,
  -- session_id is an opaque client-provided token used only for dedup; not linked to auth
  session_id    TEXT        CHECK (length(session_id) <= 128),
  -- user_id is never set from client — only from authenticated server context
  user_id       UUID        REFERENCES public.users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sql_normalized_idx  ON public.search_query_log(normalized);
CREATE INDEX IF NOT EXISTS sql_has_results_idx ON public.search_query_log(has_results);
CREATE INDEX IF NOT EXISTS sql_created_at_idx  ON public.search_query_log(created_at DESC);
-- Support fast dedup checks (session_id + normalized + recent window)
CREATE INDEX IF NOT EXISTS sql_dedup_idx       ON public.search_query_log(session_id, normalized, created_at DESC)
  WHERE session_id IS NOT NULL;

ALTER TABLE public.search_query_log ENABLE ROW LEVEL SECURITY;

-- Direct anon INSERT is NOT permitted. All logging goes through service-role
-- (which bypasses RLS) via the server-side /api/search route.
-- Authenticated editors/admins can read for signal analysis.
DROP POLICY IF EXISTS sql_anon_insert   ON public.search_query_log;
DROP POLICY IF EXISTS sql_admin_select  ON public.search_query_log;

CREATE POLICY sql_admin_select ON public.search_query_log
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('editor','admin','super_admin','analyst')
    )
  );
