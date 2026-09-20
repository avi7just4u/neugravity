-- ============================================================
-- MIGRATION 011 — REAL CONTENT SOURCES (20 HIGH-QUALITY RSS)
-- Run after 010_source_quality.sql
-- All sources start active=false — verify before activating
-- ============================================================

INSERT INTO public.sources (
  name, domain, website_url, feed_url, description,
  source_type, trust_level, trust_level_label, source_priority,
  category, active, poll_interval_seconds, health_status,
  failure_count, items_discovered
) VALUES

-- ── AI / ML ─────────────────────────────────────────────────
(
  'OpenAI Blog', 'openai.com', 'https://openai.com/news',
  'https://openai.com/news/rss.xml',
  'Official research and product updates from OpenAI.',
  'rss', 9, 'official', 9, 'ai', false, 3600, 'unknown', 0, 0
),
(
  'Anthropic News', 'anthropic.com', 'https://www.anthropic.com/news',
  'https://www.anthropic.com/rss.xml',
  'Official announcements and research from Anthropic.',
  'rss', 9, 'official', 9, 'ai', false, 3600, 'unknown', 0, 0
),
(
  'Google DeepMind Blog', 'deepmind.google', 'https://deepmind.google/blog',
  'https://deepmind.google/blog/rss.xml',
  'Research blog from Google DeepMind.',
  'rss', 9, 'official', 8, 'ai', false, 7200, 'unknown', 0, 0
),
(
  'Hugging Face Blog', 'huggingface.co', 'https://huggingface.co/blog',
  'https://huggingface.co/blog/feed.xml',
  'ML practitioner blog, model releases, and community updates.',
  'rss', 8, 'official', 8, 'ai', false, 3600, 'unknown', 0, 0
),
(
  'TechCrunch AI', 'techcrunch.com', 'https://techcrunch.com/category/artificial-intelligence',
  'https://techcrunch.com/category/artificial-intelligence/feed/',
  'AI and ML coverage from TechCrunch.',
  'rss', 7, 'reputable_secondary', 6, 'ai', false, 1800, 'unknown', 0, 0
),

-- ── CLOUD INFRASTRUCTURE ────────────────────────────────────
(
  'AWS News Blog', 'aws.amazon.com', 'https://aws.amazon.com/blogs/aws',
  'https://aws.amazon.com/blogs/aws/feed/',
  'Official AWS product announcements and news.',
  'rss', 9, 'official', 8, 'cloud', false, 3600, 'unknown', 0, 0
),
(
  'Google Cloud Blog', 'cloud.google.com', 'https://cloud.google.com/blog',
  'https://cloudblog.withgoogle.com/rss/',
  'Official Google Cloud product news and technical content.',
  'rss', 9, 'official', 8, 'cloud', false, 3600, 'unknown', 0, 0
),
(
  'Microsoft Azure Blog', 'azure.microsoft.com', 'https://azure.microsoft.com/en-us/blog',
  'https://azure.microsoft.com/en-us/blog/feed/',
  'Official Microsoft Azure announcements and updates.',
  'rss', 9, 'official', 8, 'cloud', false, 3600, 'unknown', 0, 0
),

-- ── DEVELOPER TOOLS ─────────────────────────────────────────
(
  'GitHub Blog', 'github.blog', 'https://github.blog',
  'https://github.blog/feed/',
  'Product news, engineering, and community from GitHub.',
  'rss', 9, 'official', 8, 'developer', false, 3600, 'unknown', 0, 0
),
(
  'Vercel Blog', 'vercel.com', 'https://vercel.com/blog',
  'https://vercel.com/blog/rss.xml',
  'Frontend infrastructure, Next.js, and developer experience.',
  'rss', 8, 'official', 7, 'developer', false, 3600, 'unknown', 0, 0
),
(
  'InfoQ', 'infoq.com', 'https://www.infoq.com',
  'https://feed.infoq.com/',
  'Software engineering news, articles, and presentations.',
  'rss', 8, 'reputable_secondary', 7, 'developer', false, 3600, 'unknown', 0, 0
),

-- ── INFRASTRUCTURE / DEVOPS ─────────────────────────────────
(
  'HashiCorp Blog', 'hashicorp.com', 'https://www.hashicorp.com/blog',
  'https://www.hashicorp.com/blog/feed.xml',
  'Infrastructure automation, Terraform, Vault, and Consul.',
  'rss', 8, 'official', 7, 'infrastructure', false, 7200, 'unknown', 0, 0
),
(
  'CNCF Blog', 'cncf.io', 'https://www.cncf.io/blog',
  'https://www.cncf.io/blog/feed/',
  'Cloud native computing: Kubernetes, Prometheus, and CNCF projects.',
  'rss', 8, 'official', 7, 'infrastructure', false, 7200, 'unknown', 0, 0
),
(
  'The New Stack', 'thenewstack.io', 'https://thenewstack.io',
  'https://thenewstack.io/feed/',
  'Cloud native, microservices, DevOps, and platform engineering.',
  'rss', 7, 'reputable_secondary', 6, 'infrastructure', false, 3600, 'unknown', 0, 0
),

-- ── SECURITY ────────────────────────────────────────────────
(
  'Krebs on Security', 'krebsonsecurity.com', 'https://krebsonsecurity.com',
  'https://krebsonsecurity.com/feed/',
  'Investigative cybersecurity journalism by Brian Krebs.',
  'rss', 9, 'primary', 8, 'security', false, 3600, 'unknown', 0, 0
),
(
  'The Hacker News', 'thehackernews.com', 'https://thehackernews.com',
  'https://feeds.feedburner.com/TheHackersNews',
  'Daily cybersecurity news, vulnerabilities, and breaches.',
  'rss', 7, 'reputable_secondary', 7, 'security', false, 1800, 'unknown', 0, 0
),

-- ── DATABASES ───────────────────────────────────────────────
(
  'PostgreSQL News', 'postgresql.org', 'https://www.postgresql.org/news',
  'https://www.postgresql.org/news/pwr/rss/',
  'Official PostgreSQL project news and release announcements.',
  'rss', 9, 'official', 7, 'databases', false, 86400, 'unknown', 0, 0
),
(
  'MongoDB Blog', 'mongodb.com', 'https://www.mongodb.com/blog',
  'https://www.mongodb.com/developer/feed.xml',
  'MongoDB product updates, tutorials, and developer content.',
  'rss', 8, 'official', 6, 'databases', false, 7200, 'unknown', 0, 0
),

-- ── OPEN SOURCE ─────────────────────────────────────────────
(
  'Linux Foundation Blog', 'linuxfoundation.org', 'https://www.linuxfoundation.org/blog',
  'https://www.linuxfoundation.org/blog/feed',
  'Linux, open source projects, and foundation news.',
  'rss', 8, 'official', 7, 'open-source', false, 86400, 'unknown', 0, 0
),

-- ── GENERAL TECH ─────────────────────────────────────────────
(
  'Wired', 'wired.com', 'https://www.wired.com',
  'https://www.wired.com/feed/rss',
  'Long-form tech journalism and culture.',
  'rss', 7, 'reputable_secondary', 6, 'general', false, 3600, 'unknown', 0, 0
)

ON CONFLICT (domain) DO UPDATE SET
  feed_url          = EXCLUDED.feed_url,
  trust_level       = EXCLUDED.trust_level,
  trust_level_label = EXCLUDED.trust_level_label,
  source_priority   = EXCLUDED.source_priority,
  category          = EXCLUDED.category,
  description       = EXCLUDED.description,
  poll_interval_seconds = EXCLUDED.poll_interval_seconds;

SELECT
  category,
  COUNT(*) AS source_count,
  AVG(trust_level)::numeric(4,1) AS avg_trust
FROM public.sources
WHERE category IS NOT NULL
GROUP BY category
ORDER BY category;
