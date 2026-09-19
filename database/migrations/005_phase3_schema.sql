-- ============================================================
-- MIGRATION 005 — PHASE 3: CONTENT OPERATING SYSTEM
-- ============================================================
-- Adds: jobs, job_attempts, tool_change_events, status_updates,
--       refresh_policies, content_revisions, notification_rules,
--       notifications, claim_sources
-- Extends: sources, source_items, status_incidents, ai_generations
-- ============================================================

-- ============================================================
-- 1. EXTEND SOURCES TABLE
-- ============================================================

-- Expand source_type CHECK to include 'status' type
ALTER TABLE public.sources DROP CONSTRAINT IF EXISTS sources_source_type_check;
ALTER TABLE public.sources ADD CONSTRAINT sources_source_type_check
  CHECK (source_type IN ('official_company','official_blog','rss','api','news','youtube','manual','community','status','graphql'));

ALTER TABLE public.sources
  ADD COLUMN IF NOT EXISTS base_url            text,
  ADD COLUMN IF NOT EXISTS feed_url            text,
  ADD COLUMN IF NOT EXISTS api_url             text,
  ADD COLUMN IF NOT EXISTS parser_key          text,
  ADD COLUMN IF NOT EXISTS poll_interval_seconds int NOT NULL DEFAULT 3600,
  ADD COLUMN IF NOT EXISTS last_polled_at      timestamptz,
  ADD COLUMN IF NOT EXISTS next_poll_at        timestamptz,
  ADD COLUMN IF NOT EXISTS last_success_at     timestamptz,
  ADD COLUMN IF NOT EXISTS last_error_at       timestamptz,
  ADD COLUMN IF NOT EXISTS last_error          text,
  ADD COLUMN IF NOT EXISTS failure_count       int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS items_discovered    int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS health_status       text NOT NULL DEFAULT 'unknown'
    CHECK (health_status IN ('healthy','warning','failed','disabled','unknown'));

-- Migrate rss_url → feed_url where feed_url not already set
UPDATE public.sources SET feed_url = rss_url WHERE feed_url IS NULL AND rss_url IS NOT NULL;
-- Migrate api_endpoint → api_url where api_url not already set
UPDATE public.sources SET api_url = api_endpoint WHERE api_url IS NULL AND api_endpoint IS NOT NULL;
-- Migrate fetch_frequency_minutes → poll_interval_seconds
UPDATE public.sources SET poll_interval_seconds = fetch_frequency_minutes * 60 WHERE fetch_frequency_minutes IS NOT NULL;

-- ============================================================
-- 2. EXTEND SOURCE_ITEMS TABLE
-- ============================================================
ALTER TABLE public.source_items
  ADD COLUMN IF NOT EXISTS external_id          text,
  ADD COLUMN IF NOT EXISTS description          text,
  ADD COLUMN IF NOT EXISTS content              text,
  ADD COLUMN IF NOT EXISTS author               text,
  ADD COLUMN IF NOT EXISTS source_published_at  timestamptz,
  ADD COLUMN IF NOT EXISTS content_type         text NOT NULL DEFAULT 'news'
    CHECK (content_type IN ('news','tool','technology','company','interview','article','status','other')),
  ADD COLUMN IF NOT EXISTS processing_status    text NOT NULL DEFAULT 'discovered'
    CHECK (processing_status IN ('discovered','normalized','duplicate','enriching','ready_for_review','processed','failed')),
  ADD COLUMN IF NOT EXISTS raw_payload          jsonb,
  ADD COLUMN IF NOT EXISTS updated_at           timestamptz NOT NULL DEFAULT now();

-- Migrate existing status column values → processing_status where possible
UPDATE public.source_items
  SET processing_status = CASE
    WHEN status IN ('discovered','normalized','duplicate','enriching','ready_for_review','processed','failed') THEN status
    ELSE 'discovered'
  END
WHERE processing_status = 'discovered';

-- Unique index: one item per source per external_id
CREATE UNIQUE INDEX IF NOT EXISTS source_items_source_external_idx
  ON public.source_items(source_id, external_id)
  WHERE external_id IS NOT NULL;

-- Index for queue workers pulling unprocessed items
CREATE INDEX IF NOT EXISTS source_items_processing_status_idx
  ON public.source_items(processing_status, content_type, discovered_at DESC);

-- ============================================================
-- 3. EXTEND STATUS_INCIDENTS TABLE
-- ============================================================
ALTER TABLE public.status_incidents
  ADD COLUMN IF NOT EXISTS external_incident_id  text,
  ADD COLUMN IF NOT EXISTS impact                text CHECK (impact IN ('none','minor','major','critical')),
  ADD COLUMN IF NOT EXISTS last_updated_at       timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS status_incidents_external_id_idx
  ON public.status_incidents(provider_id, external_incident_id)
  WHERE external_incident_id IS NOT NULL;

-- ============================================================
-- 4. EXTEND AI_GENERATIONS TABLE
-- ============================================================
ALTER TABLE public.ai_generations
  ADD COLUMN IF NOT EXISTS task             text,
  ADD COLUMN IF NOT EXISTS input_reference  text,
  ADD COLUMN IF NOT EXISTS output           text,
  ADD COLUMN IF NOT EXISTS latency_ms       int,
  ADD COLUMN IF NOT EXISTS token_usage      jsonb,
  ADD COLUMN IF NOT EXISTS status           text NOT NULL DEFAULT 'completed'
    CHECK (status IN ('pending','completed','failed')),
  ADD COLUMN IF NOT EXISTS error            text;

-- ============================================================
-- 5. JOBS TABLE (replaces ingestion_jobs for Phase 3)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.jobs (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_name       text        NOT NULL,
  job_type         text        NOT NULL,
  payload          jsonb       NOT NULL DEFAULT '{}',
  status           text        NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued','running','completed','retrying','failed','dead_lettered','cancelled')),
  priority         int         NOT NULL DEFAULT 5,
  attempts         int         NOT NULL DEFAULT 0,
  max_attempts     int         NOT NULL DEFAULT 3,
  idempotency_key  text        UNIQUE,
  scheduled_at     timestamptz NOT NULL DEFAULT now(),
  started_at       timestamptz,
  completed_at     timestamptz,
  failed_at        timestamptz,
  error_code       text,
  error_message    text,
  last_error       text,
  created_by       uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS jobs_queue_status_idx   ON public.jobs(queue_name, status, priority DESC, scheduled_at);
CREATE INDEX IF NOT EXISTS jobs_status_idx         ON public.jobs(status, created_at DESC);
CREATE INDEX IF NOT EXISTS jobs_idempotency_idx    ON public.jobs(idempotency_key) WHERE idempotency_key IS NOT NULL;

-- ============================================================
-- 6. JOB_ATTEMPTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.job_attempts (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id         uuid        NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  attempt_number int         NOT NULL,
  started_at     timestamptz NOT NULL DEFAULT now(),
  completed_at   timestamptz,
  status         text        NOT NULL CHECK (status IN ('running','completed','failed')),
  error          text,
  metadata       jsonb,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS job_attempts_job_id_idx ON public.job_attempts(job_id, attempt_number);

-- ============================================================
-- 7. TOOL_CHANGE_EVENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tool_change_events (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id             uuid        NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  field_name          text        NOT NULL,
  old_value           text,
  new_value           text,
  source_id           uuid        REFERENCES public.sources(id),
  detected_at         timestamptz NOT NULL DEFAULT now(),
  verified_at         timestamptz,
  verification_status text        NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending','verified','rejected','auto_accepted')),
  verified_by         uuid        REFERENCES auth.users(id),
  auto_applied        boolean     NOT NULL DEFAULT false,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tool_change_events_tool_id_idx ON public.tool_change_events(tool_id, detected_at DESC);
CREATE INDEX IF NOT EXISTS tool_change_events_pending_idx ON public.tool_change_events(verification_status) WHERE verification_status = 'pending';

-- ============================================================
-- 8. STATUS_UPDATES TABLE (incident timeline)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.status_updates (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id        uuid        NOT NULL REFERENCES public.status_incidents(id) ON DELETE CASCADE,
  external_update_id text,
  status             text        NOT NULL
    CHECK (status IN ('investigating','identified','monitoring','resolved','unknown')),
  message            text,
  published_at       timestamptz,
  discovered_at      timestamptz NOT NULL DEFAULT now(),
  raw_payload        jsonb,
  created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS status_updates_external_id_idx
  ON public.status_updates(incident_id, external_update_id)
  WHERE external_update_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS status_updates_incident_id_idx ON public.status_updates(incident_id, published_at DESC);

-- ============================================================
-- 9. REFRESH_POLICIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.refresh_policies (
  id                      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type             text        NOT NULL,
  field_group             text        NOT NULL,
  refresh_interval_seconds int        NOT NULL,
  priority                int         NOT NULL DEFAULT 5,
  enabled                 boolean     NOT NULL DEFAULT true,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entity_type, field_group)
);

-- Seed default refresh policies
INSERT INTO public.refresh_policies (entity_type, field_group, refresh_interval_seconds, priority) VALUES
  ('news_item',   'all',       300,       10),
  ('status',      'all',       120,       10),
  ('tool',        'pricing',   604800,     8),
  ('tool',        'availability', 86400,   9),
  ('tool',        'features',  2592000,    5),
  ('tool',        'metadata',  5184000,    4),
  ('company',     'metadata',  7776000,    3),
  ('technology',  'metadata',  15552000,   2),
  ('comparison',  'all',       2592000,    5),
  ('article',     'all',       86400,      6)
ON CONFLICT (entity_type, field_group) DO NOTHING;

-- ============================================================
-- 10. CONTENT_REVISIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.content_revisions (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type   text        NOT NULL,
  content_id     uuid        NOT NULL,
  version        int         NOT NULL DEFAULT 1,
  snapshot       jsonb       NOT NULL,
  change_summary text,
  created_by     uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS content_revisions_content_idx ON public.content_revisions(content_type, content_id, version DESC);

-- ============================================================
-- 11. NOTIFICATION_RULES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notification_rules (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  event_type  text        NOT NULL,
  conditions  jsonb       NOT NULL DEFAULT '{}',
  channels    jsonb       NOT NULL DEFAULT '[]',
  enabled     boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Default notification rules
INSERT INTO public.notification_rules (name, event_type, conditions, channels) VALUES
  ('High-priority news', 'news.discovered', '{"importance_gte": 8}', '["admin"]'),
  ('New outage detected', 'incident.created', '{"severity_in": ["major","critical"]}', '["admin"]'),
  ('Major incident update', 'incident.updated', '{"severity_in": ["major","critical"]}', '["admin"]'),
  ('Tool pricing changed', 'tool.price_changed', '{}', '["admin"]'),
  ('Source failing', 'source.failed', '{"consecutive_failures_gte": 3}', '["admin"]'),
  ('Dead-letter job', 'job.dead_lettered', '{}', '["admin"]'),
  ('Content needs verification', 'content.needs_verification', '{}', '["admin"]')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 12. NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id     uuid        REFERENCES public.notification_rules(id) ON DELETE SET NULL,
  user_id     uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  title       text        NOT NULL,
  body        text,
  event_type  text        NOT NULL,
  entity_type text,
  entity_id   uuid,
  read_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id, read_at, created_at DESC);

-- ============================================================
-- 13. CLAIM_SOURCES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.claim_sources (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id            uuid        NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
  source_id           uuid        REFERENCES public.sources(id),
  source_url          text        NOT NULL,
  retrieved_at        timestamptz,
  verified_at         timestamptz,
  verified_by         uuid        REFERENCES auth.users(id),
  verification_status text        NOT NULL DEFAULT 'unverified'
    CHECK (verification_status IN ('unverified','verified','disputed')),
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS claim_sources_claim_id_idx ON public.claim_sources(claim_id);

-- ============================================================
-- 14. ADDITIONAL INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS sources_next_poll_at_idx ON public.sources(next_poll_at) WHERE active = true;
CREATE INDEX IF NOT EXISTS sources_health_status_idx ON public.sources(health_status) WHERE active = true;
CREATE INDEX IF NOT EXISTS jobs_scheduled_queued_idx ON public.jobs(scheduled_at) WHERE status IN ('queued','retrying');

-- ============================================================
-- 15. RLS FOR NEW TABLES
-- ============================================================

-- jobs: admins/editors see all; workers use service-role
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY jobs_admin_all ON public.jobs FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','editor','analyst')))
    WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','editor')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- job_attempts
ALTER TABLE public.job_attempts ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY job_attempts_admin_select ON public.job_attempts FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','editor','analyst')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- tool_change_events
ALTER TABLE public.tool_change_events ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY tool_changes_admin_all ON public.tool_change_events FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','editor')))
    WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','editor')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- status_updates: public can read resolved incidents' updates
ALTER TABLE public.status_updates ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY status_updates_public_select ON public.status_updates FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY status_updates_admin_write ON public.status_updates FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin')))
    WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- refresh_policies
ALTER TABLE public.refresh_policies ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY refresh_policies_admin_all ON public.refresh_policies FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin')))
    WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY refresh_policies_read_staff ON public.refresh_policies FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','editor','analyst')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- content_revisions
ALTER TABLE public.content_revisions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY content_revisions_staff_select ON public.content_revisions FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','editor','reviewer','author')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY content_revisions_admin_write ON public.content_revisions FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','editor','author')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- notification_rules
ALTER TABLE public.notification_rules ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY notification_rules_admin_all ON public.notification_rules FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin')))
    WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- notifications: users see their own
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY notifications_own_select ON public.notifications FOR SELECT TO authenticated
    USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY notifications_own_update ON public.notifications FOR UPDATE TO authenticated
    USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- claim_sources
ALTER TABLE public.claim_sources ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY claim_sources_staff_select ON public.claim_sources FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','editor','reviewer','author')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY claim_sources_editor_write ON public.claim_sources FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','editor')))
    WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','editor')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 16. UPDATED_AT TRIGGER FOR NEW TABLES
-- ============================================================
DO $$ BEGIN
  CREATE TRIGGER jobs_updated_at BEFORE UPDATE ON public.jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN undefined_function THEN NULL;
         WHEN duplicate_object    THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER refresh_policies_updated_at BEFORE UPDATE ON public.refresh_policies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN undefined_function THEN NULL;
         WHEN duplicate_object    THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER notification_rules_updated_at BEFORE UPDATE ON public.notification_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN undefined_function THEN NULL;
         WHEN duplicate_object    THEN NULL; END $$;

-- ============================================================
-- 17. SEED DEMO SOURCES
-- ============================================================
INSERT INTO public.sources (name, domain, source_type, base_url, feed_url, parser_key, trust_level, active, poll_interval_seconds, health_status, notes) VALUES
  ('Hacker News',   'news.ycombinator.com',  'rss',    'https://news.ycombinator.com',    'https://news.ycombinator.com/rss',           'rss-generic', 5, false, 3600, 'unknown', 'DEMO - disabled by default'),
  ('AWS Status',    'status.aws.amazon.com', 'status', 'https://status.aws.amazon.com',   'https://status.aws.amazon.com/rss/all.rss',  'rss-status',  5, false, 300,  'unknown', 'DEMO - disabled by default'),
  ('GitHub Status', 'githubstatus.com',      'status', 'https://githubstatus.com',        'https://www.githubstatus.com/history.rss',   'rss-status',  5, false, 300,  'unknown', 'DEMO - disabled by default'),
  ('Vercel Status', 'vercel-status.com',     'status', 'https://www.vercel-status.com',   'https://www.vercel-status.com/history.rss',  'rss-status',  5, false, 300,  'unknown', 'DEMO - disabled by default')
ON CONFLICT (domain) DO NOTHING;

SELECT 'Phase 3 schema migration complete' AS result;
