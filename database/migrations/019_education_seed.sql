-- ============================================================
-- Migration 019: Phase 4.2 Education Seed Data
-- Demo learning paths only. is_demo=true, status='draft'.
-- No published course content until real curriculum is authored.
-- ============================================================

-- ============================================================
-- LEARNING PATHS (demo, unpublished)
-- ============================================================
INSERT INTO public.learning_paths (
  id, title, slug, description, short_description, outcome, difficulty,
  estimated_hours, is_demo, status, featured, published
) VALUES

  ('50000000-0000-0000-0000-000000000001',
   'AI Foundations',
   'ai-foundations',
   'A ground-up introduction to artificial intelligence for engineers and technical professionals. From computer fundamentals through transformers, large language models, RAG, and AI Agents.',
   'From zero to understanding modern AI systems.',
   'Understand how AI systems work, build basic ML pipelines, and apply LLMs and RAG to real problems.',
   'beginner',
   48.0,
   true, 'draft', true, false),

  ('50000000-0000-0000-0000-000000000002',
   'AI Engineer',
   'ai-engineer',
   'Production-grade AI engineering: designing, building, and operating LLM-powered systems at scale. Covers RAG architectures, AI Agents, evaluation, observability, and deployment.',
   'Build production-ready AI systems with LLMs and agents.',
   'Design and deploy LLM-powered applications, RAG pipelines, and agentic systems in production.',
   'intermediate',
   64.0,
   true, 'draft', true, false),

  ('50000000-0000-0000-0000-000000000003',
   'Cloud Engineer',
   'cloud-engineer',
   'Everything you need to design, build, and operate cloud infrastructure. Kubernetes, containers, networking, storage, observability, and platform engineering.',
   'Design and operate scalable cloud infrastructure.',
   'Deploy and operate production services on cloud platforms using containers, Kubernetes, and IaC.',
   'intermediate',
   56.0,
   true, 'draft', true, false),

  ('50000000-0000-0000-0000-000000000004',
   'Software Engineering Foundations',
   'software-engineering-foundations',
   'Core computer science and software engineering fundamentals for engineers entering the field or filling knowledge gaps. Data structures, algorithms, systems design, and professional practices.',
   'Master the fundamentals every software engineer needs.',
   'Write efficient, maintainable code and reason about systems design with confidence.',
   'beginner',
   72.0,
   true, 'draft', false, false),

  ('50000000-0000-0000-0000-000000000005',
   'Technology for Product Managers',
   'technology-for-product-managers',
   'Technical literacy for product managers and non-engineering leaders. Understand APIs, databases, cloud, AI, and infrastructure decisions without writing code.',
   'Understand how technology works — without writing code.',
   'Have informed technical conversations with engineering teams and make better product decisions.',
   'beginner',
   24.0,
   true, 'draft', false, false)

ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- NOTE: No courses seeded here.
-- Course content will be authored by editors through /admin/education.
-- All learning path steps will be added via admin after courses are created.
-- ============================================================
