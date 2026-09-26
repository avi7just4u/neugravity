-- Migration 015: Real tool catalog (non-demo)
-- Adds 4 new categories, 15 new companies, 30 real tools, pricing tiers, and a source record.
-- All tools: is_demo=false, published=true, verified=true.

-- ============================================================
-- STEP 1: New categories
-- ============================================================
INSERT INTO public.categories (id, name, slug, description) VALUES
  ('10000000-0000-0000-0000-000000000006', 'Security',        'security',       'Cybersecurity tools and platforms'),
  ('10000000-0000-0000-0000-000000000007', 'Data & Analytics','data-analytics',  'Data processing, analytics, and visualization tools'),
  ('10000000-0000-0000-0000-000000000008', 'Design',          'design',          'Design, prototyping, and creative tools'),
  ('10000000-0000-0000-0000-000000000009', 'Productivity',    'productivity',    'Team collaboration and productivity tools')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STEP 2: New companies (id, name, slug only — other cols nullable)
-- ============================================================
INSERT INTO public.companies (id, name, slug) VALUES
  ('40000000-0000-0000-0000-000000000016', 'Notion',            'notion'),
  ('40000000-0000-0000-0000-000000000017', 'Figma',             'figma'),
  ('40000000-0000-0000-0000-000000000018', 'Supabase',          'supabase'),
  ('40000000-0000-0000-0000-000000000019', 'PlanetScale',       'planetscale'),
  ('40000000-0000-0000-0000-000000000020', 'Neon',              'neon'),
  ('40000000-0000-0000-0000-000000000021', 'Render',            'render'),
  ('40000000-0000-0000-0000-000000000022', 'Railway',           'railway'),
  ('40000000-0000-0000-0000-000000000023', 'Fly.io',            'fly-io'),
  ('40000000-0000-0000-0000-000000000024', 'Cloudflare Pages',  'cloudflare-pages'),
  ('40000000-0000-0000-0000-000000000025', 'Resend',            'resend'),
  ('40000000-0000-0000-0000-000000000026', 'PostHog',           'posthog'),
  ('40000000-0000-0000-0000-000000000027', 'Sentry',            'sentry'),
  ('40000000-0000-0000-0000-000000000028', 'Datadog',           'datadog'),
  ('40000000-0000-0000-0000-000000000029', 'Grafana Labs',      'grafana-labs'),
  ('40000000-0000-0000-0000-000000000030', 'JFrog',             'jfrog')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STEP 3: Real tools (30 records)
-- ============================================================
INSERT INTO public.tools (
  name, slug, tagline, description,
  website_url, docs_url, github_url,
  category_id, company_id,
  tool_type, pricing_model, has_free_tier, has_api, enterprise_available,
  status, published, verified, is_demo,
  last_verified_at
) VALUES

-- ── AI & Machine Learning ─────────────────────────────────────
('Claude',
 'claude',
 'AI assistant by Anthropic',
 'Claude is an AI assistant built by Anthropic, focused on safety and helpfulness. Available via the claude.ai web interface and the Claude API for developers.',
 'https://claude.ai', 'https://docs.anthropic.com', NULL,
 '10000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000006',
 'saas', 'freemium', true, true, true,
 'active', true, true, false, NOW()),

('ChatGPT',
 'chatgpt',
 'AI chatbot by OpenAI',
 'ChatGPT is an AI-powered chatbot developed by OpenAI. It supports conversation, writing, coding, and analysis tasks, with a free tier and a paid Plus plan.',
 'https://chat.openai.com', 'https://platform.openai.com/docs', NULL,
 '10000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001',
 'saas', 'freemium', true, true, true,
 'active', true, true, false, NOW()),

('Gemini',
 'gemini',
 'Google AI assistant',
 'Gemini is Google''s multimodal AI model family, available as a consumer assistant at gemini.google.com and via the Gemini API for developers.',
 'https://gemini.google.com', 'https://ai.google.dev', NULL,
 '10000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002',
 'saas', 'freemium', true, true, true,
 'active', true, true, false, NOW()),

('Hugging Face',
 'hugging-face',
 'AI model hub and platform',
 'Hugging Face is the open source platform for machine learning models, datasets, and applications. It hosts the Transformers library and tens of thousands of community models.',
 'https://huggingface.co', 'https://huggingface.co/docs', 'https://github.com/huggingface/transformers',
 '10000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000013',
 'platform', 'freemium', true, true, true,
 'active', true, true, false, NOW()),

-- ── Developer Tools ───────────────────────────────────────────
('GitHub Copilot',
 'github-copilot',
 'AI pair programmer',
 'GitHub Copilot is an AI coding assistant that suggests code completions in real time inside IDEs including VS Code, JetBrains IDEs, and Neovim. Powered by OpenAI Codex and GPT-4.',
 'https://github.com/features/copilot', 'https://docs.github.com/en/copilot', NULL,
 '10000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000011',
 'saas', 'subscription', false, true, true,
 'active', true, true, false, NOW()),

('Cursor',
 'cursor',
 'AI-first code editor',
 'Cursor is an AI-native code editor built on VS Code that integrates LLM-powered coding assistance, inline chat, and multi-file edits directly into the editing experience.',
 'https://cursor.sh', 'https://docs.cursor.sh', NULL,
 '10000000-0000-0000-0000-000000000003', NULL,
 'desktop', 'freemium', true, false, true,
 'active', true, true, false, NOW()),

('VS Code',
 'vscode',
 'Free source-code editor by Microsoft',
 'Visual Studio Code is a free, open source code editor by Microsoft. It supports debugging, syntax highlighting, intelligent code completion via IntelliSense, and a rich extension marketplace.',
 'https://code.visualstudio.com', 'https://code.visualstudio.com/docs', 'https://github.com/microsoft/vscode',
 '10000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000003',
 'desktop', 'open_source', true, false, false,
 'active', true, true, false, NOW()),

('JetBrains IntelliJ IDEA',
 'intellij-idea',
 'IDE for JVM and polyglot development',
 'IntelliJ IDEA is an IDE by JetBrains for Java, Kotlin, and polyglot development. The Community Edition is free and open source; the Ultimate Edition adds support for web and enterprise frameworks.',
 'https://www.jetbrains.com/idea/', 'https://www.jetbrains.com/help/idea/', 'https://github.com/JetBrains/intellij-community',
 '10000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000014',
 'desktop', 'freemium', true, false, true,
 'active', true, true, false, NOW()),

('Sentry',
 'sentry',
 'Application monitoring and error tracking',
 'Sentry is an error tracking and performance monitoring platform. It captures application exceptions and performance issues in real time and links them to source code via source maps.',
 'https://sentry.io', 'https://docs.sentry.io', 'https://github.com/getsentry/sentry',
 '10000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000027',
 'saas', 'freemium', true, true, true,
 'active', true, true, false, NOW()),

('PostHog',
 'posthog',
 'Open source product analytics',
 'PostHog is an open source product analytics platform offering event tracking, session recording, feature flags, A/B testing, and heatmaps. Can be self-hosted or used as a cloud service.',
 'https://posthog.com', 'https://posthog.com/docs', 'https://github.com/PostHog/posthog',
 '10000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000026',
 'saas', 'freemium', true, true, true,
 'active', true, true, false, NOW()),

('Resend',
 'resend',
 'Email API for developers',
 'Resend is a transactional email API built for developers. It supports React-based email templates via react-email, provides delivery logs, analytics, and domain verification.',
 'https://resend.com', 'https://resend.com/docs', NULL,
 '10000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000025',
 'api', 'freemium', true, true, false,
 'active', true, true, false, NOW()),

('GitHub Actions',
 'github-actions',
 'CI/CD and automation on GitHub',
 'GitHub Actions is a CI/CD and automation platform built into GitHub. Teams define YAML workflows triggered by repository events such as push, pull request, or schedule.',
 'https://github.com/features/actions', 'https://docs.github.com/en/actions', NULL,
 '10000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000011',
 'saas', 'freemium', true, true, true,
 'active', true, true, false, NOW()),

('Docker',
 'docker',
 'Container platform for building and shipping apps',
 'Docker is a platform for developing, shipping, and running applications in containers. It includes Docker Desktop for local development, Docker Hub for image hosting, and Docker Compose for multi-container apps.',
 'https://docker.com', 'https://docs.docker.com', 'https://github.com/docker/cli',
 '10000000-0000-0000-0000-000000000003', NULL,
 'cli', 'freemium', true, false, true,
 'active', true, true, false, NOW()),

('Linear',
 'linear',
 'Issue tracking for software teams',
 'Linear is a project management and issue tracking tool built for modern software teams. It emphasizes speed, keyboard shortcuts, and a streamlined developer experience over heavyweight workflow configuration.',
 'https://linear.app', 'https://linear.app/docs', NULL,
 '10000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000015',
 'saas', 'freemium', true, true, true,
 'active', true, true, false, NOW()),

-- ── Cloud & Infrastructure ────────────────────────────────────
('Vercel',
 'vercel-platform',
 'Frontend cloud platform',
 'Vercel is a cloud platform for deploying and scaling frontend applications. It provides serverless functions, a global edge network, analytics, and CI/CD integration with Git providers.',
 'https://vercel.com', 'https://vercel.com/docs', NULL,
 '10000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000005',
 'platform', 'freemium', true, true, true,
 'active', true, true, false, NOW()),

('Supabase',
 'supabase',
 'Open source Firebase alternative',
 'Supabase is an open source backend-as-a-service platform built on PostgreSQL. It provides a hosted database, authentication, file storage, real-time subscriptions, and auto-generated REST and GraphQL APIs.',
 'https://supabase.com', 'https://supabase.com/docs', 'https://github.com/supabase/supabase',
 '10000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000018',
 'platform', 'freemium', true, true, true,
 'active', true, true, false, NOW()),

('Cloudflare',
 'cloudflare',
 'Global cloud platform for connectivity',
 'Cloudflare provides CDN, DDoS protection, DNS, serverless computing (Workers), KV storage, and network security services for websites and APIs across a global edge network.',
 'https://cloudflare.com', 'https://developers.cloudflare.com', NULL,
 '10000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000010',
 'platform', 'freemium', true, true, true,
 'active', true, true, false, NOW()),

('Terraform',
 'terraform',
 'Infrastructure as code tool',
 'Terraform is an open source infrastructure-as-code tool by HashiCorp. Teams define and provision infrastructure across cloud providers using a declarative HCL configuration language.',
 'https://www.terraform.io', 'https://developer.hashicorp.com/terraform/docs', 'https://github.com/hashicorp/terraform',
 '10000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000004',
 'cli', 'open_source', true, true, true,
 'active', true, true, false, NOW()),

('AWS Lambda',
 'aws-lambda',
 'Serverless compute on AWS',
 'AWS Lambda is a serverless compute service that runs code in response to events without provisioning or managing servers. It supports multiple runtimes and scales automatically.',
 'https://aws.amazon.com/lambda/', 'https://docs.aws.amazon.com/lambda/', NULL,
 '10000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000008',
 'platform', 'usage_based', true, true, true,
 'active', true, true, false, NOW()),

('Google Cloud Run',
 'google-cloud-run',
 'Fully managed container runtime',
 'Cloud Run is a managed compute platform on Google Cloud that automatically scales stateless containers to zero. It supports any language or framework packaged in a container.',
 'https://cloud.google.com/run', 'https://cloud.google.com/run/docs', NULL,
 '10000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002',
 'platform', 'usage_based', true, true, true,
 'active', true, true, false, NOW()),

('Grafana',
 'grafana',
 'Open source observability platform',
 'Grafana is an open source analytics and monitoring platform for metrics, logs, and traces. It integrates with Prometheus, Loki, Tempo, and dozens of other data sources.',
 'https://grafana.com', 'https://grafana.com/docs/', 'https://github.com/grafana/grafana',
 '10000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000029',
 'saas', 'open_source', true, true, true,
 'active', true, true, false, NOW()),

('Neon',
 'neon',
 'Serverless Postgres with branching',
 'Neon is a serverless PostgreSQL platform with database branching, autoscaling to zero, and instant provisioning. Compatible with standard Postgres drivers and tools.',
 'https://neon.tech', 'https://neon.tech/docs', 'https://github.com/neondatabase/neon',
 '10000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000020',
 'saas', 'freemium', true, true, false,
 'active', true, true, false, NOW()),

('Render',
 'render',
 'Cloud hosting for web apps and databases',
 'Render is a cloud platform for hosting web services, static sites, PostgreSQL databases, Redis instances, and cron jobs. Deploys directly from Git repositories.',
 'https://render.com', 'https://render.com/docs', NULL,
 '10000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000021',
 'platform', 'freemium', true, true, false,
 'active', true, true, false, NOW()),

('Railway',
 'railway',
 'Infrastructure for developers',
 'Railway is a cloud platform for deploying applications, databases, and services from a Git repository with minimal configuration. Supports Postgres, Redis, MySQL, and custom Docker images.',
 'https://railway.app', 'https://docs.railway.app', NULL,
 '10000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000022',
 'platform', 'usage_based', true, true, false,
 'active', true, true, false, NOW()),

('Datadog',
 'datadog',
 'Monitoring and security platform',
 'Datadog is a cloud monitoring, security, and observability platform. It aggregates metrics, traces, logs, and security signals from infrastructure, applications, and third-party services.',
 'https://datadoghq.com', 'https://docs.datadoghq.com', NULL,
 '10000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000028',
 'saas', 'usage_based', false, true, true,
 'active', true, true, false, NOW()),

-- ── Enterprise Technology ─────────────────────────────────────
('Stripe',
 'stripe',
 'Payment infrastructure for the internet',
 'Stripe is a suite of payment APIs and financial tools for accepting payments online, managing subscriptions, issuing cards, and running global marketplace businesses.',
 'https://stripe.com', 'https://stripe.com/docs', NULL,
 '10000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000009',
 'api', 'usage_based', true, true, true,
 'active', true, true, false, NOW()),

-- ── Data & Analytics ──────────────────────────────────────────
('Databricks',
 'databricks',
 'Unified analytics platform',
 'Databricks is a unified analytics platform for data engineering, machine learning, and collaborative data science built on Apache Spark. It supports Delta Lake and MLflow.',
 'https://databricks.com', 'https://docs.databricks.com', NULL,
 '10000000-0000-0000-0000-000000000007', '40000000-0000-0000-0000-000000000012',
 'platform', 'usage_based', false, true, true,
 'active', true, true, false, NOW()),

-- ── Security ─────────────────────────────────────────────────
('1Password',
 'onepassword',
 'Password manager for individuals and teams',
 '1Password is a password manager and digital wallet for securely storing and sharing credentials, credit cards, and sensitive notes. Available for individuals, families, and businesses.',
 'https://1password.com', 'https://developer.1password.com', NULL,
 '10000000-0000-0000-0000-000000000006', NULL,
 'saas', 'subscription', false, true, true,
 'active', true, true, false, NOW()),

-- ── Design ───────────────────────────────────────────────────
('Figma',
 'figma',
 'Collaborative interface design tool',
 'Figma is a web-based collaborative design tool for UI/UX design, prototyping, and design systems. It runs in the browser with real-time multiplayer collaboration.',
 'https://figma.com', 'https://help.figma.com', NULL,
 '10000000-0000-0000-0000-000000000008', '40000000-0000-0000-0000-000000000017',
 'saas', 'freemium', true, true, true,
 'active', true, true, false, NOW()),

-- ── Productivity ─────────────────────────────────────────────
('Notion',
 'notion',
 'Connected workspace for notes, docs, and projects',
 'Notion is an all-in-one workspace for note-taking, project management, wikis, and databases. It uses a flexible block-based editor and supports a public API for integrations.',
 'https://notion.so', 'https://developers.notion.com', NULL,
 '10000000-0000-0000-0000-000000000009', '40000000-0000-0000-0000-000000000016',
 'saas', 'freemium', true, true, true,
 'active', true, true, false, NOW()),

('Slack',
 'slack',
 'Business messaging and collaboration',
 'Slack is a business communication platform organized into channels. It supports direct messages, file sharing, workflow automation, and thousands of third-party app integrations.',
 'https://slack.com', 'https://api.slack.com', NULL,
 '10000000-0000-0000-0000-000000000009', NULL,
 'saas', 'freemium', true, true, true,
 'active', true, true, false, NOW())

ON CONFLICT (slug) DO UPDATE SET
  tagline          = EXCLUDED.tagline,
  description      = EXCLUDED.description,
  website_url      = EXCLUDED.website_url,
  docs_url         = EXCLUDED.docs_url,
  github_url       = EXCLUDED.github_url,
  category_id      = EXCLUDED.category_id,
  company_id       = EXCLUDED.company_id,
  tool_type        = EXCLUDED.tool_type,
  pricing_model    = EXCLUDED.pricing_model,
  has_free_tier    = EXCLUDED.has_free_tier,
  has_api          = EXCLUDED.has_api,
  enterprise_available = EXCLUDED.enterprise_available,
  is_demo          = false,
  published        = true,
  verified         = true,
  last_verified_at = NOW();

-- ============================================================
-- STEP 4: Tool pricing tiers (only well-documented plans)
-- tool_pricing columns: tool_id, plan_name, price_monthly,
--   price_annual, price_currency, features, limits,
--   is_free, is_most_popular, source_url, last_verified_at
-- NO fabricated prices — only is_free flag and plan name.
-- ============================================================

-- Claude: Free tier documented at claude.ai
INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Free', true, 'https://claude.ai', NOW()
FROM public.tools WHERE slug = 'claude' AND is_demo = false
ON CONFLICT DO NOTHING;

INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Pro', false, 'https://claude.ai', NOW()
FROM public.tools WHERE slug = 'claude' AND is_demo = false
ON CONFLICT DO NOTHING;

-- ChatGPT: Free and Plus tiers documented at chat.openai.com
INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Free', true, 'https://chat.openai.com', NOW()
FROM public.tools WHERE slug = 'chatgpt' AND is_demo = false
ON CONFLICT DO NOTHING;

INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Plus', false, 'https://openai.com/chatgpt/pricing', NOW()
FROM public.tools WHERE slug = 'chatgpt' AND is_demo = false
ON CONFLICT DO NOTHING;

-- Gemini: Free and Advanced tiers
INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Free', true, 'https://gemini.google.com', NOW()
FROM public.tools WHERE slug = 'gemini' AND is_demo = false
ON CONFLICT DO NOTHING;

INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Advanced', false, 'https://one.google.com/about/google-gemini', NOW()
FROM public.tools WHERE slug = 'gemini' AND is_demo = false
ON CONFLICT DO NOTHING;

-- GitHub Copilot: Individual subscription (no free tier for general use)
INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Individual', false, 'https://github.com/features/copilot', NOW()
FROM public.tools WHERE slug = 'github-copilot' AND is_demo = false
ON CONFLICT DO NOTHING;

INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Business', false, 'https://github.com/features/copilot', NOW()
FROM public.tools WHERE slug = 'github-copilot' AND is_demo = false
ON CONFLICT DO NOTHING;

-- Cursor: Free hobby plan + Pro plan
INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Hobby', true, 'https://cursor.sh/pricing', NOW()
FROM public.tools WHERE slug = 'cursor' AND is_demo = false
ON CONFLICT DO NOTHING;

INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Pro', false, 'https://cursor.sh/pricing', NOW()
FROM public.tools WHERE slug = 'cursor' AND is_demo = false
ON CONFLICT DO NOTHING;

-- VS Code: Free only
INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Free', true, 'https://code.visualstudio.com', NOW()
FROM public.tools WHERE slug = 'vscode' AND is_demo = false
ON CONFLICT DO NOTHING;

-- Sentry: Free Developer plan + Team/Business
INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Developer', true, 'https://sentry.io/pricing/', NOW()
FROM public.tools WHERE slug = 'sentry' AND is_demo = false
ON CONFLICT DO NOTHING;

INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Team', false, 'https://sentry.io/pricing/', NOW()
FROM public.tools WHERE slug = 'sentry' AND is_demo = false
ON CONFLICT DO NOTHING;

-- PostHog: Free tier for up to 1M events/month
INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Free', true, 'https://posthog.com/pricing', NOW()
FROM public.tools WHERE slug = 'posthog' AND is_demo = false
ON CONFLICT DO NOTHING;

INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Paid', false, 'https://posthog.com/pricing', NOW()
FROM public.tools WHERE slug = 'posthog' AND is_demo = false
ON CONFLICT DO NOTHING;

-- Resend: Free tier (up to 3,000 emails/month documented)
INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Free', true, 'https://resend.com/pricing', NOW()
FROM public.tools WHERE slug = 'resend' AND is_demo = false
ON CONFLICT DO NOTHING;

INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Pro', false, 'https://resend.com/pricing', NOW()
FROM public.tools WHERE slug = 'resend' AND is_demo = false
ON CONFLICT DO NOTHING;

-- Vercel: Hobby (free) + Pro
INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Hobby', true, 'https://vercel.com/pricing', NOW()
FROM public.tools WHERE slug = 'vercel-platform' AND is_demo = false
ON CONFLICT DO NOTHING;

INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Pro', false, 'https://vercel.com/pricing', NOW()
FROM public.tools WHERE slug = 'vercel-platform' AND is_demo = false
ON CONFLICT DO NOTHING;

-- Supabase: Free plan + Pro
INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Free', true, 'https://supabase.com/pricing', NOW()
FROM public.tools WHERE slug = 'supabase' AND is_demo = false
ON CONFLICT DO NOTHING;

INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Pro', false, 'https://supabase.com/pricing', NOW()
FROM public.tools WHERE slug = 'supabase' AND is_demo = false
ON CONFLICT DO NOTHING;

-- Neon: Free tier documented
INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Free', true, 'https://neon.tech/pricing', NOW()
FROM public.tools WHERE slug = 'neon' AND is_demo = false
ON CONFLICT DO NOTHING;

INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Launch', false, 'https://neon.tech/pricing', NOW()
FROM public.tools WHERE slug = 'neon' AND is_demo = false
ON CONFLICT DO NOTHING;

-- Figma: Free Starter + Professional
INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Starter', true, 'https://www.figma.com/pricing/', NOW()
FROM public.tools WHERE slug = 'figma' AND is_demo = false
ON CONFLICT DO NOTHING;

INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Professional', false, 'https://www.figma.com/pricing/', NOW()
FROM public.tools WHERE slug = 'figma' AND is_demo = false
ON CONFLICT DO NOTHING;

-- Notion: Free + Plus plans
INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Free', true, 'https://www.notion.so/pricing', NOW()
FROM public.tools WHERE slug = 'notion' AND is_demo = false
ON CONFLICT DO NOTHING;

INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Plus', false, 'https://www.notion.so/pricing', NOW()
FROM public.tools WHERE slug = 'notion' AND is_demo = false
ON CONFLICT DO NOTHING;

-- Slack: Free + Pro
INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Free', true, 'https://slack.com/intl/en-us/pricing', NOW()
FROM public.tools WHERE slug = 'slack' AND is_demo = false
ON CONFLICT DO NOTHING;

INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Pro', false, 'https://slack.com/intl/en-us/pricing', NOW()
FROM public.tools WHERE slug = 'slack' AND is_demo = false
ON CONFLICT DO NOTHING;

-- Hugging Face: Free + Pro
INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Free', true, 'https://huggingface.co/pricing', NOW()
FROM public.tools WHERE slug = 'hugging-face' AND is_demo = false
ON CONFLICT DO NOTHING;

INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'PRO', false, 'https://huggingface.co/pricing', NOW()
FROM public.tools WHERE slug = 'hugging-face' AND is_demo = false
ON CONFLICT DO NOTHING;

-- Linear: Free + Standard
INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Free', true, 'https://linear.app/pricing', NOW()
FROM public.tools WHERE slug = 'linear' AND is_demo = false
ON CONFLICT DO NOTHING;

INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Standard', false, 'https://linear.app/pricing', NOW()
FROM public.tools WHERE slug = 'linear' AND is_demo = false
ON CONFLICT DO NOTHING;

-- Terraform: open source (free); HCP Terraform (paid cloud managed)
INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Open Source', true, 'https://www.terraform.io', NOW()
FROM public.tools WHERE slug = 'terraform' AND is_demo = false
ON CONFLICT DO NOTHING;

INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'HCP Terraform Plus', false, 'https://www.hashicorp.com/products/terraform/pricing', NOW()
FROM public.tools WHERE slug = 'terraform' AND is_demo = false
ON CONFLICT DO NOTHING;

-- GitHub Actions: included with GitHub (free for public repos / minutes for private)
INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Free (public repos)', true, 'https://docs.github.com/en/billing/managing-billing-for-your-products/managing-billing-for-github-actions/about-billing-for-github-actions', NOW()
FROM public.tools WHERE slug = 'github-actions' AND is_demo = false
ON CONFLICT DO NOTHING;

-- Render: Free tier + paid instance types
INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Free', true, 'https://render.com/pricing', NOW()
FROM public.tools WHERE slug = 'render' AND is_demo = false
ON CONFLICT DO NOTHING;

INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Starter', false, 'https://render.com/pricing', NOW()
FROM public.tools WHERE slug = 'render' AND is_demo = false
ON CONFLICT DO NOTHING;

-- Railway: Trial (free) + Hobby
INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Trial', true, 'https://railway.app/pricing', NOW()
FROM public.tools WHERE slug = 'railway' AND is_demo = false
ON CONFLICT DO NOTHING;

INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Hobby', false, 'https://railway.app/pricing', NOW()
FROM public.tools WHERE slug = 'railway' AND is_demo = false
ON CONFLICT DO NOTHING;

-- AWS Lambda: has a permanent free tier (1M requests/month)
INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Free Tier', true, 'https://aws.amazon.com/lambda/pricing/', NOW()
FROM public.tools WHERE slug = 'aws-lambda' AND is_demo = false
ON CONFLICT DO NOTHING;

INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Pay per request', false, 'https://aws.amazon.com/lambda/pricing/', NOW()
FROM public.tools WHERE slug = 'aws-lambda' AND is_demo = false
ON CONFLICT DO NOTHING;

-- Cloudflare: Free plan well documented
INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Free', true, 'https://www.cloudflare.com/plans/', NOW()
FROM public.tools WHERE slug = 'cloudflare' AND is_demo = false
ON CONFLICT DO NOTHING;

INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Pro', false, 'https://www.cloudflare.com/plans/', NOW()
FROM public.tools WHERE slug = 'cloudflare' AND is_demo = false
ON CONFLICT DO NOTHING;

-- Grafana: Open source (free self-hosted) + Grafana Cloud (free tier)
INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Open Source', true, 'https://grafana.com/pricing/', NOW()
FROM public.tools WHERE slug = 'grafana' AND is_demo = false
ON CONFLICT DO NOTHING;

INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Cloud Free', true, 'https://grafana.com/pricing/', NOW()
FROM public.tools WHERE slug = 'grafana' AND is_demo = false
ON CONFLICT DO NOTHING;

INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Cloud Pro', false, 'https://grafana.com/pricing/', NOW()
FROM public.tools WHERE slug = 'grafana' AND is_demo = false
ON CONFLICT DO NOTHING;

-- Stripe: usage-based (no monthly fee, per-transaction cost)
INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Integrated', false, 'https://stripe.com/pricing', NOW()
FROM public.tools WHERE slug = 'stripe' AND is_demo = false
ON CONFLICT DO NOTHING;

-- Docker Desktop: free for personal/small business
INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Personal', true, 'https://www.docker.com/pricing/', NOW()
FROM public.tools WHERE slug = 'docker' AND is_demo = false
ON CONFLICT DO NOTHING;

INSERT INTO public.tool_pricing (tool_id, plan_name, is_free, source_url, last_verified_at)
SELECT id, 'Pro', false, 'https://www.docker.com/pricing/', NOW()
FROM public.tools WHERE slug = 'docker' AND is_demo = false
ON CONFLICT DO NOTHING;

-- ============================================================
-- STEP 5: Source record for the tool catalog
-- source_type must be in allowed list; 'manual' is valid.
-- category must be in the CHECK constraint list.
-- ============================================================
INSERT INTO public.sources (
  name, domain, source_type, category, categories,
  trust_level, trust_level_label, source_priority,
  active, feed_enabled, health_status
) VALUES (
  'NeuGravity Tool Catalog',
  'neugravity.internal',
  'manual',
  'developer',
  ARRAY['developer', 'ai', 'cloud'],
  10,
  'primary',
  10,
  true,
  false,
  'healthy'
) ON CONFLICT (domain) DO NOTHING;
