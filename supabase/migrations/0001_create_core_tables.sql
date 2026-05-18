create extension if not exists "uuid-ossp" with schema extensions;
create extension if not exists pgcrypto with schema extensions;

create type public.workspace_role as enum ('owner', 'admin', 'member', 'viewer');
create type public.prompt_status as enum ('active', 'paused');
create type public.llm_provider as enum ('chatgpt', 'claude', 'gemini', 'perplexity', 'deepseek');
create type public.run_status as enum ('queued', 'running', 'completed', 'failed');
create type public.sentiment as enum ('positive', 'neutral', 'negative', 'no_data');
create type public.suggestion_status as enum ('pending', 'approved', 'rejected');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  website text,
  industry text,
  locale text not null default 'es-ES',
  timezone text not null default 'Europe/Madrid',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.workspace_role not null default 'member',
  created_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create table public.workspace_invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  email text not null,
  role public.workspace_role not null default 'member',
  token text not null unique default encode(gen_random_bytes(24), 'hex'),
  accepted_at timestamptz,
  expires_at timestamptz not null default now() + interval '14 days',
  created_at timestamptz not null default now(),
  unique (workspace_id, email)
);

create table public.company_profiles (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null unique references public.workspaces(id) on delete cascade,
  brand_name text not null,
  website text,
  description text,
  products text[] not null default '{}',
  keywords text[] not null default '{}',
  markets text[] not null default '{}',
  tone text,
  official_urls text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.competitors (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  domain text,
  aliases text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, name)
);

create table public.competitor_suggestions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  domain text,
  reason text,
  confidence numeric(5,2) not null default 0,
  status public.suggestion_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.prompts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  body text not null,
  status public.prompt_status not null default 'active',
  priority int not null default 3 check (priority between 1 and 5),
  frequency text not null default 'daily',
  providers public.llm_provider[] not null default '{chatgpt}',
  tags text[] not null default '{}',
  last_run_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.prompt_tags (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  color text not null default '#334155',
  created_at timestamptz not null default now(),
  unique (workspace_id, name)
);

create table public.prompt_runs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  prompt_id uuid references public.prompts(id) on delete set null,
  provider public.llm_provider not null,
  model text not null,
  status public.run_status not null default 'queued',
  input_text text not null,
  response_text text,
  sentiment public.sentiment not null default 'no_data',
  brand_mentioned boolean not null default false,
  competitors_mentioned text[] not null default '{}',
  prompt_tokens int not null default 0,
  completion_tokens int not null default 0,
  total_cost numeric(12,6) not null default 0,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.prompt_run_mentions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  prompt_run_id uuid not null references public.prompt_runs(id) on delete cascade,
  entity_name text not null,
  entity_type text not null check (entity_type in ('brand', 'competitor')),
  sentiment public.sentiment not null default 'no_data',
  snippet text,
  created_at timestamptz not null default now()
);

create table public.prompt_run_sources (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  prompt_run_id uuid not null references public.prompt_runs(id) on delete cascade,
  url text not null,
  domain text not null,
  title text,
  mentioned_brand boolean not null default false,
  mentioned_competitors text[] not null default '{}',
  authority_score numeric(5,2),
  created_at timestamptz not null default now()
);

create table public.daily_metrics (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  metric_date date not null,
  visibility_score numeric(5,2) not null default 0,
  mention_count int not null default 0,
  total_runs int not null default 0,
  positive_mentions int not null default 0,
  neutral_mentions int not null default 0,
  negative_mentions int not null default 0,
  source_count int not null default 0,
  total_cost numeric(12,6) not null default 0,
  created_at timestamptz not null default now(),
  unique (workspace_id, metric_date)
);

create table public.workspace_llm_configs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  provider public.llm_provider not null,
  model text not null,
  enabled boolean not null default false,
  api_key_configured boolean not null default false,
  daily_run_limit int not null default 25,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, provider, model)
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index workspace_members_user_idx on public.workspace_members(user_id);
create index competitors_workspace_idx on public.competitors(workspace_id);
create index prompts_workspace_status_idx on public.prompts(workspace_id, status);
create index prompt_runs_workspace_created_idx on public.prompt_runs(workspace_id, created_at desc);
create index prompt_run_sources_workspace_idx on public.prompt_run_sources(workspace_id);
create index daily_metrics_workspace_date_idx on public.daily_metrics(workspace_id, metric_date desc);

create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = target_workspace_id
      and wm.user_id = auth.uid()
  );
$$;

create or replace function public.has_workspace_role(target_workspace_id uuid, allowed_roles public.workspace_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = target_workspace_id
      and wm.user_id = auth.uid()
      and wm.role = any(allowed_roles)
  );
$$;

create view public.workspace_daily_metric_rollup
with (security_invoker = true)
as
select
  dm.workspace_id,
  dm.metric_date,
  dm.visibility_score,
  dm.mention_count,
  dm.total_runs,
  dm.positive_mentions,
  dm.neutral_mentions,
  dm.negative_mentions,
  dm.source_count,
  dm.total_cost
from public.daily_metrics dm;

create view public.prompt_performance
with (security_invoker = true)
as
select
  p.id as prompt_id,
  p.workspace_id,
  p.title,
  p.status,
  count(pr.id)::int as run_count,
  count(pr.id) filter (where pr.brand_mentioned)::int as mention_count,
  coalesce(avg(case when pr.brand_mentioned then 100 else 0 end), 0)::numeric(5,2) as visibility_score,
  coalesce(sum(pr.total_cost), 0)::numeric(12,6) as total_cost,
  max(pr.created_at) as latest_run_at
from public.prompts p
left join public.prompt_runs pr on pr.prompt_id = p.id
group by p.id;

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.workspace_invites enable row level security;
alter table public.company_profiles enable row level security;
alter table public.competitors enable row level security;
alter table public.competitor_suggestions enable row level security;
alter table public.prompts enable row level security;
alter table public.prompt_tags enable row level security;
alter table public.prompt_runs enable row level security;
alter table public.prompt_run_mentions enable row level security;
alter table public.prompt_run_sources enable row level security;
alter table public.daily_metrics enable row level security;
alter table public.workspace_llm_configs enable row level security;
alter table public.audit_logs enable row level security;

create policy "profiles self read" on public.profiles for select using (id = auth.uid());
create policy "profiles self write" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());

create policy "workspaces member read" on public.workspaces for select using (public.is_workspace_member(id));
create policy "workspaces authenticated create" on public.workspaces for insert with check (auth.uid() = created_by);
create policy "workspaces admin update" on public.workspaces for update using (public.has_workspace_role(id, '{owner,admin}')) with check (public.has_workspace_role(id, '{owner,admin}'));

create policy "members read" on public.workspace_members for select using (public.is_workspace_member(workspace_id));
create policy "members manage" on public.workspace_members for all using (public.has_workspace_role(workspace_id, '{owner,admin}')) with check (public.has_workspace_role(workspace_id, '{owner,admin}'));
create policy "members self bootstrap" on public.workspace_members for insert with check (user_id = auth.uid());

create policy "invites manage" on public.workspace_invites for all using (public.has_workspace_role(workspace_id, '{owner,admin}')) with check (public.has_workspace_role(workspace_id, '{owner,admin}'));

create policy "company member read" on public.company_profiles for select using (public.is_workspace_member(workspace_id));
create policy "company admin write" on public.company_profiles for all using (public.has_workspace_role(workspace_id, '{owner,admin,member}')) with check (public.has_workspace_role(workspace_id, '{owner,admin,member}'));

create policy "competitors member read" on public.competitors for select using (public.is_workspace_member(workspace_id));
create policy "competitors member write" on public.competitors for all using (public.has_workspace_role(workspace_id, '{owner,admin,member}')) with check (public.has_workspace_role(workspace_id, '{owner,admin,member}'));

create policy "suggestions member read" on public.competitor_suggestions for select using (public.is_workspace_member(workspace_id));
create policy "suggestions member write" on public.competitor_suggestions for all using (public.has_workspace_role(workspace_id, '{owner,admin,member}')) with check (public.has_workspace_role(workspace_id, '{owner,admin,member}'));

create policy "prompts member read" on public.prompts for select using (public.is_workspace_member(workspace_id));
create policy "prompts member write" on public.prompts for all using (public.has_workspace_role(workspace_id, '{owner,admin,member}')) with check (public.has_workspace_role(workspace_id, '{owner,admin,member}'));

create policy "tags member read" on public.prompt_tags for select using (public.is_workspace_member(workspace_id));
create policy "tags member write" on public.prompt_tags for all using (public.has_workspace_role(workspace_id, '{owner,admin,member}')) with check (public.has_workspace_role(workspace_id, '{owner,admin,member}'));

create policy "runs member read" on public.prompt_runs for select using (public.is_workspace_member(workspace_id));
create policy "runs member write" on public.prompt_runs for all using (public.has_workspace_role(workspace_id, '{owner,admin,member}')) with check (public.has_workspace_role(workspace_id, '{owner,admin,member}'));

create policy "mentions member read" on public.prompt_run_mentions for select using (public.is_workspace_member(workspace_id));
create policy "mentions member write" on public.prompt_run_mentions for all using (public.has_workspace_role(workspace_id, '{owner,admin,member}')) with check (public.has_workspace_role(workspace_id, '{owner,admin,member}'));

create policy "sources member read" on public.prompt_run_sources for select using (public.is_workspace_member(workspace_id));
create policy "sources member write" on public.prompt_run_sources for all using (public.has_workspace_role(workspace_id, '{owner,admin,member}')) with check (public.has_workspace_role(workspace_id, '{owner,admin,member}'));

create policy "metrics member read" on public.daily_metrics for select using (public.is_workspace_member(workspace_id));
create policy "metrics member write" on public.daily_metrics for all using (public.has_workspace_role(workspace_id, '{owner,admin,member}')) with check (public.has_workspace_role(workspace_id, '{owner,admin,member}'));

create policy "llm admin read" on public.workspace_llm_configs for select using (public.is_workspace_member(workspace_id));
create policy "llm admin write" on public.workspace_llm_configs for all using (public.has_workspace_role(workspace_id, '{owner,admin}')) with check (public.has_workspace_role(workspace_id, '{owner,admin}'));

create policy "audit member read" on public.audit_logs for select using (public.is_workspace_member(workspace_id));
create policy "audit member insert" on public.audit_logs for insert with check (public.is_workspace_member(workspace_id));
