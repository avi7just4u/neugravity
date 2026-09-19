-- NeuGravity Schema Hardening
-- Migration: 003_fixes_and_hardening.sql
-- Idempotent: safe to run multiple times.
-- Fixes: missing RPC, RLS gaps, partial indexes, audit log, scheduled publish.

-- ============================================================
-- 1. MISSING RPC: increment_view_count
-- ============================================================

CREATE OR REPLACE FUNCTION increment_view_count(table_name text, row_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  EXECUTE format('UPDATE public.%I SET view_count = view_count + 1 WHERE id = $1', table_name)
  USING row_id;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_view_count(text, uuid) TO anon;
GRANT EXECUTE ON FUNCTION increment_view_count(text, uuid) TO authenticated;

-- ============================================================
-- 2. SCHEDULED PUBLISH FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION publish_scheduled_content()
RETURNS int LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  published_count int := 0;
  n int;
BEGIN
  UPDATE public.articles
  SET status = 'published', published_at = now()
  WHERE status = 'approved'
    AND scheduled_publish_at IS NOT NULL
    AND scheduled_publish_at <= now();
  GET DIAGNOSTICS n = ROW_COUNT;
  published_count := published_count + n;

  UPDATE public.news_items
  SET status = 'published', published_at = now()
  WHERE status = 'approved'
    AND scheduled_publish_at IS NOT NULL
    AND scheduled_publish_at <= now();
  GET DIAGNOSTICS n = ROW_COUNT;
  published_count := published_count + n;

  RETURN published_count;
END;
$$;

GRANT EXECUTE ON FUNCTION publish_scheduled_content() TO authenticated;

-- ============================================================
-- 3. AUDIT LOG TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid        REFERENCES public.users(id) ON DELETE SET NULL,
  action      text        NOT NULL,
  entity_type text        NOT NULL,
  entity_id   uuid,
  old_values  jsonb,
  new_values  jsonb,
  ip_address  inet,
  user_agent  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx   ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS audit_logs_entity_idx    ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON public.audit_logs(created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY audit_logs_admin_select ON public.audit_logs
    FOR SELECT TO authenticated
    USING (EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin','super_admin','analyst')
    ));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY audit_logs_insert_authenticated ON public.audit_logs
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 4. RLS — PUBLIC-READ TABLES
-- ============================================================

-- ---- categories ----
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY categories_select_all ON public.categories FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY categories_manage_admin ON public.categories FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- tags ----
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY tags_select_all ON public.tags FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY tags_manage_admin ON public.tags FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','editor')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- authors ----
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY authors_select_all ON public.authors FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY authors_manage_admin ON public.authors FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','editor')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- people ----
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY people_select_published ON public.people FOR SELECT TO anon, authenticated USING (published = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY people_select_all_editor ON public.people FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('editor','admin','super_admin')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY people_manage_admin ON public.people FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','editor')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- technologies ----
ALTER TABLE public.technologies ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY technologies_select_published ON public.technologies FOR SELECT TO anon, authenticated USING (published = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY technologies_select_all_editor ON public.technologies FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('editor','admin','super_admin','reviewer','author')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY technologies_manage_admin ON public.technologies FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','editor')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- technology_relationships ----
ALTER TABLE public.technology_relationships ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY tech_rel_select_all ON public.technology_relationships FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY tech_rel_manage_admin ON public.technology_relationships FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','editor')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- technology_tags ----
ALTER TABLE public.technology_tags ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY tech_tags_select_all ON public.technology_tags FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY tech_tags_manage_admin ON public.technology_tags FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','editor')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- company_technologies ----
ALTER TABLE public.company_technologies ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY company_tech_select_all ON public.company_technologies FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY company_tech_manage_admin ON public.company_technologies FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','editor')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- companies ----
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY companies_select_published ON public.companies FOR SELECT TO anon, authenticated USING (published = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY companies_select_all_editor ON public.companies FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('editor','admin','super_admin','reviewer')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY companies_manage_admin ON public.companies FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','editor')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- tools ----
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY tools_select_published ON public.tools FOR SELECT TO anon, authenticated USING (published = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY tools_select_all_editor ON public.tools FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('editor','admin','super_admin','reviewer','author')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY tools_manage_admin ON public.tools FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','editor')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- tool_pricing ----
ALTER TABLE public.tool_pricing ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY tool_pricing_select_all ON public.tool_pricing FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY tool_pricing_manage_admin ON public.tool_pricing FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','editor')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- tool_features ----
ALTER TABLE public.tool_features ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY tool_features_select_all ON public.tool_features FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY tool_features_manage_admin ON public.tool_features FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','editor')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- tool_integrations ----
ALTER TABLE public.tool_integrations ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY tool_integrations_select_all ON public.tool_integrations FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY tool_integrations_manage_admin ON public.tool_integrations FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','editor')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- tool_technologies ----
ALTER TABLE public.tool_technologies ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY tool_tech_select_all ON public.tool_technologies FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY tool_tech_manage_admin ON public.tool_technologies FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','editor')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- comparisons ----
ALTER TABLE public.comparisons ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY comparisons_select_published ON public.comparisons FOR SELECT TO anon, authenticated USING (status = 'published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY comparisons_select_all_editor ON public.comparisons FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('editor','admin','super_admin','reviewer')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY comparisons_manage_admin ON public.comparisons FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','editor')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- comparison_entities ----
ALTER TABLE public.comparison_entities ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY comparison_entities_select_all ON public.comparison_entities FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY comparison_entities_manage_admin ON public.comparison_entities FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','editor')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- comparison_dimensions ----
ALTER TABLE public.comparison_dimensions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY comparison_dimensions_select_all ON public.comparison_dimensions FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY comparison_dimensions_manage_admin ON public.comparison_dimensions FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','editor')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- comparison_values ----
ALTER TABLE public.comparison_values ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY comparison_values_select_all ON public.comparison_values FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY comparison_values_manage_admin ON public.comparison_values FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','editor')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- article_tags ----
ALTER TABLE public.article_tags ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY article_tags_select_all ON public.article_tags FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY article_tags_manage_editor ON public.article_tags FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('editor','admin','super_admin','author')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- article_entities ----
ALTER TABLE public.article_entities ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY article_entities_select_all ON public.article_entities FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY article_entities_manage_editor ON public.article_entities FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('editor','admin','super_admin','author')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- courses ----
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY courses_select_published ON public.courses FOR SELECT TO anon, authenticated USING (status = 'published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY courses_select_all_editor ON public.courses FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('editor','admin','super_admin','course_manager','reviewer')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY courses_manage_admin ON public.courses FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','course_manager')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- course_modules ----
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY course_modules_select_all ON public.course_modules FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY course_modules_manage_admin ON public.course_modules FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','course_manager')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- lessons ----
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY lessons_select_all ON public.lessons FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY lessons_manage_admin ON public.lessons FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','course_manager')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- quizzes ----
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY quizzes_select_enrolled ON public.quizzes FOR SELECT TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.lessons l
        JOIN public.course_modules m ON l.module_id = m.id
        JOIN public.course_enrollments e ON e.course_id = m.course_id
        WHERE l.id = quizzes.lesson_id AND e.user_id = auth.uid() AND e.status = 'active'
      )
      OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','course_manager','editor'))
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY quizzes_manage_admin ON public.quizzes FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','course_manager')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- quiz_questions ----
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY quiz_questions_select_enrolled ON public.quiz_questions FOR SELECT TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.quizzes q
        JOIN public.lessons l ON q.lesson_id = l.id
        JOIN public.course_modules m ON l.module_id = m.id
        JOIN public.course_enrollments e ON e.course_id = m.course_id
        WHERE q.id = quiz_questions.quiz_id AND e.user_id = auth.uid() AND e.status = 'active'
      )
      OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','course_manager','editor'))
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY quiz_questions_manage_admin ON public.quiz_questions FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','course_manager')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- learning_paths ----
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY learning_paths_select_published ON public.learning_paths FOR SELECT TO anon, authenticated USING (published = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY learning_paths_select_all_admin ON public.learning_paths FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','course_manager','editor')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY learning_paths_manage_admin ON public.learning_paths FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','course_manager')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- learning_path_courses ----
ALTER TABLE public.learning_path_courses ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY lp_courses_select_all ON public.learning_path_courses FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY lp_courses_manage_admin ON public.learning_path_courses FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','course_manager')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- interviews ----
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY interviews_select_published ON public.interviews FOR SELECT TO anon, authenticated USING (status = 'published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY interviews_select_all_editor ON public.interviews FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('editor','admin','super_admin','reviewer')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY interviews_manage_admin ON public.interviews FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','editor')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- interview_topics ----
ALTER TABLE public.interview_topics ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY interview_topics_select_all ON public.interview_topics FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY interview_topics_manage_admin ON public.interview_topics FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','editor')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- interview_entities ----
ALTER TABLE public.interview_entities ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY interview_entities_select_all ON public.interview_entities FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY interview_entities_manage_admin ON public.interview_entities FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','editor')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- status_providers ----
ALTER TABLE public.status_providers ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY status_providers_select_active ON public.status_providers FOR SELECT TO anon, authenticated USING (active = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY status_providers_manage_admin ON public.status_providers FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- status_services ----
ALTER TABLE public.status_services ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY status_services_select_all ON public.status_services FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY status_services_manage_admin ON public.status_services FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- status_incidents ----
ALTER TABLE public.status_incidents ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY status_incidents_select_all ON public.status_incidents FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY status_incidents_manage_admin ON public.status_incidents FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- sources (internal, editor+ only) ----
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY sources_select_editor ON public.sources FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('editor','admin','super_admin','analyst')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY sources_manage_admin ON public.sources FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','editor')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- source_items ----
ALTER TABLE public.source_items ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY source_items_select_editor ON public.source_items FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('editor','admin','super_admin','reviewer','analyst')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY source_items_manage_admin ON public.source_items FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','editor')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- story_clusters ----
ALTER TABLE public.story_clusters ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY story_clusters_select_editor ON public.story_clusters FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('editor','admin','super_admin','reviewer')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY story_clusters_manage_admin ON public.story_clusters FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','editor')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- story_cluster_sources ----
ALTER TABLE public.story_cluster_sources ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY story_cluster_sources_select_editor ON public.story_cluster_sources FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('editor','admin','super_admin','reviewer')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY story_cluster_sources_manage_admin ON public.story_cluster_sources FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','editor')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- news_sources ----
ALTER TABLE public.news_sources ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY news_sources_select_all ON public.news_sources FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY news_sources_manage_editor ON public.news_sources FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('editor','admin','super_admin')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- news_entities ----
ALTER TABLE public.news_entities ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY news_entities_select_all ON public.news_entities FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY news_entities_manage_editor ON public.news_entities FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('editor','admin','super_admin')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- news_tags ----
ALTER TABLE public.news_tags ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY news_tags_select_all ON public.news_tags FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY news_tags_manage_editor ON public.news_tags FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('editor','admin','super_admin')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- ingestion_jobs ----
ALTER TABLE public.ingestion_jobs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY ingestion_jobs_select_editor ON public.ingestion_jobs FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('editor','admin','super_admin','analyst')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY ingestion_jobs_manage_admin ON public.ingestion_jobs FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','editor')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- ai_generations ----
ALTER TABLE public.ai_generations ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY ai_generations_select_editor ON public.ai_generations FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('editor','admin','super_admin','reviewer','analyst')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY ai_generations_manage_admin ON public.ai_generations FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','editor')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- claims ----
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY claims_select_editor ON public.claims FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('editor','admin','super_admin','reviewer','analyst')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY claims_manage_editor ON public.claims FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('editor','admin','super_admin')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- revisions ----
ALTER TABLE public.revisions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY revisions_select_editor ON public.revisions FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('editor','admin','super_admin','reviewer','analyst')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY revisions_insert_editor ON public.revisions FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('editor','admin','super_admin','author')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- analytics_events ----
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  -- Anyone can insert events (tracking); service role used server-side
  CREATE POLICY analytics_events_insert_any ON public.analytics_events FOR INSERT TO anon, authenticated WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY analytics_events_select_admin ON public.analytics_events FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin','analyst')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- redirects ----
ALTER TABLE public.redirects ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY redirects_select_all ON public.redirects FOR SELECT TO anon, authenticated USING (active = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY redirects_manage_admin ON public.redirects FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- seo_metadata ----
ALTER TABLE public.seo_metadata ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY seo_metadata_select_all ON public.seo_metadata FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY seo_metadata_manage_admin ON public.seo_metadata FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','super_admin')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- comments ----
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY comments_select_published ON public.comments FOR SELECT TO anon, authenticated USING (status = 'published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY comments_insert_auth ON public.comments FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY comments_update_own ON public.comments FOR UPDATE TO authenticated USING (author_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY comments_manage_moderator ON public.comments FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('community_moderator','admin','super_admin')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- reports ----
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY reports_insert_auth ON public.reports FOR INSERT TO authenticated WITH CHECK (reporter_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY reports_select_admin ON public.reports FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('community_moderator','admin','super_admin')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY reports_manage_admin ON public.reports FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('community_moderator','admin','super_admin')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- users: add public read for active profiles ----
DO $$ BEGIN
  CREATE POLICY users_select_public ON public.users
    FOR SELECT TO anon, authenticated
    USING (status = 'active');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 5. MISSING INDEXES
-- ============================================================

-- Technologies
CREATE INDEX IF NOT EXISTS technologies_published_trending_idx
  ON public.technologies(trending_score DESC) WHERE published = true;
CREATE INDEX IF NOT EXISTS technologies_published_popularity_idx
  ON public.technologies(popularity_score DESC) WHERE published = true;
CREATE INDEX IF NOT EXISTS technologies_published_type_idx
  ON public.technologies(type) WHERE published = true;

-- Tools
CREATE INDEX IF NOT EXISTS tools_published_trending_idx
  ON public.tools(trending_score DESC) WHERE published = true;
CREATE INDEX IF NOT EXISTS tools_published_popularity_idx
  ON public.tools(popularity_score DESC) WHERE published = true;
CREATE INDEX IF NOT EXISTS tools_published_category_idx
  ON public.tools(category_id) WHERE published = true;

-- News items
CREATE INDEX IF NOT EXISTS news_items_category_id_idx ON public.news_items(category_id);
CREATE INDEX IF NOT EXISTS news_items_published_at_partial_idx
  ON public.news_items(published_at DESC) WHERE status = 'published';

-- Articles
CREATE INDEX IF NOT EXISTS articles_published_at_idx
  ON public.articles(published_at DESC) WHERE status = 'published';

-- Courses
CREATE INDEX IF NOT EXISTS courses_published_idx
  ON public.courses(published_at DESC) WHERE status = 'published';

-- Comparisons
CREATE INDEX IF NOT EXISTS comparisons_published_idx
  ON public.comparisons(published_at DESC) WHERE status = 'published';

-- Companies
CREATE INDEX IF NOT EXISTS companies_category_id_idx ON public.companies(category_id);
CREATE INDEX IF NOT EXISTS companies_published_name_idx
  ON public.companies(name) WHERE published = true;

-- Ingestion jobs: worker polling pattern
CREATE INDEX IF NOT EXISTS ingestion_jobs_pending_idx
  ON public.ingestion_jobs(priority DESC, created_at ASC) WHERE status = 'pending';

-- Analytics: user lookup
CREATE INDEX IF NOT EXISTS analytics_events_user_id_idx
  ON public.analytics_events(user_id) WHERE user_id IS NOT NULL;

-- Newsletter
CREATE INDEX IF NOT EXISTS newsletter_email_idx ON public.newsletter_subscribers(email);

-- Enterprise leads
CREATE INDEX IF NOT EXISTS enterprise_leads_email_idx ON public.enterprise_leads(email);

-- Source items dedup
CREATE INDEX IF NOT EXISTS source_items_discovered_at_idx ON public.source_items(discovered_at DESC);
