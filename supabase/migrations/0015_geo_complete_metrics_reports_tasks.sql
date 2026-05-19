alter table public.workspaces
  add column if not exists country_code text not null default 'ES';

alter table public.prompt_runs
  add column if not exists input_text text,
  add column if not exists visibility_score numeric(5,2) not null default 0,
  add column if not exists brand_position int,
  add column if not exists first_competitor_position int,
  add column if not exists source_count int not null default 0;

alter table public.prompt_run_mentions
  add column if not exists position_index int,
  add column if not exists rank_group text,
  add column if not exists mention_context text,
  add column if not exists confidence numeric(5,2) not null default 60;

alter table public.prompt_run_sources
  add column if not exists source_type text not null default 'unknown'
    check (source_type in ('client', 'competitor', 'directory', 'media', 'blog', 'review', 'comparison', 'official', 'unknown')),
  add column if not exists is_client_domain boolean not null default false,
  add column if not exists is_competitor_domain boolean not null default false,
  add column if not exists citation_context text;

alter table public.recommendation_actions
  add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade,
  add column if not exists type text not null default 'content'
    check (type in ('content', 'page_update', 'faq', 'schema', 'external_profile', 'source_review', 'comparison', 'technical')),
  add column if not exists source_recommendation_id uuid references public.recommendations(id) on delete set null,
  add column if not exists assigned_to uuid references auth.users(id) on delete set null,
  add column if not exists priority int not null default 3 check (priority between 1 and 5),
  add column if not exists completed_at timestamptz;

update public.recommendation_actions ra
set workspace_id = r.workspace_id,
    source_recommendation_id = coalesce(ra.source_recommendation_id, r.id)
from public.recommendations r
where ra.recommendation_id = r.id
  and ra.workspace_id is null;

create table if not exists public.monthly_reports (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  report_month date not null,
  title text not null,
  executive_summary text not null,
  visibility_score numeric(5,2) not null default 0,
  share_of_voice numeric(5,2) not null default 0,
  top_prompts jsonb not null default '[]',
  competitors jsonb not null default '[]',
  risks jsonb not null default '[]',
  recommended_actions jsonb not null default '[]',
  share_token text not null default encode(gen_random_bytes(16), 'hex'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, report_month)
);

create table if not exists public.report_sections (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.monthly_reports(id) on delete cascade,
  section_key text not null,
  title text not null,
  content text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create or replace view public.prompt_rankings
with (security_invoker = true)
as
select
  p.workspace_id,
  p.id as prompt_id,
  p.title,
  p.body,
  p.status,
  p.priority,
  pr.id as latest_run_id,
  pr.provider,
  pr.model,
  pr.created_at as latest_run_at,
  pr.brand_mentioned,
  pr.brand_position,
  pr.first_competitor_position,
  pr.sentiment,
  pr.visibility_score,
  pr.competitors_mentioned,
  pr.source_count
from public.prompts p
left join lateral (
  select *
  from public.prompt_runs r
  where r.prompt_id = p.id
  order by r.created_at desc
  limit 1
) pr on true;

create or replace view public.share_of_voice_metrics
with (security_invoker = true)
as
select
  workspace_id,
  date_trunc('day', created_at)::date as metric_date,
  provider,
  model,
  count(*)::int as total_runs,
  count(*) filter (where brand_mentioned)::int as brand_mentions,
  coalesce(sum(cardinality(competitors_mentioned)), 0)::int as competitor_mentions,
  case
    when count(*) filter (where brand_mentioned) + coalesce(sum(cardinality(competitors_mentioned)), 0) = 0 then 0
    else round(
      (count(*) filter (where brand_mentioned))::numeric
      / ((count(*) filter (where brand_mentioned)) + coalesce(sum(cardinality(competitors_mentioned)), 0))::numeric
      * 100,
      2
    )
  end as share_of_voice
from public.prompt_runs
where status = 'completed'
group by workspace_id, date_trunc('day', created_at)::date, provider, model;

create or replace view public.weekly_metrics
with (security_invoker = true)
as
select
  workspace_id,
  date_trunc('week', metric_date)::date as week_start,
  round(avg(visibility_score), 2) as visibility_score,
  sum(mention_count)::int as mention_count,
  sum(total_runs)::int as total_runs,
  sum(source_count)::int as source_count,
  sum(total_cost)::numeric(12,4) as total_cost
from public.daily_metrics
group by workspace_id, date_trunc('week', metric_date)::date;

alter table public.monthly_reports enable row level security;
alter table public.report_sections enable row level security;

drop policy if exists "monthly reports member read" on public.monthly_reports;
create policy "monthly reports member read"
on public.monthly_reports
for select
using (public.is_workspace_member(workspace_id));

drop policy if exists "monthly reports member write" on public.monthly_reports;
create policy "monthly reports member write"
on public.monthly_reports
for all
using (public.has_workspace_role(workspace_id, '{owner,admin,member}'))
with check (public.has_workspace_role(workspace_id, '{owner,admin,member}'));

drop policy if exists "report sections member read" on public.report_sections;
create policy "report sections member read"
on public.report_sections
for select
using (
  exists (
    select 1
    from public.monthly_reports mr
    where mr.id = report_sections.report_id
      and public.is_workspace_member(mr.workspace_id)
  )
);

drop policy if exists "report sections member write" on public.report_sections;
create policy "report sections member write"
on public.report_sections
for all
using (
  exists (
    select 1
    from public.monthly_reports mr
    where mr.id = report_sections.report_id
      and public.has_workspace_role(mr.workspace_id, '{owner,admin,member}')
  )
)
with check (
  exists (
    select 1
    from public.monthly_reports mr
    where mr.id = report_sections.report_id
      and public.has_workspace_role(mr.workspace_id, '{owner,admin,member}')
  )
);
