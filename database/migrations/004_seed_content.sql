-- ============================================================
-- 004_seed_content.sql — Comprehensive seed data for NeuGravity
-- Idempotent: ON CONFLICT DO NOTHING throughout
-- ============================================================

-- ============================================================
-- 1. FIX EXISTING DEMO NAMES
-- ============================================================
UPDATE public.companies SET name = replace(name, ' [DEMO]', '') WHERE name LIKE '%[DEMO]%';
UPDATE public.tools     SET name = replace(name, ' [DEMO]', '') WHERE name LIKE '%[DEMO]%';

-- ============================================================
-- 2. NEW TECHNOLOGIES
-- ============================================================
INSERT INTO public.technologies (id, name, slug, tagline, description, type, published, featured, popularity_score, trending_score, website_url, open_source, created_year)
VALUES
  -- Languages
  ('a1000000-0000-0000-0000-000000000001', 'Rust', 'rust',
   'Memory-safe systems programming without a garbage collector',
   'Rust is a systems programming language focused on safety, speed, and concurrency. It achieves memory safety without a garbage collector through its ownership model, making it ideal for performance-critical software. Rust has been the most loved language in Stack Overflow surveys for eight consecutive years.',
   'language', true, true, 88, 91, 'https://www.rust-lang.org', true, 2010),

  ('a1000000-0000-0000-0000-000000000002', 'Go', 'go',
   'Simple, fast, and reliable language for building services at scale',
   'Go is an open-source programming language designed at Google for building efficient, reliable software. It combines the performance of compiled languages with the simplicity of dynamically typed languages. Go excels at concurrent programming and is widely used for cloud infrastructure, microservices, and CLI tools.',
   'language', true, false, 82, 72, 'https://go.dev', true, 2009),

  ('a1000000-0000-0000-0000-000000000003', 'JavaScript', 'javascript',
   'The language of the web, now everywhere',
   'JavaScript is the world''s most widely used programming language, running in every browser and on servers via Node.js. It powers interactive web experiences, full-stack applications, and increasingly machine learning workloads. Its ecosystem is the largest in software development.',
   'language', true, false, 99, 65, 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', true, 1995),

  ('a1000000-0000-0000-0000-000000000004', 'Swift', 'swift',
   'Apple''s modern language for iOS, macOS, and beyond',
   'Swift is a powerful and intuitive programming language for Apple platforms and beyond. Designed to replace Objective-C, it combines safety features with speed and modern syntax. Swift is increasingly used for server-side development through the Swift on Server ecosystem.',
   'language', true, false, 71, 58, 'https://swift.org', true, 2014),

  ('a1000000-0000-0000-0000-000000000005', 'Kotlin', 'kotlin',
   'Modern JVM language beloved by Android developers',
   'Kotlin is a cross-platform programming language developed by JetBrains, fully interoperable with Java. It is the preferred language for Android development and growing rapidly in server-side and multiplatform development. Kotlin''s concise syntax and null safety make it a major improvement over Java.',
   'language', true, false, 74, 61, 'https://kotlinlang.org', true, 2011),

  -- Frameworks
  ('a1000000-0000-0000-0000-000000000006', 'React', 'react',
   'The library for building user interfaces at any scale',
   'React is a declarative, component-based library for building user interfaces, maintained by Meta. It introduced the virtual DOM and popularized component-driven development across the industry. With React 19, server components are now stable, blurring the line between frontend and backend rendering.',
   'framework', true, true, 97, 78, 'https://react.dev', true, 2013),

  ('a1000000-0000-0000-0000-000000000007', 'Next.js', 'nextjs',
   'The React framework for production',
   'Next.js is a React framework that enables server-side rendering, static generation, and API routes in a single cohesive framework. Built by Vercel, it has become the standard way to build production React applications. Next.js 16 introduced the App Router, Turbopack, and React Server Components as the default.',
   'framework', true, true, 94, 85, 'https://nextjs.org', true, 2016),

  ('a1000000-0000-0000-0000-000000000008', 'FastAPI', 'fastapi',
   'High performance Python web framework for building APIs',
   'FastAPI is a modern, fast web framework for building APIs with Python 3.8+ based on standard Python type hints. It automatically generates OpenAPI documentation and leverages async/await for high performance. FastAPI has become the go-to Python framework for ML model serving and internal APIs.',
   'framework', true, false, 79, 80, 'https://fastapi.tiangolo.com', true, 2018),

  ('a1000000-0000-0000-0000-000000000009', 'LangChain', 'langchain',
   'Framework for building context-aware reasoning applications',
   'LangChain is an open-source framework for developing applications powered by large language models. It provides composable abstractions for chains, agents, memory, and retrieval that make building LLM apps significantly faster. LangChain has become the dominant framework in the LLM application stack.',
   'framework', true, true, 83, 87, 'https://www.langchain.com', true, 2022),

  ('a1000000-0000-0000-0000-000000000010', 'PyTorch', 'pytorch',
   'The ML framework trusted by researchers and production teams alike',
   'PyTorch is an open-source machine learning framework developed by Meta AI Research. It provides tensor computation with GPU acceleration and a dynamic computation graph that makes model development intuitive. PyTorch dominates AI research and is increasingly the choice for production ML workloads.',
   'framework', true, false, 91, 79, 'https://pytorch.org', true, 2016),

  -- Databases
  ('a1000000-0000-0000-0000-000000000011', 'MongoDB', 'mongodb',
   'The developer-friendly document database',
   'MongoDB is a source-available cross-platform document-oriented database program. It stores data in flexible, JSON-like documents, meaning fields can vary from document to document. MongoDB is widely used for applications that require rapid iteration, flexible schemas, and horizontal scalability.',
   'database', true, false, 85, 60, 'https://www.mongodb.com', false, 2009),

  ('a1000000-0000-0000-0000-000000000012', 'Qdrant', 'qdrant',
   'High-performance vector database for AI applications',
   'Qdrant is a vector similarity search engine and database designed specifically for AI applications. It provides production-ready service with a convenient API for storing, searching, and managing points (vectors with payloads). Qdrant has become the leading choice for semantic search and RAG systems.',
   'database', true, false, 61, 89, 'https://qdrant.tech', true, 2021),

  ('a1000000-0000-0000-0000-000000000013', 'ClickHouse', 'clickhouse',
   'Real-time analytics database for petabyte-scale data',
   'ClickHouse is a fast open-source column-oriented database management system for real-time analytics. It can process billions of rows and tens of gigabytes per second per server, making it the de facto standard for analytical workloads in tech companies. ClickHouse recently went public on NASDAQ.',
   'database', true, false, 72, 75, 'https://clickhouse.com', true, 2016),

  -- AI/LLMs
  ('a1000000-0000-0000-0000-000000000014', 'GPT-4', 'gpt-4',
   'OpenAI''s most capable multimodal language model',
   'GPT-4 is a large multimodal model from OpenAI capable of accepting image and text inputs and producing text outputs. It exhibits human-level performance on many professional and academic benchmarks. GPT-4 powers ChatGPT Plus, GitHub Copilot, and thousands of enterprise AI applications.',
   'ai', true, false, 95, 77, 'https://openai.com/gpt-4', false, 2023),

  ('a1000000-0000-0000-0000-000000000015', 'Claude', 'claude',
   'Anthropic''s AI assistant built for safety and helpfulness',
   'Claude is a family of AI models developed by Anthropic, designed to be helpful, harmless, and honest. The Claude model family spans from Haiku (fast and efficient) to Opus (most capable), with the Sonnet series balancing performance and speed. Claude 4 introduced extended thinking for complex reasoning tasks.',
   'ai', true, true, 92, 93, 'https://claude.ai', false, 2023),

  ('a1000000-0000-0000-0000-000000000016', 'Llama', 'llama',
   'Meta''s open-weight large language models',
   'Llama is Meta''s family of open-weight large language models, available for research and commercial use. Starting with Llama 2 and continuing through Llama 3.x, these models power a large portion of the open-source AI ecosystem. Llama models can be fine-tuned and run locally, making them the foundation of self-hosted AI.',
   'ai', true, false, 88, 86, 'https://llama.meta.com', true, 2023),

  ('a1000000-0000-0000-0000-000000000017', 'Gemini', 'gemini',
   'Google''s most capable multimodal AI model family',
   'Gemini is Google DeepMind''s flagship family of multimodal AI models, available in Ultra, Pro, and Nano variants. Gemini models are natively multimodal, trained on text, images, audio, and video from the ground up. Gemini powers Google''s AI features across Search, Workspace, and the Vertex AI platform.',
   'ai', true, false, 87, 80, 'https://deepmind.google/technologies/gemini/', false, 2023),

  -- Cloud / Infra
  ('a1000000-0000-0000-0000-000000000018', 'AWS', 'aws',
   'The world''s most comprehensive cloud platform',
   'Amazon Web Services is the world''s leading cloud computing platform, offering over 200 services from data centers globally. AWS pioneered cloud computing and remains the market leader with approximately 31% market share. Every major enterprise, startup, and government organization relies on AWS services.',
   'cloud', true, false, 99, 68, 'https://aws.amazon.com', false, 2006),

  ('a1000000-0000-0000-0000-000000000019', 'Terraform', 'terraform',
   'Infrastructure as code for any cloud',
   'Terraform is an open-source infrastructure-as-code tool created by HashiCorp that allows teams to define and provision infrastructure using a declarative configuration language. It supports hundreds of providers across cloud, SaaS, and on-premise infrastructure. Terraform is the standard IaC tool at most engineering organizations.',
   'infrastructure', true, false, 86, 70, 'https://www.terraform.io', true, 2014),

  ('a1000000-0000-0000-0000-000000000020', 'Deno', 'deno',
   'The next-generation JavaScript runtime',
   'Deno is a modern JavaScript and TypeScript runtime built on V8 and Rust, created by the original Node.js author. It provides secure-by-default execution, native TypeScript support, and a growing standard library. Deno 3.0 achieved full Node.js compatibility, making migration from Node dramatically easier.',
   'platform', true, false, 58, 72, 'https://deno.com', true, 2018)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 3. NEW COMPANIES
-- ============================================================
INSERT INTO public.companies (id, name, slug, description, website_url, company_type, founded_year, published, featured)
VALUES
  ('40000000-0000-0000-0000-000000000006', 'Anthropic', 'anthropic',
   'Anthropic is an AI safety company and the creator of Claude. Founded in 2021 by former OpenAI researchers Dario Amodei, Daniela Amodei, and others, Anthropic focuses on building reliable, interpretable, and steerable AI systems. Claude is their primary product family, ranging from frontier research models to production-ready APIs.',
   'https://anthropic.com', 'private', 2021, true, true),

  ('40000000-0000-0000-0000-000000000007', 'Meta', 'meta',
   'Meta Platforms is the parent company of Facebook, Instagram, and WhatsApp, and a major force in open-source AI. Meta AI Research has released the Llama family of open-weight models, PyTorch, React, and dozens of other foundational technologies used by the industry. Meta is betting heavily on the open-source AI ecosystem as a competitive strategy.',
   'https://meta.com', 'public', 2004, true, false),

  ('40000000-0000-0000-0000-000000000008', 'Amazon', 'amazon',
   'Amazon is one of the world''s largest technology companies and the operator of AWS, the leading cloud platform. Through AWS, Amazon provides the infrastructure that powers a significant portion of the modern internet. Amazon Bedrock and the Alexa AI ecosystem reflect Amazon''s large investment in AI services.',
   'https://amazon.com', 'public', 1994, true, false),

  ('40000000-0000-0000-0000-000000000009', 'Stripe', 'stripe',
   'Stripe is a global payments infrastructure company that helps businesses accept payments online and in person. Founded in 2010, Stripe has become the default payments layer for internet businesses, handling hundreds of billions of dollars in annual payment volume. Stripe is known for its exceptional developer experience and API-first approach.',
   'https://stripe.com', 'private', 2010, true, false),

  ('40000000-0000-0000-0000-000000000010', 'Cloudflare', 'cloudflare',
   'Cloudflare is a global network platform that helps make the internet faster, more secure, and more reliable. Operating one of the world''s largest networks with data centers in 300+ cities, Cloudflare protects and accelerates millions of websites. Cloudflare Workers and the AI Gateway have made Cloudflare a major platform for edge AI deployments.',
   'https://cloudflare.com', 'public', 2009, true, true),

  ('40000000-0000-0000-0000-000000000011', 'GitHub', 'github',
   'GitHub is the world''s leading platform for software development and collaboration, hosting over 100 million developers and 420 million repositories. Owned by Microsoft since 2018, GitHub provides version control, project management, and CI/CD through GitHub Actions. GitHub Copilot has become the most widely used AI coding assistant.',
   'https://github.com', 'public', 2008, true, false),

  ('40000000-0000-0000-0000-000000000012', 'Databricks', 'databricks',
   'Databricks is the Data + AI company, offering a unified platform for data engineering, analytics, and machine learning. The company created Apache Spark and has built the Databricks Lakehouse Platform around it. Databricks is valued at over $43 billion and is used by 10,000+ organizations for large-scale data and AI workloads.',
   'https://databricks.com', 'private', 2013, true, false),

  ('40000000-0000-0000-0000-000000000013', 'Hugging Face', 'hugging-face',
   'Hugging Face is the leading platform for open-source machine learning models and datasets, often called the GitHub of AI. With over 900,000 models, 200,000 datasets, and 300,000 spaces, Hugging Face has become the central hub of the open ML ecosystem. The Transformers library from Hugging Face is used in virtually every ML project.',
   'https://huggingface.co', 'private', 2016, true, true),

  ('40000000-0000-0000-0000-000000000014', 'JetBrains', 'jetbrains',
   'JetBrains is a software development tools company best known for IntelliJ IDEA, PyCharm, and the Kotlin programming language. Used by millions of developers worldwide, JetBrains IDEs set the standard for intelligent code completion, refactoring, and debugging. JetBrains AI Assistant is the company''s response to the AI coding assistant wave.',
   'https://jetbrains.com', 'private', 2000, true, false),

  ('40000000-0000-0000-0000-000000000015', 'Linear', 'linear',
   'Linear is a modern project management tool built for software teams that value speed and focus. Known for its keyboard-first design, snappy performance, and opinionated workflow, Linear has become the preferred issue tracker at high-performing engineering organizations. Linear recently raised a Series C at an $800M valuation.',
   'https://linear.app', 'private', 2019, true, false)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 4. NEW TOOLS
-- ============================================================
INSERT INTO public.tools (id, name, slug, tagline, description, tool_type, pricing_model, website_url, published, featured, rating_average, rating_count, popularity_score, trending_score, has_free_tier, has_api)
VALUES
  ('50000000-0000-0000-0000-000000000006', 'Cursor', 'cursor',
   'The AI-first code editor',
   'Cursor is an AI-powered code editor built on top of VS Code that integrates large language models deeply into the editing experience. It supports codebase-aware completions, inline edits, multi-file generation, and a chat interface that understands your entire project. Cursor has rapidly become the most popular AI-native editor among professional developers.',
   'platform', 'freemium', 'https://cursor.com', true, true, 4.7, 3200, 89, 95, true, false),

  ('50000000-0000-0000-0000-000000000007', 'Claude Code', 'claude-code',
   'Anthropic''s agentic coding assistant for the terminal',
   'Claude Code is an agentic coding tool from Anthropic that runs in your terminal and understands your entire codebase. It can write and edit files, run commands, search code, and autonomously complete complex multi-step engineering tasks. Claude Code operates with model context protocol (MCP) and can be extended with custom tools.',
   'cli', 'usage_based', 'https://claude.ai/code', true, true, 4.8, 1400, 76, 92, false, true),

  ('50000000-0000-0000-0000-000000000008', 'Datadog', 'datadog',
   'Cloud monitoring and security platform',
   'Datadog is a monitoring and security platform for cloud applications, providing infrastructure monitoring, APM, log management, and security in a single unified platform. Used by thousands of enterprises, Datadog helps engineering teams understand system performance, find issues, and maintain reliability at scale.',
   'saas', 'subscription', 'https://datadoghq.com', true, false, 4.3, 2800, 84, 65, false, true),

  ('50000000-0000-0000-0000-000000000009', 'Grafana', 'grafana',
   'The open-source platform for monitoring and observability',
   'Grafana is the leading open-source visualization and observability platform, used to query, visualize, and alert on metrics from any data source. Grafana dashboards are ubiquitous in engineering organizations, and the Grafana stack (with Loki, Tempo, and Mimir) provides a full open-source observability solution.',
   'open_source', 'freemium', 'https://grafana.com', true, false, 4.5, 4100, 87, 70, true, true),

  ('50000000-0000-0000-0000-000000000010', 'Linear', 'linear',
   'The issue tracker built for high-performance teams',
   'Linear is a purpose-built project management tool designed for software teams who value speed and clarity. With a keyboard-first interface, automatic issue prioritization, and deep Git integration, Linear helps teams ship faster with less overhead. Its opinionated workflow and instant performance have made it the tool of choice at many top-tier startups.',
   'saas', 'freemium', 'https://linear.app', true, false, 4.6, 1900, 72, 78, true, true),

  ('50000000-0000-0000-0000-000000000011', 'Notion', 'notion',
   'The all-in-one workspace for notes, docs, and databases',
   'Notion is a collaborative workspace that combines notes, wikis, databases, and project management in a single flexible tool. Used by millions of individuals and teams, Notion has become the default knowledge management system for many organizations. Notion AI adds AI-powered writing, summarization, and data extraction directly within documents.',
   'saas', 'freemium', 'https://notion.so', true, false, 4.4, 5200, 88, 60, true, true),

  ('50000000-0000-0000-0000-000000000012', 'Figma', 'figma',
   'The collaborative design platform for teams',
   'Figma is a browser-based collaborative interface design tool that has become the industry standard for product design. Its multiplayer capabilities, component system, and developer handoff features make it the default tool for design teams at most technology companies. Figma''s acquisition by Adobe was blocked by regulators, and Figma has since IPO''d.',
   'saas', 'freemium', 'https://figma.com', true, false, 4.7, 6800, 93, 67, true, true),

  ('50000000-0000-0000-0000-000000000013', 'Sentry', 'sentry',
   'Application monitoring and error tracking',
   'Sentry is the leading error monitoring and performance tracking platform for software teams. It automatically captures and organizes errors with full context—stack traces, user data, breadcrumbs—so teams can find and fix issues faster. Sentry supports every major language and framework and integrates with your existing workflow.',
   'saas', 'freemium', 'https://sentry.io', true, false, 4.5, 3600, 82, 63, true, true),

  ('50000000-0000-0000-0000-000000000014', 'Vercel v0', 'vercel-v0',
   'Generate React UI from natural language',
   'v0 is Vercel''s generative UI tool that creates React components and full pages from natural language prompts. It generates production-quality code using shadcn/ui and Tailwind CSS, which can be copied directly into any React project. v0 has become the fastest way to prototype and build frontend components.',
   'saas', 'freemium', 'https://v0.dev', true, true, 4.4, 980, 67, 90, true, false),

  ('50000000-0000-0000-0000-000000000015', 'Replicate', 'replicate',
   'Run machine learning models with a cloud API',
   'Replicate is a platform for running open-source machine learning models via a simple API. It provides serverless GPU access for thousands of models including image generation, video, audio, and language models. Developers use Replicate to integrate AI capabilities into applications without managing ML infrastructure.',
   'api', 'usage_based', 'https://replicate.com', true, false, 4.3, 870, 64, 82, false, true),

  ('50000000-0000-0000-0000-000000000016', 'LangSmith', 'langsmith',
   'Observability and testing for LLM applications',
   'LangSmith is LangChain''s platform for debugging, testing, evaluating, and monitoring LLM applications. It provides tracing for every LLM call, prompt playground, evaluation datasets, and production monitoring. LangSmith has become an essential tool for teams building reliable AI applications at scale.',
   'saas', 'freemium', 'https://smith.langchain.com', true, false, 4.2, 620, 55, 85, true, true),

  ('50000000-0000-0000-0000-000000000017', 'Weights & Biases', 'weights-and-biases',
   'The ML experiment tracking and model management platform',
   'Weights & Biases (W&B) is the leading ML platform for tracking experiments, versioning datasets and models, and collaborating on AI projects. Used by tens of thousands of ML practitioners and researchers, W&B provides the observability layer that makes ML development reproducible and systematic.',
   'saas', 'freemium', 'https://wandb.ai', true, false, 4.6, 2400, 71, 73, true, true),

  ('50000000-0000-0000-0000-000000000018', 'dbt', 'dbt',
   'The transformation layer for the modern data stack',
   'dbt (data build tool) is an open-source command-line tool that enables data analysts and engineers to transform data in their warehouse using SQL. It brings software engineering best practices—version control, testing, documentation—to analytics engineering. dbt has become the standard transformation tool in the modern data stack.',
   'open_source', 'freemium', 'https://getdbt.com', true, false, 4.5, 1700, 74, 71, true, true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 5. NEWS ITEMS
-- ============================================================
INSERT INTO public.news_items (id, slug, headline, summary, status, importance, published_at, featured)
VALUES
  (gen_random_uuid(), 'anthropic-claude-4-extended-thinking',
   'Anthropic Releases Claude 4 with Extended Thinking Mode',
   'Anthropic has launched Claude 4, its most capable model family to date, featuring a new extended thinking mode that allows the model to reason through complex problems step by step before answering. Extended thinking dramatically improves performance on math, coding, and multi-step reasoning tasks. The Claude 4 family includes Haiku 4.5, Sonnet 4.6, and Opus 4.8, each optimized for different speed and capability tradeoffs.',
   'published', 9, '2026-09-10 09:00:00+00', true),

  (gen_random_uuid(), 'openai-gpt5-limited-preview',
   'OpenAI GPT-5 Enters Limited Preview for Select Partners',
   'OpenAI has begun a limited preview of GPT-5 with select enterprise partners and researchers, promising significant gains in reasoning, instruction following, and multimodal capabilities over GPT-4o. The company claims GPT-5 achieves expert-level performance on a wider range of professional benchmarks. A broader rollout is expected in Q4 2026.',
   'published', 9, '2026-08-28 14:00:00+00', true),

  (gen_random_uuid(), 'github-copilot-workspace-context',
   'GitHub Copilot Gains Workspace-Level Context Understanding',
   'GitHub has shipped a major update to Copilot that enables the AI assistant to understand entire codebases, not just the currently open file. The workspace context feature allows Copilot to make suggestions that account for project architecture, existing patterns, and cross-file dependencies. This brings Copilot significantly closer to the codebase-aware experience offered by tools like Cursor.',
   'published', 8, '2026-09-02 10:00:00+00', false),

  (gen_random_uuid(), 'clickhouse-nasdaq-ipo',
   'ClickHouse Goes Public on NASDAQ, Valued at $6.5 Billion',
   'ClickHouse, the real-time analytics database company, has completed its IPO on NASDAQ under the ticker CLCK, raising $450M at a $6.5B valuation. The offering reflects strong demand for specialized analytical databases as companies move beyond general-purpose SQL for large-scale data workloads. ClickHouse counts over 1,500 paying customers across financial services, media, and technology.',
   'published', 8, '2026-08-15 13:30:00+00', false),

  (gen_random_uuid(), 'postgresql-18-release',
   'PostgreSQL 18 Released with Incremental View Maintenance and Major Performance Gains',
   'The PostgreSQL Global Development Group has released PostgreSQL 18, featuring incremental view maintenance, improved parallel query execution, and significant index performance improvements. Benchmarks show 20-40% query speedups for analytical workloads and reduced write amplification for high-throughput OLTP. The release also includes enhanced JSON support and better logical replication tooling.',
   'published', 7, '2026-09-05 08:00:00+00', false),

  (gen_random_uuid(), 'cloudflare-ai-gateway-enterprise',
   'Cloudflare Launches AI Gateway for Enterprise LLM Observability',
   'Cloudflare has announced AI Gateway, a product that sits between enterprise applications and LLM providers to provide caching, rate limiting, logging, and cost analytics across all AI API calls. AI Gateway supports OpenAI, Anthropic, Google Gemini, and any OpenAI-compatible endpoint. The product aims to give platform teams visibility and control over how AI is used across their organizations.',
   'published', 7, '2026-08-20 11:00:00+00', false),

  (gen_random_uuid(), 'langchain-1-stable-release',
   'LangChain 1.0 Stable Release Brings Breaking Changes and Production Focus',
   'After two years of rapid iteration, LangChain has released version 1.0, marking the framework''s first stable API. The 1.0 release includes a significantly simplified interface, improved streaming support, and better error messages based on feedback from thousands of production deployments. LangChain has also introduced LangGraph as the primary abstraction for building multi-agent systems.',
   'published', 7, '2026-08-05 12:00:00+00', false),

  (gen_random_uuid(), 'deno-3-nodejs-compatibility',
   'Deno 3.0 Ships with Full Node.js and npm Compatibility',
   'Deno has released version 3.0 with complete Node.js API compatibility and native npm package support, resolving the primary adoption barrier that kept many teams on Node. The new runtime offers built-in TypeScript, a faster startup time, and a permission system that enforces security by default. Deno 3.0 also includes a built-in package registry and improved tooling for monorepos.',
   'published', 7, '2026-07-22 09:00:00+00', false),

  (gen_random_uuid(), 'rust-adoption-systems-programming',
   'Rust Adoption Surges as Linux Kernel and Android Add More Rust Code',
   'The Rust programming language has hit a tipping point in systems programming adoption, with the Linux kernel now containing over 1 million lines of Rust and Google reporting that all new Android systems components default to Rust. Memory safety vulnerabilities, which account for 70% of critical security bugs, are driving the migration away from C and C++. The US government''s CISA has formally recommended Rust for memory-safe systems development.',
   'published', 6, '2026-08-12 10:00:00+00', false),

  (gen_random_uuid(), 'linear-series-c-800m',
   'Linear Raises $35M Series C at $800M Valuation',
   'Project management tool Linear has closed a $35M Series C funding round at an $800M valuation, reflecting its rapid growth among engineering-led companies. Linear now serves over 25,000 companies including notable users like Vercel, Loom, and Raycast. The funding will go toward expanding Linear''s AI features and enterprise capabilities.',
   'published', 6, '2026-07-30 15:00:00+00', false),

  (gen_random_uuid(), 'vercel-turborepo-monorepos',
   'Vercel Doubles Down on Monorepo Tooling with Turborepo 2.0',
   'Vercel has released Turborepo 2.0, a major overhaul of its build system for JavaScript monorepos. The new version includes a Rust-based task scheduler, improved remote caching, and a visual build dashboard. Turborepo 2.0 reduces cold build times by up to 75% for large monorepos and integrates seamlessly with Next.js workspaces.',
   'published', 6, '2026-07-10 11:00:00+00', false),

  (gen_random_uuid(), 'aws-lambda-10gb-memory',
   'AWS Lambda Increases Maximum Memory to 10GB and Adds ARM Graviton4 Support',
   'Amazon Web Services has increased the maximum memory limit for Lambda functions to 10GB and added support for the latest ARM Graviton4 processors. The expanded memory allows Lambda to handle more memory-intensive workloads including ML inference, image processing, and in-memory analytics. Graviton4 support delivers up to 40% better price-performance versus x86 Lambda functions.',
   'published', 5, '2026-07-18 16:00:00+00', false)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 6. ARTICLES
-- ============================================================
INSERT INTO public.articles (id, slug, title, subtitle, excerpt, body, status, category_id, reading_time_minutes, featured, featured_order, published_at, view_count, share_count)
VALUES
  (gen_random_uuid(), 'state-of-ai-coding-assistants-2026',
   'The State of AI Coding Assistants in 2026',
   'From autocomplete to autonomous agents: how AI is reshaping software development',
   'AI coding assistants have gone from novelty to necessity in two years. This is a deep look at the tools, their real-world impact, and where the category is heading.',
   E'Two years ago, AI coding assistants were a curiosity that senior engineers politely tolerated. Today, they are the most rapidly adopted software development tools in history, with GitHub Copilot alone claiming 1.8 million paid subscribers and Cursor reportedly growing faster than any developer tool in the past decade. The question has shifted from "should we use AI coding tools?" to "which ones, for what, and how do we govern them?"\n\nThe market has split into two camps with distinct philosophies. The first camp—represented by GitHub Copilot, JetBrains AI Assistant, and Tabnine—embeds AI into existing editors as an intelligent autocomplete layer. These tools meet developers where they are and minimize workflow disruption. The second camp—Cursor, Zed AI, and Claude Code—argues that truly leveraging AI requires rethinking the editor from scratch. Cursor''s codebase-aware completions, multi-file edits, and chat that understands your architecture are impossible to bolt onto VS Code as an extension.\n\nThe agentic wave is the next inflection point. Tools like Claude Code and GitHub Copilot Workspace go beyond suggestion into autonomous execution: spinning up test suites, making multi-file changes, debugging CI failures, and opening PRs. Early adopters report completing tasks that would have taken half a day in under thirty minutes. But this autonomy introduces new challenges around code review, security, and the organizational question of what "writing code" even means when a significant portion is AI-generated.\n\nLooking at adoption data, the productivity gains are real but uneven. Studies from Google, Microsoft, and academic researchers consistently show 20-55% faster task completion for well-scoped, greenfield work. The gains are smaller—sometimes negative—for complex debugging, legacy codebases, and tasks requiring deep domain knowledge. The lesson is that AI coding tools amplify good engineering practices but cannot substitute for them. Teams with strong testing cultures, clear APIs, and well-documented architecture benefit far more than teams without.',
   'published', '10000000-0000-0000-0000-000000000001', 12, true, 1,
   '2026-09-08 10:00:00+00', 8420, 312),

  (gen_random_uuid(), 'why-rust-winning-systems-programming',
   'Why Rust Is Winning the Systems Programming War',
   'Memory safety, performance, and a growing ecosystem are making Rust the language of critical infrastructure',
   'The C and C++ era of systems programming is drawing to a close, and Rust is its most credible successor. Here is why, and what it means for infrastructure software.',
   E'The US Cybersecurity and Infrastructure Security Agency (CISA) did something unusual in 2025: it named specific programming languages that software vendors should stop using for new code. C and C++ made the list. The agency''s reasoning was straightforward—70% of critical security vulnerabilities in major software systems trace back to memory safety bugs, and memory-unsafe languages make these bugs structurally inevitable. Rust was the recommended alternative.\n\nRust''s memory safety model is fundamentally different from garbage-collected languages. Rather than using a runtime to reclaim memory, Rust uses a compile-time ownership system that statically proves a program does not contain memory bugs. If Rust code compiles, it cannot have use-after-free errors, double frees, or buffer overflows. This is not a runtime check—there is no overhead. The proof happens at compile time, and the resulting binary is as fast as equivalent C code.\n\nThe adoption evidence is compiling. The Linux kernel accepted Rust as a second implementation language in 2022 and now contains hundreds of thousands of lines of Rust drivers and subsystems. The Android Open Source Project has reported a dramatic reduction in memory safety vulnerabilities in new code since defaulting to Rust for systems components. Cloudflare, Discord, Dropbox, and Amazon have all published case studies showing Rust delivering better performance and reliability than their prior C or C++ implementations.\n\nThe argument against Rust has always been the learning curve. The borrow checker, lifetimes, and ownership model require a mental model shift that takes most experienced developers weeks to months to internalize. This is real, and teams should not underestimate it. But the counterargument is equally real: the hours spent learning Rust''s type system are fewer than the hours spent debugging memory corruption in production. For software that needs to run reliably at scale for years, Rust''s upfront investment pays off.',
   'published', '10000000-0000-0000-0000-000000000004', 10, false, NULL,
   '2026-09-01 09:00:00+00', 5230, 198),

  (gen_random_uuid(), 'postgresql-vs-mongodb-2026',
   'PostgreSQL vs MongoDB: When to Use Each in 2026',
   'The database choice debate has evolved — here is a principled framework for making the right call',
   'PostgreSQL and MongoDB are both excellent databases. Choosing between them is less about which is better and more about which fits your data model, team, and workload.',
   E'The "SQL vs NoSQL" debate that dominated the 2010s has largely been settled—and PostgreSQL won in ways that surprised everyone. MongoDB, the standard-bearer for document databases, has spent the last five years adding transactions, joins, and ACID guarantees. PostgreSQL, meanwhile, has added JSON support so capable that you can run document-style queries natively in Postgres. The gap has narrowed considerably, making the choice more nuanced than it used to be.\n\nPostgreSQL should be your default for any application that has a meaningful schema, requires reliable transactions, or will grow into complex queries over time. The relational model''s ability to express constraints, enforce referential integrity, and enable ad-hoc queries is a long-term asset that pays dividends as applications mature. Postgres''s JSON support means you can have schema flexibility where you need it (JSONB columns for metadata, user preferences, etc.) without losing the benefits of relational modeling for your core entities.\n\nMongoDB genuinely excels in a narrower set of scenarios: content management systems where documents are the natural unit, event stores with highly variable schemas, and applications where the document model maps directly to the domain with no useful relationships between document types. Teams that are exclusively working in JavaScript and want a JSON-native datastore with a first-class Node.js driver sometimes find MongoDB a more natural fit for the early stages of a project.\n\nThe practical advice for most teams in 2026: start with PostgreSQL. Its ecosystem (Supabase, Neon, pgvector for AI applications) has never been stronger, and the cost of migrating from Postgres to MongoDB if you genuinely outgrow the relational model is lower than migrating in the other direction. Use MongoDB when you have a specific, validated reason to—not because it sounds modern or because a tutorial used it.',
   'published', '10000000-0000-0000-0000-000000000001', 8, false, NULL,
   '2026-08-25 10:00:00+00', 4180, 156),

  (gen_random_uuid(), 'rise-of-mcp-protocol',
   'The Rise of the MCP Protocol and What It Means for AI Tools',
   'Model Context Protocol is becoming the USB-C of AI integrations — and that changes everything',
   'The Model Context Protocol is quietly becoming one of the most important infrastructure standards in AI. Here is what it is, why it matters, and how it will reshape the AI tools landscape.',
   E'In November 2024, Anthropic published an open specification called the Model Context Protocol (MCP). The spec describes a standard way for AI models to connect to external tools, data sources, and services. Eighteen months later, MCP has been adopted by OpenAI, Google, Microsoft, and hundreds of AI tool vendors. It is on track to become the dominant standard for AI integrations, in the same way that HTTP became the standard for web communication.\n\nThe core insight behind MCP is that every AI application was building the same integrations from scratch. Cursor connects to GitHub. Claude connects to Slack. ChatGPT connects to Notion. Each connection was a custom integration requiring custom code, custom auth, and custom maintenance. MCP proposes that instead of each AI tool building integrations with each data source, we create a standard protocol: data sources expose MCP servers, and AI tools implement MCP clients. Any MCP client can connect to any MCP server.\n\nThe implications compound quickly. If your company exposes your internal tools as MCP servers, every AI assistant—regardless of vendor—can access them without custom integration work. Engineers can switch between Claude, GPT-4, and Gemini without losing tool access. AI tools gain the ability to compose capabilities: an AI agent that can search your codebase, check a Jira ticket, query your database, and send a Slack message, all through a standard protocol. This is the "AI operating system" abstraction that theorists have been describing for years.\n\nThe protocol is not without challenges. Security is the biggest concern—MCP servers by definition have access to sensitive systems, and a compromised MCP tool is a significant attack vector. The specification is still evolving, and breaking changes between versions have frustrated some early adopters. But the direction is clear: MCP is the connective tissue of the AI tools ecosystem, and understanding it is essential for any team building AI-powered software.',
   'published', '10000000-0000-0000-0000-000000000001', 9, false, NULL,
   '2026-08-18 09:00:00+00', 6340, 287),

  (gen_random_uuid(), 'how-cloudflare-became-internets-security-layer',
   'How Cloudflare Became the Internet''s Security Layer',
   'The story of a CDN that quietly became critical infrastructure for the modern web',
   'Cloudflare started as a CDN company and is now one of the most important infrastructure providers on the internet, protecting and accelerating traffic for millions of websites.',
   E'In 2009, Matthew Prince and Michelle Zatlyn launched Cloudflare with a simple proposition: a CDN and DDoS protection service that anyone could set up in minutes. Fifteen years later, Cloudflare sits in front of approximately 20% of all web traffic and has evolved into something closer to a general-purpose edge computing platform. The company''s network of 300+ data centers has become one of the internet''s critical chokepoints—a position it has leveraged to build an increasingly comprehensive portfolio of security, networking, and compute products.\n\nCloudflare''s business model is unusual in the infrastructure space: a genuinely generous free tier that lets any website or developer use the core CDN, DDoS protection, and DNS services without paying anything. This has created a bottom-up adoption motion where developers use Cloudflare personally, advocate for it at work, and drive enterprise sales from within organizations. It also means Cloudflare has extraordinary data: processing 50 million HTTP requests per second gives the company a real-time view of internet traffic patterns that is unmatched by any security vendor.\n\nThe Workers platform represents Cloudflare''s most ambitious bet. Launched in 2017, Workers is a serverless compute environment that runs JavaScript at the network edge—meaning your code executes within milliseconds of any user, anywhere in the world. The platform has since expanded to include KV storage, Durable Objects for stateful compute, R2 for object storage (S3-compatible, no egress fees), and D1 for serverless SQLite databases. Workers AI adds GPU inference at the edge. Taken together, Cloudflare is building a full-stack application platform that competes with AWS, GCP, and Azure on specific workloads where latency and global reach matter most.\n\nThe company''s security business is where it generates the bulk of its revenue. Zero Trust Network Access (ZTNA) through Cloudflare Access, Secure Web Gateway through Cloudflare Gateway, and email security through Area 1 (now Cloudflare Email Security) have made Cloudflare a SASE vendor competing with Zscaler, Palo Alto Networks, and Cisco. The strategic position is hard to replicate: Cloudflare''s security products run on the same network as its CDN, meaning security checks happen at the edge rather than being backhauled to a cloud data center.',
   'published', '10000000-0000-0000-0000-000000000002', 11, false, NULL,
   '2026-08-10 09:00:00+00', 3870, 134),

  (gen_random_uuid(), 'building-production-rag-systems',
   'Building Production RAG Systems That Actually Work',
   'The gap between a RAG demo and a production RAG system is enormous. Here is how to bridge it.',
   'Retrieval-augmented generation is the dominant pattern for building LLM applications over private data. Here is a practical guide to building RAG systems that are reliable, fast, and maintainable in production.',
   E'Retrieval-augmented generation (RAG) is beguilingly simple in demos. Chunk your documents, embed them, store them in a vector database, and at query time retrieve the most similar chunks and pass them to an LLM. In a Jupyter notebook, this takes 50 lines of code and works surprisingly well. In production, serving real users with real data and real latency requirements, naive RAG fails in ways that are difficult to predict and often embarrassing.\n\nThe first failure mode is chunking. Most RAG tutorials chunk by character count or token count, which often splits sentences mid-thought, severs context between a header and its content, or groups unrelated content together. Production RAG systems need semantic chunking that understands document structure: headings, paragraphs, tables, and code blocks should be chunked as units, not as arbitrary token windows. Hierarchical chunking—where small chunks for retrieval are linked to larger parent chunks for context—handles the precision vs. context tradeoff better than any fixed chunk size.\n\nThe second failure mode is retrieval. Cosine similarity on dense embeddings, the default retrieval method, is good but not great. Hybrid search—combining dense embeddings with sparse BM25 keyword search and re-ranking with a cross-encoder model—significantly improves recall, especially for queries containing specific technical terms, product names, or identifiers that embedding models may not represent well in dense vector space. The added latency (50-200ms for re-ranking) is almost always worth it for customer-facing applications.\n\nThe third failure mode is evaluation. Teams ship RAG systems based on "it looks good in testing" and are surprised by failures in production. Building a systematic evaluation pipeline—a golden dataset of question/answer pairs, automated LLM-as-judge scoring, and metrics for retrieval recall and answer faithfulness—is non-negotiable for production systems. Tools like LangSmith, Weights & Biases, and Ragas make this tractable. The discipline of treating RAG quality as an engineering metric, not a vibe check, is what separates teams that successfully deploy AI applications from those that quietly roll back.',
   'published', '10000000-0000-0000-0000-000000000001', 14, false, NULL,
   '2026-07-28 10:00:00+00', 9650, 421)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 7. COMPARISONS
-- ============================================================
INSERT INTO public.comparisons (id, slug, title, description, status, view_count, published_at)
VALUES
  (gen_random_uuid(), 'react-vs-vue',
   'React vs Vue',
   'A detailed comparison of React and Vue for building modern web applications, covering ecosystem, learning curve, performance, and use cases.',
   'published', 4230, '2026-08-01 09:00:00+00'),

  (gen_random_uuid(), 'postgres-vs-mongodb',
   'PostgreSQL vs MongoDB',
   'When to choose PostgreSQL and when to choose MongoDB — a practical guide for architects and engineering leads evaluating database options in 2026.',
   'published', 6810, '2026-08-15 09:00:00+00'),

  (gen_random_uuid(), 'aws-vs-gcp',
   'AWS vs Google Cloud',
   'A comprehensive comparison of AWS and GCP across compute, storage, AI/ML services, pricing, and developer experience for teams choosing a primary cloud provider.',
   'published', 3920, '2026-07-20 09:00:00+00'),

  (gen_random_uuid(), 'cursor-vs-github-copilot',
   'Cursor vs GitHub Copilot',
   'The two dominant AI coding tools take different approaches — Cursor with a new editor built for AI and Copilot as a plugin. Here is how they compare for real development work.',
   'published', 8540, '2026-09-01 09:00:00+00')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 8. COURSES
-- ============================================================
INSERT INTO public.courses (id, slug, title, description, difficulty, estimated_hours, status, published_at, enrollment_count, rating_average, rating_count, featured, price)
VALUES
  (gen_random_uuid(), 'building-with-llms-api-to-production',
   'Building with LLMs: From API to Production',
   'A comprehensive course covering everything you need to build reliable, production-grade LLM applications. Topics include prompt engineering, RAG architecture, evaluation frameworks, structured output, tool use, agentic patterns, and observability. You will build three complete projects: a document Q&A system, a multi-agent research assistant, and a customer support bot with guardrails.',
   'intermediate', 8.00, 'published', '2026-07-01 09:00:00+00', 3420, 4.7, 842, true, 149.00),

  (gen_random_uuid(), 'kubernetes-for-platform-engineers',
   'Kubernetes for Platform Engineers',
   'Go beyond "kubectl apply" and learn to design, operate, and scale Kubernetes clusters in production. This course covers cluster architecture, networking (CNI, service mesh), storage, RBAC, admission controllers, GitOps with Flux and ArgoCD, observability, and cost optimization. Designed for engineers who need to build and maintain internal Kubernetes platforms.',
   'advanced', 10.00, 'published', '2026-06-15 09:00:00+00', 1870, 4.6, 461, false, 199.00),

  (gen_random_uuid(), 'typescript-deep-dive',
   'TypeScript Deep Dive',
   'Master TypeScript beyond the basics. This course covers the type system in depth: conditional types, mapped types, template literal types, variance, declaration merging, and module augmentation. You will learn to write type-safe utility libraries, migrate complex JavaScript codebases, and configure TypeScript for monorepo environments. Includes real-world exercises from open-source TypeScript codebases.',
   'intermediate', 6.00, 'published', '2026-05-20 09:00:00+00', 5230, 4.8, 1240, true, 99.00),

  (gen_random_uuid(), 'modern-data-engineering-dbt-clickhouse',
   'Modern Data Engineering with dbt and ClickHouse',
   'Learn to build scalable analytical data pipelines using dbt and ClickHouse. The course covers ClickHouse architecture and data modeling, dbt project structure and best practices, incremental materialization strategies, testing and documentation, and integrating with orchestration tools like Dagster and Airflow. You will build a complete analytics platform for a SaaS business from scratch.',
   'advanced', 7.00, 'published', '2026-08-10 09:00:00+00', 980, 4.5, 234, false, 179.00)
ON CONFLICT (slug) DO NOTHING;
