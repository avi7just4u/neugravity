-- ============================================================
-- MIGRATION 009 — AI ENRICHMENT FIELDS
-- Adds prompt_version to ai_generations for versioned prompts
-- ============================================================

ALTER TABLE public.ai_generations
  ADD COLUMN IF NOT EXISTS prompt_version text;

CREATE INDEX IF NOT EXISTS idx_ai_generations_task_status
  ON public.ai_generations(task, status);

CREATE INDEX IF NOT EXISTS idx_ai_generations_created_at
  ON public.ai_generations(created_at DESC);

SELECT 'Migration 009 complete' AS result;
