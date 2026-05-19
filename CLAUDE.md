# CLAUDE.md

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
1. Confirm stack from `package.json` (and related config files).
2. Confirm available dev/test/build commands.
3. Validate required environment variables.
4. Validate Supabase connectivity before DB changes.
5. Implement, test, and summarize what changed.

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
- Prefer `rg`/`rg --files` for fast discovery.
