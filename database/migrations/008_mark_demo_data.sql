-- ============================================================
-- MIGRATION 008 — MARK DEMO/SEED DATA
-- ============================================================
-- Adds is_demo column to content tables so seed records can be
-- filtered from production display without being deleted.
--
-- USAGE:
--   1. Run this migration against your Supabase project.
--   2. Set FILTER_DEMO_DATA=true in your Vercel environment variables.
--   3. Public pages will then show empty states instead of seed data.
--
-- NOTE: Records created after this migration runs will have is_demo=false
-- by default. Only records from before this migration (all seed data) are
-- marked as demo.
-- ============================================================

-- Add is_demo column to content tables
ALTER TABLE public.news_articles ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;
ALTER TABLE public.news_items    ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;
ALTER TABLE public.tools         ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;
ALTER TABLE public.technologies  ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;
ALTER TABLE public.companies     ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;
ALTER TABLE public.tool_comparisons ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;
ALTER TABLE public.articles      ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;

-- Mark all records that existed before this migration as demo.
-- Uses a generous 1 minute window to avoid race conditions.
UPDATE public.news_articles    SET is_demo = true WHERE created_at < NOW() - INTERVAL '1 minute';
UPDATE public.news_items       SET is_demo = true WHERE created_at < NOW() - INTERVAL '1 minute';
UPDATE public.tools            SET is_demo = true WHERE created_at < NOW() - INTERVAL '1 minute';
UPDATE public.technologies     SET is_demo = true WHERE created_at < NOW() - INTERVAL '1 minute';
UPDATE public.companies        SET is_demo = true WHERE created_at < NOW() - INTERVAL '1 minute';
UPDATE public.tool_comparisons SET is_demo = true WHERE created_at < NOW() - INTERVAL '1 minute';
UPDATE public.articles         SET is_demo = true WHERE created_at < NOW() - INTERVAL '1 minute';

-- Fast indexes for production filtering
CREATE INDEX IF NOT EXISTS idx_news_articles_is_demo    ON public.news_articles(is_demo)    WHERE is_demo = false;
CREATE INDEX IF NOT EXISTS idx_news_items_is_demo       ON public.news_items(is_demo)       WHERE is_demo = false;
CREATE INDEX IF NOT EXISTS idx_tools_is_demo            ON public.tools(is_demo)            WHERE is_demo = false;
CREATE INDEX IF NOT EXISTS idx_technologies_is_demo     ON public.technologies(is_demo)     WHERE is_demo = false;
CREATE INDEX IF NOT EXISTS idx_companies_is_demo        ON public.companies(is_demo)        WHERE is_demo = false;
CREATE INDEX IF NOT EXISTS idx_tool_comparisons_is_demo ON public.tool_comparisons(is_demo) WHERE is_demo = false;
