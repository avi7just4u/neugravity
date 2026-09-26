-- ============================================================
-- Migration 017: Five Flagship Technologies
-- Phase 4.1 — Idempotent (ON CONFLICT DO UPDATE / DO NOTHING)
-- Sources: official documentation, original papers, CNCF/maintainer sites
-- No fabricated benchmarks, pricing, usage stats.
-- ============================================================

-- UUIDs used:
--   Kubernetes:             30000000-0000-0000-0000-000000000001 (existing)
--   Large Language Models:  41000000-0000-0000-0000-000000000001
--   AI Agents:              41000000-0000-0000-0000-000000000002
--   RAG:                    41000000-0000-0000-0000-000000000003
--   APIs:                   41000000-0000-0000-0000-000000000004
--
--   Google (company):       40000000-0000-0000-0000-000000000002 (existing)

-- ============================================================
-- UPDATE KUBERNETES (exists — enhance with new fields)
-- ============================================================
UPDATE public.technologies SET
  short_definition = 'Kubernetes is an open-source container orchestration system that automates deploying, scaling, and managing containerized applications across clusters of machines.',
  maturity         = 'mature',
  tagline          = COALESCE(tagline, 'The standard for container orchestration'),
  difficulty       = COALESCE(difficulty, 'intermediate'),
  is_demo          = false,
  featured         = true,
  verified         = true,
  published        = true,
  last_verified_at = now()
WHERE id = '30000000-0000-0000-0000-000000000001';

-- ============================================================
-- INSERT LARGE LANGUAGE MODELS
-- Source: "Attention Is All You Need" (Vaswani et al., 2017, Google Brain / Google Research)
-- ============================================================
INSERT INTO public.technologies (
  id, name, slug, tagline, short_definition, description, long_description,
  type, maturity, website_url, docs_url, github_url,
  created_year, creator, maintained_by, open_source, license,
  status, difficulty, popularity_score, trending_score,
  published, featured, verified, is_demo, last_verified_at
) VALUES (
  '41000000-0000-0000-0000-000000000001',
  'Large Language Models',
  'large-language-models',
  'Neural networks trained on text to understand and generate language',
  'A Large Language Model (LLM) is a neural network with billions of parameters, trained on large text corpora using self-supervised learning to predict and generate human-like text.',
  'Large Language Models are transformer-based neural networks trained on vast amounts of text data. They learn statistical patterns across language to enable capabilities including text generation, summarization, translation, question-answering, and reasoning. Modern LLMs are typically pre-trained on diverse internet text and then fine-tuned for specific tasks.',
  'The transformer architecture that underpins modern LLMs was introduced in "Attention Is All You Need" (Vaswani et al., 2017). The key innovation was the self-attention mechanism, which allows the model to weigh relationships between any two tokens in a sequence, regardless of distance. This replaced recurrent architectures and enabled training at much larger scale.

LLMs are characterized by their parameter count (ranging from millions to hundreds of billions), their training data (typically crawled web text, books, and code), and their emergent capabilities — behaviors that arise from scale and were not explicitly programmed.

Major open and proprietary LLMs include GPT-4 (OpenAI), Claude (Anthropic), Gemini (Google), and Llama (Meta). The open-source ecosystem around Llama and similar models has democratized LLM experimentation and fine-tuning.',
  'ai',
  'growing',
  'https://huggingface.co/docs/transformers/index',
  'https://huggingface.co/docs/transformers/index',
  'https://github.com/huggingface/transformers',
  2017,
  'Google Brain / Google Research',
  'Multiple organizations (OpenAI, Anthropic, Google, Meta, Mistral AI, and others)',
  true,  -- open-weight models exist (Llama, Mistral, etc.); proprietary ones also exist
  'Various (MIT, Apache 2.0, custom)',
  'active',
  'intermediate',
  95,
  98,
  true, true, true, false, now()
) ON CONFLICT (slug) DO UPDATE SET
  short_definition = EXCLUDED.short_definition,
  maturity         = EXCLUDED.maturity,
  featured         = true,
  verified         = true,
  published        = true,
  is_demo          = false,
  last_verified_at = now();

-- ============================================================
-- INSERT AI AGENTS
-- Source: ReAct paper (Yao et al., 2022); OpenAI function calling docs; Anthropic tool use docs
-- ============================================================
INSERT INTO public.technologies (
  id, name, slug, tagline, short_definition, description, long_description,
  type, maturity, website_url,
  created_year, creator, open_source,
  status, difficulty, popularity_score, trending_score,
  published, featured, verified, is_demo, last_verified_at
) VALUES (
  '41000000-0000-0000-0000-000000000002',
  'AI Agents',
  'ai-agents',
  'Autonomous AI systems that reason, plan, and use tools to accomplish goals',
  'An AI Agent is a system that uses a Large Language Model as its reasoning engine to autonomously plan actions, select and execute tools, observe outcomes, and iterate until a goal is achieved.',
  'AI Agents extend LLMs beyond single-turn question-answering into multi-step autonomous operation. Rather than answering a single prompt, an agent reasons about a goal, selects appropriate tools (web search, code execution, APIs, databases), observes the results, and continues until the task is complete or a stopping condition is reached.',
  'The foundational pattern for AI agents draws from the ReAct paper (Yao et al., 2022, Princeton / Google Research), which demonstrated that interleaving reasoning (thinking) with acting (tool use) dramatically improved LLM problem-solving. Modern agent frameworks such as LangChain, LlamaIndex, AutoGPT, and CrewAI implement variations of this loop.

Key components of an AI agent:
- **LLM as reasoning engine**: Decides what to do next based on the goal and history
- **Tool calling**: Structured interfaces (function calls) that give the agent access to external systems
- **Memory**: Short-term context (the conversation), long-term storage (vector DBs, databases)
- **Observation loop**: After each tool call, the result is fed back to the LLM for the next decision
- **Stopping condition**: A goal completion check or maximum iteration limit

The Model Context Protocol (MCP) by Anthropic is an emerging standard for how agents connect to tools and data sources. Multi-agent systems (multiple specialized agents collaborating) represent the frontier of this space.',
  'ai',
  'emerging',
  'https://www.anthropic.com/news/model-context-protocol',
  2022,
  'Princeton NLP / Google Research (ReAct); OpenAI, Anthropic, LangChain (popularization)',
  true,
  'active',
  'advanced',
  88,
  99,
  true, true, true, false, now()
) ON CONFLICT (slug) DO UPDATE SET
  short_definition = EXCLUDED.short_definition,
  maturity         = EXCLUDED.maturity,
  featured         = true,
  verified         = true,
  published        = true,
  is_demo          = false,
  last_verified_at = now();

-- ============================================================
-- INSERT RETRIEVAL-AUGMENTED GENERATION (RAG)
-- Source: Lewis et al. (2020) "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"
--         Facebook AI Research / University College London / New York University
-- ============================================================
INSERT INTO public.technologies (
  id, name, slug, tagline, short_definition, description, long_description,
  type, maturity, website_url, docs_url,
  created_year, creator, open_source,
  status, difficulty, popularity_score, trending_score,
  published, featured, verified, is_demo, last_verified_at
) VALUES (
  '41000000-0000-0000-0000-000000000003',
  'Retrieval-Augmented Generation',
  'retrieval-augmented-generation',
  'Enhancing LLM responses with retrieved, relevant documents',
  'Retrieval-Augmented Generation (RAG) is a technique that grounds LLM responses in retrieved documents: given a query, relevant content is fetched from a knowledge base and injected into the prompt before the LLM generates its answer.',
  'RAG addresses a core limitation of LLMs: their knowledge is frozen at training time and they can hallucinate facts they are uncertain about. By retrieving relevant documents at inference time and including them in the prompt context, RAG gives the model access to current, specific, or proprietary information.',
  'RAG was introduced in "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks" (Lewis et al., 2020) from Facebook AI Research. The paper demonstrated that retrieval significantly improved performance on knowledge-intensive tasks compared to models relying on parametric memory alone.

A standard RAG pipeline:
1. **Ingestion**: Documents are split into chunks, converted to vector embeddings, and stored in a vector database
2. **Retrieval**: The user query is embedded and used to find semantically similar chunks via approximate nearest-neighbor search
3. **Augmentation**: Retrieved chunks are injected into the LLM prompt as context
4. **Generation**: The LLM generates a response grounded in the retrieved content

Key considerations in production RAG:
- **Chunking strategy**: How documents are split affects retrieval quality
- **Embedding model choice**: Different models optimize for different retrieval tasks
- **Reranking**: A second-pass ranker can improve precision of retrieved chunks
- **Context window limits**: Only so many chunks fit in a prompt
- **Hybrid search**: Combining semantic (vector) search with keyword (BM25) search often outperforms either alone

Popular open-source RAG frameworks include LangChain, LlamaIndex, and Haystack.',
  'ai',
  'growing',
  'https://huggingface.co/docs/transformers/model_doc/rag',
  'https://python.langchain.com/docs/concepts/rag/',
  2020,
  'Facebook AI Research (Meta), University College London, New York University',
  true,
  'active',
  'advanced',
  82,
  95,
  true, true, true, false, now()
) ON CONFLICT (slug) DO UPDATE SET
  short_definition = EXCLUDED.short_definition,
  maturity         = EXCLUDED.maturity,
  featured         = true,
  verified         = true,
  published        = true,
  is_demo          = false,
  last_verified_at = now();

-- ============================================================
-- INSERT APIs (Application Programming Interfaces)
-- Source: Roy Fielding dissertation (2000) for REST; IETF/W3C standards
-- ============================================================
INSERT INTO public.technologies (
  id, name, slug, tagline, short_definition, description, long_description,
  type, maturity, website_url, docs_url,
  created_year, open_source,
  status, difficulty, popularity_score, trending_score,
  published, featured, verified, is_demo, last_verified_at
) VALUES (
  '41000000-0000-0000-0000-000000000004',
  'APIs',
  'apis',
  'Defined interfaces that let software systems communicate',
  'An Application Programming Interface (API) is a defined contract that specifies how software components communicate: what requests can be made, in what format, and what responses to expect.',
  'APIs are the connective tissue of modern software. They allow different systems — services, databases, applications — to communicate without knowing each other''s internal implementation. A caller makes a request according to the API specification; the provider handles it and returns a response.',
  'The concept of a programming interface dates to the 1960s–70s in operating systems and library design, but the modern web API ecosystem was shaped by REST (Representational State Transfer), introduced in Roy Fielding''s 2000 dissertation at UC Irvine. REST defined principles for designing stateless, resource-oriented HTTP APIs that became the dominant style for web services through the 2000s and 2010s.

Key API styles and standards:
- **REST**: Resource-oriented, uses HTTP verbs (GET/POST/PUT/DELETE), returns JSON or XML. The most common style for web services.
- **GraphQL**: Query language for APIs (Facebook, 2015). Clients specify exactly what data they need; a single endpoint handles all queries.
- **gRPC**: High-performance RPC framework using Protocol Buffers (Google, 2015). Common in microservices.
- **WebSockets**: Full-duplex persistent connection for real-time communication.
- **Webhooks**: Event-driven "reverse APIs" — a server calls your endpoint when something happens.
- **OpenAPI / Swagger**: Specification format for documenting REST APIs.

APIs enable the platform economy: Stripe, Twilio, SendGrid, and thousands of others have built businesses entirely around API products.',
  'protocol',
  'mature',
  'https://www.w3.org/standards/',
  'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Client-side_web_APIs/Introduction',
  1960,
  true,
  'active',
  'beginner',
  90,
  75,
  true, true, true, false, now()
) ON CONFLICT (slug) DO UPDATE SET
  short_definition = EXCLUDED.short_definition,
  maturity         = EXCLUDED.maturity,
  featured         = true,
  verified         = true,
  published        = true,
  is_demo          = false,
  last_verified_at = now();

-- ============================================================
-- ENTITY ALIASES
-- ============================================================
INSERT INTO public.entity_aliases (entity_type, entity_id, alias, normalized_alias) VALUES
  -- Kubernetes
  ('technology', '30000000-0000-0000-0000-000000000001', 'K8s',        'k8s'),
  -- Large Language Models
  ('technology', '41000000-0000-0000-0000-000000000001', 'LLM',        'llm'),
  ('technology', '41000000-0000-0000-0000-000000000001', 'LLMs',       'llms'),
  ('technology', '41000000-0000-0000-0000-000000000001', 'Large Language Model', 'large language model'),
  -- AI Agents
  ('technology', '41000000-0000-0000-0000-000000000002', 'AI Agent',   'ai agent'),
  ('technology', '41000000-0000-0000-0000-000000000002', 'Agentic AI', 'agentic ai'),
  ('technology', '41000000-0000-0000-0000-000000000002', 'LLM Agent',  'llm agent'),
  ('technology', '41000000-0000-0000-0000-000000000002', 'LLM Agents', 'llm agents'),
  -- RAG
  ('technology', '41000000-0000-0000-0000-000000000003', 'RAG',        'rag'),
  ('technology', '41000000-0000-0000-0000-000000000003', 'Retrieval Augmented Generation', 'retrieval augmented generation')
ON CONFLICT (entity_type, normalized_alias) DO NOTHING;

-- ============================================================
-- ENTITY RELATIONSHIPS (verified, editor-curated)
-- ============================================================
INSERT INTO public.entity_relationships (
  source_entity_type, source_entity_id,
  target_entity_type, target_entity_id,
  relationship_type, weight, confidence,
  source, created_by_type, verified
) VALUES
  -- AI Agents depend on LLMs (core prerequisite)
  ('technology', '41000000-0000-0000-0000-000000000002',
   'technology', '41000000-0000-0000-0000-000000000001',
   'DEPENDS_ON', 1.0, 1.0,
   'editor', 'editor', true),

  -- RAG depends on LLMs
  ('technology', '41000000-0000-0000-0000-000000000003',
   'technology', '41000000-0000-0000-0000-000000000001',
   'DEPENDS_ON', 1.0, 1.0,
   'editor', 'editor', true),

  -- AI Agents use APIs (tool calling uses API patterns)
  ('technology', '41000000-0000-0000-0000-000000000002',
   'technology', '41000000-0000-0000-0000-000000000004',
   'USES', 0.9, 1.0,
   'editor', 'editor', true),

  -- AI Agents integrate with RAG (common architecture)
  ('technology', '41000000-0000-0000-0000-000000000002',
   'technology', '41000000-0000-0000-0000-000000000003',
   'INTEGRATES_WITH', 0.9, 1.0,
   'editor', 'editor', true),

  -- LLMs relate to AI Agents (inverse of DEPENDS_ON)
  ('technology', '41000000-0000-0000-0000-000000000001',
   'technology', '41000000-0000-0000-0000-000000000002',
   'RELATED_TO', 1.0, 1.0,
   'editor', 'editor', true),

  -- LLMs relate to RAG
  ('technology', '41000000-0000-0000-0000-000000000001',
   'technology', '41000000-0000-0000-0000-000000000003',
   'RELATED_TO', 1.0, 1.0,
   'editor', 'editor', true),

  -- Kubernetes was built by Google (company id from existing seed)
  ('technology', '30000000-0000-0000-0000-000000000001',
   'company',    '40000000-0000-0000-0000-000000000002',
   'BUILT_BY', 1.0, 1.0,
   'editor', 'editor', true),

  -- RAG relates to LLMs (bidirectional)
  ('technology', '41000000-0000-0000-0000-000000000003',
   'technology', '41000000-0000-0000-0000-000000000001',
   'RELATED_TO', 1.0, 1.0,
   'editor', 'editor', true)

ON CONFLICT (source_entity_type, source_entity_id, target_entity_type, target_entity_id, relationship_type) DO NOTHING;

-- ============================================================
-- TECHNOLOGY EXPLANATIONS — Five flagship technologies
-- All factually grounded. No fabricated statistics.
-- status = 'published', generated_by = 'editor'
-- ============================================================

-- -------
-- LARGE LANGUAGE MODELS
-- -------
INSERT INTO public.technology_explanations (technology_id, explanation_type, title, content, status, generated_by, published_at) VALUES

('41000000-0000-0000-0000-000000000001', 'quick',
 '30-Second Explanation',
 'A Large Language Model is a neural network trained on massive text datasets to predict and generate human-like text. LLMs power capabilities including text generation, summarization, translation, coding assistance, and reasoning by learning statistical patterns across billions of parameters. They are the engine behind products like ChatGPT, Claude, Gemini, and GitHub Copilot.',
 'published', 'editor', now()),

('41000000-0000-0000-0000-000000000001', 'simple',
 'Simple Explanation',
 'Imagine teaching someone to speak by having them read billions of pages of text — every book, article, website, and conversation ever written. They never memorize facts; instead, they learn patterns: what words typically follow other words, what answers usually follow what questions, what a "good response" looks like.

A Large Language Model is a computer system trained exactly this way. It has read an enormous amount of text and learned patterns so deeply that it can write, answer questions, translate languages, summarize documents, and even reason through problems — all because it has become very, very good at predicting what comes next.

It doesn''t "understand" in the human sense, but its predictions are so statistically sophisticated that the output is often indistinguishable from human-written text.',
 'published', 'editor', now()),

('41000000-0000-0000-0000-000000000001', 'beginner',
 'Beginner Explanation',
 '**The problem**
Before LLMs, getting a computer to understand and respond to natural language was extremely difficult. Systems needed explicit rules for every situation. They were fragile, narrow, and couldn''t generalize.

**What LLMs are**
An LLM is a transformer-based neural network with billions of learned parameters (weights). It is trained via self-supervised learning: given a sequence of text, predict the next token. Doing this billions of times across vast data forces the model to learn grammar, facts, reasoning patterns, and world knowledge.

**How they work (at a high level)**
1. Text is broken into tokens (roughly word-parts)
2. Each token becomes a numeric vector (embedding)
3. The transformer architecture uses self-attention to relate every token to every other token
4. Layers of attention + feedforward networks build up rich representations
5. The final layer predicts the probability distribution over the next token

**A concrete example**
You type: "The capital of France is"
The model assigns high probability to "Paris" because it has seen this pattern countless times and learned the association.

**What this enables**
Because the model learned from such diverse data, the same underlying system can write code, translate Spanish, summarize a legal document, explain physics, and hold a conversation — without being separately programmed for each task.',
 'published', 'editor', now()),

('41000000-0000-0000-0000-000000000001', 'technical',
 'Technical Explanation',
 '**Architecture: The Transformer**
Modern LLMs are decoder-only transformers (GPT-style) or encoder-decoder transformers (T5-style). The key components:

- **Token embeddings**: Input tokens are mapped to dense vectors in a high-dimensional space (e.g., 4096 dimensions)
- **Positional encodings**: Added to embeddings so the model knows token order
- **Self-attention layers**: Each token attends to all other tokens with learned weights. Multi-head attention runs multiple attention computations in parallel, each capturing different relationships
- **Feedforward networks**: Position-wise MLP applied after each attention block
- **Layer normalization + residual connections**: Stabilize training across depth
- **Output head**: Linear projection + softmax over the vocabulary to produce next-token probabilities

**Training: Pre-training**
Pre-training uses next-token prediction (causal language modeling) on large corpora. The objective is to minimize cross-entropy loss between predicted and actual next tokens. This is self-supervised — no human labels needed, just raw text.

**Fine-tuning and RLHF**
After pre-training, models are fine-tuned for instruction-following. Reinforcement Learning from Human Feedback (RLHF) uses human preference rankings to train a reward model, then optimizes the LLM policy against it (via PPO or similar). This is what makes ChatGPT "helpful."

**Key scaling considerations**
- Model size scales along: parameters, training data, compute (Chinchilla scaling laws)
- Context window length determines how much text the model can attend to at once
- KV-cache enables efficient autoregressive generation at inference
- Quantization (INT8/INT4) reduces memory footprint for deployment

**Limitations**
- Knowledge cutoff: no awareness of events after training
- Hallucination: generates plausible-sounding but incorrect content
- Context window: bounded by max sequence length
- No persistent memory across conversations by default',
 'published', 'editor', now()),

('41000000-0000-0000-0000-000000000001', 'architect',
 'Architect Explanation',
 '**Trade-offs in model selection**
Proprietary frontier models (GPT-4, Claude Opus, Gemini Ultra) offer the highest capability but introduce vendor lock-in, per-token cost at scale, data privacy concerns (input goes to third-party API), and dependency on provider uptime.

Open-weight models (Llama 3, Mistral, Qwen) allow self-hosting, fine-tuning on proprietary data, and cost control at scale — but require GPU infrastructure, MLOps capability, and ongoing maintenance.

**Inference architecture**
Production LLM serving differs from batch ML:
- Autoregressive generation is sequential — each token depends on all prior tokens
- KV-cache memory scales with batch_size × context_length
- Speculative decoding (using a smaller draft model) can increase throughput
- Continuous batching (vLLM, TGI) dramatically improves GPU utilization vs static batching
- Quantized models (GGUF, GPTQ) trade quality for memory/speed

**Context window as a resource**
The context window is a hard limit and an expensive resource. Long contexts increase memory quadratically with naive attention (O(n²)). Flash Attention and sliding-window attention mitigate this. Designing prompts, RAG pipelines, and agent loops to be context-efficient is an architectural skill.

**Failure modes**
- Prompt injection: Malicious user input overrides system instructions
- Jailbreaking: Adversarial prompts that bypass safety alignment
- Hallucination under distribution shift: Models confident about things they shouldn''t be
- Sycophancy: Model agrees with user rather than being accurate
- Latency variance: Non-deterministic generation makes SLA guarantees difficult

**When to use LLMs directly vs. constrain their output**
For tasks requiring structured output (JSON, SQL, function calls), use structured output modes (grammar-constrained decoding, function calling APIs) rather than parsing free text. For tasks with verifiable correct answers, implement output validation and retry loops.

**Security considerations**
- Never include sensitive credentials in prompts
- Treat LLM output as untrusted input when it is used in downstream systems
- Log inputs and outputs for audit and debugging
- Rate limit and authenticate LLM-powered endpoints',
 'published', 'editor', now());

-- -------
-- AI AGENTS
-- -------
INSERT INTO public.technology_explanations (technology_id, explanation_type, title, content, status, generated_by, published_at) VALUES

('41000000-0000-0000-0000-000000000002', 'quick',
 '30-Second Explanation',
 'An AI Agent is a system that uses an LLM as its reasoning engine to autonomously plan actions, select and execute tools, observe results, and iterate until a goal is achieved. Unlike a single prompt-response interaction, an agent runs a loop: think → act → observe → repeat.',
 'published', 'editor', now()),

('41000000-0000-0000-0000-000000000002', 'simple',
 'Simple Explanation',
 'Think of a very capable assistant you can give a complex task to. You say: "Research the top five competitors of Company X, summarize their pricing, and put it in a spreadsheet."

A human assistant would break this down: search for competitors, visit each website, read the pricing pages, extract the numbers, and write them up. They use different tools at each step and make decisions along the way.

An AI Agent works the same way. You give it a goal. It uses an AI model (like ChatGPT or Claude) as its brain, and it has access to tools: web search, code execution, file reading, database queries, and API calls. It thinks about what to do, uses a tool, reads the result, thinks again, and keeps going until the job is done.

The difference from a chatbot is that an agent acts — it doesn''t just answer.',
 'published', 'editor', now()),

('41000000-0000-0000-0000-000000000002', 'beginner',
 'Beginner Explanation',
 '**The problem**
LLMs are powerful but passive. Ask a question, get an answer. But most real tasks require multiple steps, external information, and decisions based on intermediate results. A single LLM call can''t browse the web, run code, or take actions.

**What AI Agents are**
An AI Agent is a system that puts an LLM inside a loop:
1. The agent is given a **goal**
2. The LLM **reasons** about what to do next
3. The LLM selects and calls a **tool** (function, API, search, code runner)
4. The tool result is fed back to the LLM as **observation**
5. The LLM decides whether the goal is complete or what to do next
6. Repeat until done

**The ReAct Pattern**
The foundational paper (Yao et al., 2022) described this as Reasoning + Acting (ReAct). The LLM interleaves "Thought: I need to find X" with "Action: search(X)" with "Observation: result" — building a chain of reasoning grounded in real tool outputs.

**A concrete example**
Goal: "What is the current weather in Tokyo and should I bring an umbrella?"

Agent step 1: Thought → "I need current weather data. I''ll call the weather API."
Agent step 2: Action → weather_api("Tokyo")
Agent step 3: Observation → {"temp": 18, "condition": "rainy", "precipitation_chance": 80}
Agent step 4: Thought → "80% chance of rain. Answer: yes, bring an umbrella."
Agent step 5: Final response to user.',
 'published', 'editor', now()),

('41000000-0000-0000-0000-000000000002', 'technical',
 'Technical Explanation',
 '**Core components**
1. **LLM (reasoning engine)**: Interprets goals, generates plans, decides tool calls, synthesizes final responses
2. **Tool registry**: Functions available to the agent, defined with name, description, and parameter schema (JSON Schema)
3. **Execution environment**: Safely runs tool calls and returns results
4. **Memory**: Short-term (context window) + optionally long-term (vector DB, structured store)
5. **Agent loop controller**: Manages the iteration, stopping conditions, and error handling

**Tool calling protocol**
Modern LLMs support structured tool/function calling: the model generates a JSON object specifying which function to call and with what arguments. The host application executes the function and appends the result to the conversation. This is more reliable than parsing free-text action strings.

**Planning strategies**
- **ReAct**: Interleaved reasoning + tool use in a single prompt chain
- **Plan-and-execute**: LLM generates a full plan upfront, then executes steps (can parallelize)
- **Tree of Thoughts**: Explores multiple reasoning branches, selects best path
- **Reflection**: Agent critiques its own output and revises

**Memory architecture**
- **In-context memory**: Everything in the current prompt window (limited, expensive)
- **External memory**: Vector databases for semantic retrieval (RAG over past interactions or documents)
- **Structured memory**: Databases for facts, entities, task state
- **Episodic memory**: Logs of past agent runs for later retrieval

**Multi-agent systems**
Complex tasks are decomposed across specialized agents: an orchestrator agent routes to sub-agents (research agent, coding agent, writing agent). Agents communicate via messages, shared memory, or task queues. Frameworks: AutoGen (Microsoft), CrewAI, LangGraph.

**The Model Context Protocol (MCP)**
MCP (Anthropic, 2024) is a standard for connecting agents to tools and data sources via a defined server/client protocol. An MCP server exposes tools and resources; any MCP-compatible agent client can discover and use them without custom integration code.',
 'published', 'editor', now()),

('41000000-0000-0000-0000-000000000002', 'architect',
 'Architect Explanation',
 '**Reliability and failure modes**
Agent loops are fundamentally non-deterministic. Common failure modes:
- **Infinite loops**: Agent fails to recognize completion; must impose max_iterations
- **Tool call failure spirals**: One bad tool result leads to cascading wrong decisions
- **Context exhaustion**: Long agent runs fill the context window; compaction or summarization needed
- **Hallucinated tool calls**: Model invents tool names or parameters that don''t exist
- **Prompt injection via tools**: Tool results containing adversarial instructions that redirect the agent

**Determinism and observability**
Unlike a stateless API call, agent runs are long-lived and stateful. Critical requirements:
- Full logging of every LLM call, tool call, and observation (for debugging and audit)
- Structured trace output (LangSmith, Arize Phoenix, or custom)
- Idempotent tool implementations where possible
- Human-in-the-loop checkpoints for high-stakes actions

**Security surface**
- Principle of least privilege: agents should only have access to tools they need
- Sandboxed code execution (containers, E2B, Daytona) for code-running agents
- Tool call authorization: sensitive operations (email, payments, writes) should require explicit confirmation
- Prompt injection from external content (web pages, documents) is a significant and unsolved risk

**Scaling multi-agent systems**
- Use message queues (not direct function calls) between agents for resilience
- Define clear interfaces between agents: what they accept, what they produce
- Implement circuit breakers for failing sub-agents
- Consider stateless agent workers with state externalized to a store

**When not to use agents**
- When a single well-crafted prompt is sufficient
- When determinism is required (agents are inherently variable)
- When latency is critical (agent loops add seconds or minutes)
- When the task doesn''t require external information or multi-step action

**Cost management**
Agent loops can make many LLM calls. Use smaller/cheaper models for planning steps and reserve frontier models for synthesis. Cache tool results where safe. Set token budgets per run.',
 'published', 'editor', now());

-- -------
-- RETRIEVAL-AUGMENTED GENERATION (RAG)
-- -------
INSERT INTO public.technology_explanations (technology_id, explanation_type, title, content, status, generated_by, published_at) VALUES

('41000000-0000-0000-0000-000000000003', 'quick',
 '30-Second Explanation',
 'RAG (Retrieval-Augmented Generation) is a technique that grounds LLM responses in retrieved documents. Given a query, relevant content is fetched from a knowledge base and injected into the prompt before generation. This gives the LLM access to current, specific, or proprietary information beyond its training data.',
 'published', 'editor', now()),

('41000000-0000-0000-0000-000000000003', 'simple',
 'Simple Explanation',
 'Imagine you''re answering a question but you can only use what you''ve memorized. You might get it right, or you might confidently remember something wrong.

Now imagine you can first look things up in a library before answering. You search for relevant pages, read them, and then give your answer based on what you found — plus what you already know.

RAG gives AI models that ability. Instead of relying only on what the model learned during training (which has a cutoff date and may be wrong), RAG first retrieves relevant documents from a knowledge base, then uses those documents to inform the response.

This makes AI systems more accurate for specific topics, keeps them up to date, and lets them work with your own private data that was never in their training.',
 'published', 'editor', now()),

('41000000-0000-0000-0000-000000000003', 'beginner',
 'Beginner Explanation',
 '**The problem**
LLMs have two weaknesses for factual tasks:
1. Their knowledge is frozen at training time — they don''t know about recent events
2. They can hallucinate — generate plausible-sounding but incorrect information

**What RAG does**
RAG solves this by giving the LLM relevant documents to read before answering. Instead of relying only on what it memorized, the model can consult a knowledge base at inference time.

**The pipeline, step by step**

Step 1 — **Ingestion** (done once, offline):
Documents (PDFs, web pages, database records) are split into chunks, converted to vector embeddings (numbers that capture semantic meaning), and stored in a vector database.

Step 2 — **Retrieval** (at query time):
The user''s question is converted to a vector embedding. The vector database finds the most semantically similar chunks.

Step 3 — **Augmentation**:
The retrieved chunks are injected into the LLM prompt: "Here are some relevant documents: [chunks]. Using this information, answer: [question]"

Step 4 — **Generation**:
The LLM reads the context and generates an answer grounded in the retrieved documents.

**A concrete example**
You ask: "What were last quarter''s earnings?"

Without RAG: The LLM has no idea — this happened after its training cutoff.
With RAG: The system retrieves the earnings report from your document store, injects it into the prompt, and the LLM synthesizes the answer from the actual document.',
 'published', 'editor', now()),

('41000000-0000-0000-0000-000000000003', 'technical',
 'Technical Explanation',
 '**Vector embeddings and semantic search**
Embeddings are dense numeric representations of text in high-dimensional space (typically 768–3072 dimensions), generated by an embedding model (e.g., OpenAI text-embedding-3-large, Nomic Embed, BGE). Semantically similar texts have similar vector representations (small cosine distance). This enables semantic search: finding conceptually relevant chunks even when they share no exact keywords with the query.

**Vector databases**
Specialized databases optimized for approximate nearest-neighbor (ANN) search: Pinecone, Weaviate, Qdrant, Chroma, pgvector. They index vectors for efficient similarity search at scale.

**Chunking strategies**
How you split documents affects retrieval quality:
- **Fixed-size**: Simple, predictable, loses context at boundaries
- **Sentence/paragraph-aware**: Preserves semantic units
- **Semantic chunking**: Split where content changes topic (using embedding distance)
- **Hierarchical**: Store both fine chunks (for precision) and parent chunks (for context)

**Retrieval enhancements**
- **Hybrid search**: Combine semantic (vector) with keyword (BM25) search. Often outperforms either alone, especially for proper nouns, codes, and IDs
- **Reranking**: A cross-encoder model re-scores retrieved chunks for higher precision (e.g., Cohere Rerank, BGE Reranker)
- **HyDE (Hypothetical Document Embeddings)**: Generate a hypothetical answer to the query, embed it, use that for retrieval
- **Multi-query retrieval**: Generate multiple query variants, retrieve for each, deduplicate

**Evaluation**
RAG quality decomposes into:
- **Retrieval recall**: Are the right chunks being retrieved?
- **Retrieval precision**: Are retrieved chunks relevant?
- **Generation faithfulness**: Does the answer stay grounded in retrieved content?
- **Answer relevance**: Does the answer actually address the question?

Frameworks: RAGAS, TruLens, DeepEval.',
 'published', 'editor', now()),

('41000000-0000-0000-0000-000000000003', 'architect',
 'Architect Explanation',
 '**Architectural variants**
- **Naive RAG**: Basic retrieve-then-generate. Good baseline; brittle for complex queries
- **Advanced RAG**: Pre-retrieval (query transformation) + post-retrieval (reranking, context compression)
- **Modular RAG**: Swappable retriever, reranker, generator components
- **Agentic RAG**: The retrieval step is itself an agent action; the model decides when and what to retrieve

**Context window as a bottleneck**
Retrieved chunks compete for context window space with system prompt, conversation history, and output. Strategies:
- Rank and truncate: Only include top-k chunks that fit
- Context compression (LLMLingua, RECOMP): Compress retrieved content before injection
- Iterative retrieval: Multi-turn retrieval where each retrieval is informed by prior results

**Production reliability**
- **Fallback behavior**: What happens when retrieval returns nothing relevant? Define a graceful degradation path
- **Staleness management**: When retrieved documents are updated, re-embed and re-index them
- **Citation and provenance**: Surface source URLs alongside answers for verification and trust
- **Latency budget**: Embedding the query + ANN search + reranking adds latency. Profile and cache embedding for repeated queries

**Security considerations**
- Retrieval can surface sensitive documents to unauthorized users if access control is not enforced at the retrieval layer. Filter retrieved results by user permissions
- Prompt injection risk: a malicious document in the knowledge base could inject instructions that redirect LLM behavior
- Do not include credentials, PII, or confidential data in the vector index unless the retrieval system enforces row-level access control

**When RAG vs. fine-tuning**
- RAG: best for factual grounding, dynamic/proprietary knowledge, avoiding hallucination on specific facts
- Fine-tuning: best for style, tone, domain-specific reasoning patterns, reducing instruction overhead
- They are not mutually exclusive — fine-tuned models with RAG is a common production pattern

**Cost model**
Costs: embedding model calls (ingestion) + embedding at query time + vector DB storage + ANN search + LLM generation. At scale, embedding ingestion and storage dominate; optimize by chunking efficiently and using dimension reduction where quality allows.',
 'published', 'editor', now());

-- -------
-- KUBERNETES
-- -------
INSERT INTO public.technology_explanations (technology_id, explanation_type, title, content, status, generated_by, published_at) VALUES

('30000000-0000-0000-0000-000000000001', 'quick',
 '30-Second Explanation',
 'Kubernetes is an open-source container orchestration system originally developed by Google and now maintained by the CNCF. It automates deploying, scaling, and managing containerized applications across clusters of machines, replacing the need to manually manage where and how containers run.',
 'published', 'editor', now()),

('30000000-0000-0000-0000-000000000001', 'simple',
 'Simple Explanation',
 'Imagine you have a restaurant with many kitchen stations, each capable of preparing dishes. You need to manage which station prepares what, what to do when a station breaks down, how to scale up when there''s a rush, and how to update the menu without shutting everything down.

Kubernetes is that manager for software. Instead of kitchen stations, it manages containers (packaged, self-contained pieces of software). It decides which server runs which container, restarts them if they crash, adds more when traffic increases, and rolls out updates without downtime.

You describe what you want ("run 3 copies of this service, restart if it crashes, expose it to the internet") and Kubernetes makes it happen — and keeps making it happen, continuously.',
 'published', 'editor', now()),

('30000000-0000-0000-0000-000000000001', 'beginner',
 'Beginner Explanation',
 '**The problem**
Containers (popularized by Docker) made it easy to package and run software reliably. But when you have dozens or hundreds of containers across many servers, manually managing them is a nightmare: which container runs on which server? What happens when a server fails? How do you update software without downtime?

**What Kubernetes does**
Kubernetes (abbreviated K8s) is a system that manages containers at scale. You tell Kubernetes what you want — "I need 5 replicas of my web service running" — and it figures out where to run them, monitors their health, and maintains that state automatically.

**Core concepts**

- **Pod**: The smallest deployable unit. Usually one container, sometimes a few tightly coupled ones
- **Deployment**: Describes how many pods to run and manages updates
- **Service**: A stable network endpoint for a set of pods (even as pods come and go)
- **Node**: A machine (VM or physical) in the cluster
- **Cluster**: The group of nodes Kubernetes manages
- **Control Plane**: The Kubernetes management layer (API server, scheduler, controllers)

**What Kubernetes handles automatically**
- Scheduling: Placing pods on nodes with available resources
- Self-healing: Restarting failed containers; replacing nodes that fail
- Scaling: Adding/removing pods based on load (Horizontal Pod Autoscaler)
- Rolling updates: Updating software with zero downtime
- Load balancing: Distributing traffic across healthy pods',
 'published', 'editor', now()),

('30000000-0000-0000-0000-000000000001', 'technical',
 'Technical Explanation',
 '**Architecture**
Kubernetes has a control plane + worker node architecture:

Control plane components:
- **kube-apiserver**: The central API gateway. All other components communicate through it. Stateless; horizontally scalable
- **etcd**: Distributed key-value store. The source of truth for all cluster state
- **kube-scheduler**: Assigns pods to nodes based on resource requests, affinity rules, and node capacity
- **kube-controller-manager**: Runs controllers (Deployment, ReplicaSet, Node, Endpoints, etc.) that reconcile desired state with actual state
- **cloud-controller-manager**: Cloud-specific controllers (load balancers, storage volumes)

Worker node components:
- **kubelet**: Agent on each node; communicates with the API server; manages pod lifecycle
- **kube-proxy**: Manages network rules on nodes for Service routing
- **Container runtime**: Runs containers (containerd, CRI-O)

**The control loop pattern**
All Kubernetes controllers use the same pattern:
```
observe current state
compare to desired state
act to reconcile the difference
```
This is eventually consistent: Kubernetes continuously drives toward the desired state.

**Key abstractions**
- **Deployment + ReplicaSet**: Manages stateless workloads; rolling updates; rollback
- **StatefulSet**: Stateful workloads with stable network IDs and persistent volumes
- **DaemonSet**: Run one pod per node (logging, monitoring agents)
- **ConfigMap / Secret**: Externalize configuration and credentials from container images
- **PersistentVolume / PVC**: Abstract storage provisioning
- **Ingress**: Layer 7 HTTP routing; SSL termination
- **HorizontalPodAutoscaler**: Auto-scale replicas based on CPU/memory or custom metrics

**Networking model**
Every pod gets a unique IP. Pods communicate directly (flat network). Services provide stable virtual IPs backed by kube-proxy rules (iptables or eBPF). CNI plugins (Calico, Cilium, Flannel) implement the network.',
 'published', 'editor', now()),

('30000000-0000-0000-0000-000000000001', 'architect',
 'Architect Explanation',
 '**Operational complexity is the primary trade-off**
Kubernetes is powerful but operationally heavy. Running a self-managed cluster requires deep expertise in networking, storage, upgrades, and incident response. Managed Kubernetes (GKE, EKS, AKS) reduces but does not eliminate this burden.

**When Kubernetes is the wrong choice**
- Single-server deployments: Docker Compose or a simple process manager is sufficient
- Simple scheduled tasks: A cron job or serverless function is cheaper to operate
- Small teams without Kubernetes expertise: The learning curve is steep and operational mistakes are costly
- Latency-critical workloads where cold starts are unacceptable: Serverless (Lambda, Cloud Run) may be preferable

**Multi-tenancy security**
Kubernetes was not designed for hard multi-tenancy (untrusted tenants). Network policies, RBAC, and Pod Security Standards provide isolation within a cluster, but for strict tenant isolation, separate clusters are safer.

Key security practices:
- Use RBAC (never give workloads cluster-admin)
- Restrict pod capabilities (no privileged containers, no hostPath mounts)
- Use Pod Security Admission (PSA) to enforce baseline/restricted profiles
- Scan container images in CI before deployment
- Use Network Policies to restrict pod-to-pod traffic

**Resource management and cost**
- Always set resource requests and limits on containers; without them, the scheduler cannot make good placement decisions
- Use Vertical Pod Autoscaler to right-size request/limit settings based on historical usage
- Use node auto-provisioning (Karpenter, GKE Autopilot) to dynamically match node capacity to workload demand

**Failure modes**
- **etcd degradation**: Cluster control plane becomes unavailable; no new scheduling, no updates
- **Node failure cascade**: If autoscaler is too slow, pending pods queue up; use PodDisruptionBudgets to maintain availability during node drains
- **Version skew**: API server, kubelet, and kubectl versions must stay within supported skew; upgrades require planning

**GitOps and deployment**
Store all Kubernetes manifests in Git. Apply via Argo CD or Flux for audit trail, rollback, and drift detection. Never apply manifests directly in production without version control.',
 'published', 'editor', now());

-- -------
-- APIs
-- -------
INSERT INTO public.technology_explanations (technology_id, explanation_type, title, content, status, generated_by, published_at) VALUES

('41000000-0000-0000-0000-000000000004', 'quick',
 '30-Second Explanation',
 'An API (Application Programming Interface) is a defined contract that specifies how software components communicate: what requests can be made, in what format, and what responses to expect. APIs are the standard mechanism by which services, applications, and systems interoperate.',
 'published', 'editor', now()),

('41000000-0000-0000-0000-000000000004', 'simple',
 'Simple Explanation',
 'Think of a restaurant. You don''t go into the kitchen and cook your food. Instead, you use a menu: a defined interface. You pick from the available options, make your request using the expected format (speak to the waiter), and get back a response (your food).

An API is exactly that — a menu for software. It defines what requests another program can make, what format those requests must be in, and what it will get back.

When a weather app on your phone shows the forecast, it''s calling a weather API. When you pay with your card online, the website calls a payment API. When you log in with Google, there''s a Google authentication API involved. APIs are how all modern software talks to other software.',
 'published', 'editor', now()),

('41000000-0000-0000-0000-000000000004', 'beginner',
 'Beginner Explanation',
 '**The problem**
Software systems need to communicate. A mobile app needs data from a server. One company''s system needs to trigger an action in another company''s system. Without a standard way to do this, every integration would require custom, brittle code.

**What APIs are**
An API is a formal specification of how one piece of software can talk to another. It defines:
- What operations are available (endpoints or methods)
- What input format is required (parameters, headers, request body)
- What output format to expect (response structure)
- What errors might be returned

**The dominant style: REST**
REST (Representational State Transfer) uses HTTP and is the most common API style for web services:
- Resources are identified by URLs: `https://api.example.com/users/123`
- HTTP verbs indicate the action: GET (read), POST (create), PUT/PATCH (update), DELETE (delete)
- Data is typically exchanged as JSON

**A concrete example**
```
GET https://api.openweathermap.org/data/2.5/weather?q=London
→ { "weather": [{"description": "light rain"}], "main": {"temp": 15.2} }
```

**Why APIs matter**
APIs enable the entire modern tech ecosystem. Stripe''s payment API lets any website accept credit cards. Twilio''s API adds SMS to any application. The AWS S3 API lets any program store files in the cloud. Without APIs, every company would have to rebuild these capabilities themselves.',
 'published', 'editor', now()),

('41000000-0000-0000-0000-000000000004', 'technical',
 'Technical Explanation',
 '**API styles comparison**

**REST (Representational State Transfer)**
- Stateless HTTP; each request is self-contained
- Resources at URLs; CRUD via HTTP verbs
- JSON or XML responses
- Documented via OpenAPI/Swagger specification
- Most widely used for public APIs

**GraphQL**
- Single endpoint; clients specify exactly which fields they need
- Eliminates over-fetching and under-fetching
- Strongly typed schema; introspection built in
- Better for client-driven data needs; more complex caching

**gRPC**
- Protocol Buffers (binary serialization) over HTTP/2
- Strongly typed via .proto schema files
- Bidirectional streaming; lower latency than REST
- Better for internal service-to-service communication

**WebSockets**
- Full-duplex, persistent connection
- Low latency, server-initiated messages
- Used for real-time features: chat, live dashboards, collaborative editing

**API design principles**
- Versioning: `v1`, `v2` in the URL path or as a header — never break existing consumers
- Pagination: Cursor-based (stable, handles inserts) or offset-based (simpler)
- Rate limiting: Protect against abuse; communicate limits via response headers
- Idempotency: POST endpoints that create resources should accept an `Idempotency-Key` header to safely retry on network failure
- Error responses: Use HTTP status codes correctly; return structured error bodies with machine-readable codes

**Authentication patterns**
- API keys: Simple but no user context; good for server-to-server
- OAuth 2.0: Delegated authorization; industry standard for user-acting-on-behalf
- JWT: Signed tokens encoding claims; stateless verification
- mTLS: Mutual TLS for high-security service-to-service',
 'published', 'editor', now()),

('41000000-0000-0000-0000-000000000004', 'architect',
 'Architect Explanation',
 '**API as a product**
Public APIs are products with their own lifecycle. Design decisions made in v1 are expensive to undo because breaking changes break customers. Invest in:
- A clear versioning strategy before launch
- A deprecation policy with minimum notice periods
- Backward compatibility by default (additive changes are safe; removing fields is breaking)
- API governance: a review process for schema changes

**Internal vs. external APIs**
External (public) APIs require more stability guarantees, authentication, rate limiting, and documentation. Internal APIs between owned services can evolve faster but benefit from contracts enforced via schema registries (Protobuf, Avro, OpenAPI) and contract testing.

**Reliability patterns**
- **Retry with exponential backoff**: For idempotent requests; avoid retry storms
- **Circuit breaker**: Stop calling a failing downstream API; fail fast locally; try again after a recovery period
- **Timeout**: Always set explicit timeouts on outbound API calls; no request should block indefinitely
- **Bulkhead**: Isolate API consumers in separate connection pools so one slow API doesn''t starve all others

**API gateway**
A gateway (Kong, AWS API Gateway, Nginx) centralizes: authentication, rate limiting, routing, request/response transformation, logging, and observability. Useful when multiple services share cross-cutting concerns.

**Security**
- Validate all input on the server — never trust client-supplied data
- Use HTTPS everywhere; never expose APIs over plain HTTP
- Scope API keys/tokens to minimum necessary permissions
- Log all API calls with actor, timestamp, action, and resource — for audit and forensics
- Protect against mass assignment: whitelist accepted fields in update operations

**Observability**
Track: latency (p50, p95, p99), error rate, throughput, per-endpoint breakdown. Set SLOs (e.g., p99 latency < 500ms, error rate < 0.1%) and alert on SLO burn rate. Distributed tracing (OpenTelemetry) correlates API calls across service boundaries.',
 'published', 'editor', now());
