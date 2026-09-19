# NeuGravity

**Understand Technology. Navigate What's Next.**

A production-grade technology intelligence and learning platform. Think YouTube + tech knowledge graph + tech news + learning + software discovery + comparison engine + enterprise advisory.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **Supabase** (PostgreSQL + Auth + Storage)
- **Radix UI** + **Lucide React**

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase project credentials:
- `NEXT_PUBLIC_SUPABASE_URL` — from Supabase project settings
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Supabase project settings
- `SUPABASE_SERVICE_ROLE_KEY` — from Supabase project settings (server-only, never expose)
- `DATABASE_URL` — PostgreSQL connection string (for direct DB access)

### 3. Run database migrations

In your Supabase SQL editor or via `psql`, run migrations in order:

```sql
-- Run these against your Supabase project
\i database/migrations/001_initial_schema.sql
\i database/migrations/002_seed_data.sql
```

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  app/                  # Next.js App Router pages + API routes
    admin/              # Admin panel (auth-gated, role-based)
    api/                # API routes (auth, newsletter, enterprise, search, analytics, contact)
    (public pages)      # tech, tools, companies, news, compare, articles, learn, courses...
  components/
    layout/             # Navbar, Footer, AdminSidebar
    ui/                 # Design system components (Button, Badge, Card, etc.)
  lib/
    services/           # Service layer (never call Supabase from UI directly)
    search/             # ISearchService abstraction
    supabase/           # Client, server, middleware helpers
    utils.ts            # cn(), formatDate(), generateSlug(), etc.
  types/
    index.ts            # All TypeScript types
    database.ts         # Supabase Database interface
database/
  migrations/           # SQL migration files
docs/
  architecture.md       # System design
  database.md           # Table reference
```

## Architecture

```
UI Component → Service → Repository → Supabase
```

See `docs/architecture.md` for full design documentation.
See `CLAUDE.md` for development conventions.

## Phase Status

See `PROJECT_STATUS.md` for current completion status.
