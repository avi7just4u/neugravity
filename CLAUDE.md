# NeuGravity — CLAUDE.md

Project conventions for AI-assisted development. Read this before writing any code.

## Stack

- **Next.js 16** App Router, React 19, TypeScript strict
- **Tailwind CSS v4** — uses `@import "tailwindcss"` and `@theme inline` in `globals.css`. No `tailwind.config.ts`.
- **Supabase** for PostgreSQL, Auth, Storage
- **@supabase/ssr** for server-side clients (always `await createClient()`)
- **Radix UI** primitives, **cva** for variants, **clsx + tailwind-merge** via `cn()`
- **lucide-react** for icons — Twitter/Github/Linkedin do NOT exist; use Share2/GitBranch/Globe

## Architecture

```
UI → Service → Repository → Supabase
```

- Never call Supabase directly from page/component code
- Services live in `src/lib/services/`
- Search abstraction: `ISearchService` in `src/lib/search/search.service.ts`
- Three Supabase clients in `src/lib/supabase/server.ts`:
  - `createClient()` — anon key, typed (for user-facing queries with RLS)
  - `createAdminClient()` — service-role key (for admin writes, bypasses RLS)
  - `createServiceClient()` — anon key, `any` typed (for calls against stub schema)
- Browser client: `src/lib/supabase/client.ts`

## Rules

1. **No raw SQL in components** — always use the service layer
2. **Server components by default** — add `"use client"` only when needed (hooks, browser events)
3. **Dynamic route params are async** — `params: Promise<{ slug: string }>`, then `const { slug } = await params`
4. **Admin routes require server-side auth** — check user + role in layout, redirect if missing
5. **Never expose service-role key to browser** — `SUPABASE_SERVICE_ROLE_KEY` is server-only
6. **RLS is the security layer** — do not rely on frontend-only hiding
7. **AI assists, humans approve** — no content auto-publishes from ingestion pipeline
8. **Content lifecycle**: `draft → in_review → approved → scheduled → published → archived`

## Database

Migrations in `database/migrations/`. Run them in order against your Supabase project.

- `001_initial_schema.sql` — all tables, RLS, indexes, triggers
- `002_seed_data.sql` — idempotent seed data (ON CONFLICT DO NOTHING)

The `Database` type in `src/types/database.ts` is a stub. Add table definitions as you add real Supabase queries.

## Pages

All public pages use inline demo data until Supabase is connected. Wire to services once DB is live.

Generated static params return `[]` for dynamic routes to enable full dynamic rendering.

## Icons

Available in installed lucide-react: `Share2` (Twitter/X), `GitBranch` (GitHub), `Globe` (LinkedIn/generic social). Do not import Twitter, Github, or Linkedin — they don't exist.

## Environment

Copy `.env.example` to `.env.local` and fill in values. Never commit `.env.local`.

Required for dev:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
