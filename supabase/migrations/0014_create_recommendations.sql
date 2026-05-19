do $$
begin
  create type public.recommendation_category as enum (
    'entity',
    'content',
    'sources',
    'competitors',
    'prompts',
    'technical',
    'authority',
    'sentiment'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.recommendation_status as enum (
    'pending',
    'in_progress',
    'done',
    'dismissed'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.recommendation_sources (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  slug text not null,
  category public.recommendation_category not null default 'content',
  content text not null,
  version text not null default 'v1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, slug, version)
);

create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  source_id uuid references public.recommendation_sources(id) on delete set null,
  title text not null,
  description text not null,
  category public.recommendation_category not null,
  priority int not null default 3 check (priority between 1 and 5),
  impact_score numeric(5,2) not null default 50,
  confidence_score numeric(5,2) not null default 50,
  status public.recommendation_status not null default 'pending',
  related_prompt_ids uuid[] not null default '{}',
  related_competitor_ids uuid[] not null default '{}',
  related_source_domains text[] not null default '{}',
  evidence jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.recommendation_actions (
  id uuid primary key default gen_random_uuid(),
  recommendation_id uuid not null references public.recommendations(id) on delete cascade,
  label text not null,
  status public.recommendation_status not null default 'pending',
  owner_id uuid references auth.users(id) on delete set null,
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists recommendation_sources_workspace_idx on public.recommendation_sources(workspace_id, category);
create index if not exists recommendations_workspace_status_idx on public.recommendations(workspace_id, status, priority);
create index if not exists recommendation_actions_recommendation_idx on public.recommendation_actions(recommendation_id);

alter table public.recommendation_sources enable row level security;
alter table public.recommendations enable row level security;
alter table public.recommendation_actions enable row level security;

drop policy if exists "recommendation sources member read" on public.recommendation_sources;
create policy "recommendation sources member read"
on public.recommendation_sources
for select
using (public.is_workspace_member(workspace_id));

drop policy if exists "recommendation sources member write" on public.recommendation_sources;
create policy "recommendation sources member write"
on public.recommendation_sources
for all
using (public.has_workspace_role(workspace_id, '{owner,admin,member}'))
with check (public.has_workspace_role(workspace_id, '{owner,admin,member}'));

drop policy if exists "recommendations member read" on public.recommendations;
create policy "recommendations member read"
on public.recommendations
for select
using (public.is_workspace_member(workspace_id));

drop policy if exists "recommendations member write" on public.recommendations;
create policy "recommendations member write"
on public.recommendations
for all
using (public.has_workspace_role(workspace_id, '{owner,admin,member}'))
with check (public.has_workspace_role(workspace_id, '{owner,admin,member}'));

drop policy if exists "recommendation actions member read" on public.recommendation_actions;
create policy "recommendation actions member read"
on public.recommendation_actions
for select
using (
  exists (
    select 1
    from public.recommendations r
    where r.id = recommendation_actions.recommendation_id
      and public.is_workspace_member(r.workspace_id)
  )
);

drop policy if exists "recommendation actions member write" on public.recommendation_actions;
create policy "recommendation actions member write"
on public.recommendation_actions
for all
using (
  exists (
    select 1
    from public.recommendations r
    where r.id = recommendation_actions.recommendation_id
      and public.has_workspace_role(r.workspace_id, '{owner,admin,member}')
  )
)
with check (
  exists (
    select 1
    from public.recommendations r
    where r.id = recommendation_actions.recommendation_id
      and public.has_workspace_role(r.workspace_id, '{owner,admin,member}')
  )
);
