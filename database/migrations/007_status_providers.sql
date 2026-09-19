-- ============================================================
-- MIGRATION 007 — REAL STATUS PROVIDERS
-- ============================================================
-- Adds connector metadata to status_providers.
-- Inserts real provider records for OpenAI, GitHub, AWS, etc.
-- All providers link to their official Statuspage.io or custom APIs.
-- ============================================================

-- Add connector metadata columns to status_providers
ALTER TABLE public.status_providers
  ADD COLUMN IF NOT EXISTS slug            text UNIQUE,
  ADD COLUMN IF NOT EXISTS connector_key  text,
  ADD COLUMN IF NOT EXISTS poll_interval_seconds int NOT NULL DEFAULT 300,
  ADD COLUMN IF NOT EXISTS last_checked_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_success_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_error      text,
  ADD COLUMN IF NOT EXISTS feed_url        text;

-- Deactivate any existing demo/placeholder providers
UPDATE public.status_providers SET active = false WHERE slug IS NULL;

-- Insert real providers (upsert on slug)
INSERT INTO public.status_providers (name, slug, category, website_url, official_status_url, active, connector_key, poll_interval_seconds)
VALUES
  ('OpenAI',        'openai',      'ai',             'https://openai.com',          'https://status.openai.com',              true, 'statuspage', 300),
  ('Anthropic',     'anthropic',   'ai',             'https://anthropic.com',        'https://status.anthropic.com',           true, 'statuspage', 300),
  ('GitHub',        'github',      'developer',      'https://github.com',           'https://githubstatus.com',               true, 'statuspage', 300),
  ('Cloudflare',    'cloudflare',  'infrastructure', 'https://cloudflare.com',       'https://www.cloudflarestatus.com',       true, 'statuspage', 300),
  ('Azure',         'azure',       'cloud',          'https://azure.microsoft.com',  'https://azure.status.microsoft',         true, 'statuspage', 300),
  ('Vercel',        'vercel',      'developer',      'https://vercel.com',           'https://www.vercel-status.com',          true, 'statuspage', 300),
  ('Stripe',        'stripe',      'payments',       'https://stripe.com',           'https://status.stripe.com',              true, 'statuspage', 300),
  ('Supabase',      'supabase',    'developer',      'https://supabase.com',         'https://status.supabase.com',            true, 'statuspage', 300),
  ('AWS',           'aws',         'cloud',          'https://aws.amazon.com',       'https://health.aws.amazon.com',          true, 'aws-health', 300),
  ('Google Cloud',  'gcp',         'cloud',          'https://cloud.google.com',     'https://status.cloud.google.com',        true, 'gcp-health', 300)
ON CONFLICT (slug) DO UPDATE SET
  active             = EXCLUDED.active,
  connector_key      = EXCLUDED.connector_key,
  poll_interval_seconds = EXCLUDED.poll_interval_seconds,
  official_status_url = EXCLUDED.official_status_url,
  website_url        = EXCLUDED.website_url,
  category           = EXCLUDED.category;

SELECT 'Migration 007 complete — ' || count(*) || ' providers active' AS result
FROM public.status_providers WHERE active = true;
