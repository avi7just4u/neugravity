-- Atomic job claiming using SELECT FOR UPDATE SKIP LOCKED
-- Called by JobService.claimNext() to prevent double-processing

CREATE OR REPLACE FUNCTION claim_next_job(
  p_queue_name text,
  p_now timestamptz DEFAULT now()
)
RETURNS SETOF jobs
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  UPDATE jobs
  SET
    status = 'running',
    started_at = p_now,
    attempts = attempts + 1
  WHERE id = (
    SELECT id FROM jobs
    WHERE queue_name = p_queue_name
      AND status IN ('queued', 'retrying')
      AND scheduled_at <= p_now
    ORDER BY priority DESC, scheduled_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED
  )
  RETURNING *;
END;
$$;

GRANT EXECUTE ON FUNCTION claim_next_job(text, timestamptz) TO service_role;

SELECT 'Migration 006: claim_next_job function created' AS result;
