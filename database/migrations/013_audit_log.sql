-- MIGRATION 013 — AUDIT LOG ENHANCEMENT
-- The audit_logs table already exists from an earlier migration.
-- This adds actor_email, summary, and metadata columns needed for richer logging.

ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS actor_email text,
  ADD COLUMN IF NOT EXISTS summary text,
  ADD COLUMN IF NOT EXISTS metadata jsonb;

-- entity_id is currently uuid; add a text alias for non-uuid entity IDs
ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS entity_id_text text;

-- Additional indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs (action);

-- Drop overly permissive insert policy (only service-role should insert)
DROP POLICY IF EXISTS "audit_logs_insert_authenticated" ON public.audit_logs;

-- Update select policy to also allow analyst role
DROP POLICY IF EXISTS "audit_logs_admin_select" ON public.audit_logs;
CREATE POLICY "audit_logs_admin_read" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin', 'analyst')
    )
  );
