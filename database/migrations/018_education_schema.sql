-- ============================================================
-- Migration 018: Phase 4.2 Education Schema Extensions
-- Additive only. No drops. No modifications to existing data.
-- ============================================================

-- ============================================================
-- EXTEND COURSES
-- ============================================================
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS subtitle           TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS short_description  TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS hero_image_url     TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS learning_outcomes  TEXT[];
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS audience           TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS is_demo            BOOLEAN NOT NULL DEFAULT false;

-- Extend status CHECK to include review and approved stages
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_status_check;
ALTER TABLE public.courses ADD CONSTRAINT courses_status_check
  CHECK (status IN ('draft','review','approved','published','archived'));

-- ============================================================
-- EXTEND COURSE MODULES
-- ============================================================
ALTER TABLE public.course_modules ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE OR REPLACE TRIGGER course_modules_updated_at
  BEFORE UPDATE ON public.course_modules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- EXTEND LESSONS
-- ============================================================
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS status            TEXT NOT NULL DEFAULT 'draft'
  CHECK (status IN ('draft','review','published','archived'));
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS learning_outcomes  TEXT[];
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS published_at       TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS lessons_status_idx ON public.lessons(status);

-- ============================================================
-- EXTEND LEARNING PATHS
-- ============================================================
ALTER TABLE public.learning_paths ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE public.learning_paths ADD COLUMN IF NOT EXISTS hero_image_url    TEXT;
ALTER TABLE public.learning_paths ADD COLUMN IF NOT EXISTS outcome           TEXT;
ALTER TABLE public.learning_paths ADD COLUMN IF NOT EXISTS is_demo           BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.learning_paths ADD COLUMN IF NOT EXISTS status            TEXT NOT NULL DEFAULT 'draft'
  CHECK (status IN ('draft','review','published','archived'));

-- Sync status from existing published boolean (idempotent)
UPDATE public.learning_paths SET status = 'published' WHERE published = true AND status = 'draft';

CREATE INDEX IF NOT EXISTS learning_paths_status_idx ON public.learning_paths(status);

-- ============================================================
-- EXTEND LEARNING PATH COURSES (steps)
-- ============================================================
ALTER TABLE public.learning_path_courses ADD COLUMN IF NOT EXISTS description TEXT;

-- ============================================================
-- COURSE ENTITIES — connects courses to the knowledge graph
-- ============================================================
CREATE TABLE IF NOT EXISTS public.course_entities (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id        UUID        NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  entity_type      TEXT        NOT NULL
    CHECK (entity_type IN ('technology','concept','tool','company','person')),
  entity_id        UUID        NOT NULL,
  relationship_type TEXT       NOT NULL
    CHECK (relationship_type IN ('TEACHES','COVERS','PREREQUISITE','APPLIES')),
  sort_order       INT         NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(course_id, entity_type, entity_id, relationship_type)
);

CREATE INDEX IF NOT EXISTS course_entities_course_idx  ON public.course_entities(course_id);
CREATE INDEX IF NOT EXISTS course_entities_entity_idx  ON public.course_entities(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS course_entities_teaches_idx ON public.course_entities(entity_type, entity_id)
  WHERE relationship_type = 'TEACHES';

-- ============================================================
-- COURSE PROJECTS — assignment/project foundation
-- ============================================================
CREATE TABLE IF NOT EXISTS public.course_projects (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id       UUID        NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  module_id       UUID        REFERENCES public.course_modules(id) ON DELETE SET NULL,
  title           TEXT        NOT NULL,
  description     TEXT,
  instructions    TEXT,
  submission_type TEXT        NOT NULL DEFAULT 'text'
    CHECK (submission_type IN ('text','url','github','file')),
  technology_ids  UUID[],
  sort_order      INT         NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS course_projects_course_idx ON public.course_projects(course_id);

CREATE TRIGGER course_projects_updated_at
  BEFORE UPDATE ON public.course_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE public.course_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_projects ENABLE ROW LEVEL SECURITY;

-- Public can read course_entities for published, non-demo courses
CREATE POLICY "course_entities_public_read" ON public.course_entities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE id = course_id
        AND status = 'published'
        AND is_demo = false
    )
  );

-- Public cannot read course_projects directly (admin only)
CREATE POLICY "course_projects_admin_read" ON public.course_projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
        AND role IN ('admin','super_admin','course_manager','editor')
    )
  );

-- Admins/course managers can write course_entities
CREATE POLICY "course_entities_admin_write" ON public.course_entities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
        AND role IN ('admin','super_admin','course_manager','editor')
    )
  );

-- Admins/course managers can write course_projects
CREATE POLICY "course_projects_admin_write" ON public.course_projects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
        AND role IN ('admin','super_admin','course_manager','editor')
    )
  );

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS courses_is_demo_idx       ON public.courses(is_demo) WHERE is_demo = false;
CREATE INDEX IF NOT EXISTS courses_status_demo_idx   ON public.courses(status, is_demo);
CREATE INDEX IF NOT EXISTS learning_paths_demo_idx   ON public.learning_paths(is_demo) WHERE is_demo = false;
