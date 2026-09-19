-- NeuGravity Seed Data
-- Migration: 002_seed_data.sql
-- WARNING: This file contains DEMO/development data only.
--          Do NOT run on a production database without reviewing every row.
--          All content is clearly marked [DEMO] or is generic reference data.
--          All INSERT statements use ON CONFLICT DO NOTHING for idempotency.

-- ============================================================
-- CATEGORIES
-- ============================================================
INSERT INTO public.categories (id, name, slug, description, sort_order)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'AI & Machine Learning',    'ai-machine-learning',     'Artificial intelligence, machine learning, LLMs, and AI infrastructure', 1),
  ('10000000-0000-0000-0000-000000000002', 'Cloud & Infrastructure',   'cloud-infrastructure',    'Cloud platforms, infrastructure tools, and DevOps', 2),
  ('10000000-0000-0000-0000-000000000003', 'Developer Tools',          'developer-tools',          'Tools, frameworks, and services for software developers', 3),
  ('10000000-0000-0000-0000-000000000004', 'Programming Languages',    'programming-languages',    'Programming and scripting languages', 4),
  ('10000000-0000-0000-0000-000000000005', 'Enterprise Technology',    'enterprise-technology',    'Enterprise software, B2B platforms, and business systems', 5)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- TAGS
-- ============================================================
INSERT INTO public.tags (id, name, slug)
VALUES
  ('20000000-0000-0000-0000-000000000001', 'Artificial Intelligence', 'artificial-intelligence'),
  ('20000000-0000-0000-0000-000000000002', 'Machine Learning',        'machine-learning'),
  ('20000000-0000-0000-0000-000000000003', 'Kubernetes',              'kubernetes'),
  ('20000000-0000-0000-0000-000000000004', 'Docker',                  'docker'),
  ('20000000-0000-0000-0000-000000000005', 'Python',                  'python'),
  ('20000000-0000-0000-0000-000000000006', 'JavaScript',              'javascript'),
  ('20000000-0000-0000-0000-000000000007', 'Cloud',                   'cloud'),
  ('20000000-0000-0000-0000-000000000008', 'Open Source',             'open-source'),
  ('20000000-0000-0000-0000-000000000009', 'Enterprise',              'enterprise'),
  ('20000000-0000-0000-0000-000000000010', 'Security',                'security')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- TECHNOLOGIES (DEMO)
-- ============================================================
INSERT INTO public.technologies (id, name, slug, tagline, description, type, category_id, website_url, docs_url, github_url, created_year, creator, maintained_by, license, open_source, status, difficulty, popularity_score, published, featured, verified)
VALUES
  (
    '30000000-0000-0000-0000-000000000001',
    'Kubernetes',
    'kubernetes',
    'Production-grade container orchestration',
    'Kubernetes (K8s) is an open-source system for automating deployment, scaling, and management of containerized applications. Originally designed by Google, it is now maintained by the Cloud Native Computing Foundation.',
    'platform',
    '10000000-0000-0000-0000-000000000002',
    'https://kubernetes.io',
    'https://kubernetes.io/docs',
    'https://github.com/kubernetes/kubernetes',
    2014,
    'Google',
    'Cloud Native Computing Foundation',
    'Apache-2.0',
    true,
    'active',
    'advanced',
    95,
    true,
    true,
    true
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    'Docker',
    'docker',
    'Build, ship, and run any app, anywhere',
    'Docker is a platform for developing, shipping, and running applications in containers. Containers allow developers to package an application with all its dependencies into a standardized unit.',
    'platform',
    '10000000-0000-0000-0000-000000000002',
    'https://www.docker.com',
    'https://docs.docker.com',
    'https://github.com/docker/docker-ce',
    2013,
    'Solomon Hykes',
    'Docker Inc.',
    'Apache-2.0',
    true,
    'active',
    'intermediate',
    90,
    true,
    true,
    true
  ),
  (
    '30000000-0000-0000-0000-000000000003',
    'Python',
    'python',
    'The language that powers AI, data science, and automation',
    'Python is a high-level, general-purpose programming language known for its readability and broad ecosystem. It is the dominant language for AI/ML, data science, and scripting.',
    'language',
    '10000000-0000-0000-0000-000000000004',
    'https://www.python.org',
    'https://docs.python.org',
    'https://github.com/python/cpython',
    1991,
    'Guido van Rossum',
    'Python Software Foundation',
    'Python Software Foundation License',
    true,
    'active',
    'beginner',
    98,
    true,
    true,
    true
  ),
  (
    '30000000-0000-0000-0000-000000000004',
    'TypeScript',
    'typescript',
    'JavaScript with syntax for types',
    'TypeScript is a strongly typed programming language that builds on JavaScript, adding optional static typing and class-based object-oriented programming.',
    'language',
    '10000000-0000-0000-0000-000000000004',
    'https://www.typescriptlang.org',
    'https://www.typescriptlang.org/docs',
    'https://github.com/microsoft/TypeScript',
    2012,
    'Microsoft',
    'Microsoft',
    'Apache-2.0',
    true,
    'active',
    'intermediate',
    88,
    true,
    true,
    true
  ),
  (
    '30000000-0000-0000-0000-000000000005',
    'GraphQL',
    'graphql',
    'A query language for your API',
    'GraphQL is a query language for APIs and a runtime for executing those queries with your existing data. It gives clients the power to ask for exactly what they need.',
    'protocol',
    '10000000-0000-0000-0000-000000000003',
    'https://graphql.org',
    'https://graphql.org/learn',
    'https://github.com/graphql/graphql-js',
    2015,
    'Facebook',
    'GraphQL Foundation',
    'MIT',
    true,
    'active',
    'intermediate',
    75,
    true,
    false,
    true
  ),
  (
    '30000000-0000-0000-0000-000000000006',
    'PostgreSQL',
    'postgresql',
    'The world''s most advanced open source relational database',
    'PostgreSQL is a powerful, open source object-relational database system with over 35 years of active development. It has earned a strong reputation for reliability, feature robustness, and performance.',
    'database',
    '10000000-0000-0000-0000-000000000002',
    'https://www.postgresql.org',
    'https://www.postgresql.org/docs',
    'https://github.com/postgres/postgres',
    1996,
    'Michael Stonebraker',
    'PostgreSQL Global Development Group',
    'PostgreSQL License',
    true,
    'active',
    'intermediate',
    85,
    true,
    true,
    true
  ),
  (
    '30000000-0000-0000-0000-000000000007',
    'Redis',
    'redis',
    'The open source, in-memory data structure store',
    'Redis is an in-memory data structure store used as a database, cache, message broker, and streaming engine. It supports data structures such as strings, hashes, lists, sets, and more.',
    'database',
    '10000000-0000-0000-0000-000000000002',
    'https://redis.io',
    'https://redis.io/docs',
    'https://github.com/redis/redis',
    2009,
    'Salvatore Sanfilippo',
    'Redis Ltd.',
    'BSD-3-Clause',
    true,
    'active',
    'intermediate',
    80,
    true,
    false,
    true
  ),
  (
    '30000000-0000-0000-0000-000000000008',
    'TensorFlow',
    'tensorflow',
    'An end-to-end open source machine learning platform',
    'TensorFlow is a free and open-source software library for machine learning and artificial intelligence. It is used by researchers and developers for training and deploying machine learning models.',
    'framework',
    '10000000-0000-0000-0000-000000000001',
    'https://www.tensorflow.org',
    'https://www.tensorflow.org/api_docs',
    'https://github.com/tensorflow/tensorflow',
    2015,
    'Google Brain',
    'Google',
    'Apache-2.0',
    true,
    'active',
    'advanced',
    78,
    true,
    false,
    true
  )
ON CONFLICT (slug) DO NOTHING;

-- Technology tags
INSERT INTO public.technology_tags (technology_id, tag_id)
VALUES
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003'), -- kubernetes: kubernetes
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000007'), -- kubernetes: cloud
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000008'), -- kubernetes: open-source
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000004'), -- docker: docker
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000008'), -- docker: open-source
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000005'), -- python: python
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001'), -- python: ai
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002'), -- python: machine-learning
  ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000006'), -- typescript: javascript
  ('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000001'), -- tensorflow: ai
  ('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000002')  -- tensorflow: machine-learning
ON CONFLICT DO NOTHING;

-- Technology relationships
INSERT INTO public.technology_relationships (from_technology_id, to_technology_id, relationship_type, strength)
VALUES
  ('30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', 'built_on', 9),    -- K8s built on Docker
  ('30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000006', 'used_with', 7),   -- K8s used with Postgres
  ('30000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000003', 'used_with', 9),   -- TensorFlow used with Python
  ('30000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000005', 'related_to', 8)   -- TypeScript related to GraphQL
ON CONFLICT DO NOTHING;

-- ============================================================
-- COMPANIES (DEMO)
-- ============================================================
INSERT INTO public.companies (id, name, slug, description, website_url, founded_year, headquarters, company_type, category_id, published, featured, verified)
VALUES
  (
    '40000000-0000-0000-0000-000000000001',
    'OpenAI [DEMO]',
    'openai',
    'OpenAI is an AI safety company and the creator of the GPT series of language models, DALL-E image generation, and the ChatGPT product.',
    'https://openai.com',
    2015,
    'San Francisco, CA',
    'private',
    '10000000-0000-0000-0000-000000000001',
    true,
    true,
    true
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    'Google [DEMO]',
    'google',
    'Google LLC is an American multinational technology company focusing on artificial intelligence, online advertising, search engine technology, cloud computing, and more.',
    'https://google.com',
    1998,
    'Mountain View, CA',
    'public',
    '10000000-0000-0000-0000-000000000001',
    true,
    true,
    true
  ),
  (
    '40000000-0000-0000-0000-000000000003',
    'Microsoft [DEMO]',
    'microsoft',
    'Microsoft Corporation is an American multinational technology company producing computer software, consumer electronics, personal computers, and related services.',
    'https://microsoft.com',
    1975,
    'Redmond, WA',
    'public',
    '10000000-0000-0000-0000-000000000005',
    true,
    true,
    true
  ),
  (
    '40000000-0000-0000-0000-000000000004',
    'HashiCorp [DEMO]',
    'hashicorp',
    'HashiCorp provides infrastructure automation software for multi-cloud environments, including Terraform, Vault, Consul, and Nomad.',
    'https://www.hashicorp.com',
    2012,
    'San Francisco, CA',
    'public',
    '10000000-0000-0000-0000-000000000002',
    true,
    false,
    true
  ),
  (
    '40000000-0000-0000-0000-000000000005',
    'Vercel [DEMO]',
    'vercel',
    'Vercel is a cloud platform for frontend developers, providing hosting and serverless functions optimized for Next.js and other modern frameworks.',
    'https://vercel.com',
    2015,
    'San Francisco, CA',
    'private',
    '10000000-0000-0000-0000-000000000003',
    true,
    false,
    true
  )
ON CONFLICT (slug) DO NOTHING;

-- Company technologies
INSERT INTO public.company_technologies (company_id, technology_id, relationship_type)
VALUES
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', 'uses'),     -- OpenAI uses Python
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000008', 'builds'),   -- Google builds TensorFlow
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'builds'),   -- Google builds Kubernetes
  ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000004', 'builds')    -- Microsoft builds TypeScript
ON CONFLICT DO NOTHING;

-- ============================================================
-- TOOLS (DEMO)
-- ============================================================
INSERT INTO public.tools (id, name, slug, tagline, description, website_url, category_id, company_id, tool_type, pricing_model, has_free_tier, has_api, published, featured, verified, status)
VALUES
  (
    '50000000-0000-0000-0000-000000000001',
    'ChatGPT [DEMO]',
    'chatgpt',
    'AI assistant by OpenAI',
    'ChatGPT is an AI-powered conversational assistant developed by OpenAI. It can answer questions, write code, draft documents, and assist with a wide range of tasks using large language models.',
    'https://chat.openai.com',
    '10000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000001',
    'saas',
    'freemium',
    true,
    true,
    true,
    true,
    true,
    'active'
  ),
  (
    '50000000-0000-0000-0000-000000000002',
    'GitHub Copilot [DEMO]',
    'github-copilot',
    'AI pair programmer for your IDE',
    'GitHub Copilot is an AI-powered code completion tool that suggests code snippets and entire functions in real-time as you type. Developed by GitHub and OpenAI.',
    'https://github.com/features/copilot',
    '10000000-0000-0000-0000-000000000003',
    '40000000-0000-0000-0000-000000000003',
    'saas',
    'subscription',
    false,
    true,
    true,
    true,
    true,
    'active'
  ),
  (
    '50000000-0000-0000-0000-000000000003',
    'Vercel Platform [DEMO]',
    'vercel-platform',
    'Deploy and scale your frontend instantly',
    'Vercel is a cloud platform optimized for frontend deployment. It offers automatic scaling, preview deployments, edge functions, and deep Next.js integration.',
    'https://vercel.com',
    '10000000-0000-0000-0000-000000000003',
    '40000000-0000-0000-0000-000000000005',
    'platform',
    'freemium',
    true,
    true,
    true,
    false,
    true,
    'active'
  ),
  (
    '50000000-0000-0000-0000-000000000004',
    'Supabase [DEMO]',
    'supabase',
    'The open source Firebase alternative',
    'Supabase is an open-source backend-as-a-service platform built on top of PostgreSQL. It provides a database, authentication, storage, and real-time subscriptions.',
    'https://supabase.com',
    '10000000-0000-0000-0000-000000000003',
    NULL,
    'platform',
    'freemium',
    true,
    true,
    true,
    true,
    true,
    'active'
  ),
  (
    '50000000-0000-0000-0000-000000000005',
    'Postman [DEMO]',
    'postman',
    'API platform for building and using APIs',
    'Postman is a platform for API development and testing. It enables developers to design, mock, debug, test, document, and monitor APIs.',
    'https://www.postman.com',
    '10000000-0000-0000-0000-000000000003',
    NULL,
    'saas',
    'freemium',
    true,
    true,
    true,
    false,
    true,
    'active'
  )
ON CONFLICT (slug) DO NOTHING;

-- Tool pricing (DEMO)
INSERT INTO public.tool_pricing (tool_id, plan_name, price_monthly, is_free, is_most_popular, source_url, last_verified_at)
VALUES
  ('50000000-0000-0000-0000-000000000001', 'Free',       0.00,  true,  false, 'https://openai.com/pricing', now()),
  ('50000000-0000-0000-0000-000000000001', 'ChatGPT Plus', 20.00, false, true, 'https://openai.com/pricing', now()),
  ('50000000-0000-0000-0000-000000000002', 'Individual',  10.00, false, true, 'https://github.com/features/copilot', now()),
  ('50000000-0000-0000-0000-000000000003', 'Hobby',       0.00,  true,  false, 'https://vercel.com/pricing', now()),
  ('50000000-0000-0000-0000-000000000003', 'Pro',         20.00, false, true,  'https://vercel.com/pricing', now()),
  ('50000000-0000-0000-0000-000000000004', 'Free',        0.00,  true,  false, 'https://supabase.com/pricing', now()),
  ('50000000-0000-0000-0000-000000000004', 'Pro',         25.00, false, true,  'https://supabase.com/pricing', now())
ON CONFLICT DO NOTHING;

-- Tool technologies
INSERT INTO public.tool_technologies (tool_id, technology_id)
VALUES
  ('50000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000006'), -- Supabase uses PostgreSQL
  ('50000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000004')  -- Vercel uses TypeScript
ON CONFLICT DO NOTHING;

-- ============================================================
-- SOURCES (DEMO)
-- ============================================================
INSERT INTO public.sources (id, name, domain, source_type, rss_url, trust_level, active, fetch_frequency_minutes)
VALUES
  (
    '60000000-0000-0000-0000-000000000001',
    'TechCrunch [DEMO]',
    'techcrunch.com',
    'news',
    'https://techcrunch.com/feed/',
    7,
    false,
    60
  ),
  (
    '60000000-0000-0000-0000-000000000002',
    'Hacker News [DEMO]',
    'news.ycombinator.com',
    'api',
    NULL,
    6,
    false,
    30
  ),
  (
    '60000000-0000-0000-0000-000000000003',
    'OpenAI Blog [DEMO]',
    'openai.com',
    'official_blog',
    'https://openai.com/blog/rss.xml',
    10,
    false,
    120
  )
ON CONFLICT (domain) DO NOTHING;

-- ============================================================
-- COMPARISON DIMENSIONS
-- ============================================================
INSERT INTO public.comparison_dimensions (id, name, slug, description, dimension_type, category, sort_order)
VALUES
  (
    '70000000-0000-0000-0000-000000000001',
    'Pricing',
    'pricing',
    'Pricing model and typical cost',
    'text',
    'commercial',
    1
  ),
  (
    '70000000-0000-0000-0000-000000000002',
    'Free Tier Available',
    'free-tier-available',
    'Whether a usable free tier is offered',
    'boolean',
    'commercial',
    2
  ),
  (
    '70000000-0000-0000-0000-000000000003',
    'Open Source',
    'open-source',
    'Whether the project is open source',
    'boolean',
    'licensing',
    3
  )
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- STATUS PROVIDERS (DEMO)
-- ============================================================
INSERT INTO public.status_providers (id, name, slug, category, website_url, official_status_url, active)
VALUES
  (
    '80000000-0000-0000-0000-000000000001',
    'Amazon Web Services [DEMO]',
    'aws',
    'cloud',
    'https://aws.amazon.com',
    'https://health.aws.amazon.com/health/status',
    true
  ),
  (
    '80000000-0000-0000-0000-000000000002',
    'OpenAI [DEMO]',
    'openai-status',
    'ai',
    'https://openai.com',
    'https://status.openai.com',
    true
  ),
  (
    '80000000-0000-0000-0000-000000000003',
    'GitHub [DEMO]',
    'github',
    'developer',
    'https://github.com',
    'https://githubstatus.com',
    true
  )
ON CONFLICT (slug) DO NOTHING;

-- Status services for providers
INSERT INTO public.status_services (provider_id, name, slug)
VALUES
  ('80000000-0000-0000-0000-000000000001', 'EC2',      'ec2'),
  ('80000000-0000-0000-0000-000000000001', 'S3',       's3'),
  ('80000000-0000-0000-0000-000000000001', 'RDS',      'rds'),
  ('80000000-0000-0000-0000-000000000002', 'API',      'api'),
  ('80000000-0000-0000-0000-000000000002', 'ChatGPT',  'chatgpt'),
  ('80000000-0000-0000-0000-000000000003', 'Git',      'git'),
  ('80000000-0000-0000-0000-000000000003', 'Actions',  'actions'),
  ('80000000-0000-0000-0000-000000000003', 'Packages', 'packages')
ON CONFLICT DO NOTHING;
