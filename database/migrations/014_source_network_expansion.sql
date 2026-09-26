-- MIGRATION 014 — SOURCE NETWORK EXPANSION

-- 1. Add multi-category array to sources (keep single category for backward compat)
ALTER TABLE public.sources ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}';

-- Migrate existing single categories into array
UPDATE public.sources
SET categories = ARRAY[category]
WHERE category IS NOT NULL AND (categories IS NULL OR cardinality(categories) = 0);

-- 2. Extend source_type check to include new types
ALTER TABLE public.sources DROP CONSTRAINT IF EXISTS sources_source_type_check;
ALTER TABLE public.sources ADD CONSTRAINT sources_source_type_check CHECK (
  source_type = ANY(ARRAY[
    'official_company','official_blog','engineering_blog','release_feed',
    'rss','api','news','youtube','manual','community','status','graphql','security_advisory'
  ])
);

-- 3. Extend category check to include new taxonomy categories
ALTER TABLE public.sources DROP CONSTRAINT IF EXISTS sources_category_check;
ALTER TABLE public.sources ADD CONSTRAINT sources_category_check CHECK (
  category IS NULL OR category = ANY(ARRAY[
    'ai','cloud','security','cybersecurity','developer','infrastructure',
    'enterprise','databases','open-source','productivity','hardware','general',
    'technology_companies','open_source'
  ])
);

-- 4. Add editorial_priority to source_items
ALTER TABLE public.source_items ADD COLUMN IF NOT EXISTS editorial_priority TEXT DEFAULT 'medium';
ALTER TABLE public.source_items DROP CONSTRAINT IF EXISTS source_items_editorial_priority_check;
ALTER TABLE public.source_items ADD CONSTRAINT source_items_editorial_priority_check
  CHECK (editorial_priority = ANY(ARRAY['high','medium','low']));

-- 5. Index for editorial priority queries
CREATE INDEX IF NOT EXISTS idx_source_items_editorial_priority
  ON public.source_items (editorial_priority, processing_status)
  WHERE processing_status = 'ready_for_review';

-- 6. Add items_discovered_today counter helper view
-- (actual count done via query, not materialized)

SELECT 'Migration 014 complete' as result;
