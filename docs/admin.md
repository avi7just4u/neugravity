# NeuGravity Admin Control Plane

## Overview

The admin control plane manages editorial review, source ingestion, job monitoring, and system health. All admin routes are isolated from the public website and require authentication plus a role check before any data is read or mutated.

## Architecture

Admin is isolated from the public website via the `src/app/admin/` route group. The layout (`AdminShell`, a client component) wraps Sidebar + Header + page content. All admin layouts check auth server-side and redirect unauthorized users to `/login` or `/?error=unauthorized`.

```
Browser → AdminShell layout (auth check) → Page → Service → Repository → Supabase
                                         ↘ API route → requireAdminAuth() → Service
```

## Admin Roles

| Role | Access |
|------|--------|
| admin | Full access to all admin sections |
| super_admin | Full access + can promote other admins |
| editor | Content, editorial queue, sources, freshness |
| author | Create/edit own content, editorial queue |
| reviewer | View and approve editorial queue |
| analyst | Read-only: jobs, freshness, AI usage, sources, audit log |
| course_manager | Education section |
| community_moderator | Community section |

Roles are stored in `public.users.role`. The auth trigger in migration 012 auto-creates a `public.users` row (with `role = 'user'`) when a new Supabase Auth user signs up. To grant admin access, update the `role` column directly or via a Supabase dashboard query.

## How to Grant Admin Access

```sql
UPDATE public.users SET role = 'admin' WHERE id = '<user-uuid>';
```

Or query by email:

```sql
UPDATE public.users u
SET role = 'admin'
FROM auth.users a
WHERE a.email = 'person@example.com'
  AND u.id = a.id;
```

## API Security

All admin API mutation routes call `requireAdminAuth()` from `src/lib/auth/admin-auth.ts`, which:

1. Reads the session cookie via `createClient()` (anon + SSR, respects RLS)
2. Calls `supabase.auth.getUser()` — returns 401 if no valid session
3. Queries `public.users.role` via `createAdminClient()` (service-role, bypasses RLS)
4. Returns 403 if the role is not in the allowed list

GET routes that return admin data also call `requireAdminAuth()` (no audit log written for reads).

## Audit Log

All admin mutations are recorded in `public.audit_logs`. Schema:

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → public.users (actor) |
| actor_email | text | Denormalized for readability |
| action | text | e.g. `approve`, `reject`, `publish`, `toggle_source` |
| entity_type | text | e.g. `source_item`, `source`, `job`, `news_item` |
| entity_id | uuid | UUID FK when applicable |
| entity_id_text | text | Raw entity ID string (for non-UUID IDs) |
| summary | text | Human-readable description |
| metadata | jsonb | Structured context |
| created_at | timestamptz | Auto-set |

Only service-role can insert (no RLS insert policy). Admins, super_admins, and analysts can read via RLS. View at `/admin/system/audit`.

`AuditService.log()` in `src/lib/services/audit.service.ts` never throws — failures are silently swallowed so a logging error never breaks the calling operation.

Common action values: `approve`, `reject`, `publish`, `edit`, `delete`, `toggle_source`, `run_source`, `verify_source`, `create_source`, `retry_job`, `cancel_job`, `run_freshness_refresh`.

## Environment Variables Required

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key for client-side and SSR queries |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key — server only, never expose to browser |
| `WORKER_SECRET` | Shared secret for internal worker-to-API calls |
| `NEXT_PUBLIC_SITE_URL` | Full site URL for internal fetch calls (defaults to `http://localhost:3000`) |
| `GROQ_API_KEY` | For AI enrichment pipeline |
| `AI_GROQ_MODEL` | Optional; defaults to `qwen/qwen3.8-27b` |

## Database Bootstrap

Run migrations in order against your Supabase project:

```bash
for f in database/migrations/*.sql; do
  psql "$DATABASE_URL" -f "$f"
done
```

Key migrations:
- `001` — all core tables, RLS, indexes, triggers
- `002` — idempotent seed data
- `012` — auth trigger: auto-creates `public.users` on signup
- `013` — extends `audit_logs` with `actor_email`, `summary`, `metadata`, `entity_id_text`; hardens RLS (removes permissive insert policy)

## Operational Dashboard

Available at `/admin`. Sections:
- **Attention Required** — non-zero alerts only (hidden when all clear)
- **Live Operations** — always shown: job queue, source health, freshness status

All metrics query live DB — no cached values.
