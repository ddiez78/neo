# Supabase Project Skill

## Purpose
Provide fast, safe conventions for making Supabase-related changes in this repository.

## Scope
- Schema changes in `supabase/migrations/`
- RLS and policy updates
- App-to-database integration checks
- Environment and secret hygiene

## Workflow
1. Inspect current migrations and related app code before editing.
2. Add a new migration file instead of rewriting old migrations unless explicitly requested.
3. Review RLS implications for any new or changed table.
4. Verify runtime usage in `src/lib/supabase/` and server actions.
5. Document validation steps and expected outcomes in a brief note.

## Guardrails
- Never hardcode keys in source files.
- Treat `SUPABASE_SERVICE_ROLE_KEY` as backend-only.
- Prefer least-privilege access and explicit policy intent.
