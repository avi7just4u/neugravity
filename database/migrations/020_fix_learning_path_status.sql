-- ============================================================
-- Migration 020: Fix learning_paths status constraint
-- Add 'approved' to the status CHECK to match course workflow.
-- ============================================================

ALTER TABLE public.learning_paths DROP CONSTRAINT IF EXISTS learning_paths_status_check;

ALTER TABLE public.learning_paths
  ADD CONSTRAINT learning_paths_status_check
  CHECK (status IN ('draft','review','approved','published','archived'));
