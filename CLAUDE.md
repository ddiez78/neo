# CLAUDE.md — neo-geo

## Project
- **Name:** neo-geo
- **Workspace:** `C:\Users\David\CODEX NEO\neo-geo`
- **Goal:** App development with Supabase (project `GEO`)
- **Supabase project ID:** `fwnkyhlffjzobegjyodk`
- **Supabase region:** `eu-central-1`

## Stack
- **Framework:** Next.js 16 (App Router, TypeScript)
- **UI:** React 19, Tailwind CSS v4, Recharts, Lucide React, Sonner
- **Backend/DB:** Supabase (Auth, DB, SSR), PostgreSQL via `pg`
- **Background jobs:** Inngest v4
- **Validation:** Zod v4
- **Linter/formatter:** Biome
- **Package manager:** pnpm

## Directory Structure
```
src/
  actions/     # Server Actions
  app/         # Next.js App Router (route groups: (app), (auth))
  components/  # Shared UI components
  inngest/     # Inngest functions / background jobs
  lib/         # Utilities and Supabase clients
  types/       # TypeScript types
supabase/
  migrations/  # SQL migrations
scripts/       # CLI scripts (migrate, seed, backfill, etc.)
knowledge/     # Markdown files served at runtime (recommendations)
```

## Available Commands
```powershell
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm lint             # Biome check
pnpm lint:fix         # Biome autofix
pnpm migrate          # Run DB migrations (tsx scripts/migrate.ts)
pnpm seed             # Seed database
pnpm kb:index         # Index knowledge base
pnpm backfill         # Backfill daily metrics
pnpm backfill-costs   # Backfill costs
pnpm run-prompts      # Run all prompts
```

## Environment Variables
```
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY   # backend/scripts only — never expose to client
SUPABASE_PROJECT_ID=fwnkyhlffjzobegjyodk
```

## Working Agreements
- Do not revert user changes without explicit confirmation.
- Prefer small, verifiable changes with clear context.
- Before touching multiple areas, inspect repository structure and dependencies.
- Document relevant technical decisions in commits or brief notes.

## Startup Checklist
1. Confirm stack from `package.json` and config files.
2. Identify available dev/test/build commands.
3. Verify required environment variables are set.
4. Validate Supabase connectivity before any DB changes.
5. Implement, test, and summarize what changed.

## Supabase MCP Tools (when available)
- List projects: `mcp__supabase__list_projects`
- Get project detail: `mcp__supabase__get_project` with `id: "fwnkyhlffjzobegjyodk"`
- List migrations: `mcp__supabase__list_migrations`
- View logs: `mcp__supabase__get_logs`

## Code Conventions
- Use `rg` / `rg --files` for fast discovery instead of `Get-ChildItem -Recurse`.
- Server Actions live in `src/actions/`.
- Supabase SSR client is set up in `src/lib/` — use it for server components and actions.
- Biome enforces formatting; run `pnpm lint:fix` before committing.
- No test suite configured yet — validate changes manually or add tests as needed.
