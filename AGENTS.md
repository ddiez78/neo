# AGENTS.md

## Project Context
- Project: `neo-geo`
- Workspace: `C:\Users\David\CODEX NEO\neo-geo`
- Goal: app development with Supabase
- Supabase project id: `fwnkyhlffjzobegjyodk` (`GEO`)
- Supabase region: `eu-central-1`

## Working Agreements
- Do not revert user changes without explicit confirmation.
- Prefer small, verifiable changes with clear context.
- Before touching multiple areas, inspect repository structure and dependencies.
- Leave short technical notes when decisions affect architecture or operations.

## Startup Checklist
1. Read `docs/PROJECT_MEMORY.md` when project status, recent decisions, schema changes, or current direction matter.
2. Confirm stack from `package.json` (and related config files).
3. Confirm available dev/test/build commands.
4. Validate required environment variables.
5. Validate Supabase connectivity before DB changes.
6. Implement, test, and summarize what changed.

## Recommended Environment Variables
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (backend only)
- `SUPABASE_PROJECT_ID=fwnkyhlffjzobegjyodk`

## Common Commands (PowerShell)
- List files: `Get-ChildItem`
- Recursive listing: `Get-ChildItem -Recurse`
- Search text: `rg "text"`
- Tests: `pnpm test` (or project equivalent)

## Repository Notes
- App source is in `src/`.
- Database migrations are in `supabase/migrations/`.
- Scripts are in `scripts/`.
- Operational project memory is in `docs/PROJECT_MEMORY.md`; keep it updated after meaningful changes.
- Prefer `rg`/`rg --files` for fast discovery.
