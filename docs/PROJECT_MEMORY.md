# Project Memory - neo-geo

Last updated: 2026-05-24

This file is the operational memory for the project. Read it when you need to know how the app is evolving, what was changed recently, or where to continue. Keep it current after meaningful product, schema, routing, or architecture changes.

## Current Project

- Workspace: `C:\Users\David\CODEX NEO\neo-geo`
- Do not use or modify `C:\Users\David\VS neo geo 2`.
- Supabase project: `fwnkyhlffjzobegjyodk` (`GEO`), region `eu-central-1`.
- Current branch during the latest implementation: `codex/company-bio-geo-source`.
- Latest committed implementation: `85b343e Add verified company bio GEO source`.
- Stack: Next.js 16 App Router, React 19, Supabase, Inngest, Biome, TypeScript, Recharts, OpenRouter, OpenAI embeddings.

## Product Direction

The product is moving toward an AI Visibility / GEO Operations app for Spanish SMEs and SEO agencies.

Two experience levels are being introduced:

- `sme`: simple, guided, action-oriented for business owners.
- `pro`: intermediate freelancer/small agency workflow.
- `agency`: advanced SEO/GEO workflow with deeper reporting, evidence, and client operations.

Core product promise:

- Show which customer questions the brand wins or loses.
- Show which competitors and sources influence AI answers.
- Turn insights into weekly actions and reports.

## Important Recent Changes

### Company Bio as GEO source of truth

Implemented in commit `85b343e`.

Main files:

- `src/app/(app)/[workspace]/company-bio/page.tsx`
- `src/lib/company-bio/context.ts`
- `src/lib/recommendations/companyBioRecommendations.ts`
- `src/actions/workspace.ts`
- `src/actions/recommendations.ts`
- `src/actions/reports.ts`
- `src/app/(app)/[workspace]/dashboard/page.tsx`
- `src/app/(app)/[workspace]/reports/page.tsx`
- `supabase/migrations/0020_expand_company_profiles_geo_source.sql`

Behavior:

- `company_profiles` remains the canonical table. Do not create `brand_profiles`.
- Company Bio now has guided SME fields plus advanced agency/SEO fields.
- Each field can be marked as verified using `field_verification`.
- `verified_profile` stores the approved truth snapshot.
- `scoreCompanyUnderstanding()` computes completeness, verified fields, misunderstood facts, entity gaps, and next action.
- Dashboard includes a compact `Company Understanding` panel.
- Recommendations include Company Bio-derived actions for missing pricing, social proof, entity gaps, misunderstood facts, and incomplete verified truth.
- Monthly reports include an `entity_state` snapshot and a visible `Estado de Entidad` panel.
- Mention detection now considers company aliases.

Supabase:

- Migration `expand_company_profiles_geo_source` was applied to project `fwnkyhlffjzobegjyodk`.
- Remote migration list after application included:
  - `20260518160849 create_recommendations`
  - `20260523181306 expand_company_profiles_geo_source`
- Validation queries confirmed:
  - `public.company_profiles` exists.
  - New Company Bio columns exist.
  - `public.monthly_reports.entity_state` exists.

Verification completed after this implementation:

- `npx tsc --noEmit` passed.
- `npm run build` passed.
- `npm run lint` passed.
- Local app started on `http://localhost:3000`.

Known note:

- Recharts emitted repeated dev-console warnings about chart width/height `-1` in some dashboard contexts. Build still passed. Treat this as a UI/layout follow-up, not a blocker for Company Bio.

### Prompt and GEO 2026 work in progress

There are local changes and untracked files around prompt strategy, prompt generation, and SME/agency simplification. These were present after the Company Bio commit and should not be reverted without explicit confirmation.

Relevant areas:

- `src/actions/prompts.ts`
- `src/app/(app)/[workspace]/prompts/page.tsx`
- `src/lib/prompts/generationPipeline.ts`
- `src/components/prompts/`
- `content/geo-knowledge/prompt-strategy/`

Expected product direction:

- Generate customer questions instead of exposing too much prompt-engineering complexity to SMEs.
- Keep advanced prompt controls available for agency/pro users.
- Support Spanish vertical templates and query patterns from Google AI Search / GEO strategy.

### Experience mode and tiers

Current mode model:

- `src/lib/preferences.ts` defines `AppMode = "sme" | "pro" | "agency"`.
- `DEFAULT_MODE` is `sme`.
- `src/components/settings/ExperienceModePanel.tsx` lets users choose Starter, Pro, or Agency.
- `src/lib/tiers.ts` defines feature access, limits, and labels.

Current tier notes:

- `sme`: basic dashboard, prompts, recommendations, sources, reports, settings.
- `pro`: unlocks ROI, tasks, templates.
- `agency`: unlocks Company Bio according to current `FEATURE_MIN_TIER`, although Company Bio has also been added to the sidebar. Reconcile this if gating is enforced elsewhere.

### New or emerging routes/components

Current route surface includes:

- Main workspace routes: `dashboard`, `company-bio`, `prompts`, `recommendations`, `sources`, `competitors`, `tasks`, `reports`, `settings`, `team`, `admin`.
- New/untracked or emerging routes: `alerts`, `help`, `roi`, `templates`, `pricing`, `api/search/[workspaceId]`.

New/untracked or emerging modules include:

- Alerts: `src/actions/alerts.ts`, `src/lib/data/alerts.ts`, `src/app/(app)/[workspace]/alerts/page.tsx`, `supabase/migrations/0021_alerts.sql`.
- Dashboard variants: `SmeDashboard`, `ProDashboard`, `ForecastPanel`, `SetupChecklist`, `WeeklyActivityFeed`, `ScoreCounter`.
- Layout additions: `AlertsDropdown`, `GlobalSearch`, `SupportCard`, `TierSwitcher`.
- UI helpers: `EmptyState`, `GlossaryTip`, `LockedFeature`, `Skeleton`, `UpgradeNudge`, `UpgradeTierButton`.
- Templates: `src/lib/templates/sectors.ts`, `src/actions/templates.ts`, `SectorTemplatePicker`.
- Analytics: `activity`, `cost`, `forecast`, `roi`, `workspace-stats`.

### Alerts migration status

File exists locally:

- `supabase/migrations/0021_alerts.sql`

It creates `public.alerts` with RLS and policies. At the time this memory was written, do not assume it has been applied to Supabase unless you verify with `_list_migrations` or a SQL `to_regclass('public.alerts')` query.

## Current Git Working Tree Notes

There are many local modified and untracked files after the latest commit. Treat them as user or generated work unless proven otherwise. Do not revert them casually.

Observed modified files include:

- `.env.example`
- `CLAUDE.md`
- scripts: `backfill-costs.ts`, `backfill-daily-metrics.ts`, `run-all-prompts.ts`
- many app/actions/layout/dashboard/preferences/prompt files

Observed untracked areas include:

- `.claude/skills/`
- `.tmp-dev*.log`
- `content/geo-knowledge/prompt-strategy/`
- `src/actions/alerts.ts`
- `src/actions/templates.ts`
- `src/app/(app)/[workspace]/alerts/`
- `src/app/(app)/[workspace]/help/`
- `src/app/(app)/[workspace]/roi/`
- `src/app/(app)/[workspace]/templates/`
- `src/app/api/search/`
- `src/app/pricing/`
- several new components and analytics/data modules
- `supabase/migrations/0021_alerts.sql`

When making future commits, stage only files relevant to the task.

## Operational Rules For Future Work

1. Read this file and `AGENTS.md` before planning or implementing significant changes.
2. Confirm the branch and dirty worktree with `git status --short --branch`.
3. Do not touch `C:\Users\David\VS neo geo 2`.
4. Prefer additive Supabase migrations and preserve RLS.
5. Use `company_profiles`, not `brand_profiles`.
6. Keep SME UI simple; hide agency complexity behind modes, tiers, details panels, or separate agency views.
7. Do not mutate production Supabase until code builds and the SQL has been inspected.
8. If applying a migration remotely, verify with `_list_migrations` and `to_regclass`/`information_schema`.
9. After important work, update this memory with:
   - date
   - branch/commit
   - files or modules touched
   - schema changes
   - verification results
   - unresolved risks

## Useful Commands

```powershell
git status --short --branch
npx tsc --noEmit
npm run lint
npm run build
npm run dev -- --port 3000
pnpm kb:index
```

## Open Follow-ups

- Decide whether `company-bio` should be accessible in SME mode or gated to Agency only.
- Verify whether `0021_alerts.sql` should be applied to Supabase.
- Clean or ignore temporary `.tmp-dev*.log` files if they are not needed.
- Fix Recharts width/height warnings on dashboard charts.
- Review mojibake text in several Spanish UI strings and templates.
- Decide how the new SME/Pro/Agency tier system should map to billing, workspace limits, and feature locks.
